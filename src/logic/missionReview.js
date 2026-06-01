import { MISSION_DOCTRINE } from '../data/missionDoctrine';
import { getLocalDateString, parseLocalDate } from '../utils/dateUtils';

const DUTY_COMMANDS = {
  tauheed: 'Teach one source-backed lesson or write one tawheed action step.',
  wealth: 'Move money or earning capacity today: give, invest, build, sell, or train someone to earn.',
  readiness: 'Train strength with restraint: include recovery, de-escalation, or lawful protection practice.',
  service: 'Serve one Muslim through relief, advocacy, mentorship, livelihood, or direct help.',
  family: 'Lead your home through worship, mercy, repair, provision, presence, or example.',
};

const DUTY_PILLARS = {
  tauheed: 'deen',
  wealth: 'money',
  readiness: 'body',
  service: 'deen',
  family: 'deen',
};

const CORRECTIVE_TEMPLATES = {
  tauheed: {
    title: 'Corrective: Teach Tawheed',
    description: 'Teach or write one source-backed tawheed lesson and define one action it demands today.',
    xp: 35,
    tags: ['tauheed', 'teaching', 'correction', 'knowledge'],
  },
  wealth: {
    title: 'Corrective: Wealth Amanah Action',
    description: 'Do one halal wealth action: give, invest, ship, sell, budget, or help one Muslim earn.',
    xp: 35,
    tags: ['wealth', 'halal', 'income', 'sadaqah', 'correction'],
  },
  readiness: {
    title: 'Corrective: Readiness With Restraint',
    description: 'Train strength or conditioning, then log one restraint or de-escalation lesson.',
    xp: 35,
    tags: ['readiness', 'training', 'restraint', 'lawful', 'correction'],
  },
  service: {
    title: 'Corrective: Serve One Muslim',
    description: 'Serve one Muslim through relief, mentorship, lawful advocacy, education, or direct help.',
    xp: 35,
    tags: ['service', 'ummah', 'mentorship', 'relief', 'correction'],
  },
  family: {
    title: 'Corrective: Lead The Home',
    description: 'Lead one family action through worship, mercy, repair, provision, presence, or example.',
    xp: 35,
    tags: ['family', 'leadership', 'mercy', 'home', 'correction'],
  },
};

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addDays(dateStr, offset) {
  const date = parseLocalDate(dateStr);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function normalizeEntries(entries = [], source, dutyResolver) {
  return entries.flatMap((entry) => {
    const duties = dutyResolver(entry);
    return duties.map(dutyId => ({
      ...entry,
      source,
      dutyId,
      localDate: entry.localDate || (entry.createdAt ? getLocalDateString(new Date(entry.createdAt)) : ''),
    }));
  });
}

export function getMissionReview(state = {}, today = getLocalDateString()) {
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
  const weekSet = new Set(weekDates);

  const evidence = [
    ...normalizeEntries(state.teachingPipelineLedger, 'Teaching', () => ['tauheed']),
    ...normalizeEntries(state.ummahImpactLedger, 'Impact', () => ['wealth']),
    ...normalizeEntries(state.justiceResponseLedger, 'Justice', entry => [entry.missionDuty || 'service']),
    ...normalizeEntries(state.familyCovenantLedger, 'Family', () => ['family']),
    ...normalizeEntries(state.livelihoodPipelineLedger, 'Livelihood', () => ['wealth', 'service']),
    ...normalizeEntries(state.readinessProtocolLedger, 'Readiness', () => ['readiness']),
  ].filter(entry => entry.localDate);

  const weeklyEvidence = evidence.filter(entry => weekSet.has(entry.localDate));
  const todayEvidence = evidence.filter(entry => entry.localDate === today);
  const ledgerEntries = [
    ...(state.teachingPipelineLedger || []),
    ...(state.ummahImpactLedger || []),
    ...(state.justiceResponseLedger || []),
    ...(state.familyCovenantLedger || []),
    ...(state.livelihoodPipelineLedger || []),
    ...(state.readinessProtocolLedger || []),
  ];
  const weeklyLedgerEntries = ledgerEntries.filter(entry => weekSet.has(entry.localDate || (entry.createdAt ? getLocalDateString(new Date(entry.createdAt)) : '')));

  const duties = MISSION_DOCTRINE.pillars.map((pillar) => {
    const total = evidence.filter(entry => entry.dutyId === pillar.id).length;
    const week = weeklyEvidence.filter(entry => entry.dutyId === pillar.id).length;
    const todayCount = todayEvidence.filter(entry => entry.dutyId === pillar.id).length;
    const latest = evidence
      .filter(entry => entry.dutyId === pillar.id)
      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))[0] || null;

    return {
      id: pillar.id,
      label: pillar.label,
      duty: pillar.duty,
      total,
      week,
      today: todayCount,
      status: week >= 3 ? 'strong' : week >= 1 ? 'active' : 'neglected',
      command: DUTY_COMMANDS[pillar.id],
      latest,
    };
  });

  const weakestDuty = [...duties].sort((a, b) => a.week - b.week || a.total - b.total)[0] || duties[0];
  const strongestDuty = [...duties].sort((a, b) => b.week - a.week || b.total - a.total)[0] || duties[0];
  const weeklyCoverage = duties.length
    ? Math.round((duties.filter(duty => duty.week > 0).length / duties.length) * 100)
    : 0;

  return {
    today,
    weekDates,
    weekStart: weekDates[0],
    weekEnd: weekDates[6],
    weeklyCoverage,
    weeklyActions: weeklyLedgerEntries.length,
    totalLedgerEntries: ledgerEntries.length,
    duties,
    weakestDuty,
    strongestDuty,
    command: weakestDuty?.command || 'Log one mission action today.',
  };
}

export function createMissionWeeklyReviewNote(state = {}, today = getLocalDateString()) {
  const review = getMissionReview(state, today);
  const wins = review.duties
    .filter(duty => duty.week > 0)
    .map(duty => `${duty.label}: ${duty.week} action${duty.week === 1 ? '' : 's'}`);
  const weakSpots = review.duties
    .filter(duty => duty.week === 0)
    .map(duty => duty.label);
  const dutySnapshot = review.duties.map(duty => ({
    id: duty.id,
    label: duty.label,
    week: duty.week,
    total: duty.total,
    status: duty.status,
    command: duty.command,
  }));
  const now = new Date().toISOString();

  return {
    id: createId('mission-review'),
    weekId: `${review.weekStart}_${review.weekEnd}`,
    weekStart: review.weekStart,
    weekEnd: review.weekEnd,
    localDate: today,
    weeklyCoverage: review.weeklyCoverage,
    weeklyActions: review.weeklyActions,
    totalLedgerEntries: review.totalLedgerEntries,
    strongestDuty: review.strongestDuty?.label || '',
    weakestDuty: review.weakestDuty?.label || '',
    wins,
    weakSpots,
    command: review.command,
    dutySnapshot,
    createdAt: now,
  };
}

export function addMissionWeeklyReviewToState(state = {}, today = getLocalDateString()) {
  const note = createMissionWeeklyReviewNote(state, today);
  const existing = state.missionWeeklyReviews || [];
  const withoutSameWeek = existing.filter(entry => entry.weekId !== note.weekId);
  return {
    ...state,
    missionWeeklyReviews: [...withoutSameWeek, note],
  };
}

export function getMissionReviewTrends(reviews = [], limit = 6) {
  const sorted = [...reviews]
    .filter(review => review?.weekId)
    .sort((a, b) => String(a.weekEnd || a.weekId).localeCompare(String(b.weekEnd || b.weekId)))
    .slice(-limit);
  const latest = sorted.at(-1) || null;
  const previous = sorted.at(-2) || null;
  const coverageDelta = latest && previous ? (latest.weeklyCoverage || 0) - (previous.weeklyCoverage || 0) : 0;
  const actionDelta = latest && previous ? (latest.weeklyActions || 0) - (previous.weeklyActions || 0) : 0;

  const previousDuties = new Map((previous?.dutySnapshot || []).map(duty => [duty.id, duty]));
  const dutyTrends = (latest?.dutySnapshot || []).map((duty) => {
    const prior = previousDuties.get(duty.id);
    const delta = (duty.week || 0) - (prior?.week || 0);
    return {
      id: duty.id,
      label: duty.label,
      week: duty.week || 0,
      previousWeek: prior?.week || 0,
      delta,
      direction: delta > 0 ? 'rising' : delta < 0 ? 'slipping' : 'steady',
    };
  });

  return {
    reviews: sorted,
    latest,
    previous,
    coverageDelta,
    actionDelta,
    direction: coverageDelta > 0 ? 'rising' : coverageDelta < 0 ? 'slipping' : 'steady',
    dutyTrends,
  };
}

export function getMissionCorrectiveQuestTargets(state = {}, today = getLocalDateString()) {
  const review = getMissionReview(state, today);
  const trends = getMissionReviewTrends(state.missionWeeklyReviews || []);
  const slippingIds = new Set(trends.dutyTrends.filter(duty => duty.direction === 'slipping').map(duty => duty.id));
  const targetMap = new Map();

  review.duties
    .filter(duty => duty.week === 0 || slippingIds.has(duty.id))
    .forEach(duty => targetMap.set(duty.id, duty));

  if (targetMap.size === 0 && review.weakestDuty) {
    targetMap.set(review.weakestDuty.id, review.weakestDuty);
  }

  return Array.from(targetMap.values())
    .sort((a, b) => a.week - b.week || a.total - b.total)
    .slice(0, 3);
}

export function createMissionCorrectiveQuests(state = {}, today = getLocalDateString()) {
  const review = getMissionReview(state, today);
  const targets = getMissionCorrectiveQuestTargets(state, today);
  const existingIds = new Set((state.customQuests || []).map(quest => quest.id || quest.uniqueId));
  const createdAt = new Date().toISOString();

  return targets
    .map((duty) => {
      const template = CORRECTIVE_TEMPLATES[duty.id];
      if (!template) return null;
      const id = `mission-corrective-${review.weekEnd}-${duty.id}`;
      return {
        ...template,
        id,
        uniqueId: id,
        pillar: DUTY_PILLARS[duty.id] || 'deen',
        missionDuty: duty.id,
        source: 'mission-corrective',
        alignmentStatus: 'approved',
        justification: duty.week === 0
          ? `${duty.label} had no sealed evidence this week.`
          : `${duty.label} is the weakest mission duty this week.`,
        lastCompleted: null,
        createdAt,
        createdLocalDate: today,
      };
    })
    .filter(Boolean)
    .filter(quest => !existingIds.has(quest.id));
}

export function addMissionCorrectiveQuestsToState(state = {}, today = getLocalDateString()) {
  const quests = createMissionCorrectiveQuests(state, today);
  if (quests.length === 0) return state;
  return {
    ...state,
    customQuests: [...(state.customQuests || []), ...quests],
  };
}
