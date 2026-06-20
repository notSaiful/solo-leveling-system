import { getRankByLevel } from '../data/questCatalog';
import { getScaledFlowConfig } from '../data/rankDifficulty';

const STREAK_TIERS = [
  { min: 365, multiplier: 2.0, label: 'LEGENDARY' },
  { min: 180, multiplier: 1.75, label: 'MYTHIC' },
  { min: 90, multiplier: 1.5, label: 'EPIC' },
  { min: 30, multiplier: 1.3, label: 'RARE' },
  { min: 7, multiplier: 1.15, label: 'UNCOMMON' },
];

export function getActivityStreakBonus(streak) {
  for (const tier of STREAK_TIERS) {
    if (streak >= tier.min) return { multiplier: tier.multiplier, label: tier.label };
  }
  return { multiplier: 1.0, label: 'COMMON' };
}

export function checkFlowState(history, rankKey = 'E') {
  const config = getScaledFlowConfig(rankKey);
  const now = Date.now();
  const windowMs = config.window * 60 * 1000;
  const recent = (history || []).filter(
    (h) => h.completed && now - new Date(h.date).getTime() < windowMs
  );
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

// Cleaned version of questEngine.recalculateOverallLevel:
// no mission-gate level cap, no skill-point awarding.
export function recalculateOverallLevel(state) {
  const deenLevel = state.pillars.deen.level;
  const bodyLevel = state.pillars.body.level;
  const moneyLevel = state.pillars.money.level;
  const weightedOverall = Math.floor(deenLevel * 0.5 + bodyLevel * 0.3 + moneyLevel * 0.2);
  const prevLevel = state.user.overallLevel || 0;
  const overall = Math.max(prevLevel, weightedOverall, deenLevel, bodyLevel, moneyLevel);

  const currentRank = getRankByLevel(overall);
  const prevRank = getRankByLevel(prevLevel);

  const newState = {
    ...state,
    user: { ...state.user, overallLevel: overall, currentRank: currentRank.key },
  };

  if (currentRank.key !== prevRank.key && overall > prevLevel) {
    newState.systemMessages = [
      ...(state.systemMessages || []),
      {
        type: 'rankUp',
        title: `RANK UP: ${currentRank.key}-Rank`,
        subtitle: currentRank.title,
        message: 'Your power has awakened.',
      },
    ];
  }

  return newState;
}