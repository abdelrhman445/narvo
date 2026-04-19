const { ZodError } = require('zod');

/**
 * Global Error Handler Middleware
 * Must be last middleware registered in Express
 */
const errorHandler = (err, req, res, next) => {
  // Log the error (avoid logging in production without a proper logger)
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  }

  // --- Zod Validation Errors ---
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors,
    });
  }

  // --- Mongoose Duplicate Key Error ---
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      error: `Duplicate value for field: ${field}`,
    });
  }

  // --- Mongoose Validation Error ---
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages,
    });
  }

  // --- Mongoose Cast Error (invalid ObjectId) ---
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid value for field: ${err.path}`,
    });
  }

  // --- JWT Errors ---
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid or malformed token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token has expired',
    });
  }

  // --- Operational Errors (thrown explicitly by us) ---
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: err.message,
    });
  }

  // --- Generic / Unknown Server Error ---
  return res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected server error occurred'
        : err.message,
  });
};

/**
 * Helper to create operational errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper – eliminates try/catch in controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, AppError, asyncHandler };
