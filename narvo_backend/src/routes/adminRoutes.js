const express = require('express');
const router = express.Router();

const { requireAdmin } = require('../middlewares/requireAdmin');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  adminGetProducts,
} = require('../controllers/productController');
const {
  adminGetOrders,
  adminUpdateOrderStatus,
} = require('../controllers/orderController');
const { addExpense, getFinancialReport } = require('../controllers/adminController');
const { broadcastEmail } = require('../controllers/marketingController');

// All routes in this file are protected by requireAdmin
router.use(requireAdmin);

// ─── Product Management ───────────────────────────────────────────────────────
router.get('/products', adminGetProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ─── Order Management ─────────────────────────────────────────────────────────
router.get('/orders', adminGetOrders);
router.put('/orders/:id', adminUpdateOrderStatus);

// ─── Finance / Ledger ─────────────────────────────────────────────────────────
router.post('/finance/expense', addExpense);
router.get('/finance/report', getFinancialReport);

// ─── Marketing ────────────────────────────────────────────────────────────────
router.post('/marketing/broadcast', broadcastEmail);

module.exports = router;
