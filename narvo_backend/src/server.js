require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const { standardLimiter } = require('./middlewares/rateLimiter');
const sanitizeMiddleware = require('./middlewares/sanitize');
const { errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes/index');


// ─── Validate Required Env Variables ─────────────────────────────────────────
const REQUIRED_ENV = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_ADMIN_SECRET',
  'GOOGLE_CLIENT_ID',
];

const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// ─── Connect to Database ──────────────────────────────────────────────────────
connectDB();

// ─── Initialize App ───────────────────────────────────────────────────────────
const app = express();

// ─── Security Middlewares ─────────────────────────────────────────────────────

// 1. Helmet: Sets secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
  })
);

// 2. CORS — restrict to your frontend origin in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'https://narvo-frontend.vercel.app'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server (no origin) or whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
  })
);

// 3. Body parsers with size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. NoSQL Injection Sanitization (express-mongo-sanitize)
app.use(sanitizeMiddleware);

// 5. Standard rate limiter applied globally
app.use(standardLimiter);

// ─── Trust Proxy (for accurate IP behind load balancers) ─────────────────────
app.set('trust proxy', 1);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be registered AFTER all routes
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed.');
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });

  // Force shutdown if graceful close takes too long
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  gracefulShutdown('unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
