// TransactionForm.jsx
import React, { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowRight, Download } from 'lucide-react';
import { formatCardNumber, validateCardNumber, validateName, validatePhoneNumber, validateAmount, detectCardType } from '../utils/mockData';
import { jsPDF } from 'jspdf';

function TransactionForm({ onTransaction }) {
  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [cardType, setCardType] = useState('Unknown');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setCardType(detectCardType(formatted));
  };

  // Fetch updated transactions from backend
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transactions`);
      if (response.ok) {
        const transactions = await response.json();
        // Update parent component with new transactions
        if (onTransaction) {
          onTransaction({ type: 'refresh', transactions });
        }
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleSubmit = async () => {
    if (!validateCardNumber(cardNumber) || !validateName(name) || !validatePhoneNumber(phoneNumber) || !validateAmount(amount)) {
      setMessage('Please fill in all fields correctly.');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      console.log('Sending to backend:', { cardNumber, name, phoneNumber, amount }); // Debug
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          card_number: cardNumber.replace(/\s/g, ''), // Remove spaces
          amount: parseFloat(amount)  // Convert to number
        })
      });
      
      const data = await response.json();
      
      // Create complete transaction object for receipt
      const completeTransaction = {
        ...data,
        name: name,
        phone_number: phoneNumber,
        card_number: cardNumber,
        card_type: cardType,
        amount: parseFloat(amount),
        timestamp: new Date().toISOString(),
        card_hash: data.card_hash || 'N/A'
      };
      
      setLastTransaction(completeTransaction);
      setMessage(`Transaction ${data.status}! ID: ${data.transaction_id || data.id}`);
      
      // Notify parent component about the transaction
      if (onTransaction) {
        onTransaction(completeTransaction);
      }
      
      // Fetch updated transactions list from backend
      setTimeout(() => {
        fetchTransactions();
      }, 1000); // Small delay to ensure backend is updated
      
      // Clear form if success
      if (data.status === 'success') {
        setTimeout(() => {
          setCardNumber('');
          setName('');
          setPhoneNumber('');
          setAmount('');
          setCardType('Unknown');
        }, 2000); // Clear after 2 seconds
      }
      
    } catch (error) {
      console.error('Transaction error:', error);
      setMessage('Transaction failed. Check backend or network.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!lastTransaction || lastTransaction.status !== 'success') return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(20);
    doc.setTextColor(29, 29, 31);
    doc.text('SecurePay Transaction Receipt', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Transaction ID: ${lastTransaction.transaction_id || lastTransaction.id || 'N/A'}`, 105, 30, { align: 'center' });
    doc.text(`Date: ${new Date(lastTransaction.timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 105, 36, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);

    doc.setFontSize(14);
    doc.setTextColor(29, 29, 31);
    doc.text('Transaction Details', 20, 55);

    doc.setFontSize(12);
    doc.text(`Name: ${lastTransaction.name}`, 20, 65);
    doc.text(`Phone Number: ${lastTransaction.phone_number}`, 20, 75);
    doc.text(`Card Number: ${lastTransaction.card_number}`, 20, 85);
    doc.text(`Card Type: ${lastTransaction.card_type}`, 20, 95);
    doc.text(`Amount: ₹${lastTransaction.amount.toFixed(2)}`, 20, 105);
    doc.text(`Status: ${lastTransaction.status.charAt(0).toUpperCase() + lastTransaction.status.slice(1)}`, 20, 115);
    doc.text(`Card Hash: ${lastTransaction.card_hash || 'N/A'}`, 20, 125);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for using SecurePay. For support, contact support@securepay.com.', 105, 270, { align: 'center' });

    doc.save(`SecurePay_Receipt_${lastTransaction.transaction_id || lastTransaction.id || Date.now()}.pdf`);
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="icon-container">
          <CreditCard className="header-icon" />
        </div>
        <h2>Secure Payment</h2>
        <p>Enter your payment details below</p>
      </div>

      <div className="payment-form">
        <div className="input-group">
          <label>Name</label>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength="100"
              className="name-input"
            />
          </div>
        </div>

        <div className="input-group">
          <label>Phone Number</label>
          <div className="input-wrapper">
            <input
              type="tel"
              placeholder="1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              maxLength="10"
              className="phone-input"
            />
          </div>
        </div>

        <div className="input-group">
          <label>Card Number</label>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength="19"
              className="card-input"
            />
            <CreditCard className="input-icon" />
            <span className="card-type">{cardType}</span>
          </div>
        </div>

        <div className="input-group">
          <label>Amount</label>
          <div className="input-wrapper">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="amount-input"
            />
            <span className="currency">₹</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isProcessing || !validateCardNumber(cardNumber) || !validateName(name) || !validatePhoneNumber(phoneNumber) || !validateAmount(amount)}
          className={`submit-button ${isProcessing ? 'processing' : ''}`}
        >
          {isProcessing ? (
            <>
              <div className="spinner"></div>
              Processing...
            </>
          ) : (
            <>
              Process Payment
              <ArrowRight className="button-icon" />
            </>
          )}
        </button>

        {lastTransaction && lastTransaction.status === 'success' && (
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="submit-button"
            style={{ background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' }}
          >
            Download Receipt
            <Download className="button-icon" />
          </button>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : message.includes('failed') ? 'error' : 'info'}`}>
          {message.includes('success') && <CheckCircle className="message-icon" />}
          {message.includes('failed') && <XCircle className="message-icon" />}
          {message.includes('pending') && <Clock className="message-icon" />}
          {message}
        </div>
      )}
    </div>
  );
}

export default TransactionForm;
