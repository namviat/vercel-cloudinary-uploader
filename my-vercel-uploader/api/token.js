// /api/token.js

let TOKENS = {}; // in-memory (safe for now)

const adjectives = [
  "Silent","Crimson","Azure","Shadow","Lunar","Obsidian",
  "Ivory","Golden","Phantom","Scarlet","Frozen","Storm",
  "Void","Eternal","Celestial","Midnight","Radiant","Feral"
];

const nouns = [
  "Ronin","Samurai","Shinobi","Kitsune","Oni","Dragon",
  "Lotus","Sakura","Wanderer","Guardian","Fox","Raven","Spirit"
];

function generateAnimeName(existing) {
  let name;
  do {
    const a = adjectives[Math.floor(Math.random()*adjectives.length)];
    const n = nouns[Math.floor(Math.random()*nouns.length)];
    name = `${a} ${n}`;
  } while (existing.has(name));
  return name;
}

export default function handler(req, res) {

  /* ======================
     GET → fetch or create
  ====================== */
  if (req.method === "GET") {
    const token = req.query.token;
    if (!token) return res.status(400).json({ error: "Token missing" });

    if (!TOKENS[token]) {
      const existing = new Set(Object.values(TOKENS).map(t => t.name));

      TOKENS[token] = {
        token,
        name: generateAnimeName(existing),
        avatar: {
          style: "adventurer",
          seed: token
        },
        createdAt: Date.now()
      };
    }

    return res.json(TOKENS[token]);
  }

  /* ======================
     POST → update profile
  ====================== */
  if (req.method === "POST") {
    const { token, name } = req.body || {};
    if (!token || !name) {
      return res.status(400).json({ error: "Invalid data" });
    }

    if (!TOKENS[token]) {
      return res.status(404).json({ error: "Token not found" });
    }

    TOKENS[token].name = name;
    return res.json({ ok: true });
  }

  res.status(405).end();
}
