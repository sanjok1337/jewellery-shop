const express = require('express');
const {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Всі роути потребують авторизації
router.use(authMiddleware);

router.get('/', getUserAddresses);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
