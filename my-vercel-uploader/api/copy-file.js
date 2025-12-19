const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') body = JSON.parse(body);

  const { fromToken, toToken, publicId, secureUrl } = body;
  const BASE_FOLDER = 'mycloud';

  if (!fromToken || !toToken || !publicId || !secureUrl) {
    return res.status(400).json({ error: 'Missing data' });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzvz7kzin',
    api_key: process.env.CLOUDINARY_API_KEY || '484797141727837',
    api_secret: process.env.CLOUDINARY_API_SECRET || '0AhRs9vHrqghA5ZcXRyMckXlGjk'
  });

  try {
    // build collision-safe name
    const originalName = publicId.split('/').pop();
    const nameOnly = originalName.replace(/\.[^/.]+$/, '');
    const ext = originalName.includes('.') ? '.' + originalName.split('.').pop() : '';

    const safeName = `${nameOnly}__${fromToken}_${Date.now()}${ext}`;
    const destPublicId = `${BASE_FOLDER}/${toToken}/${safeName}`;

    // 🔥 CLOUDINARY-SIDE COPY (RELIABLE)
    const result = await cloudinary.uploader.upload(secureUrl, {
      resource_type: 'raw',
      public_id: destPublicId,
      overwrite: false
    });

    if (!result || !result.public_id) {
      throw new Error('Cloudinary copy failed');
    }

    console.log('Copied file:', result.public_id);

    return res.json({ success: true });

  } catch (err) {
    console.error('Copy file failed:', err);
    return res.status(500).json({
      error: 'Copy failed',
      details: err.message
    });
  }
};
