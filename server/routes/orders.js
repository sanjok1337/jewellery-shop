const express = require('express');
const { getUserOrders, getOrderDetails, createOrder } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getUserOrders);
router.get('/:orderId', authMiddleware, getOrderDetails);

module.exports = router;