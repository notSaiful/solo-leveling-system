import { getLocalDateString, getDaysBetween, toLocalDateString } from '../utils/dateUtils';
import { getHealthDebuffReduction, getManaDebuffReduction } from '../data/stats';
import { getScaledPenalty, getScaledRedemptionQuest } from '../data/rankDifficulty';
import { getRankByLevel, RANK_CONFIG } from '../data/questCatalog';

/** ============================================================
 *  PENALTY SYSTEM — Brutal Accountability
 *  ============================================================
 *  Core principle: Penalties are based on QUEST COMPLETION,
 *  not app opens. If you open the app daily but do zero quests,
 *  you WILL be penalized.
 *  ============================================================ */

export function checkStreakBreak(history, pillar, date) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = getLocalDateString(yesterday);
  const hadQuestYesterday = history.some(h => {
    const hDate = h.date ? toLocalDateString(h.date) : '';
    return hDate === yStr && h.pillar === pillar && h.completed;
  });
  return !hadQuestYesterday;
}

export function getMissedDays(lastActiveDate) {
  const last = new Date(lastActiveDate);
  const today = new Date();
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today - last;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays - 1); // -1 because we don't count today if just opened
}

/** Find the most recent date with a completed daily quest for a pillar */
export function getLastDailyCompletionDate(history, pillar) {
  const completions = (history || []).filter(
    h => h.pillar === pillar && h.completed && h.type === 'daily'
  );
  if (completions.length === 0) return null;

  const latest = completions.reduce((latest, h) => {
    const hDate = new Date(h.date);
    return hDate > latest ? hDate : latest;
  }, new Date(0));

  return getLocalDateString(latest);
}

export function applyPenalty(pillarState, penaltyType, stats = {}, rankKey = 'E') {
  const scaled = getScaledPenalty(rankKey, penaltyType);
  if (!scaled) return pillarState;

  let debuff = { ...scaled, appliedAt: Date.now() };

  // Apply Mana reduction to debuff duration (max 50% reduction)
  const manaReduction = getManaDebuffReduction(stats);
  if (manaReduction > 0) {
    debuff.duration = Math.floor(debuff.duration * (1 - manaReduction));
    debuff.message += ` (Mana reduced duration by ${Math.round(manaReduction * 100)}%)`;
  }

  // Apply Health reduction to debuff multiplier (max 50% XP loss reduction)
  const healthReduction = getHealthDebuffReduction(stats);
  if (healthReduction > 0) {
    const originalLoss = 1 - debuff.multiplier;
    const reducedLoss = originalLoss * (1 - healthReduction);
    debuff.multiplier = Math.min(1, 1 - reducedLoss);
    debuff.message += ` (Health reduced XP loss by ${Math.round(healthReduction * 100)}%)`;
  }

  // ─── ACTUAL XP DEDUCTION — THIS IS THE PAIN ───
  const currentXp = pillarState.xp || 0;
  const xpLoss = Math.max(0, Math.floor(currentXp * scaled.xpLossPercent));
  const newXp = Math.max(0, currentXp - xpLoss);

  // Level-down check: if XP drops to 0 and we were above level 0, drop a level
  let newLevel = pillarState.level || 0;
  if (newXp === 0 && currentXp > 0 && newLevel > 0) {
    newLevel = Math.max(0, newLevel - 1);
  }

  return {
    ...pillarState,
    level: newLevel,
    xp: newXp,
    activeDebuff: debuff,
    _penaltyMeta: {
      xpLoss,
      xpBefore: currentXp,
      xpAfter: newXp,
      levelDropped: newLevel < (pillarState.level || 0),
      oldLevel: pillarState.level || 0,
      newLevel,
      rankKey,
      scaled,
    },
  };
}

export function isDebuffActive(debuff) {
  if (!debuff) return false;
  const appliedAt = typeof debuff.appliedAt === 'number'
    ? debuff.appliedAt
    : new Date(debuff.appliedAt || 0).getTime();
  const duration = debuff.duration || ((debuff.days || 0) * 24 * 60 * 60 * 1000);
  if (!Number.isFinite(appliedAt) || !Number.isFinite(duration) || duration <= 0) return false;
  return (Date.now() - appliedAt) < duration;
}

export function getEffectiveXp(baseXp, pillarState) {
  if (!isDebuffActive(pillarState.activeDebuff)) return baseXp;
  return Math.floor(baseXp * pillarState.activeDebuff.multiplier);
}

export function getRedemptionQuest(pillar, rankKey = 'E') {
  return getScaledRedemptionQuest(rankKey, pillar);
}

function getRequiredDailyCompletions(rankKey) {
  const dailyTotal = RANK_CONFIG[rankKey]?.dailyQuestsPerPillar || 2;
  const ratios = { E: 0.5, D: 0.6, C: 0.67, B: 0.75, A: 0.75, S: 0.8 };
  return Math.max(1, Math.min(dailyTotal, Math.ceil(dailyTotal * (ratios[rankKey] || 0.67))));
}

function getDailyCompletionCount(history, pillar, day) {
  return (history || []).filter(h => {
    if (h.pillar !== pillar || !h.completed || h.type !== 'daily') return false;
    const hDate = h.date ? toLocalDateString(h.date) : '';
    return hDate === day;
  }).length;
}

/** Check if the previous week's dungeon was missed before it reset */
export function checkDungeonPenalty(state, daysToCheck) {
  const dungeons = state.weeklyDungeons;
  if (!dungeons || !dungeons.weekId) return null;

  // If any of the checked days is a Monday, that means the week rolled over
  // and we need to check if last week's dungeon was completed
  const mondayShifted = daysToCheck.some(d => {
    const date = new Date(d);
    return date.getDay() === 1; // Monday = 1 (weekStartsOn: 1 in dungeons.js)
  });

  if (!mondayShifted) return null;

  // Check if all three dungeons were at least started/completed
  const allClaimed = dungeons.deenCompleted && dungeons.bodyCompleted && dungeons.moneyCompleted;
  if (allClaimed) return null;

  // At least one dungeon was missed
  const missedPillars = [];
  if (!dungeons.deenCompleted) missedPillars.push('deen');
  if (!dungeons.bodyCompleted) missedPillars.push('body');
  if (!dungeons.moneyCompleted) missedPillars.push('money');

  return {
    type: 'missedDungeon',
    missedPillars,
    message: `Weekly dungeon missed for: ${missedPillars.join(', ')}. Shadow soldiers weakened.`,
  };
}

export function checkAndApplyPenalties(state) {
  const today = getLocalDateString();
  const lastCheck = state.lastPenaltyCheckDate || state.lastActiveDate || today;

  // Days to check: from day after lastCheck up to (but not including) today
  const daysToCheck = getDaysBetween(lastCheck, today);

  if (daysToCheck.length === 0) {
    return { penalties: [], redemptionQuests: [], updatedPillars: state.pillars, dungeonPenalty: null, lastPenaltyCheckDate: today };
  }

  const penalties = [];
  const redemptionQuests = [];
  const updatedPillars = { ...state.pillars };
  const joinedDate = state.user?.joinedDate
    ? toLocalDateString(state.user.joinedDate)
    : today;

  // Determine current rank for scaled penalties
  const currentRank = getRankByLevel(state.user?.overallLevel || 0);
  const rankKey = currentRank.key;
  const requiredDailyCompletions = getRequiredDailyCompletions(rankKey);

  for (const pillar of ['deen', 'body', 'money']) {
    // Reconstruct last completion date from history if not tracked
    let lastCompDate = updatedPillars[pillar].lastDailyQuestCompletionDate;
    if (!lastCompDate) {
      lastCompDate = getLastDailyCompletionDate(state.history, pillar);
    }

    // If brand new user with no history, initialize tracking without penalty
    if (!lastCompDate) {
      // Only skip if account was created after the checked days
      const accountCreatedAfterAllChecked = daysToCheck.every(d => d < joinedDate);
      if (accountCreatedAfterAllChecked) {
        updatedPillars[pillar] = { ...updatedPillars[pillar], lastDailyQuestCompletionDate: today };
        continue;
      }
      // Otherwise, treat lastCompDate as joinedDate for penalty calculation
      lastCompDate = joinedDate;
    }

    // Count missed days for this pillar (days with no daily quest completion)
    let missedCount = 0;
    for (const day of daysToCheck) {
      // Don't penalize days before account creation
      if (day < joinedDate) continue;

      const completionCount = getDailyCompletionCount(state.history, pillar, day);
      if (completionCount < requiredDailyCompletions) {
        missedCount++;
      }
    }

    if (missedCount === 0) {
      // Update tracking date to the most recent checked day that had completions
      const mostRecentCheckedDay = daysToCheck[daysToCheck.length - 1];
      updatedPillars[pillar] = {
        ...updatedPillars[pillar],
        lastDailyQuestCompletionDate: mostRecentCheckedDay,
      };
      continue;
    }

    // Apply penalty based on total missed days in this check window
    const stats = state.stats || {};
    if (missedCount >= 3) {
      const penalized = applyPenalty(updatedPillars[pillar], 'missedThreeDays', stats, rankKey);
      updatedPillars[pillar] = penalized;
      penalties.push({
        pillar,
        type: 'missedThreeDays',
        days: missedCount,
        xpLoss: penalized._penaltyMeta?.xpLoss || 0,
        xpBefore: penalized._penaltyMeta?.xpBefore || 0,
        xpAfter: penalized._penaltyMeta?.xpAfter || 0,
        levelDropped: penalized._penaltyMeta?.levelDropped || false,
        oldLevel: penalized._penaltyMeta?.oldLevel || 0,
        newLevel: penalized._penaltyMeta?.newLevel || 0,
        rankKey,
        scaled: penalized._penaltyMeta?.scaled,
      });
      redemptionQuests.push(getRedemptionQuest(pillar, rankKey));
    } else if (missedCount >= 1) {
      const penalized = applyPenalty(updatedPillars[pillar], 'missedDaily', stats, rankKey);
      updatedPillars[pillar] = penalized;
      penalties.push({
        pillar,
        type: 'missedDaily',
        days: missedCount,
        xpLoss: penalized._penaltyMeta?.xpLoss || 0,
        xpBefore: penalized._penaltyMeta?.xpBefore || 0,
        xpAfter: penalized._penaltyMeta?.xpAfter || 0,
        levelDropped: penalized._penaltyMeta?.levelDropped || false,
        oldLevel: penalized._penaltyMeta?.oldLevel || 0,
        newLevel: penalized._penaltyMeta?.newLevel || 0,
        rankKey,
        scaled: penalized._penaltyMeta?.scaled,
      });
    }

    // Reset streak on any miss
    updatedPillars[pillar] = { ...updatedPillars[pillar], streak: 0 };
  }

  // Check dungeon penalty
  const dungeonPenalty = checkDungeonPenalty(state, daysToCheck);
  if (dungeonPenalty) {
    const stats = state.stats || {};
    for (const pillar of dungeonPenalty.missedPillars) {
      if (updatedPillars[pillar]) {
        const penalized = applyPenalty(updatedPillars[pillar], 'missedDungeon', stats, rankKey);
        updatedPillars[pillar] = penalized;
        penalties.push({
          pillar,
          type: 'missedDungeon',
          days: 1,
          xpLoss: penalized._penaltyMeta?.xpLoss || 0,
          xpBefore: penalized._penaltyMeta?.xpBefore || 0,
          xpAfter: penalized._penaltyMeta?.xpAfter || 0,
          levelDropped: penalized._penaltyMeta?.levelDropped || false,
          oldLevel: penalized._penaltyMeta?.oldLevel || 0,
          newLevel: penalized._penaltyMeta?.newLevel || 0,
          rankKey,
          scaled: penalized._penaltyMeta?.scaled,
        });
      }
    }
  }

  return {
    penalties,
    redemptionQuests,
    updatedPillars,
    dungeonPenalty,
    lastPenaltyCheckDate: today,
  };
}
