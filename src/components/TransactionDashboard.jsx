import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { detectFraud } from '../utils/mockData';

function TransactionDashboard({ transactions = [] }) {  // ✅ Default empty array
  const [filter, setFilter] = useState('all');

  // ✅ Safe filter with fallback
  const filteredTransactions = (transactions || []).filter(tx => 
    filter === 'all' || tx.status === filter
  );

  // ✅ Safe stats calculation
  const safeTransactions = transactions || [];
  const stats = {
    total: safeTransactions.length,
    success: safeTransactions.filter(tx => tx.status === 'success').length,
    pending: safeTransactions.filter(tx => tx.status === 'pending').length,
    failed: safeTransactions.filter(tx => tx.status === 'failed').length,
    fraudulent: safeTransactions.filter(tx => detectFraud(tx, safeTransactions).isFraudulent).length
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
            const fraudCheck = detectFraud(tx, safeTransactions);
            return (
              <div key={tx.id || index} className="transaction-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="transaction-left">
                  <StatusIcon status={tx.status} />
                  {fraudCheck.isFraudulent && (
                    <div className="fraud-tooltip">
                      <AlertTriangle className="status-icon fraud" />
                      <span className="tooltip-text">{fraudCheck.reasons.join(', ')}</span>
                    </div>
                  )}
                  <div className="transaction-details">
                    <div className="transaction-id">#{tx.id || 'N/A'}</div>
                    <div className="transaction-hash">{tx.name || 'Unknown'} ({tx.card_type || 'Unknown'}: {tx.card_number || 'N/A'})</div>
                    <div className="transaction-hash">Phone: {tx.phone_number || 'N/A'}</div>
                    <div className="transaction-hash">Hash: {tx.card_hash ? tx.card_hash.slice(0, 10) + '...' : 'N/A'}</div>
                  </div>
                </div>
                <div className="transaction-right">
                  <div className="transaction-amount">₹{(tx.amount || 0).toFixed(2)}</div>
                  <div className="transaction-time">{tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}</div>
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
