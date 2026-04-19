const { z } = require('zod');
const User = require('../models/User');
const { broadcastEmails } = require('../services/emailQueue');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const broadcastSchema = z.object({
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject cannot exceed 200 characters'),
  html: z
    .string()
    .min(10, 'Email body must be at least 10 characters')
    .max(100_000, 'Email body is too large'),
  text: z.string().max(50_000).optional(), // Plain-text fallback
});

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * POST /api/admin/marketing/broadcast
 * Protected: requireAdmin
 *
 * Fetches all active user emails and dispatches them in batches
 * via the email queue service (fire-and-forget – does not block response).
 */
const broadcastEmail = asyncHandler(async (req, res) => {
  const { subject, html, text } = broadcastSchema.parse(req.body);

  // Fetch all active user emails (only the email field for efficiency)
  const users = await User.find({ isActive: true }).select('email').lean();

  if (users.length === 0) {
    throw new AppError('No active users found to send emails to.', 404);
  }

  const emails = users.map((u) => u.email);

  // Fire-and-forget: dispatch the queue without awaiting it
  // The HTTP response is returned immediately
  broadcastEmails(emails, subject, html);

  res.status(202).json({
    success: true,
    message: `Broadcast queued for ${emails.length} recipient(s). Emails are being sent in the background.`,
    data: {
      totalRecipients: emails.length,
      subject,
      queuedAt: new Date().toISOString(),
      queuedBy: req.admin.username,
    },
  });
});

module.exports = { broadcastEmail };
