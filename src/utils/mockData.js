// mockData.js
export const validateName = (name) => {
  return name && typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 100;
};

export const validatePhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0.01 && num <= 100000;
};

export const formatCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

export const detectCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.startsWith('4')) return 'Visa';
  if (cleaned.match(/^5[1-5]/)) return 'Mastercard';
  if (cleaned.match(/^3[47]/)) return 'American Express';
  if (cleaned.match(/^(60|65|81|82|508)/)) return 'RuPay';
  if (cleaned.match(/^(6011|644|645|646|647|648|649)/)) return 'Discover';
  if (cleaned.match(/^35(2[8-9]|[3-8][0-9])/)) return 'JCB';
  if (cleaned.match(/^(30|36|38)/)) return 'Diners Club';
  return 'Unknown';
};

export const generateCardHash = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  let hash = 0;
  for (let i = 0; i < cleaned.length; i++) {
    hash = ((hash << 5) - hash + cleaned.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

export const detectFraud = (transaction, transactions = []) => { // Default to empty array
  const reasons = [];
  const { cardNumber, amount } = transaction; // Destructure from transaction object
  const parsedAmount = parseFloat(amount);

  if (parsedAmount > 10000) {
    reasons.push('Amount exceeds ₹10,000');
  }

  const now = new Date();
  const recentTransactions = transactions.filter(t => {
    const transactionTime = new Date(t.timestamp);
    return t.card_number === cardNumber && (now - transactionTime) < 60000;
  });

  if (recentTransactions.length > 1) {
    reasons.push('Multiple transactions within a minute');
  }

  if (cardNumber && cardNumber.startsWith('0000')) {
    reasons.push('Suspicious card number');
  }

  return {
    isFraudulent: reasons.length > 0,
    reasons
  };
};

export const generateMockTransaction = (cardNumber, name, phoneNumber, amount) => {
  const id = Math.floor(Math.random() * 1000000);
  const cleanedCardNumber = cardNumber.replace(/\s/g, '');
  const cardType = detectCardType(cleanedCardNumber);
  const status = ['success', 'pending', 'failed'][Math.floor(Math.random() * 3)];
  const timestamp = new Date().toISOString();
  const cardHash = generateCardHash(cleanedCardNumber);

  return {
    id,
    card_number: formatCardNumber(cleanedCardNumber),
    name,
    phone_number: phoneNumber,
    card_type: cardType,
    amount: parseFloat(amount),
    status,
    card_hash: cardHash,
    timestamp
  };
};