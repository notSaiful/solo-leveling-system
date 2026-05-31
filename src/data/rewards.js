/** ============================================================
 *  SYSTEM STORE — Rank-Scaling Reward Catalog
 *  ============================================================
 *  Philosophy: Rewards must feel aspirational. You should look at
 *  S-Rank items at E-Rank and think "I will become strong enough
 *  to earn that." Each rank unlocks a new tier of rewards.
 *  ============================================================ */

export const REWARD_RARITY = {
  common:     { key: 'common',     label: 'Common',     color: 'text-gray-400',  bg: 'bg-gray-900/30',     border: 'border-gray-700/30' },
  uncommon:   { key: 'uncommon',   label: 'Uncommon',   color: 'text-cyan-400',  bg: 'bg-cyan-900/20',     border: 'border-cyan-700/30' },
  rare:       { key: 'rare',       label: 'Rare',       color: 'text-blue-400',  bg: 'bg-blue-900/20',     border: 'border-blue-700/30' },
  epic:       { key: 'epic',       label: 'Epic',       color: 'text-purple-400',bg: 'bg-purple-900/20',   border: 'border-purple-700/30' },
  legendary:  { key: 'legendary',  label: 'Legendary',  color: 'text-orange-400',bg: 'bg-orange-900/20',   border: 'border-orange-700/30' },
  mythic:     { key: 'mythic',     label: 'Mythic',     color: 'text-yellow-400',bg: 'bg-yellow-900/20',   border: 'border-yellow-700/30' },
};

// Rank order for unlock checks
const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S'];

export function isItemUnlocked(itemRank, userRank) {
  const itemIdx = RANK_ORDER.indexOf(itemRank);
  const userIdx = RANK_ORDER.indexOf(userRank);
  return userIdx >= itemIdx;
}

export function getStoreItemsForRank(userRank) {
  return REWARD_ITEMS.map(item => ({
    ...item,
    unlocked: isItemUnlocked(item.unlockRank, userRank),
  }));
}

export function getFeaturedItems(userRank) {
  // Featured = items at your current rank tier (most relevant)
  const userIdx = RANK_ORDER.indexOf(userRank);
  const featuredRanks = RANK_ORDER.slice(Math.max(0, userIdx - 1), userIdx + 1);
  return REWARD_ITEMS
    .filter(item => featuredRanks.includes(item.unlockRank))
    .map(item => ({ ...item, unlocked: isItemUnlocked(item.unlockRank, userRank) }));
}

export function getNextUnlockPreview(userRank) {
  const userIdx = RANK_ORDER.indexOf(userRank);
  const nextRank = RANK_ORDER[userIdx + 1];
  if (!nextRank) return null;
  const nextItems = REWARD_ITEMS.filter(item => item.unlockRank === nextRank);
  if (nextItems.length === 0) return null;
  return { rank: nextRank, items: nextItems };
}

export const REWARD_ITEMS = [
  // ═══════════════════════════════════════
  // E-RANK: Common (Beginner rewards)
  // ═══════════════════════════════════════
  {
    id: 'reward-coffee', name: 'Premium Coffee', cost: 300, category: 'food',
    description: 'Treat yourself to a nice coffee after a hard grind.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-book', name: 'Islamic Book', cost: 500, category: 'education',
    description: 'Purchase a book on fiqh, seerah, or tafsir.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-rest', name: 'Rest Day', cost: 800, category: 'wellness',
    description: 'Skip non-mandatory quests for one day. Recharge.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-sadaqah-small', name: 'Small Sadaqah', cost: 1000, category: 'charity',
    description: 'Give 500 rupees in sadaqah beyond your normal amount.',
    unlockRank: 'E', rarity: 'uncommon',
  },
  {
    id: 'reward-tea-reset', name: 'Tea Reset', cost: 200, category: 'food',
    description: 'A quiet chai break after finishing your core obligations.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-prayer-mat', name: 'Prayer Mat Upgrade', cost: 700, category: 'spiritual',
    description: 'Buy or set aside funds for a clean, focused prayer space.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-journal', name: 'Discipline Journal', cost: 650, category: 'productivity',
    description: 'A notebook dedicated to tracking habits, duas, and failures.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-family-treat', name: 'Family Treat', cost: 900, category: 'family',
    description: 'Bring something halal home for the family. Strength serves.',
    unlockRank: 'E', rarity: 'uncommon',
  },
  {
    id: 'reward-mosque-donation', name: 'Mosque Donation', cost: 1100, category: 'charity',
    description: 'Support your local masjid with a small extra contribution.',
    unlockRank: 'E', rarity: 'uncommon',
  },
  {
    id: 'reward-focus-tools', name: 'Focus Tools', cost: 750, category: 'productivity',
    description: 'Buy small tools that remove friction: timer, notebook, pen, or planner.',
    unlockRank: 'E', rarity: 'common',
  },

  // ═══════════════════════════════════════
  // D-RANK: Uncommon (Hunter rewards)
  // ═══════════════════════════════════════
  {
    id: 'reward-anime', name: 'Watch 1 Episode', cost: 1200, category: 'entertainment',
    description: 'Relax with one episode of your favorite anime. Earned.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-meal', name: 'Eat Out', cost: 2000, category: 'food',
    description: 'Dinner at a restaurant of your choice. Halal only.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-course-basic', name: 'Basic Course', cost: 2500, category: 'education',
    description: 'Enroll in a short online course to level up a skill.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-gym-month', name: 'Gym Membership (1 Month)', cost: 3000, category: 'fitness',
    description: 'One month of gym access. Strengthen your vessel.',
    unlockRank: 'D', rarity: 'rare',
  },
  {
    id: 'reward-halal-dessert', name: 'Halal Dessert Run', cost: 1500, category: 'food',
    description: 'An earned dessert outing. No overeating, no laziness after.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-skill-book', name: 'Skill Book', cost: 1800, category: 'education',
    description: 'Buy one practical book for business, coding, health, or deen.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-workout-gear', name: 'Workout Gear', cost: 2200, category: 'fitness',
    description: 'Gloves, resistance bands, shoes, or other training support.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-deep-work-block', name: 'Deep Work Block', cost: 1600, category: 'productivity',
    description: 'Reserve a paid coworking/cafe block for serious focused work.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-family-dinner', name: 'Family Dinner', cost: 2800, category: 'family',
    description: 'Take family out or order a proper halal meal for them.',
    unlockRank: 'D', rarity: 'rare',
  },
  {
    id: 'reward-mobile-cleanup', name: 'Phone Cleanup Kit', cost: 1300, category: 'tech',
    description: 'Buy storage, cable, stand, or tools that make your phone setup cleaner.',
    unlockRank: 'D', rarity: 'uncommon',
  },

  // ═══════════════════════════════════════
  // C-RANK: Rare (Elite rewards)
  // ═══════════════════════════════════════
  {
    id: 'reward-gadget', name: 'New Gadget', cost: 5000, category: 'tech',
    description: 'Buy a gadget that helps your grind: headphones, smartwatch, etc.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-weekend', name: 'Weekend Retreat', cost: 6000, category: 'travel',
    description: 'Short getaway for the weekend. Nature restores the soul.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-sadaqah-medium', name: 'Medium Sadaqah', cost: 4000, category: 'charity',
    description: 'Give 2000 rupees in sadaqah. Barakah multiplies.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-course-advanced', name: 'Advanced Course', cost: 5500, category: 'education',
    description: 'Enroll in an advanced certification or bootcamp.',
    unlockRank: 'C', rarity: 'epic',
  },
  {
    id: 'reward-office-upgrade', name: 'Desk Upgrade', cost: 4500, category: 'productivity',
    description: 'Upgrade your desk, chair, lamp, or work surface for serious output.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-health-check', name: 'Health Checkup', cost: 5000, category: 'wellness',
    description: 'Book bloodwork, dental care, eye check, or a preventive health visit.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-mic-upgrade', name: 'Creator Gear', cost: 6500, category: 'tech',
    description: 'Mic, webcam, light, or accessories for content and client work.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-day-trip', name: 'Local Day Trip', cost: 7000, category: 'travel',
    description: 'A one-day reset after a strong streak. Keep prayers on time.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-halal-stock-research', name: 'Halal Stock Research Tool', cost: 4800, category: 'wealth',
    description: 'Pay for a screen, report, or research tool that supports halal investing.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-parent-gift', name: 'Parent Gift', cost: 5200, category: 'family',
    description: 'Buy something useful for your parents. Reward becomes service.',
    unlockRank: 'C', rarity: 'epic',
  },

  // ═══════════════════════════════════════
  // B-RANK: Epic (Knight rewards)
  // ═══════════════════════════════════════
  {
    id: 'reward-equipment', name: 'Home Equipment', cost: 8000, category: 'fitness',
    description: 'Dumbbells, pull-up bar, or kettlebells for your home gym.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-trip', name: 'Spiritual Trip', cost: 10000, category: 'travel',
    description: 'Umrah fund starter or visit to a Islamic heritage site.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-investment', name: 'Investment Starter', cost: 12000, category: 'wealth',
    description: 'Seed money for your first serious halal investment.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-sadaqah-large', name: 'Large Sadaqah', cost: 15000, category: 'charity',
    description: 'Fund a sadaqah jariyah project: well, mosque, education.',
    unlockRank: 'B', rarity: 'legendary',
  },
  {
    id: 'reward-standing-desk', name: 'Standing Desk', cost: 9000, category: 'productivity',
    description: 'A durable desk setup that supports long execution days.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-masterclass', name: 'Specialist Masterclass', cost: 9500, category: 'education',
    description: 'Pay for a serious workshop in AI, business, investing, or deen.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-sleep-system', name: 'Sleep System Upgrade', cost: 8500, category: 'wellness',
    description: 'Mattress, pillow, blackout curtains, or tools that protect recovery.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-client-dinner', name: 'Client Dinner', cost: 11000, category: 'wealth',
    description: 'A halal business meal to build relationship capital.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-family-day', name: 'Family Day Out', cost: 9500, category: 'family',
    description: 'A full planned day for family connection and gratitude.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-maktabah-stack', name: 'Maktabah Stack', cost: 13000, category: 'spiritual',
    description: 'Build a serious Islamic library shelf: Quran, hadith, fiqh, seerah.',
    unlockRank: 'B', rarity: 'legendary',
  },

  // ═══════════════════════════════════════
  // A-RANK: Legendary (General rewards)
  // ═══════════════════════════════════════
  {
    id: 'reward-laptop', name: 'New Laptop', cost: 25000, category: 'tech',
    description: 'Upgrade your primary machine. A warrior needs a sharp sword.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-coach', name: 'Personal Coach (1 Month)', cost: 20000, category: 'fitness',
    description: 'Hire a personal trainer or nutritionist for 1 month.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-business', name: 'Business Seed', cost: 30000, category: 'wealth',
    description: 'Capital to start a side business or freelance operation.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-umrah', name: 'Umrah Trip', cost: 50000, category: 'travel',
    description: 'Full Umrah trip. The journey of a lifetime.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-ai-workstation', name: 'AI Workstation Upgrade', cost: 35000, category: 'tech',
    description: 'Upgrade the machine or peripherals that power your AI ventures.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-premium-mentor', name: 'Premium Mentor Session', cost: 22000, category: 'education',
    description: 'Pay for a high-signal session with a serious expert.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-investor-toolkit', name: 'Investor Toolkit', cost: 28000, category: 'wealth',
    description: 'Professional tools, data, or subscriptions for disciplined halal investing.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-home-gym', name: 'Home Gym Expansion', cost: 32000, category: 'fitness',
    description: 'Barbell, bench, rack, or equipment that removes training excuses.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-charity-campaign', name: 'Charity Campaign', cost: 40000, category: 'charity',
    description: 'Launch a small campaign for food, education, medical help, or dawah.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-quiet-retreat', name: 'Quiet Retreat', cost: 26000, category: 'travel',
    description: 'A focused retreat for planning, worship, reading, and strategic reset.',
    unlockRank: 'A', rarity: 'legendary',
  },

  // ═══════════════════════════════════════
  // S-RANK: Mythic (Monarch rewards)
  // ═══════════════════════════════════════
  {
    id: 'reward-car', name: 'Vehicle Upgrade', cost: 100000, category: 'luxury',
    description: 'Upgrade your vehicle for safety and reliability.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-property', name: 'Property Investment', cost: 200000, category: 'wealth',
    description: 'Down payment on a halal real estate investment.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-ummah', name: 'Ummah Project', cost: 150000, category: 'charity',
    description: 'Fund a major ummah project: school, clinic, mosque construction.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-legacy', name: 'Legacy Fund', cost: 500000, category: 'wealth',
    description: 'Generational wealth seed. Your great-grandchildren will thank you.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-scholarship', name: 'Student Scholarship', cost: 125000, category: 'charity',
    description: 'Sponsor meaningful education for someone who cannot afford it.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-company-sprint', name: 'Company Sprint Fund', cost: 180000, category: 'wealth',
    description: 'Fund a serious build sprint for an AI or business venture.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-family-security', name: 'Family Security Fund', cost: 250000, category: 'family',
    description: 'Strengthen emergency reserves, insurance, or safety for your household.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-knowledge-endowment', name: 'Knowledge Endowment', cost: 175000, category: 'spiritual',
    description: 'Fund Islamic classes, books, teachers, or dawah infrastructure.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-executive-health', name: 'Executive Health Protocol', cost: 140000, category: 'wellness',
    description: 'Comprehensive health optimization with serious diagnostics and coaching.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-command-center', name: 'Command Center', cost: 220000, category: 'tech',
    description: 'A complete work command center for building, investing, and leading.',
    unlockRank: 'S', rarity: 'mythic',
  },
];

export function calculateGoldReward(quest, rank) {
  const baseGold = quest.xp || quest.baseXp || 10;
  const rankMultiplier = { E: 1, D: 1.5, C: 2.5, B: 4, A: 6, S: 10 };
  const multiplier = rankMultiplier[rank] || 1;
  return Math.floor(baseGold * 0.5 * multiplier);
}

export function purchaseReward(gold, itemId, purchasedItems) {
  const item = REWARD_ITEMS.find(i => i.id === itemId);
  if (!item) return { success: false, message: 'Item not found' };
  if (gold < item.cost) return { success: false, message: 'Not enough gold' };

  const newGold = gold - item.cost;
  const newPurchased = [...purchasedItems, { ...item, purchasedAt: new Date().toISOString() }];

  return { success: true, gold: newGold, purchasedItems: newPurchased, message: `Acquired: ${item.name}` };
}
