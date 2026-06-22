import { getRankByLevel } from '../data/questCatalog';
import { getScaledFlowConfig } from '../data/rankDifficulty';
import { getBlockingGate } from '../data/missionGates';

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

// Cleaned version of questEngine.recalculateOverallLevel, with khalifate mission-gate
// enforcement restored: level ascension pauses at L100/200/.../999 until the gate's
// required khalifate objectives are completed. Below L100 levels climb freely (job-change
// gates at L10-70 award class titles via a separate, non-capping mechanism). No
// skill-point awarding here — that stays in the quest-completion path.
export function recalculateOverallLevel(state) {
  const deenLevel = state.pillars.deen.level;
  const bodyLevel = state.pillars.body.level;
  const moneyLevel = state.pillars.money.level;
  const weightedOverall = Math.floor(deenLevel * 0.5 + bodyLevel * 0.3 + moneyLevel * 0.2);
  const prevLevel = state.user.overallLevel || 0;
  const overall = Math.max(prevLevel, weightedOverall, deenLevel, bodyLevel, moneyLevel);

  // Khalifate gate enforcement: cap ascension at the first incomplete mission gate the
  // user has reached. try/catch so a gate-system failure can't crash the log pipeline.
  let gatedLevel = overall;
  let blockingGate = null;
  try {
    blockingGate = getBlockingGate(state, overall);
    if (blockingGate && overall > blockingGate.level) {
      gatedLevel = blockingGate.level;
    }
  } catch (err) {
    console.warn('[gate enforcement] non-fatal:', err);
  }

  const currentRank = getRankByLevel(gatedLevel);
  const prevRank = getRankByLevel(prevLevel);

  const newState = {
    ...state,
    user: { ...state.user, overallLevel: gatedLevel, currentRank: currentRank.key },
  };

  if (currentRank.key !== prevRank.key && gatedLevel > prevLevel) {
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

  // Announce a khalifate gate once, on arrival (prevLevel below the gate, now at/above it)
  // — not on every recalc, so sitting at a gate doesn't spam the message every log.
  if (blockingGate && prevLevel < blockingGate.level) {
    newState.systemMessages = [
      ...(newState.systemMessages || []),
      {
        type: 'rankUp',
        title: `KHALIFATE GATE: ${blockingGate.title}`,
        subtitle: blockingGate.subtitle,
        message: `Level ascension pauses at ${blockingGate.level}. Complete ${blockingGate.requiredCount} Khalifate objectives to advance. The mission is the reality; the level is only a reflection.`,
      },
    ];
  }

  return newState;
}