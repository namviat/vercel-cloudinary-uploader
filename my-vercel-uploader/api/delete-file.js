// api/delete-file.js
const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: 'Missing public_id in request body.' });
  }

  // Cloudinary credentials from Vercel Environment Variables
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dzvz7kzin';
  const API_KEY = process.env.CLOUDINARY_API_KEY || '484797141727837';
  const API_SECRET = process.env.CLOUDINARY_API_SECRET || '0AhRs9vHrqghA5ZcXRyMckXlGjk';

  // Configure Cloudinary with your credentials
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
  });

  try {
    // Delete the resource from Cloudinary
    // Using 'raw' type as files could be non-image
    const result = await cloudinary.api.delete_resources([public_id], { type: 'upload', resource_type: 'raw' });

    if (result.deleted && result.deleted[public_id] === 'deleted') {
      res.status(200).json({ message: 'File deleted successfully.' });
    } else {
      console.error('Cloudinary deletion result:', result);
      res.status(500).json({ error: 'Failed to delete file from Cloudinary.' });
    }
  } catch (error) {
    console.error('Cloudinary API error during deletion:', error);
    res.status(500).json({ error: error.message || 'An error occurred during file deletion.' });
  }
};
