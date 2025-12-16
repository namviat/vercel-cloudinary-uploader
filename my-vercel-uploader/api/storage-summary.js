// api/storage-summary.js
const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dzvz7kzin';
  const API_KEY = process.env.CLOUDINARY_API_KEY || '484797141727837';
  const API_SECRET = process.env.CLOUDINARY_API_SECRET || '0AhRs9vHrqghA5ZcXRyMckXlGjk';
  const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'mycloud';

  const BASE_FOLDER = 'mycloud';
  const STORAGE_LIMIT_BYTES = 25 * 1024 * 1024 * 1024; // 2GB

  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
  });

  try {
    let totalBytes = 0;
    const tokenSet = new Set();
    let nextCursor = null;

    do {
      const search = cloudinary.search
        .expression(`public_id:${BASE_FOLDER}/*`)
        .sort_by('created_at', 'desc')
        .max_results(500);

      if (nextCursor) search.next_cursor(nextCursor);

      const result = await search.execute();

      for (const file of result.resources) {
        totalBytes += file.bytes || 0;

        // public_id format: mycloud/<token>/<filename>
        const parts = file.public_id.split('/');
        if (parts.length >= 2) {
          tokenSet.add(parts[1]);
        }
      }

      nextCursor = result.next_cursor;
    } while (nextCursor);

    res.status(200).json({
      totalBytes,
      limitBytes: STORAGE_LIMIT_BYTES,
      tokensCount: tokenSet.size
    });

  } catch (error) {
    console.error('Storage summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch storage summary',
      details: error.message
    });
  }
};
