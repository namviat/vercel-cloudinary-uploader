import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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

function generateAnimeName(existing) {
  let name;
  do {
    const a = adjectives[Math.floor(Math.random() * adjectives.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    name = Math.random() > 0.5
      ? `${a} ${n} ${titles[Math.floor(Math.random() * titles.length)]}`
      : `${a} ${n}`;
  } while (existing.has(name));
  return name;
}

/* =========================
   API
========================= */
export default async function handler(req, res) {
  const token = req.method === 'GET'
    ? req.query.token
    : req.body?.token;

  if (!token) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  const folderPath = `mycloud/${token}`;

  try {
    // Try listing folder
    let folder;
    try {
      folder = await cloudinary.v2.api.sub_folders(`mycloud`);
    } catch {}

    const folders = folder?.folders || [];
    const exists = folders.find(f => f.name === token);

    // Collect existing names
    const existingNames = new Set();
    for (const f of folders) {
      const details = await cloudinary.v2.api.folder(`mycloud/${f.name}`);
      if (details.context?.custom?.name) {
        existingNames.add(details.context.custom.name);
      }
    }

    // CREATE METADATA IF NOT EXISTS
    if (!exists) {
      const name = generateAnimeName(existingNames);

      await cloudinary.v2.api.create_folder(folderPath);

      await cloudinary.v2.api.update_folder(folderPath, {
        context: {
          name,
          avatar: 'adventurer'
        }
      });

      return res.json({
        token,
        name,
        avatar: {
          style: 'adventurer',
          seed: token
        }
      });
    }

    // READ METADATA
    const info = await cloudinary.v2.api.folder(folderPath);
    const ctx = info.context?.custom || {};

    return res.json({
      token,
      name: ctx.name || 'Unknown',
      avatar: {
        style: ctx.avatar || 'adventurer',
        seed: token
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Token API failed' });
  }
}
