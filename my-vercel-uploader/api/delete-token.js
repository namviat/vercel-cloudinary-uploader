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


  try {
    let nextCursor = null;

    // 1️⃣ LIST + DELETE ALL RAW FILES (SAFE WAY)
    do {
      const result = await cloudinary.api.resources({
        resource_type: 'raw',
        type: 'upload',
        prefix: `${BASE_FOLDER}/${token}/`,
        max_results: 500,
        next_cursor: nextCursor
      });

      if (result.resources.length > 0) {
        const publicIds = result.resources.map(r => r.public_id);

        await cloudinary.api.delete_resources(publicIds, {
          resource_type: 'raw',
          type: 'upload'
        });
      }

      nextCursor = result.next_cursor;
    } while (nextCursor);

    // 2️⃣ DELETE FOLDER (COSMETIC)
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
