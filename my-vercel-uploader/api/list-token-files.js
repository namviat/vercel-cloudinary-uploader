const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  const token = req.query.token;
  const BASE_FOLDER = 'mycloud';

  if (!token) return res.status(400).json({ error: 'Token required' });

  cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzvz7kzin',
    api_key: process.env.CLOUDINARY_API_KEY || '484797141727837',
    api_secret: process.env.CLOUDINARY_API_SECRET || '0AhRs9vHrqghA5ZcXRyMckXlGjk'
  });

  try {
    const result = await cloudinary.api.resources({
      resource_type: 'raw',
      type: 'upload',
      prefix: `${BASE_FOLDER}/${token}/`,
      max_results: 100
    });

    res.json({ files: result.resources });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list token files' });
  }
};
