const express = require('express');
const router = express.Router();
const { 
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

// Всі маршрути захищені авторизацією
router.use(authMiddleware);

// POST /api/cart/add - додати товар до кошика
router.post('/add', addToCart);

// GET /api/cart - отримати кошик користувача
router.get('/', getCart);

// PUT /api/cart/:itemId - оновити кількість товару
router.put('/:itemId', updateCartItem);

// DELETE /api/cart/:itemId - видалити товар з кошика
router.delete('/:itemId', removeFromCart);

// DELETE /api/cart - очистити кошик
router.delete('/', clearCart);

module.exports = router;