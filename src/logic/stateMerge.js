import { pruneExpiredCustomQuests } from './customQuests.js';

const PILLARS = ['deen', 'body', 'money'];
const STALE_ADVENTURE_DAILY_TITLES = new Set([
  // pre-v8 sprint/combat titles (kept)
  'Combat Mobility 5 Min',
  'Sprint Drills',
  'Outdoor Sprints',
  'Outdoor Sprint Intervals',
  'Hill Sprint Repeats',
  'Outdoor Movement Circuit',
  'Outdoor Circuit Challenge',
  // v8 roaming/adventure titles being replaced by Physical Power (all from DAILY_QUEST_POOLS.body, ranks E→S)
  'Explore a New Street',
  'Barefoot on Earth',
  'Park Visit',
  'Landmark Count',
  'Phone-Free Outdoors',
  'Sunset Watch',
  '2,000 Explorer Steps',
  'Green Route Walk',
  'Route Sketch',
  'Adventure Kit Check',
  'Phone-Free Scout',
  'Terrain Notes',
  '5,000 Step Expedition',
  'Weather Reading',
  'Masjid Route Scout',
  'Night Sky Orientation',
  'Trail Hike 45 Min',
  'Compass Direction Drill',
  'Safe Night Walk',
  'Elevation Route',
  'Local Resource Map',
  'Water Route Survey',
  'Pack Route Test',
  'Terrain Photo Log',
  '2-Hour Trek',
  'Tent or Shelter Setup',
  'Rock Route Survey',
  'Water Crossing Plan',
  'Orienteering Walk',
  'Hill Route Audit',
  'Wilderness Navigation',
  'Emergency Exit Map',
  'Half-Day Trek',
  'Solo Sunrise Hike',
  'Lead a Group Hike',
  'Wilderness Survival Skill',
  'Mountain Route Log',
  'Teach Outdoor Skills',
  'Overnight Camping Prep',
  'Multi-Terrain Survey',
  "The Monarch's Expedition",
  'Multi-Day Trek Plan',
  'Teach Wilderness Leadership',
  'Summit Challenge',
  'Solo Wilderness Navigation',
  'Lead Expedition Group',
  'Extreme Terrain Day',
  'Adventure Discipline Master',
]);

function xpForNextLevel(level) {
  if (level <= 99) {
    return Math.floor(100 * Math.pow(1.12, level));
  }
  if (level <= 299) {
    return 100000 + (level - 100) * 2000;
  }
  if (level <= 599) {
    return 500000 + (level - 300) * 5000;
  }
  return 2000000 + (level - 600) * 10000;
}

function getRankKey(level) {
  if (level >= 100) return 'S';
  if (level >= 71) return 'A';
  if (level >= 46) return 'B';
  if (level >= 26) return 'C';
  if (level >= 11) return 'D';
  return 'E';
}

function calculateOverallFromPillars(pillars = {}, previousOverall = 0) {
  const deen = pillars.deen?.level || 0;
  const body = pillars.body?.level || 0;
  const money = pillars.money?.level || 0;
  const weighted = Math.floor((deen * 0.5) + (body * 0.3) + (money * 0.2));
  const highestPillar = Math.max(deen, body, money);
  return Math.max(previousOverall || 0, weighted, highestPillar);
}

function recalculateOverall(state) {
  const overallLevel = calculateOverallFromPillars(state.pillars, state.user?.overallLevel || 0);
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

  const currentHasStaleAdventure = (currentState.dailyQuests || []).some(quest =>
    quest?.pillar === 'body' && STALE_ADVENTURE_DAILY_TITLES.has(quest.title)
  );
  const incomingHasFreshAdventure = (incomingState.dailyQuests || []).some(quest =>
    quest?.pillar === 'body' && !STALE_ADVENTURE_DAILY_TITLES.has(quest.title)
  );
  if (currentHasStaleAdventure && incomingHasFreshAdventure) {
    return incomingState.dailyQuests || [];
  }

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

function mergePillars(base = {}, other = {}, { preserveProgress = true } = {}) {
  const pillars = {};
  PILLARS.forEach((pillar) => {
    const a = base[pillar] || {};
    const b = other[pillar] || {};
    const aLevel = a.level || 0;
    const bLevel = b.level || 0;
    const level = preserveProgress ? Math.max(aLevel, bLevel) : aLevel;
    // When levels are equal, trust the BASE state (newer by timestamp).
    // Math.max would silently undo penalties — a major bug.
    const xp = preserveProgress
      ? aLevel > bLevel
        ? (a.xp || 0)
        : bLevel > aLevel
          ? (b.xp || 0)
          : (a.xp || 0)
      : (a.xp || 0);
    pillars[pillar] = {
      ...a,
      ...b,
      level,
      xp,
      streak: Math.max(a.streak || 0, b.streak || 0),
      shadowsUnlocked: mergeUniqueBy(a.shadowsUnlocked || [], b.shadowsUnlocked || [], x => String(x)),
      activeDebuff: isDebuffNewer(b.activeDebuff, a.activeDebuff) ? b.activeDebuff : a.activeDebuff,
      lastDailyQuestCompletionDate: [a.lastDailyQuestCompletionDate, b.lastDailyQuestCompletionDate].filter(Boolean).sort().pop(),
    };
  });
  return pillars;
}

function isIntentionalReset(candidate = {}, previous = {}) {
  if ((candidate.lastUpdated || 0) < (previous.lastUpdated || 0)) return false;
  const hasNoProgress = PILLARS.every(pillar => (candidate.pillars?.[pillar]?.level || 0) === 0 && (candidate.pillars?.[pillar]?.xp || 0) === 0);
  return hasNoProgress &&
    (candidate.gold || 0) === 0 &&
    (candidate.history || []).length === 0 &&
    (candidate.purchasedRewards || []).length === 0 &&
    (candidate.syncRevision || 0) <= 1;
}

function applyHistoryReward(state, event) {
  if (!event?.completed || !PILLARS.includes(event.pillar)) return state;
  if (!['daily', 'custom', 'dungeon', 'redemption'].includes(event.type)) return state;

  // ─── CRITICAL GUARD: never re-add XP for an event already in history ───
  const eventKey = getHistoryEventKey(event);
  const alreadyProcessed = (state.history || []).some(h => getHistoryEventKey(h) === eventKey);
  if (alreadyProcessed) return state;

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
  if (isIntentionalReset(incomingState, currentState)) return incomingState;

  const currentTime = currentState.lastUpdated || 0;
  const incomingTime = incomingState.lastUpdated || 0;
  const base = incomingTime >= currentTime ? incomingState : currentState;
  const other = base === incomingState ? currentState : incomingState;
  const baseHistoryKeys = new Set((base.history || []).map(getHistoryEventKey));
  const missingHistory = (other.history || []).filter(event => !baseHistoryKeys.has(getHistoryEventKey(event)));
  const preserveProgress = missingHistory.length === 0;
  const mergedPillars = mergePillars(base.pillars, other.pillars, { preserveProgress });
  const mergedPurchasedRewards = mergeUniqueBy(base.purchasedRewards, other.purchasedRewards, item => item.purchaseId || item.id || `${item.name}|${item.purchasedAt}`);
  const baseHasNewPurchase = (base.purchasedRewards || []).length > (other.purchasedRewards || []).length;
  const otherHasNewPurchase = (other.purchasedRewards || []).length > (base.purchasedRewards || []).length;
  const preservedOverallLevel = calculateOverallFromPillars(
    mergedPillars,
    Math.max(base.user?.overallLevel || 0, other.user?.overallLevel || 0)
  );

  let merged = {
    ...base,
    version: Math.max(base.version || 2, other.version || 2),
    user: {
      ...(other.user || {}),
      ...(base.user || {}),
      overallLevel: preservedOverallLevel,
      currentRank: getRankKey(preservedOverallLevel),
    },
    pillars: mergedPillars,
    stats: { ...(other.stats || {}), ...(base.stats || {}) },
    gold: missingHistory.length > 0
      ? (base.gold || 0)
      : otherHasNewPurchase
        ? (other.gold || 0)
        : baseHasNewPurchase
          ? (base.gold || 0)
          // When both sides have same purchases but different gold, the lower gold heals
          // previously corrupted cloud states (purchases only reduce gold).
          : (base.purchasedRewards || []).length === (other.purchasedRewards || []).length && (base.purchasedRewards || []).length > 0
            ? Math.min(base.gold || 0, other.gold || 0)
            // Default: trust the newer state (base). Math.max would allow gold to only
            // increase during sync, silently undoing any deductions or healing corruption.
            : (base.gold || 0),
    dailyQuests: mergeDailyQuests(currentState, incomingState),
    customQuests: pruneExpiredCustomQuests(mergeUniqueBy(base.customQuests, other.customQuests)),
    levelQuests: mergeUniqueBy(base.levelQuests, other.levelQuests),
    redemptionQuests: mergeUniqueBy(base.redemptionQuests, other.redemptionQuests),
    purchasedRewards: mergedPurchasedRewards,
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
    // history is unioned AFTER the missing-history replay below — assigning it here
    // would make applyHistoryReward's "already in history" guard false-positive on
    // the very events we need to replay, silently dropping the non-base device's
    // XP/gold on a cross-device conflict (the bug caught by coreSystems.test.js).
    lastQuestDate: [base.lastQuestDate, other.lastQuestDate].filter(Boolean).sort().pop() || null,
    lastActiveDate: [base.lastActiveDate, other.lastActiveDate].filter(Boolean).sort().pop() || null,
    lastPenaltyCheckDate: [base.lastPenaltyCheckDate, other.lastPenaltyCheckDate].filter(Boolean).sort().pop() || null,
    lastUpdated: Math.max(currentTime, incomingTime, Date.now()),
    syncRevision: Math.max(currentState.syncRevision || 0, incomingState.syncRevision || 0) + 1,
  };

  missingHistory.forEach((event) => {
    merged = applyHistoryReward(merged, event);
  });

  // Replay ran against base.history only (so the guard saw the missing events as
  // unprocessed). Now union the full history so both devices' events are preserved.
  merged.history = mergeUniqueBy(base.history, other.history, getHistoryEventKey);

  return merged;
}
