/** ============================================================
 *  EQUIPMENT SYSTEM — Gear Drops with Durability & Enchant
 *  ============================================================
 *  Three slots: Weapon, Armor, Ring.
 *  Weekly dungeon completion drops gear.
 *  Durability cracks on missed quests, repairs on completions.
 *  Enchant via long streaks.
 *  ============================================================ */

export const EQUIPMENT_SLOTS = ['weapon', 'armor', 'ring'];

export const EQUIPMENT_TEMPLATES = {
  // E-D rank gear (100 durability)
  'training-blade': {
    id: 'training-blade', name: 'Training Blade', slot: 'weapon', pillar: 'body', boost: 0.05, maxDurability: 100,
  },
  'recruit-vest': {
    id: 'recruit-vest', name: 'Recruit Vest', slot: 'armor', pillar: 'body', boost: 0.05, maxDurability: 100,
  },
  'apprentice-seal': {
    id: 'apprentice-seal', name: 'Apprentice Seal', slot: 'ring', pillar: 'all', boost: 0.03, maxDurability: 100,
  },
  'dhikr-strand': {
    id: 'dhikr-strand', name: 'Dhikr Strand', slot: 'ring', pillar: 'deen', boost: 0.05, maxDurability: 100,
  },
  'code-tablet': {
    id: 'code-tablet', name: 'Strategy Tablet', slot: 'weapon', pillar: 'money', boost: 0.05, maxDurability: 100,
  },
  // C-B rank gear (150 durability)
  'scimitar-of-truth': {
    id: 'scimitar-of-truth', name: 'Scimitar of Truth', slot: 'weapon', pillar: 'body', boost: 0.15, maxDurability: 150,
  },
  'battle-plate': {
    id: 'battle-plate', name: 'Battle Plate', slot: 'armor', pillar: 'body', boost: 0.15, maxDurability: 150,
  },
  'tactician-signet': {
    id: 'tactician-signet', name: 'Tactician Signet', slot: 'ring', pillar: 'all', boost: 0.10, maxDurability: 150,
  },
  'misbaha-of-focus': {
    id: 'misbaha-of-focus', name: 'Misbaha of Focus', slot: 'ring', pillar: 'deen', boost: 0.15, maxDurability: 150,
  },
  'ledger-of-barakah': {
    id: 'ledger-of-barakah', name: 'Ledger of Barakah', slot: 'weapon', pillar: 'money', boost: 0.15, maxDurability: 150,
  },
  // A-S rank gear (200 durability)
  'blade-of-tawhid': {
    id: 'blade-of-tawhid', name: "Blade of Tawhid", slot: 'weapon', pillar: 'all', boost: 0.30, maxDurability: 200,
  },
  'plate-of-dominion': {
    id: 'plate-of-dominion', name: 'Plate of Dominion', slot: 'armor', pillar: 'all', boost: 0.30, maxDurability: 200,
  },
  'seal-of-the-ummah': {
    id: 'seal-of-the-ummah', name: 'Seal of the Ummah', slot: 'ring', pillar: 'all', boost: 0.20, maxDurability: 200,
  },
  'codex-of-the-prophet': {
    id: 'codex-of-the-prophet', name: 'Codex of the Prophet ﷺ', slot: 'weapon', pillar: 'deen', boost: 0.30, maxDurability: 200,
  },
  'treasury-seal-of-the-khalifa': {
    id: 'treasury-seal-of-the-khalifa', name: 'Treasury Seal of the Khalifa', slot: 'ring', pillar: 'money', boost: 0.30, maxDurability: 200,
  },
};

function rankToGearTier(rankKey) {
  if (['E', 'D'].includes(rankKey)) return 100;
  if (['C', 'B'].includes(rankKey)) return 150;
  if (['A', 'S'].includes(rankKey)) return 200;
  return 100;
}

export function dropEquipment(rankKey, preferPillar = null) {
  const tier = rankToGearTier(rankKey);
  let pool = Object.values(EQUIPMENT_TEMPLATES).filter(e => e.maxDurability === tier);
  if (preferPillar) {
    const pillarPool = pool.filter(e => e.pillar === preferPillar || e.pillar === 'all');
    if (pillarPool.length > 0) pool = pillarPool;
  }
  if (pool.length === 0) return null;
  const item = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...item,
    durability: item.maxDurability,
    enchantLevel: 0,
    acquiredAt: new Date().toISOString(),
  };
}

export function applyEquipmentBonuses(xp, pillar, state) {
  let multiplier = 1.0;
  Object.values(state.equipment || {}).forEach(item => {
    if (!item || (item.durability || 0) <= 0) return;
    if (item.pillar === pillar || item.pillar === 'all') {
      const boost = item.boost + ((item.enchantLevel || 0) * 0.05);
      multiplier += boost;
    }
  });
  return Math.floor(xp * multiplier);
}

export function updateDurability(state, missedDaily = false, completedDaily = false) {
  const newEquipment = { ...state.equipment };
  Object.keys(newEquipment).forEach(slot => {
    const item = newEquipment[slot];
    if (!item) return;
    if (missedDaily) {
      item.durability = Math.max(0, (item.durability || 0) - 10);
    }
    if (completedDaily) {
      item.durability = Math.min(item.maxDurability || 100, (item.durability || 0) + 5);
    }
  });
  return { ...state, equipment: newEquipment };
}

export function checkEnchant(state, pillar) {
  const streak = state.pillars[pillar]?.streak || 0;
  if (streak >= 30 && streak % 30 === 0) {
    const newEquipment = { ...state.equipment };
    let enchantedAny = false;
    Object.keys(newEquipment).forEach(slot => {
      const item = newEquipment[slot];
      if (item && (item.pillar === pillar || item.pillar === 'all') && (item.durability || 0) > 0) {
        item.enchantLevel = (item.enchantLevel || 0) + 1;
        enchantedAny = true;
      }
    });
    if (!enchantedAny) return state;
    return {
      ...state,
      equipment: newEquipment,
      systemMessages: [
        ...(state.systemMessages || []),
        {
          type: 'reward',
          title: 'EQUIPMENT ENCHANTED',
          subtitle: `${pillar.toUpperCase()} Streak ${streak}`,
          message: `Your gear has been blessed by consistency. +5% boost per enchant level.`,
        },
      ],
    };
  }
  return state;
}

export function getTotalEquipmentBoost(state, pillar) {
  let total = 0;
  Object.values(state.equipment || {}).forEach(item => {
    if (!item || (item.durability || 0) <= 0) return;
    if (item.pillar === pillar || item.pillar === 'all') {
      total += item.boost + ((item.enchantLevel || 0) * 0.05);
    }
  });
  return total;
}

export function getEquipmentDurabilityPercent(item) {
  if (!item) return 0;
  return Math.round(((item.durability || 0) / (item.maxDurability || 100)) * 100);
}
