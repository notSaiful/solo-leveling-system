import { pruneExpiredCustomQuests } from './customQuests';

const PILLARS = ['deen', 'body', 'money'];

function xpForNextLevel(level) {
  return Math.floor(100 * Math.pow(1.12, level));
}

function getRankKey(level) {
  if (level >= 100) return 'S';
  if (level >= 71) return 'A';
  if (level >= 46) return 'B';
  if (level >= 26) return 'C';
  if (level >= 11) return 'D';
  return 'E';
}

function recalculateOverall(state) {
  const deen = state.pillars?.deen?.level || 0;
  const body = state.pillars?.body?.level || 0;
  const money = state.pillars?.money?.level || 0;
  const overallLevel = Math.floor((deen * 0.5) + (body * 0.3) + (money * 0.2));
  return {
    ...state,
    user: {
      ...(state.user || {}),
      overallLevel,
      currentRank: getRankKey(overallLevel),
    },
  };
}

export function getHistoryEventKey(entry = {}) {
  if (entry.eventId) return `event:${entry.eventId}`;
  const type = entry.type || 'unknown';
  const pillar = entry.pillar || 'none';
  const quest = entry.questId || entry.uniqueId || entry.id || entry.title || 'unknown';
  const day = entry.localDate || (typeof entry.date === 'string' ? entry.date.slice(0, 10) : 'no-date');
  return `${type}|${pillar}|${quest}|${day}`;
}

function getObjectKey(item = {}) {
  return item.uniqueId || item.id || item.questId || item.itemId || item.title || JSON.stringify(item);
}

function mergeUniqueBy(itemsA = [], itemsB = [], keyFn = getObjectKey) {
  const merged = new Map();
  [...itemsA, ...itemsB].forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const key = keyFn(item);
    const previous = merged.get(key);
    merged.set(key, previous ? { ...previous, ...item } : item);
  });
  return Array.from(merged.values());
}

function getMessageTime(message = {}, fallback = 0) {
  if (typeof message.createdAt === 'number') return message.createdAt;
  const parsed = new Date(message.createdAt || message.date || 0).getTime();
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getChatMessageKey(message = {}, fallbackIndex = 0) {
  if (message.messageId) return `message:${message.messageId}`;
  const role = message.role || 'unknown';
  const type = message.type || '';
  const createdAt = message.createdAt || message.date || fallbackIndex;
  return `${role}|${type}|${createdAt}|${message.content || ''}`;
}

function mergeChatHistory(messagesA = [], messagesB = []) {
  const merged = new Map();
  [...messagesA, ...messagesB].forEach((message, index) => {
    if (!message || typeof message !== 'object' || typeof message.content !== 'string') return;
    const key = getChatMessageKey(message, index);
    const previous = merged.get(key);
    merged.set(key, previous ? { ...previous, ...message } : message);
  });

  return Array.from(merged.values())
    .sort((a, b) => getMessageTime(a) - getMessageTime(b))
    .slice(-120);
}

function mergeDailyQuests(currentState = {}, incomingState = {}) {
  const currentDate = currentState.lastQuestDate || '';
  const incomingDate = incomingState.lastQuestDate || '';
  if (currentDate !== incomingDate) {
    return incomingDate > currentDate ? (incomingState.dailyQuests || []) : (currentState.dailyQuests || []);
  }

  if (!(currentState.dailyQuests || []).length) return incomingState.dailyQuests || [];
  if (!(incomingState.dailyQuests || []).length) return currentState.dailyQuests || [];

  const incomingByKey = new Map((incomingState.dailyQuests || []).map(quest => [
    quest.uniqueId || quest.id || quest.title,
    quest,
  ]));

  return (currentState.dailyQuests || []).map((quest) => {
    const key = quest.uniqueId || quest.id || quest.title;
    const incomingQuest = incomingByKey.get(key);
    if (!incomingQuest) return quest;
    return {
      ...quest,
      completed: quest.completed || incomingQuest.completed,
      completedAt: quest.completedAt || incomingQuest.completedAt,
    };
  });
}

function isDebuffNewer(candidate, current) {
  if (!candidate) return false;
  if (!current) return true;
  const candidateTime = typeof candidate.appliedAt === 'number' ? candidate.appliedAt : new Date(candidate.appliedAt || 0).getTime();
  const currentTime = typeof current.appliedAt === 'number' ? current.appliedAt : new Date(current.appliedAt || 0).getTime();
  return (candidateTime || 0) > (currentTime || 0);
}

function mergePillars(base = {}, other = {}) {
  const pillars = {};
  PILLARS.forEach((pillar) => {
    const a = base[pillar] || {};
    const b = other[pillar] || {};
    pillars[pillar] = {
      ...a,
      ...b,
      level: a.level || 0,
      xp: a.xp || 0,
      streak: Math.max(a.streak || 0, b.streak || 0),
      shadowsUnlocked: mergeUniqueBy(a.shadowsUnlocked || [], b.shadowsUnlocked || [], x => String(x)),
      activeDebuff: isDebuffNewer(b.activeDebuff, a.activeDebuff) ? b.activeDebuff : a.activeDebuff,
    };
  });
  return pillars;
}

function applyHistoryReward(state, event) {
  if (!event?.completed || !PILLARS.includes(event.pillar)) return state;
  if (!['daily', 'custom', 'dungeon', 'redemption'].includes(event.type)) return state;

  const pillar = event.pillar;
  const xp = Math.max(0, Number(event.xp) || 0);
  const gold = Math.max(0, Number(event.gold) || 0);
  const next = {
    ...state,
    gold: (state.gold || 0) + gold,
    pillars: {
      ...(state.pillars || {}),
      [pillar]: {
        ...(state.pillars?.[pillar] || {}),
        xp: (state.pillars?.[pillar]?.xp || 0) + xp,
      },
    },
  };

  while ((next.pillars[pillar].xp || 0) >= xpForNextLevel(next.pillars[pillar].level || 0)) {
    const level = next.pillars[pillar].level || 0;
    next.pillars[pillar].xp -= xpForNextLevel(level);
    next.pillars[pillar].level = level + 1;
  }

  if (event.type === 'redemption') {
    next.pillars[pillar].activeDebuff = null;
  }

  return recalculateOverall(next);
}

export function mergeStatesForSync(currentState, incomingState) {
  if (!currentState) {
    return {
      ...(incomingState || {}),
      syncRevision: Math.max(1, incomingState?.syncRevision || 0),
      lastUpdated: incomingState?.lastUpdated || Date.now(),
    };
  }
  if (!incomingState) return currentState;

  const currentTime = currentState.lastUpdated || 0;
  const incomingTime = incomingState.lastUpdated || 0;
  const base = incomingTime >= currentTime ? incomingState : currentState;
  const other = base === incomingState ? currentState : incomingState;
  const baseHistoryKeys = new Set((base.history || []).map(getHistoryEventKey));
  const missingHistory = (other.history || []).filter(event => !baseHistoryKeys.has(getHistoryEventKey(event)));

  let merged = {
    ...base,
    version: Math.max(base.version || 2, other.version || 2),
    user: { ...(other.user || {}), ...(base.user || {}) },
    pillars: mergePillars(base.pillars, other.pillars),
    stats: { ...(other.stats || {}), ...(base.stats || {}) },
    gold: base.gold || 0,
    dailyQuests: mergeDailyQuests(currentState, incomingState),
    customQuests: pruneExpiredCustomQuests(mergeUniqueBy(base.customQuests, other.customQuests)),
    levelQuests: mergeUniqueBy(base.levelQuests, other.levelQuests),
    redemptionQuests: mergeUniqueBy(base.redemptionQuests, other.redemptionQuests),
    purchasedRewards: mergeUniqueBy(base.purchasedRewards, other.purchasedRewards, item => item.purchaseId || item.id || `${item.name}|${item.purchasedAt}`),
    ummahImpactLedger: mergeUniqueBy(base.ummahImpactLedger, other.ummahImpactLedger),
    justiceResponseLedger: mergeUniqueBy(base.justiceResponseLedger, other.justiceResponseLedger),
    teachingPipelineLedger: mergeUniqueBy(base.teachingPipelineLedger, other.teachingPipelineLedger),
    familyCovenantLedger: mergeUniqueBy(base.familyCovenantLedger, other.familyCovenantLedger),
    livelihoodPipelineLedger: mergeUniqueBy(base.livelihoodPipelineLedger, other.livelihoodPipelineLedger),
    readinessProtocolLedger: mergeUniqueBy(base.readinessProtocolLedger, other.readinessProtocolLedger),
    missionWeeklyReviews: mergeUniqueBy(base.missionWeeklyReviews, other.missionWeeklyReviews, item => item.weekId || item.id),
    shadows: mergeUniqueBy(base.shadows, other.shadows),
    systemMessages: mergeUniqueBy(base.systemMessages, other.systemMessages, item => item.messageId || `${item.type}|${item.title}|${item.date || item.createdAt || ''}`),
    aiDungeons: mergeUniqueBy(base.aiDungeons, other.aiDungeons),
    aiChatHistory: mergeChatHistory(base.aiChatHistory, other.aiChatHistory),
    aiChatUpdatedAt: Math.max(base.aiChatUpdatedAt || 0, other.aiChatUpdatedAt || 0),
    history: mergeUniqueBy(base.history, other.history, getHistoryEventKey),
    lastQuestDate: [base.lastQuestDate, other.lastQuestDate].filter(Boolean).sort().pop() || null,
    lastActiveDate: [base.lastActiveDate, other.lastActiveDate].filter(Boolean).sort().pop() || null,
    lastPenaltyCheckDate: [base.lastPenaltyCheckDate, other.lastPenaltyCheckDate].filter(Boolean).sort().pop() || null,
    lastUpdated: Math.max(currentTime, incomingTime, Date.now()),
    syncRevision: Math.max(currentState.syncRevision || 0, incomingState.syncRevision || 0) + 1,
  };

  missingHistory.forEach((event) => {
    merged = applyHistoryReward(merged, event);
  });

  return merged;
}
