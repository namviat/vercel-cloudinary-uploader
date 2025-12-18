const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') body = JSON.parse(body);

  const { dest, sources } = body;
  const BASE_FOLDER = 'mycloud';

  if (!dest || !Array.isArray(sources) || sources.length === 0) {
    return res.status(400).json({ error: 'Invalid merge request' });
  }

  if (sources.includes(dest)) {
    return res.status(400).json({ error: 'Source cannot be destination' });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzvz7kzin',
    api_key: process.env.CLOUDINARY_API_KEY || '484797141727837',
    api_secret: process.env.CLOUDINARY_API_SECRET || '0AhRs9vHrqghA5ZcXRyMckXlGjk'
  });
try {
    for (const source of sources) {
      let nextCursor = null;

      do {
        const result = await cloudinary.api.resources({
          resource_type: 'raw',
          type: 'upload',
          prefix: `${BASE_FOLDER}/${source}/`,
          max_results: 500,
          next_cursor: nextCursor
        });

        for (const file of result.resources) {
          const parts = file.public_id.split('/');
          const originalName = parts.pop();
          const nameOnly = originalName.replace(/\.[^/.]+$/, '');
          const ext = originalName.includes('.') ? '.' + originalName.split('.').pop() : '';

          // 🔐 Make filename collision-safe
          const safeName = `${nameOnly}__${source}${ext}`;
          const newPublicId = `${BASE_FOLDER}/${dest}/${safeName}`;

          try {
            await cloudinary.uploader.rename(
              file.public_id,
              newPublicId,
              { resource_type: 'raw' }
            );
          } catch (e) {
            console.error('Rename failed:', file.public_id, e.message);
            // continue merge, don’t kill entire process
          }
        }

        nextCursor = result.next_cursor;
      } while (nextCursor);

      // delete source folder AFTER all renames
      await cloudinary.api.delete_folder(`${BASE_FOLDER}/${source}`);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Merge fatal error:', err);
    return res.status(500).json({
      error: 'Merge failed',
      details: err.message
    });
  }
};

