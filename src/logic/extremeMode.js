/** ============================================================
 *  EXTREME MODE — Brutal Consequence for Prolonged Failure
 *  ============================================================
 *  Tracks consecutive missed days per pillar. After 3+ days of
 *  zero completions on a pillar, the System enters Extreme Mode.
 *
 *  Extreme Penalty (on continued failure):
 *    • Cumulative XP loss scaling with rank + streak length
 *    • Extra equipment durability crack (-20 instead of -10)
 *    • Harsher debuff message
 *
 *  Extreme Reward (on breaking the streak by completing a quest):
 *    • Massive XP multiplier (2×–5× based on streak length + rank)
 *    • Bonus gold proportional to streak
 *    • System message of redemption
 *
 *  Rank scaling: Higher rank = higher stakes, but also higher
 *  redemption multiplier. The System demands more from those
 *  who have proven themselves.
 *  ============================================================ */

import { getRankByLevel, RANK_CONFIG } from '../data/questCatalog';
import { getLocalDateString } from '../utils/dateUtils';

const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S'];

function getRankIndex(rankKey) {
  return RANK_ORDER.indexOf(rankKey);
}

/** ─── FAILURE STREAK TRACKING ─── */

export function getFailureStreak(state, pillar) {
  return (state.failureStreaks || {})[pillar] || 0;
}

export function incrementFailureStreak(state, pillar) {
  const current = getFailureStreak(state, pillar);
  return {
    ...state,
    failureStreaks: {
      ...(state.failureStreaks || {}),
      [pillar]: current + 1,
    },
  };
}

export function resetFailureStreak(state, pillar) {
  const current = getFailureStreak(state, pillar);
  if (current === 0) return state;
  return {
    ...state,
    failureStreaks: {
      ...(state.failureStreaks || {}),
      [pillar]: 0,
    },
  };
}

export function isExtremeMode(state, pillar) {
  return getFailureStreak(state, pillar) >= 3;
}

/** ─── EXTREME PENALTY (called when penalties fire and streak >= 3) ─── */

export function applyExtremePenalty(state, pillar, rankKey) {
  const streak = getFailureStreak(state, pillar);
  if (streak < 3) return { state, xpLossExtra: 0, message: null };

  const idx = getRankIndex(rankKey);
  const tier = idx + 1; // E=1 ... S=6

  // Cumulative extra XP loss: 5% per day beyond the 3rd, capped at 30%
  const extraLossPercent = Math.min(0.30, (streak - 2) * 0.05);

  // Extra equipment durability crack: -20 per day beyond the 3rd
  const extraDurabilityLoss = (streak - 2) * 20;

  // Scale with rank tier
  const scaledExtraLoss = extraLossPercent * (1 + (tier - 1) * 0.15);
  const scaledDurability = extraDurabilityLoss * (1 + (tier - 1) * 0.10);

  const pillarState = state.pillars[pillar];
  const currentXp = pillarState?.xp || 0;
  const xpLossExtra = Math.max(0, Math.floor(currentXp * scaledExtraLoss));

  const newPillars = {
    ...state.pillars,
    [pillar]: {
      ...pillarState,
      xp: Math.max(0, currentXp - xpLossExtra),
    },
  };

  // Crack equipment extra
  const newEquipment = { ...state.equipment };
  Object.keys(newEquipment).forEach(slot => {
    const item = newEquipment[slot];
    if (!item) return;
    const newDurability = Math.max(0, (item.durability || 0) - scaledDurability);
    if (newDurability !== item.durability) {
      newEquipment[slot] = { ...item, durability: newDurability };
    }
  });

  const severityLabels = {
    3: 'EXTREME WARNING',
    4: 'CRITICAL FAILURE',
    5: 'SYSTEM JUDGMENT',
    6: 'MONARCH EXECUTION',
  };
  const severity = severityLabels[Math.min(6, streak)] || `DAY ${streak} EXILE`;

  const message = {
    type: 'penalty',
    title: `🔥 ${severity}`,
    subtitle: `${pillar.toUpperCase()} — ${streak} days of silence`,
    message: `• EXTRA XP SEIZED: -${xpLossExtra} XP (${Math.round(scaledExtraLoss * 100)}% extra loss)\n• EQUIPMENT CRACKED: -${scaledDurability} durability across all gear\n• STREAK: ${streak} consecutive days. The System's patience is exhausted.\n\nComplete a quest on this pillar to break the streak and earn redemption rewards.`,
  };

  return {
    state: {
      ...state,
      pillars: newPillars,
      equipment: newEquipment,
    },
    xpLossExtra,
    message,
  };
}

/** ─── EXTREME REWARD (called on quest completion when streak >= 3) ─── */

export function calculateExtremeReward(state, pillar, baseXp, rankKey) {
  const streak = getFailureStreak(state, pillar);
  if (streak < 3) return { multiplier: 1, bonusGold: 0, message: null };

  const idx = getRankIndex(rankKey);
  const tier = idx + 1;

  // Multiplier: 2× at 3 days, +0.5 per extra day, cap at 5×
  // Rank bonus: +0.25 per tier above E
  const baseMultiplier = Math.min(5.0, 2.0 + (streak - 3) * 0.5);
  const rankBonus = (tier - 1) * 0.25;
  const multiplier = baseMultiplier + rankBonus;

  // Bonus gold: 50 per day of streak, scaled by rank
  const bonusGold = Math.floor(streak * 50 * (1 + (tier - 1) * 0.3));

  const redemptionLabels = {
    3: 'REDEMPTION BEGINNING',
    4: 'CRACKED ARMOR RESTORED',
  };
  const label = redemptionLabels[streak] || `${streak}-DAY EXILE BROKEN`;

  const message = {
    type: 'reward',
    title: `⚡ ${label}`,
    subtitle: `${pillar.toUpperCase()} streak shattered — ${streak} days`,
    message: `• EXTREME XP MULTIPLIER: ${multiplier.toFixed(2)}× (${Math.round((multiplier - 1) * 100)}% bonus)\n• BONUS GOLD: +${bonusGold}\n• Failure streak RESET. You have chosen discipline over decay. The Khalifate rewards the penitent.`,
  };

  return { multiplier, bonusGold, message };
}

/** ─── UTILITY: extreme mode status for UI ─── */

export function getExtremeModeSummary(state) {
  const pillars = ['deen', 'body', 'money'];
  const active = [];
  for (const p of pillars) {
    const streak = getFailureStreak(state, p);
    if (streak >= 3) {
      active.push({
        pillar: p,
        streak,
        severity: streak >= 5 ? 'critical' : streak >= 4 ? 'severe' : 'extreme',
      });
    }
  }
  return active;
}

export function getExtremePillarLabel(streak) {
  if (streak >= 6) return 'JUDGMENT';
  if (streak >= 5) return 'EXECUTION';
  if (streak >= 4) return 'CRITICAL';
  if (streak >= 3) return 'EXTREME';
  return null;
}
