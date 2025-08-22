import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import TransactionForm from './components/TransactionForm';
import TransactionDashboard from './components/TransactionDashboard';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);

  const handleTransaction = (data) => {
    // Unique ID generate 
    const transactionWithId = {
        ...data,
        id: data.id || Date.now() + Math.random(),
        timestamp: data.timestamp || new Date().toISOString()
    };
    
    setTransactions(prev => {
        // Check 
        const exists = prev.some(tx => 
            tx.id === transactionWithId.id || 
            (tx.phone === data.phone && tx.amount === data.amount && 
             Math.abs(new Date(tx.timestamp) - new Date(transactionWithId.timestamp)) < 1000)
        );
        
        if (exists) {
            return prev; // Duplicate
        }
        
        return [transactionWithId, ...prev];
    });
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
