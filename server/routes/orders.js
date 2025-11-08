const express = require('express');
const { getUserOrders, getOrderDetails } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getUserOrders);
router.get('/:orderId', authMiddleware, getOrderDetails);

module.exports = router;