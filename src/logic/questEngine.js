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
import { isDebuffActive } from './penalties';
import { addMissionDailyQuests } from './missionQuestGenerator';

function createEventId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── STATE INITIALIZATION ───
export function initializeDailyQuests(state) {
  const rank = getRankByLevel(state.user.overallLevel);
  const today = getLocalDateString();

  // Only regenerate if date changed
  if (state.lastQuestDate === today) return state;

  const baseDailyQuests = getDailyQuestsForRank(rank.key, state.dailyQuests);
  const dailyQuests = addMissionDailyQuests(baseDailyQuests, rank.key, state.history || []);

  return {
    ...state,
    dailyQuests,
    lastQuestDate: today,
  };
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
  const dungeon = getWeeklyDungeonForRank(rank.key);
  dungeon.weekId = currentWeek;

  return {
    ...state,
    weeklyDungeons: dungeon,
  };
}

// ─── QUEST COMPLETION ───
export function completeDailyQuest(state, questUniqueId) {
  const quest = state.dailyQuests.find(q => q.uniqueId === questUniqueId);
  if (!quest || quest.completed) return state;

  const rank = getRankByLevel(state.user.overallLevel);
  const baseXp = quest.xp || getEffectiveXp(quest.baseXp, rank.key);
  const gold = calculateGoldReward(quest, rank.key);

  // Apply stat modifiers (Strength/Intelligence/Sense/Agility)
  const statModifiedXp = applyStatModifiers(baseXp, state.stats || {}, quest.pillar);

  // Apply debuff if active
  const pillar = state.pillars[quest.pillar];
  const debuffMultiplier = isDebuffActive(pillar?.activeDebuff) ? (pillar.activeDebuff.multiplier || 1) : 1;
  const finalXp = Math.floor(statModifiedXp * debuffMultiplier);

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
    xp: finalXp,
    gold,
    date: new Date().toISOString(),
    localDate: today,
    completed: true,
  };

  const result = {
    ...state,
    pillars: newPillars,
    dailyQuests: newDailyQuests,
    gold: state.gold + gold,
    history: [...state.history, historyEntry],
  };

  if (autoStatResult) {
    result.stats = autoStatResult.stats;
    const assignStr = autoStatResult.assignments.map(a => `${a.stat.toUpperCase()} +${a.points}`).join(', ');
    result.systemMessages = [
      ...(result.systemMessages || []),
      {
        type: 'levelUp',
        title: `${quest.pillar.toUpperCase()} LEVEL UP!`,
        subtitle: `Level ${newPillars[quest.pillar].level}`,
        message: `SYSTEM auto-assigned: ${assignStr}. Performance determines growth.`,
      },
    ];
  }

  return result;
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
        title: `${pillar.toUpperCase()} LEVEL UP!`,
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

  // Weighted average: Deen matters most, then Body, then Money
  const overall = Math.floor((deenLevel * 0.5) + (bodyLevel * 0.3) + (moneyLevel * 0.2));

  const currentRank = getRankByLevel(overall);
  const prevRank = getRankByLevel(state.user.overallLevel);

  let newState = {
    ...state,
    user: {
      ...state.user,
      overallLevel: overall,
      currentRank: currentRank.key,
    },
  };

  // Check for rank up
  if (currentRank.key !== prevRank.key && overall > state.user.overallLevel) {
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
  const statModifiedXp = applyStatModifiers(rankScaledXp, state.stats || {}, pillar);
  const scaledGold = Math.floor(rankScaledXp * 0.6);

  // Update pillar XP
  const newPillars = { ...state.pillars };
  newPillars[pillar] = {
    ...newPillars[pillar],
    xp: newPillars[pillar].xp + statModifiedXp,
    streak: newPillars[pillar].streak + 1,
  };

  // Check pillar level up
  let statPointsAwarded = 0;
  const pillarLevel = newPillars[pillar].level;
  const pillarXp = newPillars[pillar].xp;
  const needed = xpForNextLevel(pillarLevel);
  let autoStatResult = null;
  if (pillarXp >= needed) {
    newPillars[pillar].level = pillarLevel + 1;
    newPillars[pillar].xp = pillarXp - needed;
    const pillarRank = getRankByLevel(newPillars[pillar].level);
    statPointsAwarded = pillarRank.statPointsPerLevel || 1;
    autoStatResult = autoAssignStatPoints(state.stats || {}, pillar, statPointsAwarded);
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
    xp: statModifiedXp,
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
        title: `${pillar.toUpperCase()} LEVEL UP!`,
        subtitle: `Level ${newPillars[pillar].level}`,
        message: `SYSTEM auto-assigned: ${assignStr}. Performance determines growth.`,
      },
    ];
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
