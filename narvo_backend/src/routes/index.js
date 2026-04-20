const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const adminRoutes = require('./adminRoutes');
const categoryRoutes = require('./categoryRoutes');
const { adminLogin } = require('../controllers/authController');
const { adminLoginLimiter } = require('../middlewares/rateLimiter');


// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'Operational',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ─── Public Routes ────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

// ─── Hidden Admin Login Route ─────────────────────────────────────────────────
// Obfuscated path: not discoverable from public API docs
// Strict rate limiting: 5 attempts per 15 minutes
router.post('/management-portal-x1/login', adminLoginLimiter, adminLogin);

// ─── Admin Panel Routes ───────────────────────────────────────────────────────
router.use('/admin', adminRoutes);

router.use('/admin/categories', categoryRoutes);
// ─── 404 Catch-all ───────────────────────────────────────────────────────────
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

module.exports = router;
