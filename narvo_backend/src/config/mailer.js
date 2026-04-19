const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,          // Use connection pooling
  maxConnections: 5,   // Max concurrent SMTP connections
  maxMessages: 100,    // Max messages per connection
});

// Verify connection on startup (non-blocking)
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

/**
 * Send a single email
 * @param {object} options - { to, subject, html, text }
 */
const sendMail = async ({ to, subject, html, text }) => {
  return transporter.sendMail({
    from: `"E-Commerce Store" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html,
    text,
  });
};

module.exports = { transporter, sendMail };
