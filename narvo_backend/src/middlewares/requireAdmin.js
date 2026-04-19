const { verifyAdminToken } = require('../utils/jwtToken');
const Admin = require('../models/Admin');
const { AppError } = require('./errorHandler');

/**
 * Middleware: Authenticate admins via JWT
 * Uses a SEPARATE secret and separate 'type' claim from user tokens.
 * A user token CANNOT pass this middleware even if somehow obtained.
 */
const requireAdmin = async (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Admin access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify with ADMIN-specific secret + audience/issuer claims
    //    verifyAdminToken throws if type !== 'admin'
    const decoded = verifyAdminToken(token);

    // 3. Confirm admin still exists in DB
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return next(new AppError('Admin account not found.', 401));
    }

    // 4. Attach admin context to request
    req.admin = {
      id: admin._id.toString(),
      username: admin.username,
      role: admin.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Require a specific admin role
 * Used for future role extension (e.g., finance_admin vs super_admin)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = { requireAdmin, requireRole };
