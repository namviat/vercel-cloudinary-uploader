const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch');

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
    // 1️⃣ Download the file from Cloudinary
    const response = await fetch(secureUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch source file');
    }

    const buffer = await response.buffer();

    // 2️⃣ Prepare destination filename
    const originalName = publicId.split('/').pop();
    const nameOnly = originalName.replace(/\.[^/.]+$/, '');
    const ext = originalName.includes('.')
      ? '.' + originalName.split('.').pop()
      : '';

    const safeName = `${nameOnly}__${fromToken}${ext}`;
    const destPublicId = `${BASE_FOLDER}/${toToken}/${safeName}`;

    // 3️⃣ Upload buffer to Cloudinary
    await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: destPublicId,
          type: 'upload'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    return res.json({ success: true });

  } catch (err) {
    console.error('Copy file failed:', err);
    return res.status(500).json({
      error: 'Copy failed',
      details: err.message
    });
  }
};
