const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') body = JSON.parse(body);

  const { token } = body;
  const BASE_FOLDER = 'mycloud';

  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzvz7kzin',
    api_key: process.env.CLOUDINARY_API_KEY || '484797141727837',
    api_secret: process.env.CLOUDINARY_API_SECRET || '0AhRs9vHrqghA5ZcXRyMckXlGjk'
  });

  try {
    // 1️⃣ Delete all files under token
    await cloudinary.api.delete_resources_by_prefix(
      `${BASE_FOLDER}/${token}/`,
      { resource_type: 'raw', type: 'upload' }
    );

    // 2️⃣ Delete token folder (cosmetic)
    try {
      await cloudinary.api.delete_folder(`${BASE_FOLDER}/${token}`);
    } catch (_) {}

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Delete token failed:', err);
    return res.status(500).json({
      error: 'Delete token failed',
      details: err.message
    });
  }
};
