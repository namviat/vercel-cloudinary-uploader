// api/token.js
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================
   Anime name generator
========================= */
const adjectives = [
  "Silent","Crimson","Azure","Shadow","Lunar","Obsidian",
  "Ivory","Golden","Phantom","Scarlet","Frozen","Storm",
  "Void","Eternal","Celestial","Midnight","Radiant","Feral"
];

const nouns = [
  "Ronin","Samurai","Shinobi","Kitsune","Oni","Dragon",
  "Lotus","Sakura","Vanguard","Slayer","Wanderer",
  "Guardian","Fox","Raven","Blade","Spirit"
];

const titles = [
  "of Dawn","of Twilight","of the Void","of Ash",
  "of Mist","of Ember","of Frost","of Night"
];

function generateAnimeName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return Math.random() > 0.5
    ? `${adj} ${noun} ${titles[Math.floor(Math.random() * titles.length)]}`
    : `${adj} ${noun}`;
}

/* =========================
   API handler
========================= */
export default async function handler(req, res) {
  try {
    const token =
      req.method === 'GET'
        ? req.query.token
        : req.body?.token;

    if (!token) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const folder = `mycloud/${token}`;

    // try to read folder resources
    const resources = await cloudinary.v2.search
      .expression(`folder:${folder}`)
      .max_results(1)
      .execute();

    let profileName;
    let avatarSeed = token;

    if (resources.resources.length > 0) {
      const ctx = resources.resources[0].context || {};
      profileName = ctx.profile_name;
    }

    // FIRST TIME → create metadata
    if (!profileName) {
      profileName = generateAnimeName();

      // attach metadata to folder by tagging first asset
      if (resources.resources.length > 0) {
        await cloudinary.v2.uploader.add_context(
          {
            profile_name: profileName,
          },
          resources.resources[0].public_id
        );
      }
    }

    return res.status(200).json({
      token,
      name: profileName,
      avatar: {
        style: 'adventurer',
        seed: avatarSeed,
      },
    });

  } catch (err) {
    console.error('Token API error:', err);
    return res.status(500).json({ error: 'Token API failed' });
  }
}
