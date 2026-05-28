// Stat system inspired by Solo Leveling's 6 attributes
export const STAT_NAMES = {
  strength: { name: 'Strength', icon: '💪', description: 'Physical power. Boosts Body quest XP.', color: '#f44336' },
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
    return { name: 'Warrior Build', icon: '⚔️', description: 'Dominant in physical power' };
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
