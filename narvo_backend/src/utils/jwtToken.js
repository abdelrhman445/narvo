const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a regular user
 */
const generateUserToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
      type: 'user', // Role claim to prevent cross-contamination
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'ecommerce-api',
      audience: 'ecommerce-user',
    }
  );
};

/**
 * Generate a JWT token for an admin
 */
const generateAdminToken = (adminId, role) => {
  return jwt.sign(
    {
      id: adminId,
      role,
      type: 'admin', // Role claim to prevent cross-contamination
    },
    process.env.JWT_ADMIN_SECRET, // Separate secret for admins
    {
      expiresIn: '8h', // Shorter expiry for admin sessions
      issuer: 'ecommerce-api',
      audience: 'ecommerce-admin',
    }
  );
};

/**
 * Verify a user JWT token
 */
const verifyUserToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'ecommerce-api',
    audience: 'ecommerce-user',
  });

  if (decoded.type !== 'user') {
    throw new Error('Invalid token type');
  }

  return decoded;
};

/**
 * Verify an admin JWT token
 */
const verifyAdminToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET, {
    issuer: 'ecommerce-api',
    audience: 'ecommerce-admin',
  });

  if (decoded.type !== 'admin') {
    throw new Error('Invalid token type');
  }

  return decoded;
};

module.exports = {
  generateUserToken,
  generateAdminToken,
  verifyUserToken,
  verifyAdminToken,
};
