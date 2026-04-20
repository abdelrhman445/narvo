const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const adminRoutes = require('./adminRoutes');
const categoryRoutes = require('./categoryRoutes');

// ✅ استدعاء الكنترولر عشان الراوتس العامة (Public)
const categoryController = require('../controllers/categoryController');

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
router.use('/products', productRoutes); // ✅ ده لوحده كفاية للمنتجات لأنه جواه الـ GET
router.use('/orders', orderRoutes);

// ✅ مسار جلب الفئات للجمهور (عشان يظهر في الـ Navbar)
router.get('/categories', categoryController.getCategories);

// ─── Hidden Admin Login Route ─────────────────────────────────────────────────
router.post('/management-portal-x1/login', adminLoginLimiter, adminLogin);

// ─── Admin Panel Routes ───────────────────────────────────────────────────────
router.use('/admin', adminRoutes);

// ✅ مسارات إدارة الفئات (للأدمن فقط)
router.use('/admin/categories', categoryRoutes);

// ─── 404 Catch-all ───────────────────────────────────────────────────────────
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

module.exports = router;
