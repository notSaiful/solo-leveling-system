/** ============================================================
 *  RANK DIFFICULTY SCALING
 *  Higher rank = higher stakes. The System demands more from those
 *  who have proven themselves. Failure at high rank is catastrophic.
 *  ============================================================ */

import { RANK_CONFIG, getRankByLevel } from './questCatalog';

const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S'];

function getRankIndex(rankKey) {
  return RANK_ORDER.indexOf(rankKey);
}

// ─── PENALTY SCALING ───
// At higher ranks, failure costs proportionally more.
export function getScaledPenalty(rankKey, penaltyType) {
  const idx = getRankIndex(rankKey);
  const tier = idx + 1; // E=1, D=2, ..., S=6

  const base = {
    missedDaily:      { xpLossPercent: 0.05, multiplier: 0.95, durationHours: 24 },
    missedThreeDays:  { xpLossPercent: 0.20, multiplier: 0.80, durationHours: 72 },
    missedDungeon:    { xpLossPercent: 0.10, multiplier: 0.90, durationHours: 168 },
  }[penaltyType];

  if (!base) return null;

  // Scaling formula: linear growth with rank tier
  // E: 1.0x | D: 1.5x | C: 2.0x | B: 3.0x | A: 4.0x | S: 5.0x
  const scaleMult = [1.0, 1.5, 2.0, 3.0, 4.0, 5.0][idx] || 1.0;

  const scaledXpLoss = Math.min(0.90, base.xpLossPercent * scaleMult);
  const scaledMultiplier = Math.max(0.30, base.multiplier - (scaleMult - 1) * 0.08);
  const scaledDuration = base.durationHours * (1 + (scaleMult - 1) * 0.25);

  return {
    type: penaltyType,
    xpLossPercent: scaledXpLoss,
    multiplier: scaledMultiplier,
    duration: Math.floor(scaledDuration * 60 * 60 * 1000), // ms
    message: getPenaltyMessage(rankKey, penaltyType),
  };
}

function getPenaltyMessage(rankKey, penaltyType) {
  const messages = {
    missedDaily: {
      E: 'You missed a daily quest. The System claims its toll.',
      D: 'You missed a daily quest. A Hunter does not skip training.',
      C: 'You missed a daily quest. The Elite have no excuses.',
      B: 'You missed a daily quest. A Knight\'s oath demands discipline.',
      A: 'You missed a daily quest. A General leads by example.',
      S: 'You missed a daily quest. A Monarch\'s failure shakes the empire.',
    },
    missedThreeDays: {
      E: 'You missed 3 days in a row. Your shadows are being devoured.',
      D: 'You missed 3 days in a row. The Hunter has gone soft.',
      C: 'You missed 3 days in a row. The Elite do not crumble.',
      B: 'You missed 3 days in a row. A Knight\'s armor rusts from neglect.',
      A: 'You missed 3 days in a row. A General who abandons the front line is executed.',
      S: 'You missed 3 days in a row. The Monarch\'s empire burns while you sleep.',
    },
    missedDungeon: {
      E: 'You missed a weekly dungeon. Shadow soldiers weakened.',
      D: 'You missed a weekly dungeon. The Hunter\'s prey escapes.',
      C: 'You missed a weekly dungeon. The Elite do not retreat from battle.',
      B: 'You missed a weekly dungeon. A Knight who skips the crusade is stripped of honor.',
      A: 'You missed a weekly dungeon. A General who ignores the war is overthrown.',
      S: 'You missed a weekly dungeon. The Monarch\'s dominion weakens. Arise or fall.',
    },
  };
  return messages[penaltyType]?.[rankKey] || messages[penaltyType]?.E;
}

// ─── REDEMPTION QUEST SCALING ───
// Higher ranks must do MORE to recover from failure.
export function getScaledRedemptionQuest(rankKey, pillar) {
  const idx = getRankIndex(rankKey);
  const tier = idx + 1;

  // E: 1 quest | D: 2 quests | C: all + 1 extra | B: all + 2 extra | A: all + 3 extra + 1 dungeon step | S: all + 4 extra + full dungeon
  const extraQuests = Math.max(0, tier - 2); // E=0, D=0, C=1, B=2, A=3, S=4
  const requiresDungeonStep = tier >= 4; // B and above
  const requiresFullDungeon = tier >= 6; // S only

  let description = `Complete ${extraQuests > 0 ? 'ALL daily quests' : 'one daily quest'} for ${pillar}`;
  if (extraQuests > 0) description += ` plus ${extraQuests} additional ${pillar} quest${extraQuests > 1 ? 's' : ''}`;
  if (requiresDungeonStep) description += ` and complete one dungeon step for ${pillar}`;
  if (requiresFullDungeon) description += ` and complete the ENTIRE weekly dungeon for ${pillar}`;
  description += ' to clear your debuff.';

  const baseXp = 50;
  const scaledXp = Math.floor(baseXp * (1 + (tier - 1) * 0.5));

  return {
    id: `redemption-${pillar}-${Date.now()}`,
    pillar,
    title: `Redemption: ${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Recovery (${rankKey}-Rank)`,
    xp: scaledXp,
    isRedemption: true,
    description,
    extraQuestsRequired: extraQuests,
    requiresDungeonStep,
    requiresFullDungeon,
  };
}

// ─── FLOW STATE SCALING ───
// Higher ranks must enter deeper flow to earn the bonus.
export function getScaledFlowConfig(rankKey) {
  const idx = getRankIndex(rankKey);

  // Config: [questsNeeded, windowMinutes, multiplier]
  const configs = [
    { quests: 3,  window: 60,  multiplier: 1.20 }, // E
    { quests: 4,  window: 50,  multiplier: 1.25 }, // D
    { quests: 5,  window: 45,  multiplier: 1.30 }, // C
    { quests: 6,  window: 40,  multiplier: 1.35 }, // B
    { quests: 7,  window: 35,  multiplier: 1.40 }, // A
    { quests: 8,  window: 30,  multiplier: 1.50 }, // S
  ];

  return configs[idx] || configs[0];
}

// ─── STREAK THRESHOLD SCALING (optional tightening) ───
export function getScaledStreakThresholds(rankKey) {
  const idx = getRankIndex(rankKey);
  // Higher ranks need LONGER streaks to earn the same bonus tier
  const baseDays = [7, 30, 90, 180, 365];
  const tightenFactor = [0, 0, 2, 5, 10, 15][idx] || 0; // E=0, S=15 extra days

  return {
    uncommon: baseDays[0] + tightenFactor,
    rare: baseDays[1] + tightenFactor,
    epic: baseDays[2] + tightenFactor,
    mythic: baseDays[3] + tightenFactor,
    legendary: baseDays[4] + tightenFactor,
  };
}

// ─── GOLD REWARD SCALING (already exists but export helper) ───
export function getScaledGoldReward(baseXp, rankKey) {
  const rankMultipliers = { E: 1, D: 1.5, C: 2.5, B: 4, A: 6, S: 10 };
  const m = rankMultipliers[rankKey] || 1;
  return Math.floor((baseXp / 5) * m);
}

// ─── CONVENIENCE: scale everything from overall level ───
export function getCurrentRankDifficulty(level) {
  const rank = getRankByLevel(level);
  return {
    rankKey: rank.key,
    penaltyScale: [1.0, 1.5, 2.0, 3.0, 4.0, 5.0][getRankIndex(rank.key)] || 1.0,
    flowConfig: getScaledFlowConfig(rank.key),
    redemptionConfig: getScaledRedemptionQuest(rank.key, 'deen'),
  };
}
