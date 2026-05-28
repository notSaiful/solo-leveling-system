/** ============================================================
 *  SHADOW EXTRACTION SYSTEM
 *  Habits become "Shadows" — automatic behaviors that require
 *  less willpower as you rank up. Inspired by Solo Leveling's
 *  Shadow Army where defeated enemies become loyal soldiers.
 *  ============================================================
 *  Core Concept: As you rank up, habits become "extracted" as
 *  Shadows. Each Shadow provides passive benefits and reduces
 *  the willpower cost of maintaining habits.
 *  ============================================================ */

export const SHADOW_GRADES = {
  NORMAL: { key: 'normal', name: 'Normal Shadow', color: 'text-gray-400', passiveBonus: 0.05 },
  ELITE: { key: 'elite', name: 'Elite Shadow', color: 'text-cyan-400', passiveBonus: 0.10 },
  KNIGHT: { key: 'knight', name: 'Knight Shadow', color: 'text-blue-400', passiveBonus: 0.15 },
  ELITE_KNIGHT: { key: 'eliteKnight', name: 'Elite Knight', color: 'text-purple-400', passiveBonus: 0.20 },
  GENERAL: { key: 'general', name: 'General Shadow', color: 'text-orange-400', passiveBonus: 0.30 },
  MONARCH: { key: 'monarch', name: 'Monarch Shadow', color: 'text-yellow-400', passiveBonus: 0.50 },
};

export const SHADOW_TEMPLATES = {
  // E-Rank Shadows (Basic habit automations)
  'basic-dhikr': {
    id: 'basic-dhikr',
    name: 'Shadow of Dhikr',
    description: 'Morning and evening adhkar become automatic. +5% Deen XP.',
    grade: 'NORMAL',
    pillar: 'deen',
    unlockLevel: 4,
    unlockRank: 'E',
    passiveBonus: 0.05,
    effect: 'deenXpBonus',
  },
  'basic-fitness': {
    id: 'basic-fitness',
    name: 'Shadow of Movement',
    description: 'Daily movement becomes automatic. +5% Body XP.',
    grade: 'NORMAL',
    pillar: 'body',
    unlockLevel: 5,
    unlockRank: 'E',
    passiveBonus: 0.05,
    effect: 'bodyXpBonus',
  },
  'basic-wealth': {
    id: 'basic-wealth',
    name: 'Shadow of Tracking',
    description: 'Expense tracking becomes automatic. +5% Money XP.',
    grade: 'NORMAL',
    pillar: 'money',
    unlockLevel: 6,
    unlockRank: 'E',
    passiveBonus: 0.05,
    effect: 'moneyXpBonus',
  },

  // D-Rank Shadows (Habit stacking)
  'devotee-path': {
    id: 'devotee-path',
    name: 'Shadow of the Devotee',
    description: 'Prayer habits stack automatically. +10% Deen XP.',
    grade: 'ELITE',
    pillar: 'deen',
    unlockLevel: 12,
    unlockRank: 'D',
    passiveBonus: 0.10,
    effect: 'deenXpBonus',
  },
  'warrior-body': {
    id: 'warrior-body',
    name: 'Shadow of the Warrior',
    description: 'Workout habits stack automatically. +10% Body XP.',
    grade: 'ELITE',
    pillar: 'body',
    unlockLevel: 14,
    unlockRank: 'D',
    passiveBonus: 0.10,
    effect: 'bodyXpBonus',
  },
  'merchant-mind': {
    id: 'merchant-mind',
    name: 'Shadow of the Merchant',
    description: 'Financial habits stack automatically. +10% Money XP.',
    grade: 'ELITE',
    pillar: 'money',
    unlockLevel: 15,
    unlockRank: 'D',
    passiveBonus: 0.10,
    effect: 'moneyXpBonus',
  },
  'elite-habit-stack': {
    id: 'elite-habit-stack',
    name: 'Shadow of Habit Stacking',
    description: 'One habit triggers the next automatically. +10% all XP.',
    grade: 'ELITE',
    pillar: 'all',
    unlockLevel: 20,
    unlockRank: 'D',
    passiveBonus: 0.10,
    effect: 'allXpBonus',
  },

  // C-Rank Shadows (Advanced automation)
  'knight-shadow': {
    id: 'knight-shadow',
    name: 'Shadow of the Knight',
    description: 'Your habits fight for you. +15% all XP. Reduces penalty severity.',
    grade: 'KNIGHT',
    pillar: 'all',
    unlockLevel: 33,
    unlockRank: 'C',
    passiveBonus: 0.15,
    effect: 'allXpBonus',
    special: 'penaltyReduction',
  },
  'knight-devotion': {
    id: 'knight-devotion',
    name: 'Shadow of Deep Devotion',
    description: 'Deep worship practices become automatic. +15% Deen XP.',
    grade: 'KNIGHT',
    pillar: 'deen',
    unlockLevel: 30,
    unlockRank: 'C',
    passiveBonus: 0.15,
    effect: 'deenXpBonus',
  },
  'knight-strength': {
    id: 'knight-strength',
    name: 'Shadow of Deep Strength',
    description: 'Advanced training becomes automatic. +15% Body XP.',
    grade: 'KNIGHT',
    pillar: 'body',
    unlockLevel: 35,
    unlockRank: 'C',
    passiveBonus: 0.15,
    effect: 'bodyXpBonus',
  },

  // B-Rank Shadows (Leadership)
  'general-shadow': {
    id: 'general-shadow',
    name: 'Shadow General',
    description: 'Your habits command other habits. +20% all XP. Missed days recover faster.',
    grade: 'ELITE_KNIGHT',
    pillar: 'all',
    unlockLevel: 56,
    unlockRank: 'B',
    passiveBonus: 0.20,
    effect: 'allXpBonus',
    special: 'fasterRecovery',
  },
  'templar-oath': {
    id: 'templar-oath',
    name: 'Shadow of the Templar',
    description: 'Discipline becomes your nature. +20% all XP. Immune to minor penalties.',
    grade: 'ELITE_KNIGHT',
    pillar: 'all',
    unlockLevel: 50,
    unlockRank: 'B',
    passiveBonus: 0.20,
    effect: 'allXpBonus',
    special: 'penaltyImmunityMinor',
  },

  // A-Rank Shadows (Mastery)
  'monarch-shadow': {
    id: 'monarch-shadow',
    name: 'Shadow of the Monarch',
    description: 'You are the System. +30% all XP. Complete penalty immunity.',
    grade: 'GENERAL',
    pillar: 'all',
    unlockLevel: 76,
    unlockRank: 'A',
    passiveBonus: 0.30,
    effect: 'allXpBonus',
    special: 'penaltyImmunity',
  },

  // S-Rank Shadows (Transcendence)
  'monarch-army': {
    id: 'monarch-army',
    name: "The Monarch's Army",
    description: 'Infinite shadows. +50% all XP. Your habits are now your legacy.',
    grade: 'MONARCH',
    pillar: 'all',
    unlockLevel: 100,
    unlockRank: 'S',
    passiveBonus: 0.50,
    effect: 'allXpBonus',
    special: 'legacyMode',
  },
};

// ─── SHADOW MANAGEMENT ───
export function getUnlockedShadows(state) {
  const unlocked = [];
  const rank = state.user.currentRank;
  const level = state.user.overallLevel;

  Object.values(SHADOW_TEMPLATES).forEach(shadow => {
    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
    const userRankIndex = rankOrder.indexOf(rank);
    const requiredRankIndex = rankOrder.indexOf(shadow.unlockRank);

    if (userRankIndex > requiredRankIndex || (userRankIndex === requiredRankIndex && level >= shadow.unlockLevel)) {
      // Check if already extracted
      const extracted = state.shadows?.some(s => s.id === shadow.id);
      unlocked.push({ ...shadow, extracted });
    }
  });

  return unlocked;
}

export function extractShadow(state, shadowId) {
  const shadow = SHADOW_TEMPLATES[shadowId];
  if (!shadow) return state;

  const alreadyExtracted = state.shadows?.some(s => s.id === shadowId);
  if (alreadyExtracted) return state;

  const newShadows = [...(state.shadows || []), { ...shadow, extractedAt: new Date().toISOString() }];

  return {
    ...state,
    shadows: newShadows,
    systemMessages: [
      ...state.systemMessages,
      {
        type: 'shadow',
        title: 'SHADOW EXTRACTED',
        subtitle: shadow.name,
        message: `"Arise." ${shadow.description}`,
      },
    ],
  };
}

// ─── PASSIVE BONUS CALCULATION ───
export function getShadowBonuses(state) {
  const shadows = state.shadows || [];
  const bonuses = {
    deenXp: 1.0,
    bodyXp: 1.0,
    moneyXp: 1.0,
    allXp: 1.0,
    penaltyReduction: 0,
    fasterRecovery: false,
    penaltyImmunityMinor: false,
    penaltyImmunity: false,
    legacyMode: false,
  };

  shadows.forEach(shadow => {
    if (shadow.effect === 'deenXpBonus') bonuses.deenXp += shadow.passiveBonus;
    if (shadow.effect === 'bodyXpBonus') bonuses.bodyXp += shadow.passiveBonus;
    if (shadow.effect === 'moneyXpBonus') bonuses.moneyXp += shadow.passiveBonus;
    if (shadow.effect === 'allXpBonus') bonuses.allXp += shadow.passiveBonus;
    if (shadow.special === 'penaltyReduction') bonuses.penaltyReduction += 0.5;
    if (shadow.special === 'fasterRecovery') bonuses.fasterRecovery = true;
    if (shadow.special === 'penaltyImmunityMinor') bonuses.penaltyImmunityMinor = true;
    if (shadow.special === 'penaltyImmunity') bonuses.penaltyImmunity = true;
    if (shadow.special === 'legacyMode') bonuses.legacyMode = true;
  });

  return bonuses;
}

export function applyShadowBonuses(xp, pillar, state) {
  const bonuses = getShadowBonuses(state);
  let multiplier = bonuses.allXp;
  if (pillar === 'deen') multiplier *= bonuses.deenXp;
  if (pillar === 'body') multiplier *= bonuses.bodyXp;
  if (pillar === 'money') multiplier *= bonuses.moneyXp;
  return Math.floor(xp * multiplier);
}

// ─── SHADOW UI HELPERS ───
export function getShadowGradeColor(gradeKey) {
  return SHADOW_GRADES[gradeKey]?.color || 'text-gray-400';
}

export function getShadowGradeName(gradeKey) {
  return SHADOW_GRADES[gradeKey]?.name || 'Unknown';
}

export function getExtractedShadowsByPillar(state, pillar) {
  return (state.shadows || []).filter(s => s.pillar === pillar || s.pillar === 'all');
}

export function getTotalShadowPower(state) {
  const shadows = state.shadows || [];
  return shadows.reduce((sum, s) => sum + (s.passiveBonus || 0), 0);
}
