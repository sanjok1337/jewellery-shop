const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

// Отримати всі відгуки для товару (публічний доступ)
router.get('/product/:productId', reviewController.getProductReviews);

// Створити новий відгук або коментар (потребує авторизації)
router.post('/', authMiddleware, reviewController.createReview);

// Оновити відгук (потребує авторизації)
router.put('/:reviewId', authMiddleware, reviewController.updateReview);

// Видалити відгук (потребує авторизації)
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

module.exports = router;
