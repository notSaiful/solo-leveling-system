import { callModelWithSystem, sanitize, containsCrisisSignal, getCrisisResponse } from './aiAssistant';
import { lookupActivity } from '../data/activityCatalog';

const PILLARS = ['deen', 'body', 'money'];

const PARSER_SYSTEM_PROMPT = `You are the System's activity parser. The user tells you what they did today. Convert their input into a JSON array of activities.

For each activity return an object with EXACTLY these fields:
- activityKey: lowercase kebab-case slug (e.g. "pushups", "fajr", "ai-business-idea"). Reuse the same key for the same activity across days.
- name: short display name (max 40 chars)
- pillar: one of "deen", "body", "money" (deen = Islamic worship/character, body = physical/outdoor, money = wealth/AI work/halal income)
- quantity: number or null
- unit: string or null (e.g. "reps", "minutes", "rupees")
- effortScore: integer 1-10 (1 = trivial, 10 = extreme effort)
- notes: string or null

Rules:
- Output ONLY a JSON array. No prose, no markdown fences.
- If the input is ambiguous, make a single best guess.
- If the input is not an activity log (a question, a complaint), return [].
- Never include [[CMD]] markers.`;

export function safeParseActivities(raw) {
  if (!raw) return null;
  let text = String(raw).trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const arr = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

export function normalizeActivity(a) {
  if (!a || typeof a !== 'object') return null;
  const pillar = PILLARS.includes(a.pillar) ? a.pillar : 'deen';
  const rawEffort = a.effortScore == null ? 3 : Number(a.effortScore);
  const effortScore = Math.max(1, Math.min(10, Math.round(Number.isFinite(rawEffort) ? rawEffort : 3)));
  const quantity = a.quantity == null ? null : Number.isFinite(Number(a.quantity)) ? Number(a.quantity) : null;
  const key = String(a.activityKey || a.key || 'activity')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'activity';
  return {
    activityKey: key,
    name: String(a.name || key).slice(0, 40),
    pillar,
    quantity,
    unit: a.unit == null ? null : String(a.unit).slice(0, 20),
    effortScore,
    notes: a.notes == null ? null : String(a.notes).slice(0, 200),
  };
}

export async function parseActivities(text, context = {}) {
  const cleaned = sanitize(String(text || ''));
  if (containsCrisisSignal(cleaned)) {
    return { crisis: true, message: getCrisisResponse(), activities: [] };
  }
  if (!cleaned.trim()) {
    return { crisis: false, activities: [] };
  }

  const userMessages = [{ role: 'user', content: cleaned }];
  let raw;
  try {
    raw = await callModelWithSystem(PARSER_SYSTEM_PROMPT, userMessages, { maxTokens: 800, temperature: 0.3 });
  } catch (err) {
    // never lose the input: surface it for a pending log / manual tag
    return { crisis: false, activities: [], error: err.message, raw: cleaned };
  }

  let parsed = safeParseActivities(raw);
  if (!parsed && context.allowRetry !== false) {
    try {
      raw = await callModelWithSystem(
        PARSER_SYSTEM_PROMPT + '\n\nRespond with ONLY a JSON array. No other text.',
        userMessages,
        { maxTokens: 800, temperature: 0.2 }
      );
      parsed = safeParseActivities(raw);
    } catch (err) {
      return { crisis: false, activities: [], error: err.message, raw: cleaned };
    }
  }

  const normalized = (parsed || []).map(normalizeActivity).filter(Boolean);
  // catalog fast-path: pin a known synonym so the activity keeps a stable key + fixed base XP
  for (const a of normalized) {
    const hit = lookupActivity(`${a.name} ${a.quantity ?? ''}`);
    if (hit) {
      a.activityKey = hit.key;
      a.pillar = hit.pillar;
    }
  }
  return { crisis: false, activities: normalized };
}
