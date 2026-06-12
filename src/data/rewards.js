/** ============================================================
 *  SYSTEM STORE — Rank-Scaling Reward Catalog
 *  ============================================================
 *  RULE: Nothing in this store is for you. Nothing.
 *
 *  Every gold piece you spend here flows outward — to the Ummah,
 *  to the needy, to the orphan, to the widow, to the student,
 *  to the masjid, to the relief worker, to the brother who
 *  cannot afford his own tools.
 *
 *  The Khalifa does not consume. The Khalifa distributes.
 *  The Khalifa does not decorate his own wall. He decorates
 *  the masjid. The Khalifa does not eat the best dates.
 *  He feeds them to the fasting. The Khalifa does not wear
 *  the finest garment. He clothes the naked.
 *
 *  Categories:
 *  - charity: Direct aid, food, shelter, medical, education
 *  - spiritual: Qurans, prayer supplies, masjid equipment, Islamic knowledge
 *  - adventure: Gear for relief workers, dawah teams, field volunteers
 *  - tech: Equipment for Muslim developers, students, academies, platforms
 *  - wealth: Gold, property, land, investment — held in trust for the Ummah
 *  - family: Care for orphans, elderly, widows, needy families — NOT your own comfort
 *  - sadaqah: Ongoing charity, waqf, endowments, infrastructure
 *  - community: Collective goods, public spaces, shared tools
 *
 *  Forbidden:
 *  - Anything framed as "for you," "your home," "your family"
 *  - Personal consumption, personal luxury, personal convenience
 *  - Status symbols, entertainment, distraction
 *  - "Recovery for you" — recovery is for those who serve harder
 *  ============================================================ */

export const REWARD_RARITY = {
  common:     { key: 'common',     label: 'Common',     color: 'text-gray-400',  bg: 'bg-gray-900/30',     border: 'border-gray-700/30' },
  uncommon:   { key: 'uncommon',   label: 'Uncommon',   color: 'text-cyan-400',  bg: 'bg-cyan-900/20',     border: 'border-cyan-700/30' },
  rare:       { key: 'rare',       label: 'Rare',       color: 'text-blue-400',  bg: 'bg-blue-900/20',     border: 'border-blue-700/30' },
  epic:       { key: 'epic',       label: 'Epic',       color: 'text-purple-400',bg: 'bg-purple-900/20',   border: 'border-purple-700/30' },
  legendary:  { key: 'legendary',  label: 'Legendary',  color: 'text-orange-400',bg: 'bg-orange-900/20',   border: 'border-orange-700/30' },
  mythic:     { key: 'mythic',     label: 'Mythic',     color: 'text-yellow-400',bg: 'bg-yellow-900/20',   border: 'border-yellow-700/30' },
};

/** Map player level to store unlock tier. S-rank splits into 3 sub-tiers. */
export function getEffectiveStoreRank(level = 0) {
  if (level >= 600) return 'S_III';
  if (level >= 300) return 'S_II';
  if (level >= 100) return 'S';
  if (level >= 71)  return 'A';
  if (level >= 46)  return 'B';
  if (level >= 26)  return 'C';
  if (level >= 11)  return 'D';
  return 'E';
}

const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S', 'S_II', 'S_III'];

export function isItemUnlocked(itemRank, userRank, userLevel = 0) {
  const effectiveRank = userRank === 'S' ? getEffectiveStoreRank(userLevel) : userRank;
  const itemIdx = RANK_ORDER.indexOf(itemRank);
  const userIdx = RANK_ORDER.indexOf(effectiveRank);
  if (itemIdx === -1 || userIdx === -1) return false;
  return userIdx >= itemIdx;
}

export function getStoreItemsForRank(userRank, userLevel = 0) {
  const effectiveRank = userRank === 'S' ? getEffectiveStoreRank(userLevel) : userRank;
  return REWARD_ITEMS.map(item => ({
    ...item,
    unlocked: isItemUnlocked(item.unlockRank, userRank, userLevel),
  }));
}

export function getFeaturedItems(userRank, userLevel = 0) {
  const effectiveRank = userRank === 'S' ? getEffectiveStoreRank(userLevel) : userRank;
  const userIdx = RANK_ORDER.indexOf(effectiveRank);
  const featuredRanks = RANK_ORDER.slice(Math.max(0, userIdx - 1), userIdx + 1);
  return REWARD_ITEMS
    .filter(item => featuredRanks.includes(item.unlockRank))
    .map(item => ({ ...item, unlocked: isItemUnlocked(item.unlockRank, userRank, userLevel) }));
}

export function getNextUnlockPreview(userRank, userLevel = 0) {
  const effectiveRank = userRank === 'S' ? getEffectiveStoreRank(userLevel) : userRank;
  const userIdx = RANK_ORDER.indexOf(effectiveRank);
  const nextRank = RANK_ORDER[userIdx + 1];
  if (!nextRank) return null;
  const nextItems = REWARD_ITEMS.filter(item => item.unlockRank === nextRank);
  if (nextItems.length === 0) return null;
  return { rank: nextRank, items: nextItems };
}

export const REWARD_ITEMS = [
  // ═══════════════════════════════════════
  // E-RANK: Common (Give away what the Prophet ﷺ loved — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-premium-dates', name: 'Ajwa Dates for Fasting Families', cost: 300, category: 'charity',
    description: 'Buy boxes of Ajwa dates and distribute them to fasting Muslims before Maghrib. The Prophet ﷺ called them the fruit of Jannah — share Jannah.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-miswak-set', name: 'Miswak Sets for Masjid', cost: 250, category: 'spiritual',
    description: 'Supply natural miswaks and holders at your local masjid so every brother can practice Sunnah hygiene.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-sunnah-food-box', name: 'Sunnah Food Baskets for Needy', cost: 500, category: 'charity',
    description: 'Assemble boxes of dates, honey, black seed oil, and dried fruits from Muslim vendors. Give them to families who cannot afford Sunnah nutrition.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-tasbih-premium', name: 'Tasbih Gift Sets for New Muslims', cost: 450, category: 'spiritual',
    description: 'Beautiful 99-bead tasbih sets for converts and youth learning dhikr. Welcome them to the Ummah with the tools of remembrance.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-islamic-calligraphy', name: 'Islamic Art for Masjid Wall', cost: 650, category: 'community',
    description: 'Commission a framed "Bismillah" or "Alhamdulillah" piece and donate it to the masjid. Let the house of Allah testify to Tawhid.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-halal-snack-box', name: 'Muslim Vendor Snack Box for Orphans', cost: 400, category: 'charity',
    description: 'Buy halal-certified treats from a Muslim-owned business and deliver them to an orphanage or street children. Two Ummah members served in one act.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-natural-attar', name: 'Natural Attar for Masjid Guests', cost: 700, category: 'spiritual',
    description: 'Alcohol-free oud and musk attar to keep at the masjid for guests and Jumuah attendees. The scent of the Prophet ﷺ belongs in the house of Allah.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-qamis-basic', name: 'White Qamis for a Needy Brother', cost: 900, category: 'charity',
    description: 'Buy a clean, well-fitted white thobe for a brother who cannot afford Eid or Jumuah clothing. Clothe the naked, earn the reward.',
    unlockRank: 'E', rarity: 'uncommon',
  },
  {
    id: 'reward-family-dessert', name: 'Dessert Delivery to Orphanage', cost: 550, category: 'charity',
    description: 'Order baklava, Turkish delight, and halal sweets from a Muslim bakery and deliver them to orphans. Sweeten mouths that have known too much bitterness.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-siwak-toothpaste', name: 'Siwak Toothpaste for Madrasa Children', cost: 350, category: 'charity',
    description: 'Supply natural siwak toothpaste to a madrasa or orphanage. Clean the mouths that will recite Quran tomorrow.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-hiking-socks', name: 'Hiking Socks for Relief Walker', cost: 500, category: 'adventure',
    description: 'Quality merino socks for a volunteer who walks trails and rough terrain to deliver aid. Protect the feet that carry relief.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-islamic-mug', name: 'Islamic Mugs for Dawah Table', cost: 300, category: 'community',
    description: 'Ceramic mugs with powerful reminders to give away at dawah stalls and community events. Warm chai, warm welcome.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-pocket-quran', name: 'Pocket Qurans for Distribution', cost: 600, category: 'spiritual',
    description: 'Small, beautiful Qurans to hand to new Muslims, travelers, and hospital patients. Never let a hand leave empty.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-muslim-tea-set', name: 'Muslim Artisan Tea for Elders', cost: 450, category: 'charity',
    description: 'Hand-blended herbal teas from a Muslim vendor, gifted to the elderly in your community. Serve those who served before you.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-carabiner-multi', name: 'Multi-Tools for Field Volunteers', cost: 350, category: 'adventure',
    description: 'Compact carabiners with knife, firestarter, and screwdriver for relief workers and scouts. Equip the hands that rebuild.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-mission-notebook', name: 'Notebooks for Muslim Students', cost: 800, category: 'community',
    description: 'Premium leather notebooks for students at a madrasa or Islamic school. Ideas written become actions; actions become change.',
    unlockRank: 'E', rarity: 'uncommon',
  },
  {
    id: 'reward-support-farmer', name: 'Sponsor a Muslim Farmer\'s Harvest', cost: 500, category: 'wealth',
    description: 'Pre-buy a season\'s produce from a Muslim farmer and donate the harvest to a food kitchen. Strengthen the Ummah\'s food sovereignty while feeding the hungry.',
    unlockRank: 'E', rarity: 'common',
  },
  {
    id: 'reward-child-prayer-mat', name: 'Child Prayer Mats for Masjid', cost: 400, category: 'spiritual',
    description: 'Colorful prayer mats for the children\'s corner at the masjid. Plant the seed of salah where they will grow.',
    unlockRank: 'E', rarity: 'common',
  },

  // ═══════════════════════════════════════
  // D-RANK: Uncommon (Equip others, feed others, teach others — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-muslim-micro-invest', name: 'Micro-Seed a Muslim Business', cost: 2500, category: 'wealth',
    description: 'Inject startup capital into a small Muslim-owned halal business. Be the reason a brother\'s shop opens tomorrow.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-trekking-shoes', name: 'Boots for Field Relief Worker', cost: 3000, category: 'adventure',
    description: 'Waterproof trekking boots with ankle support for a volunteer who covers rough terrain to deliver aid. Equip the feet that serve.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-iftar-needy', name: 'Iftar for a Struggling Family', cost: 2000, category: 'charity',
    description: 'Sponsor a full iftar meal for a Muslim family that struggles to afford two meals. Feed the fasting, earn the reward of their fast.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-quran-study-bundle', name: 'Quran Study Bundle for Masjid Library', cost: 2800, category: 'spiritual',
    description: 'Tafsir books, word-by-word Quran, and study guides donated to the masjid library. Knowledge kept in a shelf serves more than knowledge kept in a drawer.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-binoculars', name: 'Binoculars for Relief Survey Team', cost: 2200, category: 'adventure',
    description: 'Compact binoculars for a volunteer team assessing terrain, disaster zones, and VAWT sites. See farther so you can serve better.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-mission-backpack', name: 'Backpacks for Dawah / Relief Team', cost: 1800, category: 'adventure',
    description: 'Durable, organized backpacks for volunteers carrying literature, first aid, and relief supplies. One bag can carry the message of Islam to a village.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-family-learning-kit', name: 'Islamic Learning Kits for Orphanage', cost: 1500, category: 'family',
    description: 'Seerah cards, Islamic trivia, and discussion guides for children without parents. Build a home of knowledge where there is no home.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-quality-journal', name: 'Quality Journals for Muslim Students', cost: 1600, category: 'community',
    description: 'Thick archival journals for students at an Islamic school. Teach them to write their thoughts before the world writes their fate.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-parents-wellness', name: 'Wellness Package for Elderly Muslims', cost: 3500, category: 'family',
    description: 'Natural remedies, halal supplements, and care items for the elderly in your community. Serve those who are closest to Jannah.',
    unlockRank: 'D', rarity: 'rare',
  },
  {
    id: 'reward-quran-speaker', name: 'Quran Speaker for Masjid or Orphanage', cost: 2400, category: 'spiritual',
    description: 'A portable speaker donated to a masjid or orphanage so Quran can fill the space where children sleep and elders rest.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-first-aid-kit', name: 'Field First Aid Kits for Relief Team', cost: 1900, category: 'adventure',
    description: 'Comprehensive first aid kits for volunteers working in disaster zones and remote areas. Be ready to heal through those you equip.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-natural-fragrance', name: 'Natural Fragrance for Masjid Hospitality', cost: 2700, category: 'spiritual',
    description: 'Alcohol-free attar oils for the masjid to offer guests. Musk, oud, and amber — the scent of dignity for every Muslim who enters.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-airfryer', name: 'Air Fryer for Orphanage Kitchen', cost: 3200, category: 'family',
    description: 'A compact air fryer for an orphanage or madrasa kitchen. Cook healthier meals for children who need nutrition to grow strong for the Ummah.',
    unlockRank: 'D', rarity: 'rare',
  },
  {
    id: 'reward-jubba', name: 'Embroidered Jubba for Needy Brother', cost: 2100, category: 'charity',
    description: 'A stitched jubba for a brother who has no Eid clothing. Dress him with dignity so he can pray with confidence.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-field-power', name: 'Field Power Banks for Relief Workers', cost: 1700, category: 'adventure',
    description: 'High-capacity power banks for volunteers in the field. Keep their phones alive so they can coordinate aid and call for help.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-bakhoor-set', name: 'Natural Bakhoor for Masjid', cost: 1400, category: 'spiritual',
    description: 'Natural incense and burner donated to the masjid. Let the house of Allah smell like the peace it offers.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-compass-watch', name: 'Field Watches for Relief Coordinators', cost: 2300, category: 'adventure',
    description: 'Rugged analog watches with compass bezels for team leaders. Direction and discipline for those who direct relief.',
    unlockRank: 'D', rarity: 'uncommon',
  },
  {
    id: 'reward-parent-gift-small', name: 'Gift Package for Vulnerable Elderly', cost: 2600, category: 'family',
    description: 'Dates, tea, honey, and warmth for elderly Muslims who live alone. Jannah is at their feet — visit them while they are near.',
    unlockRank: 'D', rarity: 'uncommon',
  },

  // ═══════════════════════════════════════
  // C-RANK: Rare (Sponsor lives, build collective spaces — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-orphan-month', name: 'Sponsor an Orphan (1 Month)', cost: 6000, category: 'family',
    description: 'Cover food, clothing, and school supplies for one orphan for a month. Be the father they lost.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-islamic-audio-lib', name: 'Islamic Audio Library for Masjid', cost: 5500, category: 'spiritual',
    description: 'A curated drive with 500+ hours of Quran, seerah, and fiqh lectures, donated to the masjid. Let the whole neighborhood learn while they sleep.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-spiritual-retreat', name: 'Sponsor a Youth Spiritual Retreat', cost: 7000, category: 'community',
    description: 'Fund a weekend retreat for a group of Muslim youth: Quran, reflection, and mentorship. Plant the next generation in Tawhid.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-prayer-space', name: 'Upgrade Masjid Prayer Space', cost: 6500, category: 'spiritual',
    description: 'Better lighting, carpets, and wudu facilities for a local masjid. The Khalifa does not pray in comfort while the Ummah prays in darkness.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-e-reader-islamic', name: 'E-Readers for Muslim Students', cost: 5000, category: 'community',
    description: 'E-readers pre-loaded with Islamic books, given to students who cannot afford a library. Carry a thousand books to those who carry the future.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-ummah-camera', name: 'Documentation Camera for Ummah NGO', cost: 8000, category: 'community',
    description: 'A professional camera donated to a Muslim relief organization. Document their impact so the world can see the Ummah serving.',
    unlockRank: 'C', rarity: 'epic',
  },
  {
    id: 'reward-prayer-garment-set', name: 'Prayer Garments for Needy Brothers', cost: 4500, category: 'charity',
    description: 'Premium kurta-pajama sets for brothers who have no dignified clothing for salah. Clothe them for the prayer that clothes the soul.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-family-grill', name: 'Community BBQ Grill for Masjid', cost: 5200, category: 'community',
    description: 'A halal BBQ grill donated to the masjid for community gatherings, Eid events, and feeding the poor. The Khalifa feeds his people publicly.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-gold-ring-small', name: 'Gold Ring for Needy Sister\'s Dowry', cost: 7500, category: 'charity',
    description: 'A simple gold ring to help a poor sister complete her dowry and marry with dignity. Be the reason a family begins.',
    unlockRank: 'C', rarity: 'epic',
  },
  {
    id: 'reward-orphan-eid-fund', name: 'Orphan Eid Gift Fund', cost: 5800, category: 'family',
    description: 'Fund new clothes, toys, and sweets for 10 orphans on Eid. Let them smile on the day the Ummah celebrates.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-dawah-luggage', name: 'Dawah Travel Gear for Field Missionary', cost: 6200, category: 'adventure',
    description: 'A durable carry-on and packing system for a brother doing dawah or relief in remote areas. Equip the messenger.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-family-quran-audio', name: 'Quran Audio System for Needy Family', cost: 4800, category: 'family',
    description: 'A quality home audio setup for a poor Muslim family. Fill their home with the Words of Allah instead of silence.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-camping-hammock', name: 'Camping Gear for Relief / Scout Team', cost: 5500, category: 'adventure',
    description: 'Packable hammocks and camping gear for volunteers on multi-day relief missions. Rest the bodies that serve.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-islamic-carpet', name: 'Premium Prayer Carpets for Masjid', cost: 4200, category: 'spiritual',
    description: 'Thick, high-quality prayer rugs donated to the masjid. Every sajdah made on them carries your reward until they wear out.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-trail-shoes', name: 'Trail Shoes for Field Volunteers', cost: 6800, category: 'adventure',
    description: 'Quality trail runners for relief workers covering rugged terrain. Move fast when the Ummah calls.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-headlamp', name: 'Headlamps for Night Relief Workers', cost: 5000, category: 'adventure',
    description: 'Powerful LED headlamps for volunteers working through the night. Light the path for those who carry aid in darkness.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-cookware-set', name: 'Cookware Set for Orphanage Kitchen', cost: 4500, category: 'family',
    description: 'A full ceramic cookware set for an orphanage or madrasa kitchen. Feed the stomachs that will feed the Ummah tomorrow.',
    unlockRank: 'C', rarity: 'rare',
  },
  {
    id: 'reward-student-laptop-fund', name: 'Laptop for Needy Muslim Student', cost: 7200, category: 'community',
    description: 'A laptop for a Muslim student who cannot afford one. Education is the key to Ummah strength — hand them the key.',
    unlockRank: 'C', rarity: 'epic',
  },

  // ═══════════════════════════════════════
  // B-RANK: Epic (Equip builders, fund education, protect families — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-ummah-workstation', name: 'Workstation for Muslim Developer', cost: 12000, category: 'tech',
    description: 'A serious computer for a Muslim brother or sister building tech for the Ummah. Fund the builder so the Ummah can benefit.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-family-education-laptop', name: 'Education Laptop for Orphan / Needy Child', cost: 15000, category: 'family',
    description: 'A laptop for an orphan or poor child to learn, code, and build. Invest in the next generation, not your own comfort.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-gold-bar-small', name: 'Gold Bar for Ummah Emergency Fund', cost: 18000, category: 'wealth',
    description: 'A 5g gold bar placed in a communal emergency fund for Muslim communities in crisis. Wealth held in trust, not in vanity.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-manuscript-replica', name: 'Islamic Manuscript for School Display', cost: 14000, category: 'spiritual',
    description: 'A museum-quality replica donated to an Islamic school or madrasa. Let children touch 1,000 years of scholarship with their eyes.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-strategy-planning-kit', name: 'Strategy Planning Kit for Muslim NGO', cost: 16000, category: 'community',
    description: 'Whiteboard, project planner, and wall map for a Muslim organization strategizing Ummah projects. Equip the planners.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-clean-bike', name: 'Bicycle for Needy Muslim Commuter', cost: 13000, category: 'adventure',
    description: 'A quality bicycle for a brother who walks two hours to work or madrasa. Give him speed so he can serve faster.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-ummah-media-kit', name: 'Media Kit for Ummah Documentary Team', cost: 17000, category: 'tech',
    description: 'Professional camera and lenses for a Muslim team documenting relief work, Islamic history, and community stories. Tell the Ummah\'s truth.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-orphan-school-year', name: 'Orphan School Supplies (1 Year)', cost: 11000, category: 'family',
    description: 'Books, bags, uniforms, and fees for 20 orphans for one full school year. Pay for the pens that will write the future.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-home-library', name: 'Library Bookshelf for Islamic School', cost: 13500, category: 'community',
    description: 'A solid wood bookshelf for an Islamic school library. Knowledge must have a throne, and the throne belongs to the community.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-home-security', name: 'Security Upgrade for Vulnerable Muslim Family', cost: 10500, category: 'family',
    description: 'A basic security system for a Muslim family living in a dangerous area. Protect those the state has forgotten.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-muslim-land-trip', name: 'Sponsor Dawah Trip for Student Group', cost: 20000, category: 'adventure',
    description: 'Fund a 3-day trip to a Muslim city for a group of students to learn, connect, and do dawah. Send them so they return with purpose.',
    unlockRank: 'B', rarity: 'legendary',
  },
  {
    id: 'reward-mountain-bike', name: 'Mountain Bike for Relief Access', cost: 15500, category: 'adventure',
    description: 'A hardtail MTB for a relief worker who needs to reach areas no car can access. Conquer terrain so aid can conquer suffering.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-premium-mattress', name: 'Mattress for Orphanage / Refugee Camp', cost: 19000, category: 'family',
    description: 'Quality mattresses for an orphanage or refugee camp. Rest the bodies that have known too much unrest.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-quran-distribution', name: 'Quran Distribution (100 copies)', cost: 22000, category: 'spiritual',
    description: 'Print and distribute 100 Qurans to new Muslims, madrasas, and remote communities. Spread the Word so it spreads you.',
    unlockRank: 'B', rarity: 'legendary',
  },
  {
    id: 'reward-parents-gold', name: 'Gold Security for Elderly Muslims in Need', cost: 25000, category: 'family',
    description: 'A small gold piece given to an elderly Muslim with no savings. Honor the age that is closest to Jannah by securing their dignity.',
    unlockRank: 'B', rarity: 'legendary',
  },
  {
    id: 'reward-ebike-dawah', name: 'E-Bike for Dawah / Relief Worker', cost: 14500, category: 'adventure',
    description: 'A pedal-assist bike for a brother doing dawah or relief across a wide area. Multiply his reach without multiplying his exhaustion.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-relief-jacket', name: 'All-Climate Jackets for Relief Team', cost: 12500, category: 'adventure',
    description: 'Warm, durable jackets for volunteers traveling to cold climates during relief missions. The Khalifa is prepared through those he equips.',
    unlockRank: 'B', rarity: 'epic',
  },
  {
    id: 'reward-muslim-seed-invest', name: 'Seed Investment in Muslim Startup', cost: 16500, category: 'wealth',
    description: 'A meaningful seed investment in a halal Muslim startup. Be the reason a brother\'s dream breathes and his employees feed their children.',
    unlockRank: 'B', rarity: 'epic',
  },

  // ═══════════════════════════════════════
  // A-RANK: Legendary (Build institutions, send others, protect communities — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-ummah-ai-lab', name: 'AI Lab Workstation for Muslim Tech Academy', cost: 35000, category: 'tech',
    description: 'A high-performance workstation donated to a Muslim tech academy training the next generation of Ummah-serving developers.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-family-umrah', name: 'Umrah Trip for Needy Muslim Family', cost: 50000, category: 'adventure',
    description: 'Send a poor Muslim family for Umrah who have never seen the Kaaba. Show them the House of Allah. Let them return transformed.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-gold-bar-medium', name: 'Gold Bar for Waqf Backing', cost: 45000, category: 'wealth',
    description: 'A 20g gold bar placed as backing for a waqf or community trust. Real money that central banks cannot print, held for the Ummah.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-home-solar', name: 'Solar Kit for Masjid or Orphanage', cost: 32000, category: 'community',
    description: 'Rooftop solar panels for a masjid or orphanage. Power the house of Allah with the sun Allah created.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-himalayan-trek', name: 'Sponsor Outdoor Leadership Camp for Youth', cost: 40000, category: 'adventure',
    description: 'Fund a 5-day Himalayan trek for a group of Muslim youth. Test their bodies so they learn to carry the Ummah\'s burdens.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-relief-drone', name: 'Relief Survey Drone for Muslim NGO', cost: 38000, category: 'adventure',
    description: 'A drone donated to a Muslim relief organization for surveying disaster zones and mapping aid delivery. See from above so you can serve below.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-private-mentor', name: 'Mentor Session for Needy Muslim Entrepreneur', cost: 35000, category: 'community',
    description: 'Pay for a struggling Muslim entrepreneur to receive 3 hours with an experienced mentor. Sharpen his mind so he can hire your brothers.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-ummah-monitor', name: 'Monitor Setup for Ummah Tech Academy', cost: 28000, category: 'tech',
    description: 'A wide monitor setup donated to a Muslim tech academy. One screen for the code, one for the mission — both serving the Ummah.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-orphanage-year', name: 'Orphanage Support (1 Year)', cost: 55000, category: 'family',
    description: 'Cover rent, food, and teacher salaries for a small orphanage for one full year. Be the roof over their heads.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-muslim-angel-invest', name: 'Angel Investment in Muslim Venture', cost: 60000, category: 'wealth',
    description: 'A serious angel investment in a Shariah-compliant Muslim venture. Create halal jobs for the Ummah.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-family-celebration', name: 'Community Eid Celebration for Needy', cost: 42000, category: 'community',
    description: 'Fund a grand Eid gathering for poor Muslim families: venue, halal catering, gifts. The Khalifa celebrates with the weakest first.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-water-well', name: 'Water Well for Muslim Village', cost: 48000, category: 'sadaqah',
    description: 'Fund a deep water well in a Muslim village without clean water. Every drop is sadaqah jariyah until the well runs dry.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-kayak', name: 'Kayak for River Relief Access', cost: 36000, category: 'adventure',
    description: 'A sea kayak for a relief team accessing riverside communities where roads do not reach. Water is the other path to those in need.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-umrah-parents', name: 'Umrah for Needy Elderly Muslims', cost: 75000, category: 'adventure',
    description: 'Send elderly Muslims who have never performed Umrah. The best gift is the one that wipes sins and draws them closer to Allah.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-office-prayer-reno', name: 'Office & Prayer Room for Muslim NGO', cost: 45000, category: 'community',
    description: 'Renovate one room for a Muslim organization: workspace and dedicated prayer space. Build and bow in the same room — for the Ummah.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-school-scholarship', name: 'Islamic School Scholarship Fund', cost: 52000, category: 'family',
    description: 'Create scholarships for 5 Muslim students to attend Islamic school. Fund the next generation of knowledge.',
    unlockRank: 'A', rarity: 'mythic',
  },
  {
    id: 'reward-masjid-audio', name: 'Masjid Audio System', cost: 38000, category: 'spiritual',
    description: 'A quality sound system for a masjid: microphones, speakers, receiver. Every prayer heard clearly, every adhan carried to the neighborhood.',
    unlockRank: 'A', rarity: 'legendary',
  },
  {
    id: 'reward-emergency-gold', name: 'Emergency Gold for Disaster Relief Fund', cost: 65000, category: 'wealth',
    description: 'A 30g gold reserve placed in a disaster relief fund. The believer plans. The Khalifa prepares for famine, war, and collapse on behalf of the Ummah.',
    unlockRank: 'A', rarity: 'mythic',
  },

  // ═══════════════════════════════════════
  // S-RANK: Mythic (Build infrastructure, save lives, send souls to Hajj — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-community-ambulance', name: 'Community Ambulance', cost: 800000, category: 'sadaqah',
    description: 'Fund an ambulance for a Muslim community without emergency transport. Between life and death, speed is worship.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-property-down', name: 'Property Down Payment for Waqf Housing', cost: 500000, category: 'sadaqah',
    description: 'A down payment on property to house Muslim families, orphans, or students. Generational wealth begins with dirt that serves the Ummah.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-hajj-package', name: 'Hajj for Needy Muslim Couple', cost: 600000, category: 'adventure',
    description: 'The fifth pillar. Send a poor Muslim couple who have saved their whole lives but still cannot afford it. Carry them to Arafat.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-gold-kilogram', name: 'Gold for Ummah Treasury', cost: 750000, category: 'wealth',
    description: 'One kilogram of pure gold placed in a communal Ummah treasury. The ultimate store of value for the ultimate store of deeds.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-family-estate', name: 'Land for Ummah Community Center', cost: 1000000, category: 'sadaqah',
    description: 'A plot of land for a masjid, school, or orphanage. The Khalifa thinks in generations, not quarterly reports.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-executive-health', name: 'Health Screening for 10 Relief Workers', cost: 300000, category: 'family',
    description: 'Full diagnostics and health screening for 10 volunteers who sacrifice their bodies for the Ummah. You cannot send sick soldiers to the front.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-server-farm', name: 'Server Farm for Ummah Tech Platform', cost: 350000, category: 'tech',
    description: 'A server-grade machine or leased GPU cluster for a Muslim tech platform serving the Ummah globally. Compute for the cause.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-muslim-lands-tour', name: 'Sponsor Muslim Lands Study Tour for Students', cost: 900000, category: 'adventure',
    description: 'A month-long journey through Muslim lands for a group of students. Send them to see the Ummah they will one day serve.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-orphanage-construction', name: 'Orphanage Construction', cost: 1200000, category: 'sadaqah',
    description: 'Build a small orphanage: dormitory, kitchen, classroom, and playground. Be the father to the fatherless.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-renewable-farm', name: 'Renewable Energy Farm for Muslim Village', cost: 1500000, category: 'sadaqah',
    description: 'Fund a real VAWT or solar installation for a Muslim village. Power the Ummah with clean energy. Live the GeoWind mission.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-masjid-donation', name: 'Masjid Construction Donation', cost: 800000, category: 'sadaqah',
    description: 'A major donation toward a masjid or Islamic center. Your name lives in every prayer said inside.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-generational-library', name: 'Public Islamic Library', cost: 450000, category: 'community',
    description: 'Build a dedicated library open to all Muslims: shelves, rare books, Quran stand, reading chairs. Knowledge is inheritance for the Ummah.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-waqf-rental', name: 'Waqf Rental Property for Ummah Income', cost: 2500000, category: 'sadaqah',
    description: 'Buy a rental property whose income funds sadaqah and Ummah projects. The building prays on your behalf through every tenant it serves.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-food-kitchen', name: 'Food Kitchen for Poor Muslims', cost: 600000, category: 'sadaqah',
    description: 'Fund a daily food kitchen serving 100+ poor Muslims. The Khalifa does not eat alone while his people hunger.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-medical-camp', name: 'Medical Camp for Muslims', cost: 400000, category: 'sadaqah',
    description: 'A mobile medical camp serving underserved Muslim communities. Healing is the highest sadaqah.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-education-endowment', name: 'Education Endowment for Orphans', cost: 2000000, category: 'family',
    description: 'A permanent fund for orphans and poor children\'s education. Knowledge is the only inheritance that never depreciates — and the Khalifa gives it freely.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-tech-platform', name: 'Ummah Tech Platform Fund', cost: 1200000, category: 'tech',
    description: 'Capital to launch or scale a platform serving Muslims globally. Build technology that makes the Ummah stronger.',
    unlockRank: 'S', rarity: 'mythic',
  },
  {
    id: 'reward-waqf', name: 'Waqf Property', cost: 5000000, category: 'sadaqah',
    description: 'A permanent charitable endowment: land, building, or farm. Sadaqah jariyah until Judgment Day.',
    unlockRank: 'S', rarity: 'mythic',
  },

  // ═══════════════════════════════════════
  // S-II RANK: Sovereign (Empire-scale Ummah building — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-ummah-housing-complex', name: 'Ummah Housing Complex', cost: 5000000, category: 'sadaqah',
    description: 'Build or buy a multi-unit building for Muslim families. Provide halal housing with dignity.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-factory', name: 'Ummah Manufacturing Unit', cost: 8000000, category: 'sadaqah',
    description: 'Fund a small factory or production unit employing 50+ Muslims. Economic jihad in action.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-hajj-parents-comfort', name: 'Comfortable Hajj for Needy Elderly Couple', cost: 6000000, category: 'adventure',
    description: 'A well-organized Hajj package for an elderly couple with private guide, accessible hotel, and medical support. Carry the weak to the strongest act of worship.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-gold-5kg', name: 'Gold Bullion for Ummah Treasury', cost: 10000000, category: 'wealth',
    description: 'Five kilos of 24-karat gold placed in a communal treasury. The Sovereign\'s reserve ensures the Ummah is never hungry.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-ai-cloud', name: 'Ummah AI Cloud Cluster', cost: 12000000, category: 'tech',
    description: 'A leased AI datacenter cluster for training models that serve Muslims globally. Compute for the Ummah.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-solar-ummah-grid', name: 'Ummah Solar Micro-Grid', cost: 15000000, category: 'sadaqah',
    description: 'Fund a village-scale solar micro-grid serving 1,000+ Muslims. Clean power, clean intentions.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-medical-clinic-boat', name: 'Mobile Medical Clinic Boat', cost: 20000000, category: 'sadaqah',
    description: 'A boat-mounted mobile clinic serving riverside and coastal Muslim communities without road access.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-school', name: 'Ummah School Campus', cost: 25000000, category: 'sadaqah',
    description: 'Build or fully fund a school campus for 500+ Muslim students. Your name etched above the gate.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-family-office', name: 'Family Office Setup for Ummah Wealth Management', cost: 18000000, category: 'wealth',
    description: 'Establish a formal office managing Ummah-bound investments: zakat, sadaqah, waqf, and halal ventures. Manage wealth for the Ummah, not for the self.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-umrah-100', name: 'Umrah for 100 Muslims', cost: 30000000, category: 'adventure',
    description: 'Sponsor Umrah for 100 Muslims who cannot afford it. The Sovereign carries the Ummah to the Haram.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-vawt-park', name: 'VAWT Wind Park', cost: 35000000, category: 'sadaqah',
    description: 'Install a 1MW vertical-axis wind turbine park. Power a Muslim community with renewable energy.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-community-transport', name: 'Community Transport Fleet', cost: 22000000, category: 'sadaqah',
    description: 'A fleet of vans for transporting Muslim students, elderly, and sick to masjid, hospital, and school.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-halal-vc-fund', name: 'Halal VC Fund Seat for Ummah', cost: 40000000, category: 'wealth',
    description: 'A limited-partner seat in a Shariah-compliant venture capital fund. Invest in Muslim founders so they hire your brothers.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-hospital-wing', name: 'Ummah Hospital Wing', cost: 45000000, category: 'sadaqah',
    description: 'Fund a hospital wing or clinic serving poor Muslims. Healing is the highest sadaqah.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-generational-mosque', name: 'Generational Mosque', cost: 50000000, category: 'sadaqah',
    description: 'Build a mosque designed to last 200 years: marble, minaret, madrasa, and community hall.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-sovereign-library', name: 'Sovereign Manuscript Library', cost: 28000000, category: 'community',
    description: 'A climate-controlled library housing rare Islamic manuscripts, first-edition tafsir, and collected works. Open to all scholars.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-tech-academy', name: 'Ummah Tech Academy', cost: 32000000, category: 'tech',
    description: 'Launch a tuition-free tech academy for Muslims. AI, coding, and entrepreneurship. 1,000 graduates per year.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-parents-palace', name: 'Retirement Home for Elderly Muslims', cost: 38000000, category: 'family',
    description: 'A custom-built home for elderly Muslims with gardens, prayer room, and full-time care. Jannah is at their feet — serve them while they are near.',
    unlockRank: 'S_II', rarity: 'mythic',
  },

  // ═══════════════════════════════════════
  // S-III RANK: Divine (Legacy-scale Ummah building — 18 items)
  // ═══════════════════════════════════════
  {
    id: 'reward-ummah-community-center', name: 'Ummah Community Center', cost: 50000000, category: 'sadaqah',
    description: 'A multi-purpose center: masjid, school, clinic, market, and hall. The heart of a Muslim neighborhood.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-university', name: 'Ummah University Endowment', cost: 80000000, category: 'sadaqah',
    description: 'A major endowment for an Islamic university or college. Educate generations until Qiyamah.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-gold-50kg', name: 'Gold Reserve for Ummah Treasury', cost: 100000000, category: 'wealth',
    description: 'Fifty kilos of gold bullion placed in the communal treasury. The Divine treasury ensures the Ummah never wants.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-city', name: 'Ummah Township', cost: 120000000, category: 'sadaqah',
    description: 'Develop a Muslim township: homes, masjid, school, clinic, market, and park. A city built on Tawhid.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-relief-base', name: 'Ummah Relief Coordination Base', cost: 150000000, category: 'sadaqah',
    description: 'A permanent base for coordinating disaster relief, medical camps, and dawah across a region.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-hajj-1000', name: 'Hajj for 1,000 Muslims', cost: 200000000, category: 'adventure',
    description: 'Sponsor Hajj for 1,000 Muslims from poor communities. The Divine carries the Ummah to Arafat.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-bank', name: 'Ummah Microfinance Bank', cost: 250000000, category: 'wealth',
    description: 'Establish a Shariah-compliant microfinance bank serving 100,000+ Muslims. Interest-free dignity.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-renewable-ummah-grid', name: 'Ummah National Grid', cost: 300000000, category: 'wealth',
    description: 'Fund a 100MW renewable energy plant powering an entire Muslim region. Light the Ummah with clean power.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-divine-waqf', name: 'Divine Waqf Empire', cost: 350000000, category: 'sadaqah',
    description: 'A portfolio of waqf properties: farms, schools, clinics, and masjids. Self-sustaining charity forever.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-air-ambulance', name: 'Ummah Air Ambulance', cost: 400000000, category: 'sadaqah',
    description: 'A medical aircraft for emergency evacuation and supply drops in remote Muslim regions. Speed saves lives.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-research-institute', name: 'Ummah Research Institute', cost: 450000000, category: 'tech',
    description: 'An AI and renewable energy research institute employing 500+ Muslim scientists. Innovation for the Ummah.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-divine-museum', name: 'Islamic Heritage Museum', cost: 500000000, category: 'sadaqah',
    description: 'A world-class museum preserving Islamic art, science, and history. Open to all humanity, funded by the Ummah.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-media-empire', name: 'Ummah Media Empire', cost: 200000000, category: 'tech',
    description: 'A global media platform: TV, streaming, publishing. Tell the Ummah\'s story to billions.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-disaster-fleet', name: 'Disaster Relief Vehicle Fleet', cost: 180000000, category: 'sadaqah',
    description: 'A fleet of 20 rugged vehicles for disaster response across Muslim regions. Every journey saves lives.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-housing', name: 'Ummah Housing Foundation', cost: 280000000, category: 'sadaqah',
    description: 'Build 1,000 homes for displaced or poor Muslims. A roof is the first act of humanity.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-divine-tech-unicorn', name: 'Ummah Tech Unicorn Fund', cost: 320000000, category: 'wealth',
    description: 'A major fund to build Muslim-founded tech unicorns. The Divine invests in the future of the Ummah.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-satellite', name: 'Ummah Communications Satellite', cost: 150000000, category: 'tech',
    description: 'Launch a communications satellite serving Muslim remote communities. Reach the unreachable.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-final-waqf', name: 'The Infinite Endowment', cost: 500000000, category: 'sadaqah',
    description: 'A perpetual endowment. Its returns fund education, relief, and dawah forever. Your name lives in every graduate, every healed patient, every prayer.',
    unlockRank: 'S_III', rarity: 'mythic',
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
  const purchaseId = `purchase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newPurchased = [...purchasedItems, { ...item, purchaseId, purchasedAt: new Date().toISOString() }];

  return { success: true, gold: newGold, purchasedItems: newPurchased, message: `Acquired: ${item.name}` };
}
