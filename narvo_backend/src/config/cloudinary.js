const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer or path to Cloudinary
 * @param {string} filePathOrBase64 - local path or base64 string
 * @param {string} folder - destination folder in Cloudinary
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadToCloudinary = (filePathOrBase64, folder = 'products') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePathOrBase64,
      {
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
  });
};

/**
 * Delete a file from Cloudinary by public_id
 */
const deleteFromCloudinary = (public_id) => {
  return cloudinary.uploader.destroy(public_id);
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
