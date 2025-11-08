const express = require('express');
const { register, login, getCurrentUser, logout, changePassword, changeEmail } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/change-password', authMiddleware, changePassword);
router.post('/change-email', authMiddleware, changeEmail);

module.exports = router;
