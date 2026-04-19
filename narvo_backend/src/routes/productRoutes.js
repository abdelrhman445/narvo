const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
} = require('../controllers/productController');

/**
 * Public product routes — no authentication required
 */

// GET /api/products
router.get('/', getProducts);

// GET /api/products/:id
router.get('/:id', getProduct);

module.exports = router;
