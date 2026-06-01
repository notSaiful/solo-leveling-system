import { IMPACT_CATEGORY_LABELS } from '../data/ummahImpact';
import { getLocalDateString } from '../utils/dateUtils';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value);
}

function normalizePeople(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0) return 0;
  return Math.floor(count);
}

export function createImpactEntry(input = {}) {
  const amount = normalizeAmount(input.amount);
  if (amount <= 0) throw new Error('Impact amount must be greater than zero.');

  const category = IMPACT_CATEGORY_LABELS[input.category] ? input.category : 'sadaqah';
  const now = new Date().toISOString();
  return {
    id: createId('impact'),
    amount,
    currency: input.currency || 'INR',
    category,
    categoryLabel: IMPACT_CATEGORY_LABELS[category],
    peopleHelped: normalizePeople(input.peopleHelped),
    note: String(input.note || '').trim().slice(0, 240),
    createdAt: now,
    localDate: getLocalDateString(new Date(now)),
  };
}

export function createImpactHistoryEntry(entry) {
  return {
    eventId: createId('impact-history'),
    type: 'ummahImpact',
    questId: entry.id,
    title: `Ummah Impact: ${entry.categoryLabel}`,
    description: entry.note || `Logged ${entry.currency} ${entry.amount.toLocaleString()} for ${entry.categoryLabel}.`,
    pillar: 'money',
    tags: ['ummah', 'charity', 'impact', entry.category],
    missionDuty: 'wealth',
    source: 'impact-ledger',
    xp: 0,
    gold: 0,
    amount: entry.amount,
    currency: entry.currency,
    peopleHelped: entry.peopleHelped,
    date: entry.createdAt,
    localDate: entry.localDate,
    completed: true,
  };
}

export function addImpactEntryToState(state, input) {
  const entry = createImpactEntry(input);
  return {
    ...state,
    ummahImpactLedger: [...(state.ummahImpactLedger || []), entry],
    history: [...(state.history || []), createImpactHistoryEntry(entry)],
  };
}

export function getImpactMetrics(entries = []) {
  const totalAmount = entries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const totalPeopleHelped = entries.reduce((sum, entry) => sum + (Number(entry.peopleHelped) || 0), 0);
  const byCategory = entries.reduce((acc, entry) => {
    const key = entry.category || 'sadaqah';
    acc[key] = (acc[key] || 0) + (Number(entry.amount) || 0);
    return acc;
  }, {});

  return {
    totalAmount,
    totalPeopleHelped,
    totalEntries: entries.length,
    byCategory,
    latestEntry: [...entries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null,
  };
}
