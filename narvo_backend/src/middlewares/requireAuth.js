const { verifyUserToken } = require('../utils/jwtToken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');

/**
 * Middleware: Authenticate regular users via JWT
 * Strictly validates that the token belongs to a USER, not an admin.
 */
const requireAuth = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token using USER-specific secret and claims
    //    verifyUserToken throws if type !== 'user', preventing admin token reuse
    const decoded = verifyUserToken(token);

    // 3. Fetch user from DB to ensure they still exist and are active
    const user = await User.findById(decoded.id).select('+isActive');
    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated.', 403));
    }

    // 4. Attach user to request object (only safe fields)
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    // Update lastActive asynchronously (non-blocking)
    User.findByIdAndUpdate(user._id, { lastActive: new Date() }).exec();

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireAuth;
