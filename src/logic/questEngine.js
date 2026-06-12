/** ============================================================
 *  QUEST ENGINE
 *  Handles quest generation, completion, rewards, and progression
 *  ============================================================ */

import {
  getRankByLevel,
  xpForNextLevel,
  getEffectiveXp,
  getDailyQuestsForRank,
  getLevelQuestsForLevel,
  getWeeklyDungeonForRank,
  calculateGoldReward,
  RANK_CONFIG,
} from '../data/questCatalog';
import { applyStatModifiers, autoAssignStatPoints } from '../data/stats';
import { getCurrentWeekId } from './dungeons';
import { getLocalDateString } from '../utils/dateUtils';
import { getScaledFlowConfig } from '../data/rankDifficulty';
import { isDebuffActive, checkAndApplyPenalties } from './penalties';
import { addMissionDailyQuests } from './missionQuestGenerator';
import { getUnlockedShadows, extractShadow } from '../data/shadows';
import { applyEquipmentBonuses, updateDurability, checkEnchant, dropEquipment } from '../data/equipment';
import { applySkillEffects, isSkillActive } from '../data/skills';
import { applyNabawiTraits, hasPenaltyImmunity, getDebuffDurationReduction } from '../data/seerahChains';
import { calculateExtremeReward, resetFailureStreak } from './extremeMode';
import { initializeSeerahChain, advanceSeerahChain, failSeerahChain, getActiveSeerahChain, wasSeerahChainAdvancedOnDate, injectSeerahDailyQuests } from '../data/seerahChains';
import { initializeJobChangeGate, completeGateStep, failJobChangeGate, getActiveJobChangeGate, getPendingGate } from '../data/jobChangeGates';
import { initializeMonarchTrials, checkMonarchTrialProgress } from './monarchTrials';
import { getPillarDisplayKey } from '../utils/pillarDisplay';
import {
  initializeKhalifateObjectives,
  getBlockingGate,
  isGateComplete,
  getGateProgress,
} from '../data/missionGates';

function createEventId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── STATE INITIALIZATION ───
export function initializeDailyQuests(state) {
  const rank = getRankByLevel(state.user.overallLevel);
  const today = getLocalDateString();

  // Only regenerate if date changed
  if (state.lastQuestDate === today) return state;

  let nextState = { ...state };

  // Check for missed seerah chains BEFORE generating new quests
  const activeChain = getActiveSeerahChain(nextState);
  if (activeChain && state.lastQuestDate) {
    const wasAdvanced = wasSeerahChainAdvancedOnDate(nextState, activeChain.chainId, state.lastQuestDate);
    if (!wasAdvanced) {
      nextState = failSeerahChain(nextState, activeChain.chainId);
    }
  }

  const baseDailyQuests = getDailyQuestsForRank(rank.key, state.dailyQuests, (state.user?.name || '').trim().toLowerCase(), state.user.overallLevel);
  const dailyQuests = addMissionDailyQuests(baseDailyQuests, rank.key, state.history || [], state.user.overallLevel);

  nextState = {
    ...nextState,
    dailyQuests,
    lastQuestDate: today,
  };

  // Initialize new systems
  nextState = initializeSeerahChain(nextState);
  nextState = initializeJobChangeGate(nextState);
  nextState = initializeMonarchTrials(nextState);
  nextState = checkMonarchTrialProgress(nextState);
  nextState = initializeKhalifateObjectives(nextState);

  // Inject seerah daily quests for any active chain
  nextState = injectSeerahDailyQuests(nextState);

  return nextState;
}

export function initializeLevelQuest(state) {
  const currentLevel = state.user.overallLevel;
  const levelQuest = getLevelQuestsForLevel(currentLevel);

  if (!levelQuest) return state;

  // Check if already active or completed
  const alreadyActive = state.levelQuests.some(lq => lq.level === currentLevel);
  if (alreadyActive) return state;

  return {
    ...state,
    levelQuests: [
      ...state.levelQuests,
      {
        ...levelQuest,
        activatedAt: new Date().toISOString(),
        completed: false,
        quests: levelQuest.quests.map(q => ({
          ...q,
          completed: false,
          completedAt: null,
        })),
      },
    ],
  };
}

export function initializeWeeklyDungeon(state) {
  const currentWeek = getCurrentWeekId();
  if (state.weeklyDungeons.weekId === currentWeek) return state;

  const rank = getRankByLevel(state.user.overallLevel);
  const dungeon = getWeeklyDungeonForRank(rank.key, state.user.overallLevel);
  dungeon.weekId = currentWeek;

  return {
    ...state,
    weeklyDungeons: dungeon,
  };
}

// ─── PENALTY INITIALIZATION ───
export function initializePenalties(state) {
  const today = getLocalDateString();
  // Only check once per day
  if (state.lastPenaltyCheckDate === today) return state;

  const result = checkAndApplyPenalties(state);
  if (result.penalties.length === 0 && result.redemptionQuests.length === 0 && !result.dungeonPenalty) {
    return { ...state, lastPenaltyCheckDate: today };
  }

  let nextState = {
    ...state,
    pillars: result.updatedPillars,
    failureStreaks: result.updatedFailureStreaks,
    streakFrozen: result.updatedStreakFrozen,
    lastPenaltyCheckDate: today,
  };

  // Recalculate overall level in case a penalty caused a pillar level drop
  nextState = recalculateOverallLevel(nextState);

  // Merge redemption quests (avoid duplicates)
  const existingIds = new Set((state.redemptionQuests || []).map(rq => rq.id));
  const newRedemptionQuests = result.redemptionQuests
    .filter(rq => rq && !existingIds.has(rq.id))
    .map(rq => ({
      ...rq,
      createdAt: new Date().toISOString(),
      createdLocalDate: today,
      completed: false,
    }));
  if (newRedemptionQuests.length > 0) {
    nextState.redemptionQuests = [...(state.redemptionQuests || []), ...newRedemptionQuests];
  }

  // Build system messages for each penalty
  const penaltyMessages = result.penalties.map(p => {
    const baseMsg = p.type === 'missedDungeon'
      ? `Weekly dungeon missed for ${getPillarDisplayKey(p.pillar)}. Shadow soldiers weakened.`
      : p.type === 'extreme'
        ? `${getPillarDisplayKey(p.pillar)}: EXTREME MODE ACTIVATED. ${p.message || ''}`
        : `${getPillarDisplayKey(p.pillar)}: ${p.days} day${p.days > 1 ? 's' : ''} missed. XP lost: ${p.xpLoss.toLocaleString()}.`;
    const levelMsg = p.levelDropped ? ` LEVEL DROPPED: ${p.oldLevel} → ${p.newLevel}.` : '';
    return {
      type: 'penalty',
      title: 'SYSTEM PENALTY',
      subtitle: `${getPillarDisplayKey(p.pillar)} — ${p.type}`,
      message: baseMsg + levelMsg + (p.scaled?.message ? ` ${p.scaled.message}` : ''),
    };
  });

  // Dungeon penalty message
  if (result.dungeonPenalty) {
    penaltyMessages.push({
      type: 'penalty',
      title: 'DUNGEON PENALTY',
      subtitle: 'Weekly Dungeon Missed',
      message: result.dungeonPenalty.message,
    });
  }

  // Streak frozen warnings (Never Miss Twice)
  for (const pillar of ['deen', 'body', 'money']) {
    if (result.updatedStreakFrozen?.[pillar] && !state.streakFrozen?.[pillar]) {
      penaltyMessages.push({
        type: 'warning',
        title: 'STREAK FROZEN',
        subtitle: `${getPillarDisplayKey(pillar)} — Never Miss Twice`,
        message: `You missed yesterday. Your ${getPillarDisplayKey(pillar)} streak is FROZEN at ${result.updatedPillars[pillar]?.streak || 0}. Complete a ${getPillarDisplayKey(pillar)} quest TODAY to save it. Miss today and it resets to zero.`,
      });
    }
  }

  if (penaltyMessages.length > 0) {
    nextState.systemMessages = [...(state.systemMessages || []), ...penaltyMessages];
  }

  return nextState;
}

// ─── QUEST COMPLETION ───
export function completeDailyQuest(state, questUniqueId) {
  const quest = state.dailyQuests.find(q => q.uniqueId === questUniqueId);
  if (!quest || quest.completed) return state;

  const rank = getRankByLevel(state.user.overallLevel);
  const baseXp = quest.xp || getEffectiveXp(quest.baseXp, rank.key, state.user.overallLevel);
  const gold = calculateGoldReward(quest, rank.key);

  // ─── EXTREME MODE REWARD ───
  // If this pillar has a 3+ day failure streak, completing a quest
  // triggers a massive redemption bonus.
  const extreme = calculateExtremeReward(state, quest.pillar, baseXp, rank.key);

  // Apply stat modifiers (Strength/Intelligence/Sense/Agility)
  const statModifiedXp = applyStatModifiers(baseXp, state.stats || {}, quest.pillar);

  // Apply equipment bonuses
  const equipmentModifiedXp = applyEquipmentBonuses(statModifiedXp, quest.pillar, state);

  // Apply nabawi traits
  const traitModifiedXp = applyNabawiTraits(equipmentModifiedXp, quest.pillar, state);

  // Apply debuff if active (respect nabawi trait immunity/reduction)
  const pillar = state.pillars[quest.pillar];
  let debuffMultiplier = 1;
  if (isDebuffActive(pillar?.activeDebuff)) {
    const debuffType = pillar.activeDebuff.type;
    if (hasPenaltyImmunity(state, debuffType)) {
      debuffMultiplier = 1;
    } else {
      const baseMultiplier = pillar.activeDebuff.multiplier || 1;
      const reduction = getDebuffDurationReduction(state);
      // reduction applies to the loss portion: multiplier = 1 - (1 - baseMultiplier) * (1 - reduction)
      debuffMultiplier = 1 - (1 - baseMultiplier) * (1 - reduction);
    }
  }
  let finalXp = Math.floor(traitModifiedXp * debuffMultiplier);

  // Apply extreme multiplier on top of everything
  if (extreme.multiplier > 1) {
    finalXp = Math.floor(finalXp * extreme.multiplier);
  }

  // Apply weekly focus multiplier (+50% XP for focused pillar)
  if (state.weeklyFocus === quest.pillar) {
    finalXp = Math.floor(finalXp * 1.5);
  }

  // Update pillar
  const newPillars = { ...state.pillars };
  const today = getLocalDateString();
  newPillars[quest.pillar] = {
    ...newPillars[quest.pillar],
    xp: newPillars[quest.pillar].xp + finalXp,
    streak: newPillars[quest.pillar].streak + 1,
    lastDailyQuestCompletionDate: today,
  };

  // Check for pillar level up
  let statPointsAwarded = 0;
  const pillarLevel = newPillars[quest.pillar].level;
  const pillarXp = newPillars[quest.pillar].xp;
  const needed = xpForNextLevel(pillarLevel);
  let autoStatResult = null;
  if (pillarXp >= needed) {
    newPillars[quest.pillar].level = pillarLevel + 1;
    newPillars[quest.pillar].xp = pillarXp - needed;
    // Award stat points based on the PILLAR's rank, not overall rank
    const pillarRank = getRankByLevel(newPillars[quest.pillar].level);
    statPointsAwarded = pillarRank.statPointsPerLevel || 1;
    // Auto-assign based on performance — user does NOT choose
    autoStatResult = autoAssignStatPoints(state.stats || {}, quest.pillar, statPointsAwarded);
  }

  // Mark quest complete
  const newDailyQuests = state.dailyQuests.map(q =>
    q.uniqueId === questUniqueId
      ? { ...q, completed: true, completedAt: new Date().toISOString() }
      : q
  );

  // Add to history
  const historyEntry = {
    eventId: createEventId('daily'),
    type: 'daily',
    questId: quest.id,
    title: quest.title,
    description: quest.description || '',
    pillar: quest.pillar,
    tags: quest.tags || [],
    missionDuty: quest.missionDuty || null,
    source: quest.source || 'catalog',
    chainId: quest.chainId || null,
    xp: finalXp,
    gold,
    date: new Date().toISOString(),
    localDate: today,
    completed: true,
  };

  // Advance seerah chain if this was a seerah quest
  let seerahState = state;
  if (quest.source === 'seerah' && quest.chainId) {
    seerahState = advanceSeerahChain(seerahState, quest.chainId);
  }

  // Apply skill effects (gold multiplier, etc.)
  const skillEffects = applySkillEffects(0, gold, quest.pillar, seerahState);
  const finalGold = skillEffects.gold;

  // Update equipment durability (+5 for completion)
  let durabilityState = updateDurability(seerahState, false, true);

  // Check enchant from streak
  let enchantState = checkEnchant(durabilityState, quest.pillar);

  // ─── RESET FAILURE STREAK ON SUCCESS ───
  const streakResetState = resetFailureStreak(enchantState, quest.pillar);

  const result = {
    ...streakResetState,
    pillars: newPillars,
    dailyQuests: newDailyQuests,
    gold: streakResetState.gold + finalGold + (extreme.bonusGold || 0),
    history: [...streakResetState.history, historyEntry],
  };

  // Clear streak frozen on quest completion (Never Miss Twice protection)
  if (streakResetState.streakFrozen?.[quest.pillar]) {
    result.streakFrozen = {
      ...streakResetState.streakFrozen,
      [quest.pillar]: false,
    };
  }

  if (autoStatResult) {
    result.stats = autoStatResult.stats;
    const assignStr = autoStatResult.assignments.map(a => `${a.stat.toUpperCase()} +${a.points}`).join(', ');
    result.systemMessages = [
      ...(result.systemMessages || []),
      {
        type: 'levelUp',
        title: `${getPillarDisplayKey(quest.pillar)} LEVEL UP!`,
        subtitle: `Level ${newPillars[quest.pillar].level}`,
        message: `SYSTEM auto-assigned: ${assignStr}. Performance determines growth.`,
      },
    ];
  }

  // Attach extreme reward message
  if (extreme.message) {
    result.systemMessages = [
      ...(result.systemMessages || []),
      extreme.message,
    ];
  }

  return result;
}

function normalizeCustomQuestPillar(pillar) {
  if (pillar === 'body' || pillar === 'adventure' || pillar === 'readiness') return 'body';
  if (pillar === 'money' || pillar === 'wealth') return 'money';
  if (pillar === 'deen' || pillar === 'service' || pillar === 'family' || pillar === 'ummah') return 'deen';
  return 'deen';
}

function getCustomQuestKey(quest) {
  return quest?.uniqueId || quest?.id || null;
}

export function completeCustomQuest(state, questIdentifier, today = getLocalDateString()) {
  const quest = (state.customQuests || []).find(q =>
    q.uniqueId === questIdentifier || q.id === questIdentifier
  );
  if (!quest) return state;

  const questKey = getCustomQuestKey(quest);
  if (!questKey) return state;

  const completedToday =
    quest.lastCompleted === today ||
    (quest.completedAt && getLocalDateString(new Date(quest.completedAt)) === today);
  if (completedToday) return state;

  const questIds = new Set([quest.id, quest.uniqueId, questKey].filter(Boolean));
  const alreadyDone = (state.history || []).some(h => {
    const hDate = h.localDate || (h.date ? getLocalDateString(new Date(h.date)) : '');
    return hDate === today && h.type === 'custom' && questIds.has(h.questId);
  });
  if (alreadyDone) return state;

  const baseXp = quest.xp || 20;
  const gold = Math.floor(baseXp * 0.5);
  const pillar = normalizeCustomQuestPillar(quest.pillar);
  const completedAt = new Date().toISOString();
  const newPillars = { ...state.pillars };
  newPillars[pillar] = {
    ...newPillars[pillar],
    xp: (newPillars[pillar].xp || 0) + baseXp,
    streak: (newPillars[pillar].streak || 0) + 1,
    lastDailyQuestCompletionDate: today,
  };

  let next = {
    ...state,
    customQuests: (state.customQuests || []).map(q =>
      q.uniqueId === questIdentifier || q.id === questIdentifier
        ? {
            ...q,
            id: q.id || q.uniqueId || questKey,
            uniqueId: q.uniqueId || q.id || questKey,
            lastCompleted: today,
            completedAt,
          }
        : q
    ),
    pillars: newPillars,
    gold: (state.gold || 0) + gold,
    history: [
      ...(state.history || []),
      {
        eventId: createEventId('custom'),
        type: 'custom',
        questId: questKey,
        title: quest.title,
        description: quest.description || '',
        pillar,
        tags: quest.tags || [],
        missionDuty: quest.missionDuty || null,
        source: quest.source || 'custom',
        xp: baseXp,
        gold,
        date: completedAt,
        localDate: today,
        completed: true,
      },
    ],
  };

  const needed = xpForNextLevel(newPillars[pillar].level || 0);
  if (newPillars[pillar].xp >= needed) {
    newPillars[pillar].level = (newPillars[pillar].level || 0) + 1;
    newPillars[pillar].xp -= needed;
    const pillarRank = getRankByLevel(newPillars[pillar].level);
    const spAwarded = pillarRank.statPointsPerLevel || 1;
    const autoStatResult = autoAssignStatPoints(next.stats || {}, pillar, spAwarded);
    if (autoStatResult) {
      next.stats = autoStatResult.stats;
      const assignStr = autoStatResult.assignments.map(a => `${a.stat.toUpperCase()} +${a.points}`).join(', ');
      next.systemMessages = [
        ...(next.systemMessages || []),
        {
          type: 'levelUp',
          title: `${getPillarDisplayKey(pillar)} LEVEL UP!`,
          subtitle: `Level ${newPillars[pillar].level}`,
          message: `SYSTEM auto-assigned: ${assignStr}. Performance determines growth.`,
        },
      ];
    }
    next = { ...next, pillars: newPillars };
  }

  // Clear streak frozen on custom quest completion (Never Miss Twice)
  if (next.streakFrozen?.[pillar]) {
    next = {
      ...next,
      streakFrozen: { ...next.streakFrozen, [pillar]: false },
    };
  }

  return resetFailureStreak(next, pillar);
}

export function completeLevelQuest(state, levelQuestIndex, questIndex) {
  const levelQuest = state.levelQuests[levelQuestIndex];
  if (!levelQuest || levelQuest.completed) return state;

  const quest = levelQuest.quests[questIndex];
  if (!quest || quest.completed) return state;

  const rank = getRankByLevel(state.user.overallLevel);
  const gold = calculateGoldReward(quest, rank.key);

  // Mark sub-quest complete
  const newLevelQuests = [...state.levelQuests];
  newLevelQuests[levelQuestIndex] = {
    ...newLevelQuests[levelQuestIndex],
    quests: newLevelQuests[levelQuestIndex].quests.map((q, i) =>
      i === questIndex ? { ...q, completed: true, completedAt: new Date().toISOString() } : q
    ),
  };

  // Check if all sub-quests complete
  const allComplete = newLevelQuests[levelQuestIndex].quests.every(q => q.completed);
  if (allComplete) {
    newLevelQuests[levelQuestIndex] = {
      ...newLevelQuests[levelQuestIndex],
      completed: true,
      completedAt: new Date().toISOString(),
    };

    // Apply rewards
    const reward = levelQuest.reward || {};
    const messages = [];

    if (reward.rankUp) {
      messages.push({
        type: 'rankUp',
        title: `RANK UP! ${reward.rankUp}-Rank`,
        subtitle: `You are now a ${reward.rankUp}-Rank Hunter`,
        message: reward.message || 'Your power has awakened.',
      });
    } else if (reward.jobChange) {
      messages.push({
        type: 'rankUp',
        title: `JOB CHANGE: ${reward.title || reward.jobChange}`,
        subtitle: 'Your class has evolved.',
        message: reward.message || 'New abilities unlocked.',
      });
    } else {
      messages.push({
        type: 'levelUp',
        title: `LEVEL QUEST COMPLETE: ${levelQuest.title}`,
        subtitle: 'Milestone achieved.',
        message: reward.message || 'Keep grinding.',
      });
    }

    let nextState = {
      ...state,
      levelQuests: newLevelQuests,
      gold: state.gold + (reward.gold || 0) + gold,
      systemMessages: [...state.systemMessages, ...messages],
      history: [
        ...state.history,
        {
          eventId: createEventId('level-quest'),
          type: 'levelQuest',
          title: levelQuest.title,
          description: quest.description || levelQuest.description || '',
          pillar: quest.pillar,
          tags: quest.tags || [],
          xp: quest.xp,
          gold: (reward.gold || 0) + gold,
          date: new Date().toISOString(),
          localDate: getLocalDateString(),
          completed: true,
        },
      ],
    };

    // Auto-assign any reward stat points directly
    const rewardSp = reward.statPoints || 0;
    if (rewardSp > 0) {
      const pillar = quest.pillar || 'deen';
      const autoStatResult = autoAssignStatPoints(state.stats || {}, pillar, rewardSp);
      if (autoStatResult) {
        nextState.stats = autoStatResult.stats;
        const assignStr = autoStatResult.assignments.map(a => `${a.stat.toUpperCase()} +${a.points}`).join(', ');
        nextState.systemMessages = [
          ...nextState.systemMessages,
          {
            type: 'levelUp',
            title: 'STAT GROWTH',
            subtitle: `Level Quest Reward`,
            message: `SYSTEM auto-assigned: ${assignStr}.`,
          },
        ];
      }
    }

    return nextState;
  }

  return {
    ...state,
    levelQuests: newLevelQuests,
    gold: state.gold + gold,
    history: [
      ...state.history,
      {
        eventId: createEventId('level-partial'),
        type: 'levelQuestPartial',
        title: quest.title,
        description: quest.description || '',
        pillar: quest.pillar,
        tags: quest.tags || [],
        xp: quest.xp,
        gold,
        date: new Date().toISOString(),
        localDate: getLocalDateString(),
        completed: true,
      },
    ],
  };
}

export function completeRedemptionQuest(state, redemptionQuestId) {
  const quest = state.redemptionQuests.find(rq => rq.id === redemptionQuestId);
  if (!quest || quest.completed) return state;

  const pillar = quest.pillar;
  if (!pillar || !state.pillars[pillar]) return state;

  const progress = getRedemptionProgress(state, quest);
  if (!progress.ready) {
    return {
      ...state,
      systemMessages: [
        ...(state.systemMessages || []),
        {
          type: 'penalty',
          title: 'REDEMPTION LOCKED',
          subtitle: quest.title,
          message: progress.missing.join(' '),
        },
      ],
    };
  }

  // Mark complete
  const newRedemptionQuests = state.redemptionQuests.map(rq =>
    rq.id === redemptionQuestId ? { ...rq, completed: true, completedAt: new Date().toISOString() } : rq
  );

  // Clear debuff ONLY for the matching pillar
  const newPillars = { ...state.pillars };
  const redemptionXp = quest.xp || 0;
  newPillars[pillar] = {
    ...newPillars[pillar],
    xp: (newPillars[pillar].xp || 0) + redemptionXp,
    activeDebuff: null,
  };

  let autoStatResult = null;
  const pillarLevel = newPillars[pillar].level || 0;
  const needed = xpForNextLevel(pillarLevel);
  if (newPillars[pillar].xp >= needed) {
    newPillars[pillar].level = pillarLevel + 1;
    newPillars[pillar].xp -= needed;
    const pillarRank = getRankByLevel(newPillars[pillar].level);
    autoStatResult = autoAssignStatPoints(state.stats || {}, pillar, pillarRank.statPointsPerLevel || 1);
  }

  const reward = quest.reward || {};

  let nextState = {
    ...state,
    redemptionQuests: newRedemptionQuests,
    pillars: newPillars,
    gold: state.gold + (reward.gold || 0),
    history: [
      ...(state.history || []),
      {
        eventId: createEventId('redemption'),
        type: 'redemption',
        questId: quest.id,
        title: quest.title,
        description: quest.description || '',
        pillar,
        tags: ['redemption', pillar],
        xp: redemptionXp,
        gold: reward.gold || 0,
        date: new Date().toISOString(),
        localDate: getLocalDateString(),
        completed: true,
      },
    ],
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'reward',
        title: 'REDEMPTION COMPLETE',
        subtitle: quest.title,
        message: reward.message || 'Your power is restored.',
      },
    ],
  };

  if (autoStatResult) {
    nextState.stats = autoStatResult.stats;
    const assignStr = autoStatResult.assignments.map(a => `${a.stat.toUpperCase()} +${a.points}`).join(', ');
    nextState.systemMessages = [
      ...nextState.systemMessages,
      {
        type: 'levelUp',
        title: `${getPillarDisplayKey(pillar)} LEVEL UP!`,
        subtitle: `Level ${newPillars[pillar].level}`,
        message: `SYSTEM auto-assigned: ${assignStr}.`,
      },
    ];
  }

  // Auto-assign any reward stat points directly
  const rewardSp = reward.statPoints || 0;
  if (rewardSp > 0) {
    const rewardStatResult = autoAssignStatPoints(nextState.stats || state.stats || {}, pillar, rewardSp);
    if (rewardStatResult) {
      nextState.stats = rewardStatResult.stats;
      const assignStr = rewardStatResult.assignments.map(a => `${a.stat.toUpperCase()} +${a.points}`).join(', ');
      nextState.systemMessages = [
        ...nextState.systemMessages,
        {
          type: 'levelUp',
          title: 'STAT GROWTH',
          subtitle: `Redemption Reward`,
          message: `SYSTEM auto-assigned: ${assignStr}.`,
        },
      ];
    }
  }

  return nextState;
}

export function getRedemptionProgress(state, quest) {
  const pillar = quest?.pillar;
  if (!pillar) {
    return { ready: false, questCompletions: 0, questRequired: 1, dungeonStepReady: true, fullDungeonReady: true, missing: ['Invalid redemption quest.'] };
  }

  const createdAt = new Date(quest.createdAt || 0).getTime();
  const afterCreated = (date) => {
    const time = new Date(date || 0).getTime();
    return Number.isFinite(time) && time >= createdAt;
  };

  const questRequired = Math.max(1, quest.dailyCompletionsRequired || (quest.extraQuestsRequired > 0 ? quest.extraQuestsRequired + 1 : 1));
  const questCompletions = (state.history || []).filter(h =>
    h.completed &&
    h.pillar === pillar &&
    ['daily', 'custom'].includes(h.type) &&
    afterCreated(h.date)
  ).length;

  const dungeon = state.weeklyDungeons?.[pillar];
  const dungeonStepReady = !quest.requiresDungeonStep || !!dungeon?.steps?.some(step =>
    step.completed && step.completedAt && afterCreated(step.completedAt)
  );

  const fullDungeonReady = !quest.requiresFullDungeon || (state.history || []).some(h =>
    h.completed &&
    h.pillar === pillar &&
    h.type === 'dungeon' &&
    afterCreated(h.date)
  );

  const missing = [];
  if (questCompletions < questRequired) {
    missing.push(`Complete ${questRequired - questCompletions} more ${pillar} quest${questRequired - questCompletions === 1 ? '' : 's'}.`);
  }
  if (!dungeonStepReady) missing.push(`Complete one new ${pillar} dungeon step.`);
  if (!fullDungeonReady) missing.push(`Conquer the full ${pillar} weekly dungeon.`);

  return {
    ready: missing.length === 0,
    questCompletions,
    questRequired,
    dungeonStepReady,
    fullDungeonReady,
    missing,
  };
}

// ─── OVERALL LEVEL CALCULATION ───
export function recalculateOverallLevel(state) {
  const deenLevel = state.pillars.deen.level;
  const bodyLevel = state.pillars.body.level;
  const moneyLevel = state.pillars.money.level;

  // Weighted discipline still matters, but the displayed hunter level should
  // never drop below the strongest pillar the user has already earned.
  const weightedOverall = Math.floor((deenLevel * 0.5) + (bodyLevel * 0.3) + (moneyLevel * 0.2));
  let overall = Math.max(state.user.overallLevel || 0, weightedOverall, deenLevel, bodyLevel, moneyLevel);

  const prevLevel = state.user.overallLevel || 0;

  // ─── MISSION GATE ENFORCEMENT ───
  // Real-world objectives must be completed before level ascension.
  // The pillars' accumulated XP naturally serves as the reserve.
  const blockingGate = getBlockingGate(state, overall);
  let gated = false;
  if (blockingGate && overall > blockingGate.level) {
    overall = blockingGate.level;
    gated = true;
  }

  const currentRank = getRankByLevel(overall);
  const prevRank = getRankByLevel(prevLevel);

  // Award skill points: 1 SP per 5 overall levels (based on actual achieved level)
  const spEarned = Math.floor(overall / 5) - Math.floor(prevLevel / 5);

  let newState = {
    ...state,
    user: {
      ...state.user,
      overallLevel: overall,
      currentRank: currentRank.key,
    },
    skillPoints: (state.skillPoints || 0) + spEarned,
  };

  // Check for rank up
  if (currentRank.key !== prevRank.key && overall > prevLevel) {
    newState.systemMessages = [
      ...newState.systemMessages,
      {
        type: 'rankUp',
        title: `RANK UP! ${currentRank.key}-Rank`,
        subtitle: `${currentRank.title}`,
        message: 'Your power has awakened. New quests and shadows are now available.',
      },
    ];
  }

  // Mission gate block message
  if (gated && blockingGate) {
    const progress = getGateProgress(state, blockingGate);
    newState.systemMessages = [
      ...newState.systemMessages,
      {
        type: 'penalty',
        title: `🚫 ${blockingGate.title}`,
        subtitle: blockingGate.subtitle,
        message: `LEVEL ASCENSION HALTED.\n\nYour calculated power exceeds your Khalifate. The System will not advance you to level ${overall + 1} until you complete ${progress.required - progress.completed} more mission objective${progress.required - progress.completed === 1 ? '' : 's'}:\n\n${blockingGate.objectives.map(o => `${(state.khalifateObjectives || []).find(ko => ko.id === o.id)?.completed ? '✅' : '⬜'} ${o.label}: ${o.description}`).join('\n')}\n\nThe level is a reflection. The mission is the reality. Complete the mission first.`,
      },
    ];
  }

  if (spEarned > 0) {
    newState.systemMessages = [
      ...newState.systemMessages,
      {
        type: 'reward',
        title: 'SKILL POINTS AWARDED',
        subtitle: `+${spEarned} SP`,
        message: `Reached level ${overall}. You now have ${newState.skillPoints} skill points to unlock abilities.`,
      },
    ];
  }

  return newState;
}

// ─── FLOW STATE (Rank-Scaled) ───
export function checkFlowState(history, rankKey = 'E') {
  const config = getScaledFlowConfig(rankKey);
  const now = Date.now();
  const windowMs = config.window * 60 * 1000;
  const recent = history.filter(h => h.completed && now - new Date(h.date).getTime() < windowMs);

  if (recent.length >= config.quests) {
    return {
      active: true,
      multiplier: config.multiplier,
      expiresAt: now + windowMs,
      questsInWindow: recent.length,
      rankKey,
    };
  }

  return { active: false, multiplier: 1, expiresAt: 0, questsInWindow: recent.length, rankKey };
}

export function getFlowStateDisplay(flowState) {
  if (!flowState?.active) return null;
  const timeLeft = Math.max(0, Math.floor((flowState.expiresAt - Date.now()) / 60000));
  return {
    text: `FLOW STATE: +${Math.round((flowState.multiplier - 1) * 100)}% XP`,
    timeLeft: `${timeLeft}m remaining`,
    questsInWindow: flowState.questsInWindow,
  };
}

// ─── STREAK BONUSES ───
export function getStreakBonus(streak) {
  if (streak >= 365) return { multiplier: 2.0, label: 'LEGENDARY', color: 'text-yellow-400' };
  if (streak >= 180) return { multiplier: 1.75, label: 'MYTHIC', color: 'text-purple-400' };
  if (streak >= 90) return { multiplier: 1.5, label: 'EPIC', color: 'text-orange-400' };
  if (streak >= 30) return { multiplier: 1.3, label: 'RARE', color: 'text-blue-400' };
  if (streak >= 7) return { multiplier: 1.15, label: 'UNCOMMON', color: 'text-cyan-400' };
  return { multiplier: 1.0, label: 'COMMON', color: 'text-gray-400' };
}

// ─── STAT POINTS FROM LEVEL ───
export function getStatPointsForLevel(level, prevLevel = 0) {
  let points = 0;
  for (let i = prevLevel + 1; i <= level; i++) {
    const rank = getRankByLevel(i);
    points += rank.statPointsPerLevel;
  }
  return points;
}

// ─── WEEKLY DUNGEON COMPLETION ───
export function completeWeeklyDungeon(state, pillar) {
  const dungeon = state.weeklyDungeons?.[pillar];
  if (!dungeon) return state;

  const allStepsComplete = dungeon.steps?.every(s => s.completed);
  if (!allStepsComplete) return state;

  // Already claimed
  if (state.weeklyDungeons[`${pillar}Completed`]) return state;

  const rank = getRankByLevel(state.user.overallLevel);
  const baseXp = dungeon.xp || 200;
  const rankScaledXp = Math.floor(baseXp * (rank.xpMultiplier || 1));
  // Ummah Service does not write to a specific pillar (it serves the whole mission).
  // Stat/equipment/trait bonuses only apply to the 3 primary pillars.
  const isUmmah = pillar === 'ummah';
  const statModifiedXp = isUmmah ? rankScaledXp : applyStatModifiers(rankScaledXp, state.stats || {}, pillar);

  // Apply equipment bonuses
  const equipmentModifiedXp = isUmmah ? statModifiedXp : applyEquipmentBonuses(statModifiedXp, pillar, state);

  // Apply nabawi traits
  const traitModifiedXp = isUmmah ? equipmentModifiedXp : applyNabawiTraits(equipmentModifiedXp, pillar, state);

  // Solo Clear Bonus: 2x XP if no AI prompts used this week
  let soloClearMultiplier = 1;
  const isSoloClear = state.weeklyStats?.aiPromptsUsed === 0;
  if (isSoloClear) {
    soloClearMultiplier = 2;
  }

  const finalXp = Math.floor(traitModifiedXp * soloClearMultiplier);
  const scaledGold = Math.floor(rankScaledXp * 0.6 * soloClearMultiplier);

  // Update pillar XP — skip for ummah (no pillar backing)
  const newPillars = { ...state.pillars };
  if (!isUmmah) {
    newPillars[pillar] = {
      ...newPillars[pillar],
      xp: newPillars[pillar].xp + finalXp,
      streak: newPillars[pillar].streak + 1,
    };
  }

  // Check pillar level up — skip for ummah
  let statPointsAwarded = 0;
  let autoStatResult = null;
  if (!isUmmah) {
    const pillarLevel = newPillars[pillar].level;
    const pillarXp = newPillars[pillar].xp;
    const needed = xpForNextLevel(pillarLevel);
    if (pillarXp >= needed) {
      newPillars[pillar].level = pillarLevel + 1;
      newPillars[pillar].xp = pillarXp - needed;
      const pillarRank = getRankByLevel(newPillars[pillar].level);
      statPointsAwarded = pillarRank.statPointsPerLevel || 1;
      autoStatResult = autoAssignStatPoints(state.stats || {}, pillar, statPointsAwarded);
    }
  }

  // Mark dungeon pillar as completed
  const newWeeklyDungeons = {
    ...state.weeklyDungeons,
    [`${pillar}Completed`]: true,
  };

  // Add history
  const historyEntry = {
    eventId: createEventId('dungeon'),
    type: 'dungeon',
    pillar,
    title: dungeon.title,
    description: dungeon.description || '',
    tags: ['dungeon', pillar, ...(dungeon.tags || [])],
    xp: finalXp,
    gold: scaledGold,
    date: new Date().toISOString(),
    localDate: getLocalDateString(),
    completed: true,
  };

  let nextState = {
    ...state,
    pillars: newPillars,
    gold: state.gold + scaledGold,
    weeklyDungeons: newWeeklyDungeons,
    history: [...state.history, historyEntry],
  };

  if (autoStatResult) {
    nextState.stats = autoStatResult.stats;
    const assignStr = autoStatResult.assignments.map(a => `${a.stat.toUpperCase()} +${a.points}`).join(', ');
    nextState.systemMessages = [
      ...(nextState.systemMessages || []),
      {
        type: 'levelUp',
        title: `${getPillarDisplayKey(pillar)} LEVEL UP!`,
        subtitle: `Level ${newPillars[pillar].level}`,
        message: `SYSTEM auto-assigned: ${assignStr}. Performance determines growth.`,
      },
    ];
  }

  // Equipment drop: 15% base chance, guaranteed on Solo Clear
  const dropRoll = Math.random();
  const dropChance = isSoloClear ? 1.0 : 0.15;
  if (dropRoll <= dropChance) {
    const droppedItem = dropEquipment(state.user.overallLevel, pillar);
    if (droppedItem) {
      const slot = droppedItem.slot;
      nextState = {
        ...nextState,
        equipment: {
          ...nextState.equipment,
          [slot]: droppedItem,
        },
        systemMessages: [
          ...(nextState.systemMessages || []),
          {
            type: 'reward',
            title: 'EQUIPMENT DROP',
            subtitle: droppedItem.name,
            message: `+${Math.round(droppedItem.boost * 100)}% ${droppedItem.pillar === 'all' ? 'all' : droppedItem.pillar} XP boost. Durability: ${droppedItem.durability}/${droppedItem.maxDurability}.`,
          },
        ],
      };
    }
  }

  // Solo Clear Bonus: guaranteed shadow extraction if no AI used
  if (isSoloClear) {
    const available = getUnlockedShadows(nextState).filter(s => !s.extracted);
    if (available.length > 0) {
      const highest = available.sort((a, b) => b.passiveBonus - a.passiveBonus)[0];
      nextState = extractShadow(nextState, highest.id);
    }
    // Mark solo clear as earned for the week
    nextState.weeklyStats = {
      ...nextState.weeklyStats,
      soloClear: true,
    };
  }

  // Recalculate overall level
  nextState = recalculateOverallLevel(nextState);

  return nextState;
}

// ─── PROGRESS PERCENTAGE ───
export function getLevelProgress(pillarState) {
  const needed = xpForNextLevel(pillarState.level);
  return Math.min(100, Math.floor((pillarState.xp / needed) * 100));
}

export function getOverallProgress(state) {
  const deen = state.pillars.deen;
  const body = state.pillars.body;
  const money = state.pillars.money;

  const deenNeeded = xpForNextLevel(deen.level);
  const bodyNeeded = xpForNextLevel(body.level);
  const moneyNeeded = xpForNextLevel(money.level);

  const totalXp = deen.xp + body.xp + money.xp;
  const totalNeeded = deenNeeded + bodyNeeded + moneyNeeded;

  return Math.min(100, Math.floor((totalXp / totalNeeded) * 100));
}
