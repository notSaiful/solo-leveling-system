const GITHUB_API = 'https://api.github.com';
const DEFAULT_FILENAME = 'solo-leveling-system-state.json';

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || `GitHub API error ${response.status}`;
    throw new Error(message);
  }
  return data;
}

function parseStoredState(gist) {
  const filename = process.env.SLS_GIST_FILENAME || DEFAULT_FILENAME;
  const content = gist?.files?.[filename]?.content;
  if (!content) return null;
  const parsed = JSON.parse(content);
  return parsed?.state || null;
}

async function readStoredState() {
  const gist = await githubRequest(`/gists/${process.env.SLS_GIST_ID}`);
  return parseStoredState(gist);
}

async function writeStoredState(state) {
  const filename = process.env.SLS_GIST_FILENAME || DEFAULT_FILENAME;
  await githubRequest(`/gists/${process.env.SLS_GIST_ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: {
        [filename]: {
          content: JSON.stringify({
            state,
            updatedAt: new Date().toISOString(),
          }, null, 2),
        },
      },
    }),
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (!['GET', 'PUT'].includes(req.method)) return sendJson(res, 405, { error: 'Method not allowed' });

  const expectedSecret = process.env.SLS_SYNC_SECRET;
  const providedSecret = req.headers['x-sls-sync-secret'];
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return sendJson(res, 401, { error: 'Unauthorized' });
  }

  if (!process.env.GITHUB_TOKEN || !process.env.SLS_GIST_ID) {
    return sendJson(res, 500, { error: 'Sync backend is not configured' });
  }

  try {
    if (req.method === 'GET') {
      const state = await readStoredState();
      return sendJson(res, 200, { state });
    }

    const body = await readBody(req);
    const incomingState = body?.state;
    if (!incomingState || typeof incomingState !== 'object') {
      return sendJson(res, 400, { error: 'Invalid state payload' });
    }

    const currentState = await readStoredState();
    const incomingTime = incomingState.lastUpdated || 0;
    const currentTime = currentState?.lastUpdated || 0;

    if (currentState && incomingTime < currentTime) {
      return sendJson(res, 200, { accepted: false, state: currentState });
    }

    await writeStoredState(incomingState);
    return sendJson(res, 200, { accepted: true, state: incomingState });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Sync failed' });
  }
}
