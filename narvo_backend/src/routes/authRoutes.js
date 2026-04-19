const express = require('express');
const router = express.Router();
const { googleCallback } = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');

/**
 * POST /api/auth/google/callback
 * Accepts a Google ID Token from the frontend (after Google Sign-In)
 * Finds or creates a User account and returns a JWT
 */
router.post('/google/callback', authLimiter, googleCallback);

module.exports = router;
