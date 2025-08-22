import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import TransactionForm from './components/TransactionForm';
import TransactionDashboard from './components/TransactionDashboard';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);

  const handleTransaction = (transaction) => {
    setTransactions((prev) => [...prev, transaction]);
  };

  return (
    <div className="app">
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo">
            <Shield className="logo-icon" />
            <h1>SecurePay</h1>
          </div>
          <p className="hero-subtitle">Safe, Fast, and Reliable Payments</p>
        </div>
      </div>
      <div className="main-content">
        <TransactionForm onTransaction={handleTransaction} />
        <TransactionDashboard transactions={transactions} />
      </div>
    </div>
  );
}

export default App;