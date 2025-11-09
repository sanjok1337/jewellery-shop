const express = require('express');
const router = express.Router();
const { 
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  removeFromWishlistByProduct,
  clearWishlist
} = require('../controllers/wishlistController');
const { authMiddleware } = require('../middleware/auth');

// Всі маршрути захищені авторизацією
router.use(authMiddleware);

// POST /api/wishlist/add - додати товар до віш-ліста
router.post('/add', addToWishlist);

// GET /api/wishlist - отримати віш-ліст користувача
router.get('/', getWishlist);

// DELETE /api/wishlist/:itemId - видалити товар з віш-ліста по itemId
router.delete('/:itemId', removeFromWishlist);

// DELETE /api/wishlist/product/:productId - видалити товар з віш-ліста по productId
router.delete('/product/:productId', removeFromWishlistByProduct);

// DELETE /api/wishlist - очистити віш-ліст
router.delete('/', clearWishlist);

module.exports = router;