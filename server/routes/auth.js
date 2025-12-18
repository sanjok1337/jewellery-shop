const express = require('express');
const { 
  register, 
  login, 
  getCurrentUser, 
  logout, 
  changePassword, 
  changeEmail,
  sendVerificationCode,
  verifyCodeAndRegister,
  sendLoginVerificationCode,
  verifyCodeAndLogin
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Публічні роути
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Email верифікація для реєстрації
router.post('/send-verification', sendVerificationCode);
router.post('/verify-code', verifyCodeAndRegister);

// Email верифікація для входу
router.post('/send-login-verification', sendLoginVerificationCode);
router.post('/verify-login-code', verifyCodeAndLogin);

// Захищені роути
router.get('/me', authMiddleware, getCurrentUser);
router.post('/change-password', authMiddleware, changePassword);
router.post('/change-email', authMiddleware, changeEmail);

module.exports = router;
