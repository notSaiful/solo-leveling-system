/** ============================================================
 *  EQUIPMENT SYSTEM — Full Tier Progression to Level 999
 *  ============================================================
 *  Six tiers: Novice → Adept → Elite → Monarch → Sovereign → Divine
 *  45+ unique items across all pillars and slots.
 *  Quality system: Common → Rare → Epic → Legendary.
 *  Enchantment cap: +10 levels (+50% boost).
 *  Set bonus: wearing 3 matching-tier pieces adds extra boost.
 *  ============================================================ */

import { getPillarDisplayKey } from '../utils/pillarDisplay';

export const EQUIPMENT_SLOTS = ['weapon', 'armor', 'ring'];

export const EQUIPMENT_TIERS = {
  100: { name: 'Novice',    label: 'E-D',    color: 'text-gray-400',   border: 'border-gray-500/30' },
  150: { name: 'Adept',     label: 'C-B',    color: 'text-cyan-400',   border: 'border-cyan-500/30' },
  200: { name: 'Elite',     label: 'A',      color: 'text-purple-400', border: 'border-purple-500/30' },
  300: { name: 'Monarch',   label: 'S-I',    color: 'text-orange-400', border: 'border-orange-500/30' },
  450: { name: 'Sovereign', label: 'S-II',   color: 'text-red-400',    border: 'border-red-500/30' },
  600: { name: 'Divine',    label: 'S-III',  color: 'text-yellow-400', border: 'border-yellow-500/30' },
};

export const EQUIPMENT_TEMPLATES = {
  // ─── TIER 1: Novice (E-D, lv 0-25) — 100 durability, +5%–8% ───
  'trail-staff':        { id: 'trail-staff',        name: 'Trail Staff',        slot: 'weapon', pillar: 'body',  boost: 0.05, maxDurability: 100 },
  'wanderer-cloak':     { id: 'wanderer-cloak',     name: 'Wanderer Cloak',     slot: 'armor',  pillar: 'body',  boost: 0.05, maxDurability: 100 },
  'apprentice-seal':    { id: 'apprentice-seal',    name: 'Apprentice Seal',    slot: 'ring',   pillar: 'all',   boost: 0.03, maxDurability: 100 },
  'dhikr-strand':       { id: 'dhikr-strand',       name: 'Dhikr Strand',       slot: 'ring',   pillar: 'deen',  boost: 0.05, maxDurability: 100 },
  'code-tablet':        { id: 'code-tablet',        name: 'Strategy Tablet',      slot: 'weapon', pillar: 'money', boost: 0.05, maxDurability: 100 },
  'prayer-beads':       { id: 'prayer-beads',       name: 'Prayer Beads',       slot: 'ring',   pillar: 'deen',  boost: 0.05, maxDurability: 100 },
  'coin-pouch':         { id: 'coin-pouch',         name: 'Coin Pouch',         slot: 'armor',  pillar: 'money', boost: 0.05, maxDurability: 100 },
  'runner-blade':       { id: 'runner-blade',       name: 'Runner Blade',       slot: 'weapon', pillar: 'body',  boost: 0.08, maxDurability: 100 },

  // ─── TIER 2: Adept (C-B, lv 26-70) — 150 durability, +15%–18% ───
  'compass-of-truth':   { id: 'compass-of-truth',   name: 'Compass of Truth',   slot: 'weapon', pillar: 'body',  boost: 0.15, maxDurability: 150 },
  'expedition-gear':    { id: 'expedition-gear',    name: 'Expedition Gear',    slot: 'armor',  pillar: 'body',  boost: 0.15, maxDurability: 150 },
  'tactician-signet':   { id: 'tactician-signet',   name: 'Tactician Signet',   slot: 'ring',   pillar: 'all',   boost: 0.10, maxDurability: 150 },
  'misbaha-of-focus':   { id: 'misbaha-of-focus',   name: 'Misbaha of Focus',   slot: 'ring',   pillar: 'deen',  boost: 0.15, maxDurability: 150 },
  'ledger-of-barakah':  { id: 'ledger-of-barakah',  name: 'Ledger of Barakah',  slot: 'weapon', pillar: 'money', boost: 0.15, maxDurability: 150 },
  'shield-of-fajr':     { id: 'shield-of-fajr',     name: 'Shield of Fajr',     slot: 'armor',  pillar: 'deen',  boost: 0.15, maxDurability: 150 },
  'scale-of-rizq':      { id: 'scale-of-rizq',      name: 'Scale of Rizq',      slot: 'weapon', pillar: 'money', boost: 0.18, maxDurability: 150 },
  'sprint-boots':       { id: 'sprint-boots',       name: 'Sprint Boots',       slot: 'armor',  pillar: 'body',  boost: 0.18, maxDurability: 150 },

  // ─── TIER 3: Elite (A, lv 71-99) — 200 durability, +30%–35% ───
  'blade-of-tawhid':    { id: 'blade-of-tawhid',    name: 'Blade of Tawhid',    slot: 'weapon', pillar: 'all',   boost: 0.30, maxDurability: 200 },
  'plate-of-dominion':  { id: 'plate-of-dominion',  name: 'Plate of Dominion',  slot: 'armor',  pillar: 'all',   boost: 0.30, maxDurability: 200 },
  'seal-of-the-ummah':  { id: 'seal-of-the-ummah',  name: 'Seal of the Ummah',  slot: 'ring',   pillar: 'all',   boost: 0.20, maxDurability: 200 },
  'codex-of-the-prophet': { id: 'codex-of-the-prophet', name: 'Codex of the Prophet ﷺ', slot: 'weapon', pillar: 'deen', boost: 0.30, maxDurability: 200 },
  'treasury-seal-of-the-khalifa': { id: 'treasury-seal-of-the-khalifa', name: 'Treasury Seal of the Khalifa', slot: 'ring', pillar: 'money', boost: 0.30, maxDurability: 200 },
  'armor-of-salah':     { id: 'armor-of-salah',     name: 'Armor of Salah',     slot: 'armor',  pillar: 'deen',  boost: 0.30, maxDurability: 200 },
  'ledger-of-zakat':    { id: 'ledger-of-zakat',    name: 'Ledger of Zakat',    slot: 'weapon', pillar: 'money', boost: 0.35, maxDurability: 200 },
  'sandals-of-tahajjud':{ id: 'sandals-of-tahajjud',name: 'Sandals of Tahajjud',slot: 'armor',  pillar: 'deen',  boost: 0.35, maxDurability: 200 },

  // ─── TIER 4: Monarch (S-I, lv 100-299) — 300 durability, +50%–55% ───
  'sword-of-the-khalifa':     { id: 'sword-of-the-khalifa',     name: 'Sword of the Khalifa',     slot: 'weapon', pillar: 'all',   boost: 0.50, maxDurability: 300 },
  'crown-of-command':         { id: 'crown-of-command',         name: 'Crown of Command',         slot: 'armor',  pillar: 'all',   boost: 0.50, maxDurability: 300 },
  'signet-of-the-monarch':    { id: 'signet-of-the-monarch',    name: 'Signet of the Monarch',    slot: 'ring',   pillar: 'all',   boost: 0.40, maxDurability: 300 },
  'spear-of-ummah-defense':   { id: 'spear-of-ummah-defense',   name: 'Spear of Ummah Defense', slot: 'weapon', pillar: 'deen',  boost: 0.55, maxDurability: 300 },
  'breastplate-of-istiqamah': { id: 'breastplate-of-istiqamah', name: 'Breastplate of Istiqamah',slot: 'armor',  pillar: 'deen',  boost: 0.55, maxDurability: 300 },
  'ring-of-barakah-flow':     { id: 'ring-of-barakah-flow',     name: 'Ring of Barakah Flow',   slot: 'ring',   pillar: 'money', boost: 0.55, maxDurability: 300 },
  'war-axe-of-fitness':       { id: 'war-axe-of-fitness',       name: 'War Axe of Fitness',       slot: 'weapon', pillar: 'body',  boost: 0.55, maxDurability: 300 },
  'cuirass-of-discipline':    { id: 'cuirass-of-discipline',    name: 'Cuirass of Discipline',  slot: 'armor',  pillar: 'body',  boost: 0.55, maxDurability: 300 },

  // ─── TIER 5: Sovereign (S-II, lv 300-599) — 450 durability, +75%–80% ───
  'throneblade-of-divinity':  { id: 'throneblade-of-divinity',  name: 'Throneblade of Divinity',  slot: 'weapon', pillar: 'all',   boost: 0.75, maxDurability: 450 },
  'mantle-of-the-sovereign':  { id: 'mantle-of-the-sovereign',  name: 'Mantle of the Sovereign',  slot: 'armor',  pillar: 'all',   boost: 0.75, maxDurability: 450 },
  'orb-of-absolute-will':     { id: 'orb-of-absolute-will',     name: 'Orb of Absolute Will',     slot: 'ring',   pillar: 'all',   boost: 0.60, maxDurability: 450 },
  'lance-of-shahada':         { id: 'lance-of-shahada',         name: 'Lance of Shahada',         slot: 'weapon', pillar: 'deen',  boost: 0.80, maxDurability: 450 },
  'shield-of-divine-protection':{ id: 'shield-of-divine-protection', name: 'Shield of Divine Protection', slot: 'armor', pillar: 'deen', boost: 0.80, maxDurability: 450 },
  'crown-of-endless-rizq':    { id: 'crown-of-endless-rizq',    name: 'Crown of Endless Rizq',    slot: 'ring',   pillar: 'money', boost: 0.80, maxDurability: 450 },
  'fist-of-iron-discipline':  { id: 'fist-of-iron-discipline',  name: 'Fist of Iron Discipline',  slot: 'weapon', pillar: 'body',  boost: 0.80, maxDurability: 450 },
  'shell-of-unbreakable-health':{ id: 'shell-of-unbreakable-health', name: 'Shell of Unbreakable Health', slot: 'armor', pillar: 'body', boost: 0.80, maxDurability: 450 },

  // ─── TIER 6: Divine (S-III, lv 600-999) — 600 durability, +100%–110% ───
  'ashrafi-of-creation':      { id: 'ashrafi-of-creation',      name: 'Ashrafi of Creation',      slot: 'weapon', pillar: 'all',   boost: 1.00, maxDurability: 600 },
  'kursi-armor-of-the-throne':{ id: 'kursi-armor-of-the-throne',name: 'Kursi Armor of the Throne', slot: 'armor',  pillar: 'all',   boost: 1.00, maxDurability: 600 },
  'nur-ring-of-guidance':     { id: 'nur-ring-of-guidance',     name: 'Nur Ring of Guidance',     slot: 'ring',   pillar: 'all',   boost: 0.90, maxDurability: 600 },
  'sword-of-the-last-prophet':{ id: 'sword-of-the-last-prophet',name: 'Sword of the Last Prophet',slot: 'weapon', pillar: 'deen',  boost: 1.10, maxDurability: 600 },
  'throne-vestments-of-jannah':{ id: 'throne-vestments-of-jannah',name: 'Throne Vestments of Jannah', slot: 'armor', pillar: 'deen', boost: 1.10, maxDurability: 600 },
  'seal-of-infinite-wealth':  { id: 'seal-of-infinite-wealth',  name: 'Seal of Infinite Wealth',  slot: 'ring',   pillar: 'money', boost: 1.10, maxDurability: 600 },
  'fist-of-divine-strength':  { id: 'fist-of-divine-strength',  name: 'Fist of Divine Strength',  slot: 'weapon', pillar: 'body',  boost: 1.10, maxDurability: 600 },
  'immortal-frame-of-the-khalifa':{ id: 'immortal-frame-of-the-khalifa', name: 'Immortal Frame of the Khalifa', slot: 'armor', pillar: 'body', boost: 1.10, maxDurability: 600 },
};

/** Map overall level to gear tier (not just rank key) */
export function levelToGearTier(level) {
  if (level <= 25)  return 100;  // E-D: Novice
  if (level <= 70)  return 150;  // C-B: Adept
  if (level <= 99)  return 200;  // A: Elite
  if (level <= 299) return 300;  // S-I: Monarch
  if (level <= 599) return 450;  // S-II: Sovereign
  return 600;                     // S-III: Divine
}

/** Quality multipliers for drop variance */
const QUALITY_MODS = {
  Common:    { label: 'Common',    boostMult: 1.00, color: 'text-gray-400',  chance: 0.55 },
  Rare:      { label: 'Rare',      boostMult: 1.15, color: 'text-cyan-400',   chance: 0.30 },
  Epic:      { label: 'Epic',      boostMult: 1.30, color: 'text-purple-400', chance: 0.12 },
  Legendary: { label: 'Legendary', boostMult: 1.50, color: 'text-yellow-400', chance: 0.03 },
};

function rollQuality() {
  const roll = Math.random();
  let cumulative = 0;
  for (const [key, data] of Object.entries(QUALITY_MODS)) {
    cumulative += data.chance;
    if (roll <= cumulative) return key;
  }
  return 'Common';
}

/** Enchant cap per tier */
const ENCHANT_CAP = 10;

/** Drop an equipment piece based on overall level + optional pillar preference */
export function dropEquipment(levelOrRank, preferPillar = null) {
  const tier = typeof levelOrRank === 'number' ? levelToGearTier(levelOrRank) : levelToGearTier(0);
  let pool = Object.values(EQUIPMENT_TEMPLATES).filter(e => e.maxDurability === tier);
  if (preferPillar) {
    const pillarPool = pool.filter(e => e.pillar === preferPillar || e.pillar === 'all');
    if (pillarPool.length > 0) pool = pillarPool;
  }
  if (pool.length === 0) return null;

  const template = pool[Math.floor(Math.random() * pool.length)];
  const quality = rollQuality();
  const qualityData = QUALITY_MODS[quality];

  return {
    ...template,
    boost: Math.round(template.boost * qualityData.boostMult * 100) / 100,
    durability: template.maxDurability,
    enchantLevel: 0,
    quality,
    acquiredAt: new Date().toISOString(),
  };
}

/** ─── BONUS APPLICATION ─── */

export function applyEquipmentBonuses(xp, pillar, state) {
  let multiplier = 1.0;
  Object.values(state.equipment || {}).forEach(item => {
    if (!item || (item.durability || 0) <= 0) return;
    if (item.pillar === pillar || item.pillar === 'all') {
      const boost = item.boost + ((Math.min(item.enchantLevel || 0, ENCHANT_CAP)) * 0.05);
      multiplier += boost;
    }
  });
  // Set bonus: 3 matching-tier pieces = +10% all XP
  if (hasSetBonus(state)) {
    multiplier += 0.10;
  }
  return Math.floor(xp * multiplier);
}

/** Check if all 3 equipped items share the same maxDurability tier */
function hasSetBonus(state) {
  const items = Object.values(state.equipment || {}).filter(Boolean);
  if (items.length < 3) return false;
  const firstTier = items[0].maxDurability;
  return items.every(i => i.maxDurability === firstTier && (i.durability || 0) > 0);
}

export function getSetBonusStatus(state) {
  const items = Object.values(state.equipment || {}).filter(Boolean);
  if (items.length < 3) return { active: false, label: null };
  const tiers = items.map(i => i.maxDurability);
  const allSame = tiers.every(t => t === tiers[0]);
  const allAlive = items.every(i => (i.durability || 0) > 0);
  if (allSame && allAlive) {
    const tierInfo = EQUIPMENT_TIERS[tiers[0]];
    return { active: true, label: tierInfo ? `${tierInfo.name} Set` : 'Full Set' };
  }
  return { active: false, label: null };
}

/** ─── DURABILITY ─── */

export function updateDurability(state, missedDaily = false, completedDaily = false) {
  const newEquipment = { ...state.equipment };
  let changed = false;
  Object.keys(newEquipment).forEach(slot => {
    const item = newEquipment[slot];
    if (!item) return;
    let durability = item.durability || 0;
    if (missedDaily) {
      durability = Math.max(0, durability - 10);
    }
    if (completedDaily) {
      durability = Math.min(item.maxDurability || 100, durability + 5);
    }
    if (durability !== item.durability) {
      newEquipment[slot] = { ...item, durability };
      changed = true;
    }
  });
  return changed ? { ...state, equipment: newEquipment } : state;
}

/** ─── ENCHANT (capped at +10) ─── */

export function checkEnchant(state, pillar) {
  const streak = state.pillars[pillar]?.streak || 0;
  if (streak >= 30 && streak % 30 === 0) {
    const newEquipment = { ...state.equipment };
    let enchantedAny = false;
    Object.keys(newEquipment).forEach(slot => {
      const item = newEquipment[slot];
      if (item && (item.pillar === pillar || item.pillar === 'all') && (item.durability || 0) > 0) {
        const newLevel = Math.min(ENCHANT_CAP, (item.enchantLevel || 0) + 1);
        if (newLevel !== item.enchantLevel) {
          newEquipment[slot] = { ...item, enchantLevel: newLevel };
          enchantedAny = true;
        }
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
          subtitle: `${getPillarDisplayKey(pillar)} Streak ${streak}`,
          message: `Your gear has been blessed by consistency. +5% boost per enchant level (cap: +${ENCHANT_CAP}).`,
        },
      ],
    };
  }
  return state;
}

/** ─── HELPERS ─── */

export function getTotalEquipmentBoost(state, pillar) {
  let total = 0;
  Object.values(state.equipment || {}).forEach(item => {
    if (!item || (item.durability || 0) <= 0) return;
    if (item.pillar === pillar || item.pillar === 'all') {
      total += item.boost + ((Math.min(item.enchantLevel || 0, ENCHANT_CAP)) * 0.05);
    }
  });
  if (hasSetBonus(state)) total += 0.10;
  return total;
}

export function getEquipmentDurabilityPercent(item) {
  if (!item) return 0;
  return Math.round(((item.durability || 0) / (item.maxDurability || 100)) * 100);
}

export function getItemTierLabel(item) {
  if (!item) return '';
  const tier = EQUIPMENT_TIERS[item.maxDurability];
  const quality = item.quality || 'Common';
  const qData = QUALITY_MODS[quality];
  return tier ? `${quality} ${tier.name}` : quality;
}

export function getItemColorClass(item) {
  if (!item) return '';
  const quality = item.quality || 'Common';
  return QUALITY_MODS[quality]?.color || 'text-gray-400';
}

/** ─── ENDGAME: AWAKENING (spend gold to upgrade boost beyond drop limits) ─── */

export function canAwaken(item, gold) {
  if (!item || item.maxDurability < 300) return false; // Only S-rank+ gear can awaken
  if (item.awakened >= 5) return false; // Max 5 awakenings
  const cost = (item.awakened || 0) * 500 + 1000;
  return gold >= cost;
}

export function awakenItem(state, slot) {
  const item = state.equipment?.[slot];
  if (!item || !canAwaken(item, state.gold || 0)) return state;
  const cost = (item.awakened || 0) * 500 + 1000;
  const newAwakened = (item.awakened || 0) + 1;
  const boostIncrease = item.maxDurability >= 600 ? 0.10 : 0.05;
  return {
    ...state,
    gold: (state.gold || 0) - cost,
    equipment: {
      ...state.equipment,
      [slot]: {
        ...item,
        boost: Math.round((item.boost + boostIncrease) * 100) / 100,
        awakened: newAwakened,
      },
    },
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'reward',
        title: 'GEAR AWAKENED',
        subtitle: `${item.name}`,
        message: `Awakening ${newAwakened}/5 complete. Boost increased by +${Math.round(boostIncrease * 100)}%. Cost: ${cost} gold.`,
      },
    ],
  };
}
