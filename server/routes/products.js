const express = require('express');
const { getProducts, getProduct, getCategories, getPriceRange } = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/price-range', getPriceRange);
router.get('/:id', getProduct);

module.exports = router;
