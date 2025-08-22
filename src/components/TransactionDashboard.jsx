import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { detectFraud } from '../utils/mockData';

function TransactionDashboard({ transactions }) {
  const [filter, setFilter] = useState('all');

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.status === filter
  );

  const stats = {
    total: transactions.length,
    success: transactions.filter(tx => tx.status === 'success').length,
    pending: transactions.filter(tx => tx.status === 'pending').length,
    failed: transactions.filter(tx => tx.status === 'failed').length,
    fraudulent: transactions.filter(tx => detectFraud(tx, transactions).isFraudulent).length
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'success': return <CheckCircle className="status-icon success" />;
      case 'failed': return <XCircle className="status-icon failed" />;
      case 'pending': return <Clock className="status-icon pending" />;
      default: return null;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Transaction Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <TrendingUp className="stat-icon" />
            <div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          <div className="stat-card success">
            <CheckCircle className="stat-icon" />
            <div>
              <div className="stat-number">{stats.success}</div>
              <div className="stat-label">Success</div>
            </div>
          </div>
          <div className="stat-card pending">
            <Clock className="stat-icon" />
            <div>
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card failed">
            <XCircle className="stat-icon" />
            <div>
              <div className="stat-number">{stats.failed}</div>
              <div className="stat-label">Failed</div>
            </div>
          </div>
          <div className="stat-card fraud">
            <AlertTriangle className="stat-icon" />
            <div>
              <div className="stat-number">{stats.fraudulent}</div>
              <div className="stat-label">Fraudulent</div>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        {['all', 'success', 'pending', 'failed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <Shield className="empty-icon" />
            <h3>No transactions found</h3>
            <p>Start by processing your first payment above</p>
          </div>
        ) : (
          filteredTransactions.map((tx, index) => {
            const fraudCheck = detectFraud(tx, transactions);
            return (
              <div key={tx.id} className="transaction-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="transaction-left">
                  <StatusIcon status={tx.status} />
                  {fraudCheck.isFraudulent && (
                    <div className="fraud-tooltip">
                      <AlertTriangle className="status-icon fraud" />
                      <span className="tooltip-text">{fraudCheck.reasons.join(', ')}</span>
                    </div>
                  )}
                  <div className="transaction-details">
                    <div className="transaction-id">#{tx.id}</div>
                    <div className="transaction-hash">{tx.name} ({tx.card_type}: {tx.card_number})</div>
                    <div className="transaction-hash">Phone: {tx.phone_number}</div>
                    <div className="transaction-hash">Hash: {tx.card_hash.slice(0, 10)}...</div>
                  </div>
                </div>
                <div className="transaction-right">
                  <div className="transaction-amount">₹{tx.amount.toFixed(2)}</div>
                  <div className="transaction-time">{new Date(tx.timestamp).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TransactionDashboard;