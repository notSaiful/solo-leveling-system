import { READINESS_ACTION_LABELS, READINESS_INTENSITY_LABELS } from '../data/readinessProtocol';
import { getLocalDateString } from '../utils/dateUtils';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value, max = 220) {
  return String(value || '').trim().slice(0, max);
}

function normalizeCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0) return 0;
  return Math.floor(count);
}

const UNSAFE_READINESS_PATTERNS = [
  /\b(i|we)\s+(will|am going to|are going to|plan to|want to|intend to)\s+(attack|kill|stab|shoot|bomb|hurt|harm|assault)\b/i,
  /\b(vigilante|revenge attack|street fight|target civilians|make them fear me)\b/i,
];

export function containsUnsafeReadinessIntent(text = '') {
  return UNSAFE_READINESS_PATTERNS.some(pattern => pattern.test(String(text || '')));
}

export function createReadinessEntry(input = {}) {
  const actionType = READINESS_ACTION_LABELS[input.actionType] ? input.actionType : 'strength';
  const intensity = READINESS_INTENSITY_LABELS[input.intensity] ? input.intensity : 'moderate';
  const action = normalizeText(input.action, 220);
  const restraintLesson = normalizeText(input.restraintLesson, 220);
  const combinedText = [input.action, input.restraintLesson, input.note].join(' ');

  if (!action) throw new Error('Readiness entry needs the concrete training or restraint action.');
  if (containsUnsafeReadinessIntent(combinedText)) {
    throw new Error('Readiness must remain lawful: no vigilantism, revenge, threats, or unlawful violence.');
  }
  if (input.lawfulGuardrailAccepted !== true) {
    throw new Error('Accept the lawful restraint guardrail before logging readiness.');
  }

  const now = new Date().toISOString();
  return {
    id: createId('readiness'),
    actionType,
    actionLabel: READINESS_ACTION_LABELS[actionType],
    intensity,
    intensityLabel: READINESS_INTENSITY_LABELS[intensity],
    action,
    minutes: normalizeCount(input.minutes),
    restraintScore: Math.min(10, normalizeCount(input.restraintScore)),
    restraintLesson,
    note: normalizeText(input.note, 260),
    lawfulOnly: true,
    createdAt: now,
    localDate: getLocalDateString(new Date(now)),
  };
}

export function createReadinessHistoryEntry(entry) {
  return {
    eventId: createId('readiness-history'),
    type: 'readinessProtocol',
    questId: entry.id,
    title: `Readiness: ${entry.actionLabel}`,
    description: entry.restraintLesson || entry.action,
    pillar: 'body',
    tags: ['readiness', 'strength', 'conditioning', 'physical', 'discipline', 'restraint', 'lawful', 'protection', entry.actionType, entry.intensity],
    missionDuty: 'readiness',
    source: 'readiness-protocol',
    xp: 0,
    gold: 0,
    actionType: entry.actionType,
    intensity: entry.intensity,
    minutes: entry.minutes,
    restraintScore: entry.restraintScore,
    lawfulOnly: true,
    date: entry.createdAt,
    localDate: entry.localDate,
    completed: true,
  };
}

export function addReadinessEntryToState(state, input) {
  const entry = createReadinessEntry(input);
  return {
    ...state,
    readinessProtocolLedger: [...(state.readinessProtocolLedger || []), entry],
    history: [...(state.history || []), createReadinessHistoryEntry(entry)],
  };
}

export function getReadinessMetrics(entries = []) {
  const totalMinutes = entries.reduce((sum, entry) => sum + (Number(entry.minutes) || 0), 0);
  const restraintEntries = entries.filter(entry => Number(entry.restraintScore) > 0);
  const averageRestraint = restraintEntries.length
    ? Math.round(restraintEntries.reduce((sum, entry) => sum + (Number(entry.restraintScore) || 0), 0) / restraintEntries.length)
    : 0;
  const byAction = entries.reduce((acc, entry) => {
    const key = entry.actionType || 'strength';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const restraintActions = (byAction.deescalation || 0) + (byAction.restraint || 0);

  return {
    totalEntries: entries.length,
    totalMinutes,
    averageRestraint,
    restraintActions,
    byAction,
    latestEntry: [...entries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null,
  };
}
