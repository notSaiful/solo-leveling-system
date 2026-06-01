import { JUSTICE_ACTION_DUTIES, JUSTICE_ACTION_LABELS } from '../data/justiceResponse';
import { getLocalDateString } from '../utils/dateUtils';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value, max = 180) {
  return String(value || '').trim().slice(0, max);
}

function normalizeCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0) return 0;
  return Math.floor(count);
}

const UNSAFE_INTENT_PATTERNS = [
  /\b(i|we)\s+(will|am going to|are going to|plan to|want to|intend to)\s+(kill|attack|shoot|stab|bomb|assassinate|hurt|harm)\b/i,
  /\b(revenge attack|vigilante attack|unlawful violence|target civilians)\b/i,
];

export function containsUnsafeJusticeIntent(text = '') {
  return UNSAFE_INTENT_PATTERNS.some(pattern => pattern.test(String(text || '')));
}

export function createJusticeResponseEntry(input = {}) {
  const actionType = JUSTICE_ACTION_LABELS[input.actionType] ? input.actionType : 'evidence';
  const combinedText = [
    input.cause,
    input.oppressedGroup,
    input.channel,
    input.note,
  ].join(' ');

  if (containsUnsafeJusticeIntent(combinedText)) {
    throw new Error('Justice response must remain lawful: no vigilantism, threats, revenge, or unlawful violence.');
  }

  if (input.guardrailAccepted !== true) {
    throw new Error('Accept the lawful justice guardrail before logging this action.');
  }

  const now = new Date().toISOString();
  return {
    id: createId('justice'),
    cause: normalizeText(input.cause || 'Oppression Response', 100),
    oppressedGroup: normalizeText(input.oppressedGroup || 'Muslims / innocents', 80),
    actionType,
    actionLabel: JUSTICE_ACTION_LABELS[actionType],
    missionDuty: JUSTICE_ACTION_DUTIES[actionType] || 'service',
    channel: normalizeText(input.channel, 120),
    evidenceCount: normalizeCount(input.evidenceCount),
    peopleHelped: normalizeCount(input.peopleHelped),
    note: normalizeText(input.note, 260),
    lawfulOnly: true,
    createdAt: now,
    localDate: getLocalDateString(new Date(now)),
  };
}

export function createJusticeHistoryEntry(entry) {
  return {
    eventId: createId('justice-history'),
    type: 'justiceResponse',
    questId: entry.id,
    title: `Justice Response: ${entry.actionLabel}`,
    description: entry.note || `${entry.actionLabel} for ${entry.cause}.`,
    pillar: entry.missionDuty === 'wealth' ? 'money' : entry.missionDuty === 'readiness' ? 'body' : 'deen',
    tags: ['justice', 'lawful', 'advocacy', 'service', entry.actionType, entry.cause],
    missionDuty: entry.missionDuty,
    source: 'justice-ledger',
    xp: 0,
    gold: 0,
    cause: entry.cause,
    oppressedGroup: entry.oppressedGroup,
    actionType: entry.actionType,
    evidenceCount: entry.evidenceCount,
    peopleHelped: entry.peopleHelped,
    lawfulOnly: true,
    date: entry.createdAt,
    localDate: entry.localDate,
    completed: true,
  };
}

export function addJusticeResponseToState(state, input) {
  const entry = createJusticeResponseEntry(input);
  return {
    ...state,
    justiceResponseLedger: [...(state.justiceResponseLedger || []), entry],
    history: [...(state.history || []), createJusticeHistoryEntry(entry)],
  };
}

export function getJusticeResponseMetrics(entries = []) {
  const totalEvidence = entries.reduce((sum, entry) => sum + (Number(entry.evidenceCount) || 0), 0);
  const totalPeopleHelped = entries.reduce((sum, entry) => sum + (Number(entry.peopleHelped) || 0), 0);
  const byAction = entries.reduce((acc, entry) => {
    const key = entry.actionType || 'evidence';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const activeCauses = new Set(entries.map(entry => normalizeText(entry.cause, 100)).filter(Boolean)).size;

  return {
    totalActions: entries.length,
    totalEvidence,
    totalPeopleHelped,
    activeCauses,
    byAction,
    latestEntry: [...entries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null,
  };
}
