// api/token.js
// Serverless endpoint to check/create a token in a tokens.txt file in the GitHub repo.
// Expects POST { "token": "abc123" }

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // owner/repo, e.g. "yourname/yourrepo"
const TOKENS_FILE_PATH = process.env.TOKENS_FILE_PATH || 'tokens.txt';

if (!GITHUB_TOKEN || !GITHUB_REPO) {
  console.warn('GITHUB_TOKEN or GITHUB_REPO not set in env');
}

async function getFile() {
  // GET file metadata/content from GitHub API
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURIComponent(TOKENS_FILE_PATH)}`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
  if (resp.status === 404) return null;
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`GitHub get file error: ${resp.status} ${txt}`);
  }
  return resp.json();
}

async function putFile(contentBase64, sha, message) {
  // Create or update the file using PUT
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURIComponent(TOKENS_FILE_PATH)}`;
  const body = { message, content: contentBase64 };
  if (sha) body.sha = sha;
  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`GitHub put file error: ${resp.status} ${txt}`);
  }
  return resp.json();
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    // Ensure JSON body is parsed. Vercel auto-parses req.body; if you test locally with node,
    // make sure the body-parser behavior is present.
    const { token } = req.body || {};
    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ error: 'token required' });
    }
    const normalized = token.trim();

    // get current file (if any)
    const fileData = await getFile();
    if (fileData) {
      // file exists: fileData.content is base64
      const content = Buffer.from(fileData.content, 'base64').toString('utf8');
      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.includes(normalized)) {
        return res.status(200).json({ exists: true });
      }
      // append token and update file
      lines.push(normalized);
      const newContent = lines.join('\n') + '\n';
      const base64 = Buffer.from(newContent, 'utf8').toString('base64');
      await putFile(base64, fileData.sha, `Add token ${normalized} via Qloud`);
      return res.status(200).json({ created: true });
    } else {
      // file does not exist: create it
      const newContent = normalized + '\n';
      const base64 = Buffer.from(newContent, 'utf8').toString('base64');
      await putFile(base64, undefined, `Create tokens file and add ${normalized}`);
      return res.status(200).json({ created: true });
    }
  } catch (err) {
    console.error('api/token error:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
token.jstoken.js
