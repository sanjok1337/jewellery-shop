const express = require('express');
const { 
  generateCryptoPayment, 
  verifyCryptoPayment, 
  getCryptoPaymentStatus,
  simulateCryptoPayment 
} = require('../controllers/cryptoPaymentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Generate crypto payment details for an order
router.post('/generate', authMiddleware, generateCryptoPayment);

// Verify crypto payment transaction
router.post('/verify', authMiddleware, verifyCryptoPayment);

// Get crypto payment status for an order
router.get('/status/:orderId', authMiddleware, getCryptoPaymentStatus);

// Simulate payment (for testing - remove in production)
router.post('/simulate', authMiddleware, simulateCryptoPayment);

module.exports = router;
