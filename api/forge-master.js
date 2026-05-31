const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_SITE = 'https://solo-leveling-system-psi.vercel.app';

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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: 'Forge-Master backend is missing OPENROUTER_API_KEY' });
  }

  try {
    const body = await readBody(req);
    const payload = {
      model: body.model,
      messages: body.messages,
      temperature: body.temperature ?? 0.85,
      max_tokens: body.max_tokens ?? 1500,
      include_reasoning: false,
    };

    if (!payload.model || !Array.isArray(payload.messages)) {
      return sendJson(res, 400, { error: 'Invalid Forge-Master payload' });
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || DEFAULT_SITE,
        'X-Title': 'Solo Leveling System',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      return sendJson(res, response.status, {
        error: data?.error?.message || data?.message || `OpenRouter error ${response.status}`,
      });
    }

    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Forge-Master proxy failed' });
  }
}
