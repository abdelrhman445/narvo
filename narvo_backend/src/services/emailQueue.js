const { sendMail } = require('../config/mailer');

const BATCH_SIZE = 50;          // Emails per batch
const BATCH_DELAY_MS = 2000;   // Delay between batches (2 seconds)

/**
 * Split an array into chunks of a given size
 * @param {Array} array
 * @param {number} size
 * @returns {Array[]}
 */
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Send a single batch of emails
 * @param {string[]} emails
 * @param {string} subject
 * @param {string} html
 * @returns {Promise<{sent: number, failed: number}>}
 */
const sendBatch = async (emails, subject, html) => {
  let sent = 0;
  let failed = 0;

  const promises = emails.map((email) =>
    sendMail({ to: email, subject, html })
      .then(() => { sent++; })
      .catch((err) => {
        failed++;
        console.error(`[EmailQueue] Failed to send to ${email}:`, err.message);
      })
  );

  await Promise.allSettled(promises);
  return { sent, failed };
};

/**
 * Broadcast an email to all provided recipients in batches
 * Runs asynchronously in the background – does NOT block the HTTP response.
 *
 * @param {string[]} allEmails  - Array of recipient email addresses
 * @param {string} subject      - Email subject
 * @param {string} html         - HTML body
 * @param {Function} [onProgress] - Optional callback: ({batchIndex, totalBatches, sent, failed}) => void
 * @returns {void}              - Fire-and-forget
 */
const broadcastEmails = (allEmails, subject, html, onProgress) => {
  const uniqueEmails = [...new Set(allEmails)];
  const batches = chunkArray(uniqueEmails, BATCH_SIZE);
  const totalBatches = batches.length;

  let totalSent = 0;
  let totalFailed = 0;

  console.log(
    `[EmailQueue] Starting broadcast: ${uniqueEmails.length} recipients in ${totalBatches} batches`
  );

  // Process batches sequentially with delays using recursive setTimeout
  const processBatch = (index) => {
    if (index >= totalBatches) {
      console.log(
        `[EmailQueue] Broadcast complete. Sent: ${totalSent}, Failed: ${totalFailed}`
      );
      return;
    }

    sendBatch(batches[index], subject, html).then(({ sent, failed }) => {
      totalSent += sent;
      totalFailed += failed;

      console.log(
        `[EmailQueue] Batch ${index + 1}/${totalBatches} — Sent: ${sent}, Failed: ${failed}`
      );

      if (typeof onProgress === 'function') {
        onProgress({
          batchIndex: index + 1,
          totalBatches,
          batchSent: sent,
          batchFailed: failed,
          totalSent,
          totalFailed,
        });
      }

      // Wait before processing the next batch
      setTimeout(() => processBatch(index + 1), BATCH_DELAY_MS);
    });
  };

  // Start the queue without blocking the event loop
  setImmediate(() => processBatch(0));
};

module.exports = { broadcastEmails };
