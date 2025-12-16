// api/storage-summary.js
const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dzvz7kzin';
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;
  const BASE_FOLDER = 'mycloud';

  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
  });

  try {
    let totalBytes = 0;
    const tokenSet = new Set();

    let result = await cloudinary.search
      .expression(`folder:${BASE_FOLDER}/*`)
      .max_results(500)
      .execute();

    result.resources.forEach(file => {
      totalBytes += file.bytes || 0;

      // public_id = mycloud/token/filename
      const parts = file.public_id.split('/');
      if (parts.length >= 2) tokenSet.add(parts[1]);
    });

    res.status(200).json({
      totalBytes,
      limitBytes: 2 * 1024 * 1024 * 1024, // 2GB example
      tokensCount: tokenSet.size
    });
  } catch (error) {
    console.error('Storage summary error:', error);
    res.status(500).json({ error: 'Failed to fetch storage summary' });
  }
};
