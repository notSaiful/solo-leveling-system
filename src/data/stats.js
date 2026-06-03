// Stat system inspired by Solo Leveling's 6 attributes
export const STAT_NAMES = {
  strength: { name: 'Strength', icon: '💪', description: 'Physical endurance. Boosts Body quest XP.', color: '#f44336' },
  agility: { name: 'Agility', icon: '⚡', description: 'Speed and consistency. Enables Flow State faster.', color: '#2196F3' },
  intelligence: { name: 'Intelligence', icon: '🧠', description: 'Knowledge depth. Boosts Deen quest XP.', color: '#9C27B0' },
  sense: { name: 'Sense', icon: '👁️', description: 'Intuition and awareness. Boosts Money quest XP.', color: '#FF9800' },
  health: { name: 'Health', icon: '❤️', description: 'Wellness and stamina. Reduces fatigue effects.', color: '#E91E63' },
  mana: { name: 'Mana', icon: '✨', description: 'Spiritual energy. Reduces debuff duration.', color: '#00BCD4' },
};

export const STAT_DEFAULTS = {
  strength: 10,
  agility: 10,
  intelligence: 10,
  sense: 10,
  health: 10,
  mana: 10,
};

// How stats affect gameplay
export function applyStatModifiers(baseXp, stats, pillar) {
  let multiplier = 1.0;

  switch (pillar) {
    case 'body':
      multiplier += (stats.strength - 10) * 0.02; // +2% per Strength point above 10
      break;
    case 'deen':
      multiplier += (stats.intelligence - 10) * 0.02; // +2% per Intelligence point above 10
      break;
    case 'money':
      multiplier += (stats.sense - 10) * 0.02; // +2% per Sense point above 10
      break;
  }

  // Agility gives small boost to all
  multiplier += (stats.agility - 10) * 0.005;

  return Math.floor(baseXp * multiplier);
}

// Health reduces XP loss from debuffs
export function getHealthDebuffReduction(stats) {
  const healthBonus = Math.max(0, (stats.health - 10) * 0.02);
  return Math.min(0.5, healthBonus); // Max 50% reduction
}

// Mana reduces debuff duration
export function getManaDebuffReduction(stats) {
  const manaBonus = Math.max(0, (stats.mana - 10) * 0.02);
  return Math.min(0.5, manaBonus); // Max 50% reduction
}

// Build detection based on highest stats
export function getCharacterBuild(stats) {
  const entries = Object.entries(stats);
  const max = Math.max(...entries.map(([_, v]) => v));
  const topStats = entries.filter(([_, v]) => v >= max - 5).map(([k]) => k);

  if (topStats.includes('strength') && topStats.includes('health')) {
    return { name: 'Warrior Build', icon: '⚔️', description: 'Dominant in physical endurance' };
  }
  if (topStats.includes('intelligence') && topStats.includes('mana')) {
    return { name: 'Scholar Build', icon: '📜', description: 'Dominant in spiritual knowledge' };
  }
  if (topStats.includes('sense') && topStats.includes('agility')) {
    return { name: 'Merchant Build', icon: '💰', description: 'Dominant in wealth and speed' };
  }
  if (entries.every(([_, v]) => v >= 15 && v <= 25)) {
    return { name: 'Balanced Build', icon: '⚖️', description: 'No weakness, no overwhelming strength' };
  }
  return { name: 'Hybrid Build', icon: '🔀', description: 'Mixed specialization' };
}

/**
 * Auto-assign stat points based on which pillar just leveled up.
 * The SYSTEM decides. The user does NOT choose.
 */
export function autoAssignStatPoints(stats, pillar, pointsToAssign) {
  const newStats = { ...stats };
  let assignments = [];

  // Each pillar maps to two primary stats
  const pillarMap = {
    body:  { primary: 'strength', secondary: 'agility', reason: 'Physical power and combat readiness' },
    deen:  { primary: 'intelligence', secondary: 'mana', reason: 'Spiritual knowledge and discipline energy' },
    money: { primary: 'sense', secondary: 'agility', reason: 'Intuition and execution speed' },
  };

  const mapping = pillarMap[pillar];
  if (!mapping) return { stats: newStats, assignments: [] };

  // Distribute 60% to primary, 40% to secondary (rounded)
  const primaryPoints = Math.ceil(pointsToAssign * 0.6);
  const secondaryPoints = pointsToAssign - primaryPoints;

  newStats[mapping.primary] = (newStats[mapping.primary] || 10) + primaryPoints;
  newStats[mapping.secondary] = (newStats[mapping.secondary] || 10) + secondaryPoints;

  assignments.push({ stat: mapping.primary, points: primaryPoints });
  assignments.push({ stat: mapping.secondary, points: secondaryPoints });

  return { stats: newStats, assignments };
}

/**
 * Analyze recent quest history to determine dominant pillar for auto-stat allocation.
 */
export function analyzePillarFocus(history, days = 7) {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  const recent = (history || []).filter(h => h.completed && new Date(h.date).getTime() > cutoff);

  const counts = { deen: 0, body: 0, money: 0 };
  recent.forEach(h => {
    if (counts[h.pillar] !== undefined) counts[h.pillar]++;
  });

  const total = counts.deen + counts.body + counts.money;
  if (total === 0) return { dominant: 'deen', counts, total };

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return { dominant, counts, total };
}
