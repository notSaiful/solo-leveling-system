import { LIVELIHOOD_ACTION_LABELS, LIVELIHOOD_OUTCOME_LABELS } from '../data/livelihoodPipeline';
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

function normalizeMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount);
}

export function createLivelihoodEntry(input = {}) {
  const actionType = LIVELIHOOD_ACTION_LABELS[input.actionType] ? input.actionType : 'skill-training';
  const outcome = LIVELIHOOD_OUTCOME_LABELS[input.outcome] ? input.outcome : 'planned';
  const beneficiary = normalizeText(input.beneficiary, 100);
  const skill = normalizeText(input.skill, 100);
  const action = normalizeText(input.action, 220);

  if (!beneficiary) throw new Error('Livelihood entry needs a beneficiary or group.');
  if (!skill) throw new Error('Livelihood entry needs a skill, job path, or business path.');
  if (!action) throw new Error('Livelihood entry needs the concrete action taken.');
  if (input.halalGuardrailAccepted !== true) {
    throw new Error('Accept the halal livelihood guardrail before logging this action.');
  }

  const now = new Date().toISOString();
  return {
    id: createId('livelihood'),
    actionType,
    actionLabel: LIVELIHOOD_ACTION_LABELS[actionType],
    outcome,
    outcomeLabel: LIVELIHOOD_OUTCOME_LABELS[outcome],
    beneficiary,
    skill,
    action,
    peopleHelped: normalizeCount(input.peopleHelped || 1),
    projectedMonthlyIncome: normalizeMoney(input.projectedMonthlyIncome),
    currency: input.currency || 'INR',
    followUpDate: normalizeText(input.followUpDate, 20),
    note: normalizeText(input.note, 260),
    halalOnly: true,
    createdAt: now,
    localDate: getLocalDateString(new Date(now)),
  };
}

export function createLivelihoodHistoryEntry(entry) {
  return {
    eventId: createId('livelihood-history'),
    type: 'livelihoodPipeline',
    questId: entry.id,
    title: `Livelihood: ${entry.actionLabel}`,
    description: entry.action,
    pillar: 'money',
    tags: ['livelihood', 'skills', 'income', 'job', 'business', 'mentorship', 'service', 'ummah', 'halal', entry.actionType, entry.outcome],
    missionDuty: 'wealth',
    source: 'livelihood-pipeline',
    xp: 0,
    gold: 0,
    actionType: entry.actionType,
    outcome: entry.outcome,
    beneficiary: entry.beneficiary,
    skill: entry.skill,
    peopleHelped: entry.peopleHelped,
    projectedMonthlyIncome: entry.projectedMonthlyIncome,
    currency: entry.currency,
    halalOnly: true,
    date: entry.createdAt,
    localDate: entry.localDate,
    completed: true,
  };
}

export function addLivelihoodEntryToState(state, input) {
  const entry = createLivelihoodEntry(input);
  return {
    ...state,
    livelihoodPipelineLedger: [...(state.livelihoodPipelineLedger || []), entry],
    history: [...(state.history || []), createLivelihoodHistoryEntry(entry)],
  };
}

export function getLivelihoodMetrics(entries = []) {
  const totalPeopleHelped = entries.reduce((sum, entry) => sum + (Number(entry.peopleHelped) || 0), 0);
  const totalProjectedMonthlyIncome = entries.reduce((sum, entry) => sum + (Number(entry.projectedMonthlyIncome) || 0), 0);
  const activeBeneficiaries = new Set(entries.map(entry => normalizeText(entry.beneficiary, 100)).filter(Boolean)).size;
  const earningOutcomes = entries.filter(entry => ['earning', 'placed', 'business-started'].includes(entry.outcome)).length;
  const byOutcome = entries.reduce((acc, entry) => {
    const key = entry.outcome || 'planned';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEntries: entries.length,
    totalPeopleHelped,
    totalProjectedMonthlyIncome,
    activeBeneficiaries,
    earningOutcomes,
    byOutcome,
    latestEntry: [...entries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null,
  };
}
