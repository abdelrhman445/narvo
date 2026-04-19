const { z } = require('zod');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateUserToken, generateAdminToken } = require('../utils/jwtToken');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Zod Schemas ────────────────────────────────────────────────────────────

const googleCallbackSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

const adminLoginSchema = z.object({
  username: z
    .string()
    .min(4, 'Username must be at least 4 characters')
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Invalid username format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/google/callback
 * Accepts a Google ID Token from the frontend, verifies it,
 * then finds or creates the user and returns a JWT.
 */
const googleCallback = asyncHandler(async (req, res) => {
  // 1. Validate request body
  const { idToken } = googleCallbackSchema.parse(req.body);

  // 2. Verify token with Google
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError('Invalid or expired Google token.', 401);
  }

// استخراج البيانات مع وضع اسم احتياطي في حال فشل جوجل في إرساله
const { sub: googleId, email, picture: avatar } = payload;
const name = payload.name || email.split('@')[0]; // لو الاسم مش موجود، خد اللي قبل الـ @ في الإيميل

  if (!googleId || !email) {
    throw new AppError('Google account is missing required fields.', 400);
  }

  // 3. Find or create user
  let user = await User.findOne({ googleId });

  if (!user) {
    // Check if email already in use by another Google account
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new AppError('This email is already linked to another account.', 409);
    }

    user = await User.create({ googleId, email, name, avatar });
  } else {
    // Update profile info in case it changed on Google
    user.name = name;
    user.avatar = avatar;
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });
  }

  // 4. Issue JWT
  const token = generateUserToken(user._id.toString());

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
  });
});

/**
 * POST /api/management-portal-x1/login
 * Hidden admin login route. Returns an Admin JWT on success.
 * Implements account lockout after 5 failed attempts.
 */
const adminLogin = asyncHandler(async (req, res) => {
  // 1. Validate body
  const { username, password } = adminLoginSchema.parse(req.body);

  // 2. Fetch admin with sensitive fields
  const admin = await Admin.findOne({ username }).select(
    '+password +loginAttempts +lockUntil'
  );

  // 3. Constant-time response to prevent username enumeration
  if (!admin) {
    // Still run bcrypt to prevent timing attacks
    await require('bcryptjs').compare(password, '$2a$12$invalidhashfortimingpurposes00000000000000000000000000');
    throw new AppError('Invalid credentials.', 401);
  }

  // 4. Check account lock
  if (admin.isLocked) {
    const lockRemaining = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
    throw new AppError(
      `Account is locked. Try again in ${lockRemaining} minute(s).`,
      423
    );
  }

  // 5. Verify password
  const isMatch = await admin.comparePassword(password);

  if (!isMatch) {
    await admin.incLoginAttempts();
    throw new AppError('Invalid credentials.', 401);
  }

  // 6. Reset attempts on success
  await admin.resetLoginAttempts();

  // 7. Issue Admin JWT
  const token = generateAdminToken(admin._id.toString(), admin.role);

  res.status(200).json({
    success: true,
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      role: admin.role,
    },
  });
});

module.exports = { googleCallback, adminLogin };
