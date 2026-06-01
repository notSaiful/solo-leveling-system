import { FAMILY_ACTION_LABELS, FAMILY_RELATION_LABELS } from '../data/familyCovenant';
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

const FAMILY_HARM_PATTERNS = [
  /\b(i|we)\s+(will|am going to|are going to|plan to|want to|intend to)\s+(hit|slap|beat|hurt|harm|threaten|terrorize|humiliate)\b/i,
  /\b(make them fear me|put them in their place|teach them with violence)\b/i,
];

export function containsFamilyHarmIntent(text = '') {
  return FAMILY_HARM_PATTERNS.some(pattern => pattern.test(String(text || '')));
}

export function createFamilyCovenantEntry(input = {}) {
  const actionType = FAMILY_ACTION_LABELS[input.actionType] ? input.actionType : 'mercy';
  const relation = FAMILY_RELATION_LABELS[input.relation] ? input.relation : 'household';
  const action = normalizeText(input.action, 180);
  const note = normalizeText(input.note, 260);
  const repair = normalizeText(input.repair, 180);
  const combinedText = [input.action, input.note, input.repair].join(' ');

  if (!action) throw new Error('Family covenant entry needs a clear action.');
  if (containsFamilyHarmIntent(combinedText)) {
    throw new Error('Family leadership must remain merciful and lawful: no threats, humiliation, or harm.');
  }

  const now = new Date().toISOString();
  return {
    id: createId('family'),
    actionType,
    actionLabel: FAMILY_ACTION_LABELS[actionType],
    relation,
    relationLabel: FAMILY_RELATION_LABELS[relation],
    action,
    minutes: normalizeCount(input.minutes),
    repair,
    note,
    propheticStandard: true,
    createdAt: now,
    localDate: getLocalDateString(new Date(now)),
  };
}

export function createFamilyCovenantHistoryEntry(entry) {
  return {
    eventId: createId('family-history'),
    type: 'familyCovenant',
    questId: entry.id,
    title: `Family Covenant: ${entry.actionLabel}`,
    description: entry.action,
    pillar: entry.actionType === 'provision' ? 'money' : entry.actionType === 'example' ? 'body' : 'deen',
    tags: ['family', 'leadership', 'mercy', 'home', 'role-model', entry.actionType, entry.relation],
    missionDuty: 'family',
    source: 'family-covenant',
    xp: 0,
    gold: 0,
    actionType: entry.actionType,
    relation: entry.relation,
    minutes: entry.minutes,
    repair: entry.repair,
    propheticStandard: true,
    date: entry.createdAt,
    localDate: entry.localDate,
    completed: true,
  };
}

export function addFamilyCovenantEntryToState(state, input) {
  const entry = createFamilyCovenantEntry(input);
  return {
    ...state,
    familyCovenantLedger: [...(state.familyCovenantLedger || []), entry],
    history: [...(state.history || []), createFamilyCovenantHistoryEntry(entry)],
  };
}

export function getFamilyCovenantMetrics(entries = []) {
  const totalMinutes = entries.reduce((sum, entry) => sum + (Number(entry.minutes) || 0), 0);
  const byAction = entries.reduce((acc, entry) => {
    const key = entry.actionType || 'mercy';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const relationsServed = new Set(entries.map(entry => normalizeText(entry.relation, 80)).filter(Boolean)).size;

  return {
    totalActions: entries.length,
    totalMinutes,
    relationsServed,
    worshipActions: byAction.worship || 0,
    repairActions: byAction.repair || 0,
    byAction,
    latestEntry: [...entries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null,
  };
}
