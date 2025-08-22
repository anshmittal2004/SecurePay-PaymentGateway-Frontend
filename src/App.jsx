import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import TransactionForm from './components/TransactionForm';
import TransactionDashboard from './components/TransactionDashboard';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);

  const handleTransaction = (data) => {
    const transactionId = `${data.phone}-${data.amount}-${Date.now()}`;
    
    setTransactions(prev => {
        // Check if this exact transaction was just added (within last 2 seconds)
        const isDuplicate = prev.some(tx => 
            tx.phone === data.phone && 
            tx.amount === data.amount &&
            Math.abs(new Date() - new Date(tx.timestamp)) < 2000
        );
        
        if (isDuplicate) {
            return prev; // Don't add duplicate
        }
        
        const newTransaction = {
            ...data,
            id: transactionId,
            timestamp: new Date().toISOString()
        };
        
        return [newTransaction, ...prev];
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
