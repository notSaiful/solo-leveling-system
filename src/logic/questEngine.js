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
  getRedemptionQuest,
  getJobChangeQuest,
  calculateGoldReward,
  RANK_CONFIG,
} from '../data/questCatalog';
import { getCurrentWeekId } from './dungeons';

// ─── STATE INITIALIZATION ───
export function initializeDailyQuests(state) {
  const rank = getRankByLevel(state.user.overallLevel);
  const today = new Date().toISOString().split('T')[0];

  // Only regenerate if date changed
  if (state.lastQuestDate === today) return state;

  const dailyQuests = getDailyQuestsForRank(rank.key, state.dailyQuests);

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
  const xp = quest.xp || getEffectiveXp(quest.baseXp, rank.key);
  const gold = calculateGoldReward(quest, rank.key);

  // Apply debuff if active
  const pillar = state.pillars[quest.pillar];
  const debuffMultiplier = pillar?.activeDebuff?.multiplier || 1;
  const finalXp = Math.floor(xp * debuffMultiplier);

  // Update pillar
  const newPillars = { ...state.pillars };
  newPillars[quest.pillar] = {
    ...newPillars[quest.pillar],
    xp: newPillars[quest.pillar].xp + finalXp,
    streak: newPillars[quest.pillar].streak + 1,
  };

  // Check for pillar level up
  const pillarLevel = newPillars[quest.pillar].level;
  const pillarXp = newPillars[quest.pillar].xp;
  const needed = xpForNextLevel(pillarLevel);
  if (pillarXp >= needed) {
    newPillars[quest.pillar].level = pillarLevel + 1;
    newPillars[quest.pillar].xp = pillarXp - needed;
  }

  // Mark quest complete
  const newDailyQuests = state.dailyQuests.map(q =>
    q.uniqueId === questUniqueId
      ? { ...q, completed: true, completedAt: new Date().toISOString() }
      : q
  );

  // Add to history
  const historyEntry = {
    type: 'daily',
    questId: quest.id,
    title: quest.title,
    pillar: quest.pillar,
    xp: finalXp,
    gold,
    date: new Date().toISOString(),
    completed: true,
  };

  return {
    ...state,
    pillars: newPillars,
    dailyQuests: newDailyQuests,
    gold: state.gold + gold,
    history: [...state.history, historyEntry],
  };
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

    return {
      ...state,
      levelQuests: newLevelQuests,
      gold: state.gold + (reward.gold || 0) + gold,
      statPoints: state.statPoints + (reward.statPoints || 0),
      systemMessages: [...state.systemMessages, ...messages],
      user: reward.rankUp
        ? { ...state.user, currentRank: reward.rankUp, overallLevel: state.user.overallLevel + 1 }
        : { ...state.user, overallLevel: state.user.overallLevel + 1 },
      history: [
        ...state.history,
        {
          type: 'levelQuest',
          title: levelQuest.title,
          xp: quest.xp,
          gold: (reward.gold || 0) + gold,
          date: new Date().toISOString(),
          completed: true,
        },
      ],
    };
  }

  return {
    ...state,
    levelQuests: newLevelQuests,
    gold: state.gold + gold,
    history: [
      ...state.history,
      {
        type: 'levelQuestPartial',
        title: quest.title,
        xp: quest.xp,
        gold,
        date: new Date().toISOString(),
        completed: true,
      },
    ],
  };
}

export function completeRedemptionQuest(state, redemptionQuestId) {
  const quest = state.redemptionQuests.find(rq => rq.id === redemptionQuestId);
  if (!quest || quest.completed) return state;

  // Mark complete
  const newRedemptionQuests = state.redemptionQuests.map(rq =>
    rq.id === redemptionQuestId ? { ...rq, completed: true, completedAt: new Date().toISOString() } : rq
  );

  // Clear debuffs
  const newPillars = { ...state.pillars };
  Object.keys(newPillars).forEach(key => {
    newPillars[key] = { ...newPillars[key], activeDebuff: null };
  });

  const reward = quest.reward || {};

  return {
    ...state,
    redemptionQuests: newRedemptionQuests,
    pillars: newPillars,
    gold: state.gold + (reward.gold || 0),
    statPoints: state.statPoints + (reward.statPoints || 0),
    systemMessages: [
      ...state.systemMessages,
      {
        type: 'reward',
        title: 'REDEMPTION COMPLETE',
        subtitle: quest.title,
        message: reward.message || 'Your power is restored.',
      },
    ],
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

// ─── FLOW STATE ───
const FLOW_WINDOW_MS = 60 * 60 * 1000; // 60 minutes
const FLOW_THRESHOLD = 3;
const FLOW_MULTIPLIER = 1.2;

export function checkFlowState(history) {
  const now = Date.now();
  const recent = history.filter(h => h.completed && now - new Date(h.date).getTime() < FLOW_WINDOW_MS);

  if (recent.length >= FLOW_THRESHOLD) {
    return {
      active: true,
      multiplier: FLOW_MULTIPLIER,
      expiresAt: now + FLOW_WINDOW_MS,
      questsInWindow: recent.length,
    };
  }

  return { active: false, multiplier: 1, expiresAt: 0, questsInWindow: recent.length };
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
