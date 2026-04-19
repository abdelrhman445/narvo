const mongoSanitize = require('express-mongo-sanitize');

/**
 * NoSQL Injection Sanitization Middleware
 *
 * express-mongo-sanitize removes keys that start with '$' or contain '.'
 * from req.body, req.query, and req.params — preventing NoSQL injection attacks.
 *
 * Example attack prevented:
 *   POST /login { "username": { "$gt": "" }, "password": { "$gt": "" } }
 */
const sanitizeMiddleware = mongoSanitize({
  replaceWith: '_',         // Replace prohibited chars instead of removing
  allowDots: false,         // Disallow dot notation in keys
  onSanitize: ({ req, key }) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[SECURITY] Sanitized potentially malicious key: "${key}" from ${req.ip}`);
    }
  },
});

module.exports = sanitizeMiddleware;
