// api/list-files.js
const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  // Cloudinary credentials from Vercel Environment Variables
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dzvz7kzin';
  const API_KEY = process.env.CLOUDINARY_API_KEY || '484797141727837';
  const API_SECRET = process.env.CLOUDINARY_API_SECRET || '0AhRs9vHrqghA5ZcXRyMckXlGjk';
  const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'mycloud';
  const BASE_FOLDER = 'mycloud';

  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }

  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
  });

  try {
    const result = await cloudinary.search
      .expression(`folder:${BASE_FOLDER}/${token}`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    res.status(200).json({
      token,
      resources: result.resources
    });

  } catch (error) {
    console.error('Cloudinary list error:', error);
    res.status(500).json({ error: 'Failed to fetch files from Cloudinary.' });
  }
};
};

