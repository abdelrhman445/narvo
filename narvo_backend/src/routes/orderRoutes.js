const express = require('express');
const router = express.Router();
const { checkout, getMyOrders } = require('../controllers/orderController');
const requireAuth = require('../middlewares/requireAuth');
const { checkoutLimiter } = require('../middlewares/rateLimiter');

/**
 * All order routes require user authentication
 */

// POST /api/orders/checkout — strict rate limit (3/min)
router.post('/checkout', requireAuth, checkoutLimiter, checkout);

// GET /api/orders/me — IDOR-safe: only returns current user's orders
router.get('/me', requireAuth, getMyOrders);

module.exports = router;
