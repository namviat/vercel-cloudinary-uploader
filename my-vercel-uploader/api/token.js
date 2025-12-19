// api/token.js

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;

    // SAFETY: parse body if it's a string
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const token = body?.token;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid token' });

    }

    return res.status(200).json({
      ok: true,
      token
    });

  } catch (error) {
    console.error('Token API error:', error);
    return res.status(500).json({
      error: 'Token API failed',
      details: error.message
    });
  }
};
