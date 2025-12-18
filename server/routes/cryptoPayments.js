const express = require('express');
const { 
  generateCryptoPayment, 
  verifyCryptoPayment, 
  getCryptoPaymentStatus,
  simulateCryptoPayment,
  verifyTransactionHash
} = require('../controllers/cryptoPaymentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Generate crypto payment details for an order
router.post('/generate', authMiddleware, generateCryptoPayment);

// Verify crypto payment transaction (manual verification)
router.post('/verify', authMiddleware, verifyCryptoPayment);

// Verify crypto payment with transaction hash (Sepolia testnet)
router.post('/verify-tx', authMiddleware, verifyTransactionHash);

// Get crypto payment status for an order
router.get('/status/:orderId', authMiddleware, getCryptoPaymentStatus);

// Simulate payment (for testing - remove in production)
router.post('/simulate', authMiddleware, simulateCryptoPayment);

module.exports = router;
