// api/token.js
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'tokens.json');

/* =========================
   Name generator
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

function generateAnimeName(existingNames) {
  let name;
  do {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    name = Math.random() > 0.5
      ? `${adj} ${noun} ${titles[Math.floor(Math.random() * titles.length)]}`
      : `${adj} ${noun}`;
  } while (existingNames.has(name));
  return name;
}

/* =========================
   Helpers
========================= */
function loadTokens() {
  if (!fs.existsSync(DATA_PATH)) return {};
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function saveTokens(tokens) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(tokens, null, 2));
}

/* =========================
   API handler
========================= */
export default function handler(req, res) {
  try {
    const token =
      req.method === 'GET'
        ? req.query.token
        : req.body?.token;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const tokens = loadTokens();

    // CREATE TOKEN IF NOT EXISTS
    if (!tokens[token]) {
      const existingNames = new Set(
        Object.values(tokens).map(t => t.name)
      );

      tokens[token] = {
        token,
        name: generateAnimeName(existingNames),
        avatar: {
          style: 'adventurer',
          seed: token
        },
        createdAt: Date.now()
      };

      saveTokens(tokens);
    }

    // RETURN TOKEN DATA
    return res.status(200).json(tokens[token]);

  } catch (err) {
    console.error('Token API error:', err);
    return res.status(500).json({ error: 'Token API failed' });
  }
}
