/** ============================================================
 *  SYSTEM STORE — Rank-Scaling Reward Catalog
 *  ============================================================
 *  RULE: Every item is something you BUY and RECEIVE. Not a task.
 *  No courses. No "research." No "plans." No "sprints."
 *  Tangible rewards only: food, gear, experiences, luxuries.
 *
 *  Aligned with:
 *  - Khalifa goal: Family, deen, leadership
 *  - Mission: AI builder, halal investor, clean energy (India)
 *  - Pillars: Deen, Body, Money — rewarded, not worked
 *  ============================================================ */

export const REWARD_RARITY = {
  common:     { key: 'common',     label: 'Common',     color: 'text-gray-400',  bg: 'bg-gray-900/30',     border: 'border-gray-700/30' },
  uncommon:   { key: 'uncommon',   label: 'Uncommon',   color: 'text-cyan-400',  bg: 'bg-cyan-900/20',     border: 'border-cyan-700/30' },
  rare:       { key: 'rare',       label: 'Rare',       color: 'text-blue-400',  bg: 'bg-blue-900/20',     border: 'border-blue-700/30' },
  epic:       { key: 'epic',       label: 'Epic',       color: 'text-purple-400',bg: 'bg-purple-900/20',   border: 'border-purple-700/30' },
  legendary:  { key: 'legendary',  label: 'Legendary',  color: 'text-orange-400',bg: 'bg-orange-900/20',   border: 'border-orange-700/30' },
  mythic:     { key: 'mythic',     label: 'Mythic',     color: 'text-yellow-400',bg: 'bg-yellow-900/20',   border: 'border-yellow-700/30' },
};

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
  // E-RANK: Common (Small treats — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-premium-dates', name: 'Premium Ajwa Dates', cost: 300, category: 'food',
    description: 'A box of Ajwa or Medjool dates. The Prophet ﷺ called them the fruit of Jannah.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-miswak-set', name: 'Miswak Set', cost: 250, category: 'wellness',
    description: 'A bundle of natural miswaks and a holder. Sunnah hygiene, premium feel.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-turkish-coffee', name: 'Turkish Coffee Set', cost: 500, category: 'food',
    description: 'A cezve and fine-ground coffee for slow, earned mornings.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-prayer-beads', name: 'Premium Tasbih', cost: 450, category: 'spiritual',
    description: 'A beautiful set of 99 prayer beads for dhikr after salah.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-islamic-calligraphy', name: 'Islamic Art Print', cost: 650, category: 'home',
    description: 'A framed "Bismillah" or "Alhamdulillah" print for your wall.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-halal-snack-box', name: 'Halal Snack Box', cost: 400, category: 'food',
    description: 'A curated box of halal-certified treats: chips, chocolate, nuts.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-itr-attar', name: 'Premium Attar', cost: 700, category: 'wellness',
    description: 'A small bottle of oud or musk attar. The scent of the Prophet ﷺ.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-qamis-basic', name: 'White Qamis', cost: 900, category: 'fashion',
    description: 'A clean, well-fitted white thobe for Jumuah and special occasions.',
    unlockRank: 'E', rarity: 'uncommon',
  },
  {
    id: 'reward-family-dessert', name: 'Family Dessert Box', cost: 550, category: 'food',
    description: 'A box of baklava, Turkish delight, or halal sweets to share.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-siwak-toothpaste', name: 'Siwak Toothpaste', cost: 350, category: 'wellness',
    description: 'Halal, natural toothpaste with siwak extract. Clean without compromise.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-hiking-socks', name: 'Merino Hiking Socks', cost: 500, category: 'adventure',
    description: 'Wool hiking socks that keep your feet dry on any trail. Start from the ground up.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-islamic-mug', name: 'Islamic Quote Mug', cost: 300, category: 'home',
    description: 'A ceramic mug with a powerful reminder. For chai after Fajr.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-pocket-quran', name: 'Pocket Quran', cost: 600, category: 'spiritual',
    description: 'A small, beautiful Quran you can carry everywhere.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-herbal-tea', name: 'Herbal Tea Collection', cost: 450, category: 'food',
    description: 'Chamomile, green tea, and saffron blends for recovery evenings.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-carabiner-multi', name: 'Carabiner Multi-Tool', cost: 350, category: 'adventure',
    description: 'A compact carabiner with knife, firestarter, and screwdriver. Adventure-ready.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-desk-mat', name: 'Desk Mat', cost: 800, category: 'home',
    description: 'A large, clean desk mat for your workspace. Protect the surface.',
    unlockRank: 'E', rarity: 'uncommon',
  },
  {
    id: 'reward-halal-chocolate', name: 'Luxury Halal Chocolate', cost: 500, category: 'food',
    description: 'Premium dark chocolate, halal-certified. Small indulgence, earned.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-notebook-leather', name: 'Leather Notebook', cost: 750, category: 'home',
    description: 'A premium notebook for ideas, reflections, and plans. Tangible thoughts.',
    unlockRank: 'E', rarity: 'uncommon',
  },

  // ═══════════════════════════════════════
  // D-RANK: Uncommon (Gear upgrades — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-wireless-earbuds', name: 'Wireless Earbuds', cost: 2500, category: 'tech',
    description: 'Bluetooth earbuds for focused work and outdoor movement. No cords, no excuses.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-trekking-shoes', name: 'Trekking Boots', cost: 3000, category: 'adventure',
    description: 'Waterproof boots with ankle support. Your feet carry you to the summit.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-restaurant-voucher', name: 'Restaurant Voucher', cost: 2000, category: 'food',
    description: 'A halal restaurant meal for two. Earned, not given.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-mechanical-keyboard', name: 'Mechanical Keyboard', cost: 2800, category: 'tech',
    description: 'Tactile switches for serious typing. Your sword is your code.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-binoculars', name: 'Premium Binoculars', cost: 2200, category: 'adventure',
    description: 'Compact binoculars for birdwatching, trekking, and scouting terrain. See farther.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-backpack-premium', name: 'Premium Backpack', cost: 1800, category: 'fashion',
    description: 'A durable, organized bag for outdoor gear, work, and travel. One bag for everything.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-chess-set', name: 'Premium Chess Set', cost: 1500, category: 'strategy',
    description: 'A weighted wooden chess set. The investor trains pattern recognition.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-leather-wallet', name: 'Leather Wallet', cost: 1600, category: 'fashion',
    description: 'A slim, quality wallet. The merchant carries his wealth with pride.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-spa-session', name: 'Spa / Massage Session', cost: 3500, category: 'wellness',
    description: 'A 60-minute deep tissue massage. Recovery is part of the grind.',
    unlockRank: 'D', rarity: 'rare',
  },
  {
    id: 'reward-bluetooth-speaker', name: 'Bluetooth Speaker', cost: 2400, category: 'tech',
    description: 'Portable speaker for Quran recitation, podcasts, or outdoor motivation.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-sunglasses', name: 'Polarized Sunglasses', cost: 1900, category: 'fashion',
    description: 'UV protection with style. The Khalifa walks with confidence.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-halal-perfume', name: 'Designer Halal Perfume', cost: 2700, category: 'wellness',
    description: 'A premium alcohol-free fragrance. Smell like the Sunnah.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-airfryer', name: 'Compact Air Fryer', cost: 3200, category: 'home',
    description: 'Cook halal meals with less oil. Health for the body that serves.',
    unlockRank: 'D', rarity: 'rare',
  },
  {
    id: 'reward-jubba', name: 'Embroidered Jubba', cost: 2100, category: 'fashion',
    description: 'A stitched jubba for Eid, Jumuah, or special gatherings. Dress like a Khalifa.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-power-bank', name: 'High-Capacity Power Bank', cost: 1700, category: 'tech',
    description: '20,000mAh to keep devices alive through long execution days.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-arabic-oud', name: 'Arabic Oud Candle', cost: 1400, category: 'home',
    description: 'A luxury scented candle for your space. Calm before the storm.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-compass-watch', name: 'Analog Field Watch', cost: 2300, category: 'adventure',
    description: 'A rugged analog watch with compass bezel. No battery, no GPS — just direction.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-parent-gift-small', name: 'Parent Gift Package', cost: 2600, category: 'family',
    description: 'A curated gift box for your parents: dates, tea, honey, and gratitude.',
    unlockRank: 'D', rarity: 'uncommon',
  },

  // ═══════════════════════════════════════
  // C-RANK: Rare (Quality of life — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-smartwatch', name: 'Smartwatch', cost: 6000, category: 'tech',
    description: 'Track outdoor treks, sleep, and prayer times from your wrist.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-noise-headphones', name: 'Noise-Cancelling Headphones', cost: 5500, category: 'tech',
    description: 'Silence the world. Focus on building, learning, and dhikr.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-hotel-weekend', name: 'Weekend Hotel Stay', cost: 7000, category: 'experience',
    description: 'Two nights at a clean, comfortable hotel. Reset away from home.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-office-chair', name: 'Ergonomic Office Chair', cost: 6500, category: 'home',
    description: 'Your throne for 10-hour build sessions. Protect your back.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-e-reader', name: 'E-Reader', cost: 5000, category: 'tech',
    description: 'Thousands of books in one device. Islamic library in your pocket.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-camera', name: 'Mirrorless Camera', cost: 8000, category: 'tech',
    description: 'Capture your journey, your family, and your Ummah impact.',
    unlockRank: 'C', rarity: 'epic',
  },
  {
    id: 'reward-kurta-set', name: 'Designer Kurta Set', cost: 4500, category: 'fashion',
    description: 'A premium kurta-pajama set for weddings, Eid, and leadership events.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-portable-grill', name: 'Portable Grill', cost: 5200, category: 'home',
    description: 'A halal BBQ grill for family gatherings. The Khalifa feeds his people.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-gold-jewelry-small', name: 'Small Gold Jewelry', cost: 7500, category: 'luxury',
    description: 'A delicate gold chain or ring. Wealth you can wear.',
    unlockRank: 'C', rarity: 'epic',
  },
  {
    id: 'reward-coffee-machine', name: 'Espresso Machine', cost: 5800, category: 'home',
    description: 'Pull shots at home. Caffeine for the builder.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-luggage', name: 'Premium Luggage Set', cost: 6200, category: 'travel',
    description: 'A durable carry-on for business trips, Umrah, and expansion.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-soundbar', name: 'Desktop Soundbar', cost: 4800, category: 'tech',
    description: 'Rich audio for calls, Quran, and focus music. Small footprint, big sound.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-camping-hammock', name: 'Ultralight Camping Hammock', cost: 5500, category: 'adventure',
    description: 'A packable hammock for mountain rest stops. Sleep under the stars, not the ceiling.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-islamic-carpet', name: 'Prayer Carpet', cost: 4200, category: 'spiritual',
    description: 'A thick, high-quality prayer rug. Your sajdah deserves the best.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-sneakers-premium', name: 'Premium Sneakers', cost: 6800, category: 'fashion',
    description: 'A pair of quality trainers that work on trails and the street.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-headlamp', name: 'Trail Headlamp', cost: 5000, category: 'adventure',
    description: 'A powerful LED headlamp for night treks and early summit starts. Light the path.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-cookware-set', name: 'Ceramic Cookware Set', cost: 4500, category: 'home',
    description: 'A full set for halal home cooking. The Khalifa eats clean.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-tablet', name: 'Android Tablet / iPad', cost: 7200, category: 'tech',
    description: 'A tablet for reading, notes, and light work. Portable productivity.',
    unlockRank: 'C', rarity: 'epic',
  },

  // ═══════════════════════════════════════
  // B-RANK: Epic (Serious upgrades — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-iphone', name: 'Flagship Smartphone', cost: 12000, category: 'tech',
    description: 'The latest iPhone or Android flagship. Your command center in your pocket.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-macbook', name: 'MacBook / ThinkPad', cost: 15000, category: 'tech',
    description: 'A serious laptop for building AI products and managing investments.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-luxury-watch', name: 'Mid-Tier Luxury Watch', cost: 18000, category: 'luxury',
    description: 'A Seiko, Tissot, or similar automatic watch. Time is your most valuable asset.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-shatranj', name: 'Shatranj / Backgammon Set', cost: 14000, category: 'strategy',
    description: 'A hand-carved wooden backgammon board. The game of merchants and kings.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-go-board', name: 'Go Board (19x19)', cost: 16000, category: 'strategy',
    description: 'A full Go set with glass stones. The ancient game of territory and patience.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-electric-scooter', name: 'Electric Scooter', cost: 13000, category: 'travel',
    description: 'Zip through the city with zero emissions. Clean energy, clean transport.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-dslr', name: 'DSLR Camera Kit', cost: 17000, category: 'tech',
    description: 'A professional camera with lenses for content, family, and travel.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-thobe-luxury', name: 'Luxury Thobe Collection', cost: 11000, category: 'fashion',
    description: 'Three premium thobes: white, cream, and black. Dress like the future Khalifa.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-standing-desk', name: 'Electric Standing Desk', cost: 13500, category: 'home',
    description: 'Height-adjustable desk for long execution sessions. Stand when energy dips.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-smart-home-hub', name: 'Smart Home Hub', cost: 10500, category: 'home',
    description: 'Automate lights, AC, and prayer reminders. A modern home for a modern Khalifa.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-domestic-luxury-trip', name: 'Domestic Luxury Trip', cost: 20000, category: 'experience',
    description: 'A 3-day premium trip within India: Goa, Kerala, or the mountains.',
    unlockRank: 'B', rarity: 'legendary',
  },
  {
    id: 'reward-mountain-bike', name: 'Mountain Bike', cost: 15500, category: 'adventure',
    description: 'A hardtail MTB for trails, hills, and off-road exploration. The Khalifa conquers terrain.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-premium-mattress', name: 'Premium Mattress', cost: 19000, category: 'wellness',
    description: 'A memory foam or latex mattress for deep, restorative sleep. Recovery is king.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-gold-bar-small', name: 'Small Gold Bar', cost: 22000, category: 'wealth',
    description: 'A 5g gold bar. Real wealth you can hold. Sadaqah jariyah for the soul, gold for the vault.',
    unlockRank: 'B', rarity: 'legendary',
  },
  {
    id: 'reward-premium-speakers', name: 'Hi-Fi Speaker System', cost: 16500, category: 'tech',
    description: 'Studio-monitor quality speakers for your workspace. Hear every detail.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-parents-gold', name: 'Parents Gold Gift', cost: 25000, category: 'family',
    description: 'A small gold piece for your mother or father. Jannah is at their feet — honor them.',
    unlockRank: 'B', rarity: 'legendary',
  },
  {
    id: 'reward-bicycle-electric', name: 'Electric Bicycle', cost: 14500, category: 'travel',
    description: 'Pedal-assist bike for commuting and exploring. Zero fuel, maximum barakah.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-winter-jacket', name: 'Premium Winter Jacket', cost: 12500, category: 'fashion',
    description: 'A warm, stylish jacket for travel to cold climates. The Khalifa is prepared.',
    unlockRank: 'B', rarity: 'epic',
  },

  // ═══════════════════════════════════════
  // A-RANK: Legendary (Empire rewards — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-gaming-laptop', name: 'Gaming / Workstation Laptop', cost: 35000, category: 'tech',
    description: 'RTX GPU, 32GB RAM, fast SSD. Build AI models without waiting.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-international-vacation', name: 'International Vacation', cost: 50000, category: 'travel',
    description: 'A week in Turkey, Malaysia, or Dubai with family. See the Ummah.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-rolex-tier', name: 'Luxury Automatic Watch', cost: 45000, category: 'luxury',
    description: 'A Rolex, Omega, or Grand Seiko. A legacy piece that outlives trends.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-sound-system', name: 'Premium Sound System', cost: 32000, category: 'home',
    description: 'A full home audio setup: subwoofer, towers, receiver. For Quran and focus.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-himalayan-trek', name: 'Guided Himalayan Trek', cost: 40000, category: 'adventure',
    description: 'A 5-day guided trek in the Himalayas. Altitude, endurance, and perspective.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-drone', name: 'Professional Drone', cost: 38000, category: 'adventure',
    description: 'A DJI drone for surveying terrain, capturing expeditions, and scouting VAWT sites.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-strategy-master', name: 'Private Strategy Session', cost: 35000, category: 'strategy',
    description: 'A 3-hour session with a chess grandmaster or investment strategist. Sharpen the mind.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-ultrawide-monitor', name: 'Ultrawide Monitor Setup', cost: 28000, category: 'tech',
    description: 'A 49-inch ultrawide for serious multitasking. One screen to rule them all.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-motorcycle', name: 'Premium Motorcycle', cost: 55000, category: 'travel',
    description: 'A Royal Enfield or similar for solo rides and clear thinking. Freedom on two wheels.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-gold-bar-medium', name: 'Medium Gold Bar', cost: 60000, category: 'wealth',
    description: 'A 20g gold bar. Real money that central banks cannot print.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-family-celebration', name: 'Family Celebration Event', cost: 42000, category: 'family',
    description: 'A grand family gathering: venue, catering, gifts. The Khalifa honors his lineage.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-solar-home-kit', name: 'Home Solar Panel Kit', cost: 48000, category: 'home',
    description: 'Rooftop solar panels for your home. Live what you build. Clean energy starts at home.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-kayak', name: 'Expedition Kayak', cost: 36000, category: 'adventure',
    description: 'A sea kayak for coastal exploration and river expeditions. Water is the other wilderness.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-umrah-for-parents', name: 'Umrah for Parents', cost: 75000, category: 'travel',
    description: 'Send your parents for Umrah. The best gift is the one that wipes sins.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-smart-home-full', name: 'Full Smart Home Upgrade', cost: 45000, category: 'home',
    description: 'Smart lights, locks, cameras, and climate control. A fortress of convenience.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-jewelry-set', name: 'Premium Jewelry Set', cost: 52000, category: 'luxury',
    description: 'Gold and diamond pieces for family. Wealth shared is wealth multiplied.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-home-renovation', name: 'Home Office Renovation', cost: 65000, category: 'home',
    description: 'Renovate one room into a world-class office and prayer space.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-muslim-designer', name: 'Muslim Designer Wear', cost: 38000, category: 'fashion',
    description: 'Bespoke thobes and suits from a Muslim designer. Support the Ummah economy.',
    unlockRank: 'A', rarity: 'legendary',
  },

  // ═══════════════════════════════════════
  // S-RANK: Mythic (Monarch rewards — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-luxury-car', name: 'Luxury Vehicle', cost: 800000, category: 'luxury',
    description: 'A BMW, Mercedes, or Tesla. Safe, reliable, and worthy of a Monarch.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-property-down', name: 'Property Down Payment', cost: 500000, category: 'wealth',
    description: 'A down payment on halal real estate. Generational wealth begins with dirt.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-hajj-package', name: 'Hajj Package', cost: 600000, category: 'travel',
    description: 'The fifth pillar. A package for you and your spouse. The journey of a lifetime.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-gold-kilogram', name: '1 Kilogram Gold Bar', cost: 750000, category: 'wealth',
    description: 'One kilo of pure gold. The ultimate store of value for the ultimate store of deeds.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-family-estate', name: 'Family Estate Land', cost: 1000000, category: 'wealth',
    description: 'A plot of land for your family compound. The Khalifa thinks in generations.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-executive-health', name: 'Executive Health Package', cost: 300000, category: 'wellness',
    description: 'Full diagnostics, executive physical, and longevity coaching for one year.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-custom-pc', name: 'Custom Workstation Build', cost: 350000, category: 'tech',
    description: 'Threadripper, 128GB RAM, multiple GPUs. A server-grade machine for AI empire-building.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-world-tour-family', name: 'World Tour with Family', cost: 900000, category: 'travel',
    description: 'A month-long journey through Muslim lands: Makkah, Madinah, Istanbul, Cairo, Kuala Lumpur.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-rolex', name: 'Rolex / Patek Philippe', cost: 1200000, category: 'luxury',
    description: 'A timepiece that appreciates. Wealth that tells time.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-renewable-farm', name: 'Renewable Energy Farm', cost: 1500000, category: 'wealth',
    description: 'Fund a real VAWT or solar installation. Power the Ummah with clean energy.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-masjid-donation', name: 'Masjid Construction Donation', cost: 800000, category: 'charity',
    description: 'A major donation toward a masjid or Islamic center. Your name lives in every prayer.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-generational-library', name: 'Generational Library Room', cost: 450000, category: 'home',
    description: 'Build a dedicated library in your home: shelves, rare books, Quran stand, reading chairs.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-luxury-apartment', name: 'Luxury Apartment', cost: 2500000, category: 'wealth',
    description: 'A premium apartment in a major Indian city. Live where you build.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-private-chef-year', name: 'Private Halal Chef (1 Year)', cost: 600000, category: 'luxury',
    description: 'A personal chef preparing halal, healthy meals for your family. The Khalifa eats like a king.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-yacht-day', name: 'Luxury Yacht Day', cost: 400000, category: 'luxury',
    description: 'A private yacht day for family and close friends. Earned celebration.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-education-endowment', name: 'Family Education Endowment', cost: 2000000, category: 'family',
    description: 'A permanent fund for your children and grandchildren education. Knowledge is the only inheritance.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-tech-platform', name: 'Ummah Tech Platform Fund', cost: 1200000, category: 'tech',
    description: 'Capital to launch or scale a platform serving Muslims globally. Build for the Ummah.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-waqf', name: 'Waqf Property', cost: 5000000, category: 'charity',
    description: 'A permanent charitable endowment: land, building, or farm. Sadaqah jariyah until Judgment Day.',
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
