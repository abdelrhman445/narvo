const rateLimit = require('express-rate-limit');

/**
 * Generic rate limit response formatter
 */
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    error: 'Too many requests. Please try again later.',
  });
};

/**
 * Standard limiter: 100 requests per 15 minutes
 * Applied globally to all routes
 */
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => req.ip === '127.0.0.1' && process.env.NODE_ENV === 'test',
});

/**
 * Strict limiter for Admin Login: 5 requests per 15 minutes
 * Protects against brute-force attacks on the hidden admin portal
 */
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Your IP has been blocked for 15 minutes.',
    });
  },
  // Use IP + route for key (prevents key-sharing abuse)
  keyGenerator: (req) => `admin-login:${req.ip}`,
  skipSuccessfulRequests: false,
});

/**
 * Checkout limiter: 3 requests per 1 minute
 * Prevents order flooding / stock manipulation
 */
const checkoutLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => `checkout:${req.ip}`,
});

/**
 * Google OAuth callback limiter: 10 requests per 5 minutes
 */
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = {
  standardLimiter,
  adminLoginLimiter,
  checkoutLimiter,
  authLimiter,
};
