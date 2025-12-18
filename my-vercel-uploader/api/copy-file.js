const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { fromToken, toToken, publicId, secureUrl } = req.body;
  const BASE_FOLDER = 'mycloud';

  if (!fromToken || !toToken || !secureUrl)
    return res.status(400).json({ error: 'Missing data' });

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzvz7kzin',
    api_key: process.env.CLOUDINARY_API_KEY || '484797141727837',
    api_secret: process.env.CLOUDINARY_API_SECRET || '0AhRs9vHrqghA5ZcXRyMckXlGjk'
  });

  try {
    const filename = publicId.split('/').pop();
    const safeName = `${filename.replace('.', `__${fromToken}.`)}`;

    await cloudinary.uploader.upload(secureUrl, {
      resource_type: 'raw',
      public_id: `${BASE_FOLDER}/${toToken}/${safeName}`
    });

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Copy failed' });
  }
};
