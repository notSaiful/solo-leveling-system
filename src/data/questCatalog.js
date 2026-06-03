/** ============================================================
 *  SOLO LEVELING QUEST CATALOG
 *  Designed for Guaranteed Success ("Doomed for Success")
 *  ============================================================
 *  Core Philosophy:
 *  1. Micro-habits at low levels (impossible to fail)
 *  2. Progressive overload (habits grow 10-20% per rank)
 *  3. Prayer-anchored timing (attach habits to existing Salah)
 *  4. Never Miss Twice (built into penalty + redemption)
 *  5. Compound growth (money habits stack like interest)
 *  6. Shadow extraction = habit automation (less willpower at high ranks)
 *  ============================================================ */

// ─── RANK CONFIGURATION ───
export const RANK_CONFIG = {
  E: { minLevel: 0,  maxLevel: 10,  title: 'Hunter Candidate', name: 'Al-Bahith', color: 'text-gray-400',  hexColor: '#9ca3af', statPointsPerLevel: 1, dailyQuestsPerPillar: 2, xpMultiplier: 1.0 },
  D: { minLevel: 11, maxLevel: 25, title: 'Hunter',         name: 'Al-Mujahid', color: 'text-cyan-400',  hexColor: '#22d3ee', statPointsPerLevel: 2, dailyQuestsPerPillar: 3, xpMultiplier: 1.3 },
  C: { minLevel: 26, maxLevel: 45, title: 'Elite Hunter',   name: 'Al-Murabit', color: 'text-blue-400',  hexColor: '#60a5fa', statPointsPerLevel: 3, dailyQuestsPerPillar: 3, xpMultiplier: 1.6 },
  B: { minLevel: 46, maxLevel: 70, title: 'Knight',         name: 'Al-Alim', color: 'text-purple-400',hexColor: '#c084fc', statPointsPerLevel: 4, dailyQuestsPerPillar: 4, xpMultiplier: 2.0 },
  A: { minLevel: 71, maxLevel: 99, title: 'General',        name: 'Al-Hadi', color: 'text-orange-400',hexColor: '#fb923c', statPointsPerLevel: 5, dailyQuestsPerPillar: 4, xpMultiplier: 2.5 },
  S: { minLevel: 100,maxLevel: 999,title: 'Monarch',        name: 'Al-Khalifa', color: 'text-yellow-400',hexColor: '#facc15', statPointsPerLevel: 6, dailyQuestsPerPillar: 5, xpMultiplier: 3.0 },
};

export function getRankByLevel(level) {
  for (const [key, config] of Object.entries(RANK_CONFIG)) {
    if (level >= config.minLevel && level <= config.maxLevel) return { key, ...config };
  }
  return { key: 'S', ...RANK_CONFIG.S };
}

// ─── XP CURVE (Generous — "Doomed for Success") ───
export function xpForNextLevel(level) {
  // Base: 100 XP, grows by 12% per level, plateaus nicely
  return Math.floor(100 * Math.pow(1.12, level));
}

export function getEffectiveXp(baseXp, rankKey) {
  return Math.floor(baseXp * RANK_CONFIG[rankKey].xpMultiplier);
}

// ─── DAILY QUEST POOLS BY RANK & PILLAR ───
// Each day, the engine picks N quests from the pool for the user's current rank

export const DAILY_QUEST_POOLS = {
  deen: {
    E: [
      { id: 'd-deen-e-1', title: 'Fajr on Time', description: 'Pray Fajr within 10 min of adhan. The Prophet ﷺ said: "The two sunnah rakahs of Fajr are better than this world and everything in it." Leadership begins with showing up before the sun.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['salah', 'sunnah'] },
      { id: 'd-deen-e-2', title: 'Morning Adhkar', description: 'Say Ayat al-Kursi + 3x Ikhlas/Falaq/Nas after Fajr. The Prophet ﷺ never missed these. Armor for the day ahead.', baseXp: 10, pillar: 'deen', estimatedMinutes: 3, tags: ['adhkar', 'sunnah'] },
      { id: 'd-deen-e-3', title: 'Leadership Seed', description: 'Read or listen to one story for 2 minutes on how the Prophet ﷺ handled pressure. Emulate his character in one decision today.', baseXp: 10, pillar: 'deen', estimatedMinutes: 2, tags: ['seerah', 'leadership'] },
      { id: 'd-deen-e-4', title: 'Evening Adhkar', description: 'Say evening adhkar once after Maghrib or Isha. Protection as taught by the Prophet ﷺ — the Khalifa shields his household at night.', baseXp: 10, pillar: 'deen', estimatedMinutes: 3, tags: ['adhkar', 'evening'] },
      { id: 'd-deen-e-5', title: 'Reflection Before Sleep', description: 'Make specific dua before sleeping + seek forgiveness for any slips in character today. The leader audits himself daily.', baseXp: 10, pillar: 'deen', estimatedMinutes: 2, tags: ['dua', 'istighfar'] },
      { id: 'd-deen-e-6', title: 'All 5 Prayers', description: 'Pray all 5 daily prayers on time (±15 min window). The foundation of the believer — and the foundation of any Ummah you will lead.', baseXp: 20, pillar: 'deen', estimatedMinutes: 30, tags: ['salah', 'core'] },
      { id: 'd-deen-e-7', title: 'Teach One Thing', description: 'Teach one Muslim one thing about Islam today — a verse, a hadith, an adab. Even a small clarification. The Prophet ﷺ said: "Convey from me, even if it is one verse."', baseXp: 12, pillar: 'deen', estimatedMinutes: 5, tags: ['dawah', 'teaching'] },
    ],
    D: [
      { id: 'd-deen-d-1', title: 'Fajr + 2 Sunnah', description: 'Pray Fajr with its 2 Sunnah rakahs. The Prophet ﷺ never abandoned them. Consistency builds public character.', baseXp: 15, pillar: 'deen', estimatedMinutes: 10, tags: ['salah', 'sunnah'] },
      { id: 'd-deen-d-2', title: 'Seerah on Leadership', description: 'Read seerah for 10 minutes after Fajr or Dhuhr. Focus on his leadership and mercy — the patterns you will copy.', baseXp: 15, pillar: 'deen', estimatedMinutes: 10, tags: ['seerah', 'leadership'] },
      { id: 'd-deen-d-3', title: 'Morning Adhkar Complete', description: 'Full morning adhkar: Ayat al-Kursi, 3 Quls, protection duas. The leader is armored before he leaves the door.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['adhkar', 'morning'] },
      { id: 'd-deen-d-4', title: 'One Hadith on Akhlaq', description: 'Read and reflect on one hadith about prophetic character from Riyad as-Salihin. Your character IS your dawah.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['hadith', 'akhlaq'] },
      { id: 'd-deen-d-5', title: 'Dhuhr in Congregation', description: 'Pray Dhuhr in congregation (masjid, home, or work). The Prophet ﷺ said: "Prayer in congregation is 27 times better." Build the community you will lead.', baseXp: 15, pillar: 'deen', estimatedMinutes: 15, tags: ['salah', 'congregation'] },
      { id: 'd-deen-d-6', title: 'Tasbih After Salah', description: 'Say 33x SubhanAllah, Alhamdulillah, Allahu Akbar after each obligatory prayer. The Prophet ﷺ\'s daily fortress of dhikr.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['dhikr', 'post-salah'] },
      { id: 'd-deen-d-7', title: 'Istighfar 100x', description: 'Say Astaghfirullah 100 times. The Prophet ﷺ sought forgiveness 70+ times daily — the leader purifies constantly.', baseXp: 15, pillar: 'deen', estimatedMinutes: 3, tags: ['dhikr', 'istighfar'] },
      { id: 'd-deen-d-8', title: 'Sleep Discipline', description: 'Go to bed within 30 minutes of Isha. Protect your Fajr — the first battle of every day.', baseXp: 15, pillar: 'deen', estimatedMinutes: 0, tags: ['sleep', 'discipline'] },
    ],
    C: [
      { id: 'd-deen-c-1', title: 'Tahajjud Attempt', description: 'Wake up 10 minutes before Fajr for Tahajjud. The Prophet ﷺ called it the prayer of the righteous — and the prayer of the leaders who carry the Ummah.', baseXp: 20, pillar: 'deen', estimatedMinutes: 10, tags: ['tahajjud', 'night'] },
      { id: 'd-deen-c-2', title: 'Seerah on Justice & Mercy', description: 'Study seerah for 20 minutes. Focus on his decisions under pressure — justice, mercy, and how he treated enemies. The Khalifa\'s playbook.', baseXp: 20, pillar: 'deen', estimatedMinutes: 20, tags: ['seerah', 'justice'] },
      { id: 'd-deen-c-3', title: 'Rawatib Prayers', description: 'Pray the 12 rawatib (Sunnah before/after fard) throughout the day. The Prophet ﷺ never left his home except he prayed 12 rakahs — set the standard for your household.', baseXp: 25, pillar: 'deen', estimatedMinutes: 20, tags: ['salah', 'rawatib'] },
      { id: 'd-deen-c-4', title: 'Memorize 1 Verse', description: 'Memorize and review one new verse from a surah you are learning. The word of Allah in your heart is your weapon and your shield.', baseXp: 20, pillar: 'deen', estimatedMinutes: 15, tags: ['hifz', 'quran'] },
      { id: 'd-deen-c-5', title: 'Prophetic Character Check', description: 'Practice one specific prophetic trait today: patience, truthfulness, mercy, or forgiveness. The Khalifate is built on character, not just knowledge.', baseXp: 20, pillar: 'deen', estimatedMinutes: 0, tags: ['character', 'akhlaq'] },
      { id: 'd-deen-c-6', title: 'Dua List', description: 'Make a list of 3 specific duas and make them at the times they are accepted. Lead your family in dua at one of these times today.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['dua', 'intention'] },
      { id: 'd-deen-c-7', title: 'Sadaqah Daily', description: 'Give any amount of sadaqah. The Prophet ﷺ was the most generous — and sadaqah purifies the wealth that will one day fund the Ummah.', baseXp: 15, pillar: 'deen', estimatedMinutes: 2, tags: ['charity', 'sadaqah'] },
      { id: 'd-deen-c-8', title: 'Qaylulah', description: 'Take a 15-20 minute midday nap (Qaylulah) for energy and Sunnah. The leader must be sharp, not exhausted.', baseXp: 10, pillar: 'deen', estimatedMinutes: 20, tags: ['health', 'sunnah'] },
    ],
    B: [
      { id: 'd-deen-b-1', title: 'Tahajjud + Witr', description: 'Pray Tahajjud (minimum 2 rakahs) + Witr before Fajr. The private conversation with Allah that gives public strength.', baseXp: 30, pillar: 'deen', estimatedMinutes: 20, tags: ['tahajjud', 'witr'] },
      { id: 'd-deen-b-2', title: 'Deep Seerah Study', description: 'Study seerah, hadith, or fiqh for 30 minutes. Deepen your understanding of the Prophet ﷺ — depth creates authority.', baseXp: 25, pillar: 'deen', estimatedMinutes: 30, tags: ['seerah', 'deep'] },
      { id: 'd-deen-b-3', title: 'Teach a 10-Minute Lesson', description: 'Teach one Islamic concept to a family member, friend, or online audience for 10 minutes. A Khalifa in training teaches.', baseXp: 25, pillar: 'deen', estimatedMinutes: 10, tags: ['teaching', 'dawah'] },
      { id: 'd-deen-b-4', title: 'Itikaf Micro', description: 'Spend 10 minutes in quiet reflection/dhikr after any prayer. Sit with the Quran even if you don\'t recite — presence over performance.', baseXp: 20, pillar: 'deen', estimatedMinutes: 10, tags: ['dhikr', 'reflection'] },
      { id: 'd-deen-b-5', title: 'Complete Rawatib + Duha', description: 'Pray all 12 rawatib + Duha prayer (Salat al-Ishraq). Set the household rhythm — when you pray, they pray.', baseXp: 30, pillar: 'deen', estimatedMinutes: 25, tags: ['salah', 'nafl'] },
      { id: 'd-deen-b-6', title: 'Fasting Monday/Thursday', description: 'Fast Monday or Thursday (or both). The Sunnah fasts — discipline the body for the Ummah\'s sake.', baseXp: 30, pillar: 'deen', estimatedMinutes: 0, tags: ['fasting', 'sunnah'] },
      { id: 'd-deen-b-7', title: 'Night Adhkar + Wudu Before Bed', description: 'Sleep with wudu and complete night adhkar. End the day armored.', baseXp: 20, pillar: 'deen', estimatedMinutes: 5, tags: ['adhkar', 'wudu'] },
      { id: 'd-deen-b-8', title: 'Record or Post', description: 'Record one short video, post, or message about Islam today. Your voice carries — use it for Tawheed.', baseXp: 25, pillar: 'deen', estimatedMinutes: 15, tags: ['dawah', 'content'] },
    ],
    A: [
      { id: 'd-deen-a-1', title: 'Tahajjud + Dua Marathon', description: 'Pray Tahajjud and make extended dua in sujood (20+ min total). Make dua for the Ummah, for the leadership of this ummah, for Imam Mahdi (AS).', baseXp: 35, pillar: 'deen', estimatedMinutes: 25, tags: ['tahajjud', 'dua'] },
      { id: 'd-deen-a-2', title: 'Scholarly Seerah Study', description: 'Study advanced seerah, hadith, or Islamic texts for 45 minutes. The scholars\' seerah is governance and statecraft — your future curriculum.', baseXp: 30, pillar: 'deen', estimatedMinutes: 45, tags: ['seerah', 'advanced'] },
      { id: 'd-deen-a-3', title: 'Lead Family Prayer or Khutbah', description: 'Lead your family in prayer OR prepare a 5-minute khutbah/lesson. The Khalifa leads before he commands.', baseXp: 35, pillar: 'deen', estimatedMinutes: 15, tags: ['leadership', 'imam'] },
      { id: 'd-deen-a-4', title: 'Formal Mentorship Check-in', description: 'Check in on a younger Muslim or new Muslim you are mentoring. Guide, listen, advise. The Ummah\'s shepherd knows his flock.', baseXp: 30, pillar: 'deen', estimatedMinutes: 15, tags: ['mentorship', 'community'] },
      { id: 'd-deen-a-5', title: 'Complete Juz with Tafsir', description: 'Read or review 1/2 to 1 Juz of Quran with tafsir reflection. Read it as if you will lead with it tomorrow.', baseXp: 30, pillar: 'deen', estimatedMinutes: 45, tags: ['quran', 'tafsir'] },
      { id: 'd-deen-a-6', title: '6 Days of Shawwal / Weekly Fast', description: 'If in Shawwal, fast the 6 days. Otherwise, fast 3 days this week. The body is amanah, the fast is training.', baseXp: 30, pillar: 'deen', estimatedMinutes: 0, tags: ['fasting', 'sunnah'] },
      { id: 'd-deen-a-7', title: 'Muhasabah Deep Review', description: '30-minute self-accountability: review the week, seek forgiveness, plan fixes. The leader audits himself before others do.', baseXp: 25, pillar: 'deen', estimatedMinutes: 30, tags: ['muhasabah', 'review'] },
      { id: 'd-deen-a-8', title: 'Dawah Action', description: 'Share one beneficial Islamic post, video, or message — public dawah. Your public voice shapes the Ummah\'s narrative.', baseXp: 25, pillar: 'deen', estimatedMinutes: 10, tags: ['dawah', 'social'] },
    ],
    S: [
      { id: 'd-deen-s-1', title: "The Monarch's Tahajjud", description: 'Pray Tahajjud with deep focus and extended Quran recitation (30+ min). Make dua for the Ummah by name — the Monarch carries the whole community in his sujood.', baseXp: 40, pillar: 'deen', estimatedMinutes: 35, tags: ['tahajjud', 'master'] },
      { id: 'd-deen-s-2', title: 'Seerah: Statecraft & Governance', description: '1 hour seerah mastery focused on governance — treaties, diplomacy, treaties with non-Muslims, treaties between tribes. The Khalifa\'s MBA.', baseXp: 35, pillar: 'deen', estimatedMinutes: 60, tags: ['seerah', 'governance'] },
      { id: 'd-deen-s-3', title: 'Organize Community Event', description: 'Organize or lead a community halaqa, study circle, or volunteering event. The Monarch creates institutions, not just habits.', baseXp: 40, pillar: 'deen', estimatedMinutes: 60, tags: ['leadership', 'community'] },
      { id: 'd-deen-s-4', title: 'Juz with Tafsir Reflection', description: 'Read 1 Juz with tafsir and write 1-page reflection. Teach it to your family or community within the week.', baseXp: 35, pillar: 'deen', estimatedMinutes: 60, tags: ['quran', 'mastery'] },
      { id: 'd-deen-s-5', title: 'Spiritual Retreat', description: 'Plan or execute a half-day itikaf or spiritual retreat. Recharge the source from which everything else flows.', baseXp: 40, pillar: 'deen', estimatedMinutes: 120, tags: ['itikaf', 'retreat'] },
      { id: 'd-deen-s-6', title: 'Record Legacy Teaching', description: 'Record or write a teaching that can benefit Muslims for generations. The Monarch writes books, not just to-do lists.', baseXp: 35, pillar: 'deen', estimatedMinutes: 45, tags: ['legacy', 'teaching'] },
      { id: 'd-deen-s-7', title: 'Advanced Fasting', description: 'Fast Davidic fast: half the year (alternate days) or 3 days per month. The body is a tool — sharpen it for the Ummah.', baseXp: 40, pillar: 'deen', estimatedMinutes: 0, tags: ['fasting', 'advanced'] },
      { id: 'd-deen-s-8', title: 'Guidance Counsel', description: 'Provide detailed Islamic guidance to someone seeking help — fatwa-level care, even if you refer to a scholar. The Monarch is the first responder of the Ummah.', baseXp: 35, pillar: 'deen', estimatedMinutes: 30, tags: ['counsel', 'community'] },
    ],
  },

  body: {
    E: [
      { id: 'd-body-e-1', title: 'Explore a New Street', description: 'Walk a street in your neighborhood you have never walked before. The Khalifa knows his land before he leads on it.', baseXp: 10, pillar: 'body', estimatedMinutes: 10, tags: ['explore', 'walk'] },
      { id: 'd-body-e-2', title: 'Barefoot on Earth', description: 'Stand barefoot on grass, sand, or soil for 5 minutes. The earth grounds the one who will stand before armies.', baseXp: 10, pillar: 'body', estimatedMinutes: 5, tags: ['grounding', 'nature'] },
      { id: 'd-body-e-3', title: 'Park Visit', description: 'Walk to the nearest park, sit under a tree, and observe for 5 minutes. Awareness begins in stillness.', baseXp: 10, pillar: 'body', estimatedMinutes: 15, tags: ['nature', 'awareness'] },
      { id: 'd-body-e-4', title: 'Stairs Only', description: 'Take the stairs instead of elevators/escalators for one full day. Elevation is earned one step at a time.', baseXp: 10, pillar: 'body', estimatedMinutes: 0, tags: ['elevation', 'discipline'] },
      { id: 'd-body-e-5', title: 'Phone-Free Outdoors', description: 'Spend 10 minutes outside with no phone — only eyes, ears, and breath. The Khalifa commands his attention.', baseXp: 10, pillar: 'body', estimatedMinutes: 10, tags: ['presence', 'mindfulness'] },
      { id: 'd-body-e-6', title: 'Sunset Watch', description: 'Sit outside during Maghrib and watch the sunset in silence. The same sun sets on every Muslim.', baseXp: 15, pillar: 'body', estimatedMinutes: 10, tags: ['sunset', 'reflection'] },
      { id: 'd-body-e-7', title: '2,000 New Steps', description: 'Walk 2,000 steps exploring somewhere you have never been. The Khalifa does not stay home.', baseXp: 10, pillar: 'body', estimatedMinutes: 20, tags: ['explore', 'walk'] },
    ],
    D: [
      { id: 'd-body-d-1', title: 'Nature Walk 20 Min', description: 'Walk 20 minutes on a green route, trail, or riverbank. Nature restores the strategist.', baseXp: 15, pillar: 'body', estimatedMinutes: 20, tags: ['nature', 'walk'] },
      { id: 'd-body-d-2', title: 'Outdoor Sprints', description: 'Sprint 3x50m on grass or open ground. Build the engine that outruns complacency.', baseXp: 15, pillar: 'body', estimatedMinutes: 15, tags: ['sprint', 'power'] },
      { id: 'd-body-d-3', title: 'Weighted Pack Walk', description: 'Walk 15 minutes with a backpack loaded with books or water bottles. The Khalifa trains under load.', baseXp: 15, pillar: 'body', estimatedMinutes: 15, tags: ['loaded', 'endurance'] },
      { id: 'd-body-d-4', title: 'Phone-Free 30 Min', description: 'Spend 30 continuous minutes outside with no phone. Train your senses like your investments.', baseXp: 15, pillar: 'body', estimatedMinutes: 30, tags: ['presence', 'awareness'] },
      { id: 'd-body-d-5', title: 'Balance Practice', description: 'Balance on one leg for 30 seconds each side, 3 rounds. Stability on uneven ground is a Khalifa skill.', baseXp: 15, pillar: 'body', estimatedMinutes: 10, tags: ['balance', 'stability'] },
      { id: 'd-body-d-6', title: '5,000 Step Exploration', description: 'Walk 5,000 steps through a new neighborhood, market, or trail. Map the land with your feet.', baseXp: 15, pillar: 'body', estimatedMinutes: 45, tags: ['explore', 'endurance'] },
      { id: 'd-body-d-7', title: 'Cold Water Exposure', description: 'End your shower with 30 seconds of cold water, or dip your face in cold water outside. The wilderness is not comfortable.', baseXp: 10, pillar: 'body', estimatedMinutes: 0, tags: ['discipline', 'resilience'] },
      { id: 'd-body-d-8', title: 'Outdoor Bodyweight Circuit', description: '10 push-ups, 10 squats, 10 lunges each leg — outdoors. The ground is your gym.', baseXp: 15, pillar: 'body', estimatedMinutes: 10, tags: ['strength', 'outdoor'] },
      { id: 'd-body-d-9', title: 'Night Sky 10 Min', description: 'Spend 10 minutes outside after Isha looking at the stars. The same sky watched the Sahaba.', baseXp: 15, pillar: 'body', estimatedMinutes: 10, tags: ['night', 'wonder'] },
    ],
    C: [
      { id: 'd-body-c-1', title: 'Trail Hike 45 Min', description: 'Hike a local trail, hill, or nature path for 45 minutes. The Khalifa knows terrain.', baseXp: 20, pillar: 'body', estimatedMinutes: 45, tags: ['hike', 'trail'] },
      { id: 'd-body-c-2', title: 'Outdoor Sprint Intervals', description: 'Sprint intervals on grass or trail: 30 sec on, 60 sec rest, 10 rounds. Train where the earth shifts underfoot.', baseXp: 20, pillar: 'body', estimatedMinutes: 25, tags: ['sprint', 'intervals'] },
      { id: 'd-body-c-3', title: 'Night Walk Under Stars', description: 'Walk 20 minutes outside after dark with no flashlight if safe. Let your eyes remember darkness.', baseXp: 20, pillar: 'body', estimatedMinutes: 20, tags: ['night', 'adaptation'] },
      { id: 'd-body-c-4', title: 'Hill Climb', description: 'Find a hill and climb it 3 times. Elevation gain builds the lungs the Ummah will need.', baseXp: 20, pillar: 'body', estimatedMinutes: 30, tags: ['hill', 'climb'] },
      { id: 'd-body-c-5', title: 'Tree or Playground Challenge', description: 'Climb a tree, traverse monkey bars, or scale a playground structure. The body remembers what concrete forgot.', baseXp: 15, pillar: 'body', estimatedMinutes: 15, tags: ['climb', 'play'] },
      { id: 'd-body-c-6', title: 'Creek or Stream Crossing', description: 'Walk barefoot through a shallow creek, stream, or puddle path for 10 minutes. Water teaches humility.', baseXp: 20, pillar: 'body', estimatedMinutes: 15, tags: ['water', 'terrain'] },
      { id: 'd-body-c-7', title: 'Loaded Pack Carry', description: 'Carry a weighted backpack for 20 minutes on uneven ground. The Khalifa carries his own load.', baseXp: 20, pillar: 'body', estimatedMinutes: 20, tags: ['loaded', 'carry'] },
      { id: 'd-body-c-8', title: 'Outdoor Mobility Flow', description: '15 minutes of animal walks, crawling, and hip mobility on grass. Move like you are in the wild.', baseXp: 15, pillar: 'body', estimatedMinutes: 15, tags: ['mobility', 'ground'] },
    ],
    B: [
      { id: 'd-body-b-1', title: '2-Hour Trek', description: 'Hike for 2 hours on trail, hill, or wilderness. The Khalifa endures distance.', baseXp: 30, pillar: 'body', estimatedMinutes: 120, tags: ['trek', 'endurance'] },
      { id: 'd-body-b-2', title: 'Tent or Shelter Setup', description: 'Set up a tent, tarp shelter, or camping hammock in your yard or a park. The Khalifa builds shelter.', baseXp: 25, pillar: 'body', estimatedMinutes: 30, tags: ['shelter', 'prep'] },
      { id: 'd-body-b-3', title: 'Rock Climb or Boulder', description: 'Try bouldering, rock climbing, or scramble up a rocky incline. Conquer vertical ground.', baseXp: 25, pillar: 'body', estimatedMinutes: 45, tags: ['climb', 'vertical'] },
      { id: 'd-body-b-4', title: 'River Crossing Practice', description: 'Walk through shallow water, practice stepping stone crossings, or wade a stream. Water is the other wilderness.', baseXp: 25, pillar: 'body', estimatedMinutes: 30, tags: ['water', 'crossing'] },
      { id: 'd-body-b-5', title: 'Orienteering Walk', description: 'Walk 5km using only a compass and paper map — no GPS. The Khalifa finds his own way.', baseXp: 25, pillar: 'body', estimatedMinutes: 60, tags: ['navigate', 'compass'] },
      { id: 'd-body-b-6', title: 'Hill Sprint Repeats', description: 'Sprint up a hill 5 times. Walk down to recover. The earth fights back — fight harder.', baseXp: 25, pillar: 'body', estimatedMinutes: 30, tags: ['sprint', 'hill'] },
      { id: 'd-body-b-7', title: 'Wilderness Navigation', description: 'Navigate to a landmark 3km away using only cardinal directions and landmarks. No GPS. Trust your senses.', baseXp: 20, pillar: 'body', estimatedMinutes: 45, tags: ['navigate', 'wilderness'] },
      { id: 'd-body-b-8', title: 'Outdoor Circuit Challenge', description: 'Push-ups, squats, lunges, and planks on uneven ground for 20 minutes. The ground is never flat in nature.', baseXp: 20, pillar: 'body', estimatedMinutes: 20, tags: ['circuit', 'outdoor'] },
    ],
    A: [
      { id: 'd-body-a-1', title: 'Half-Day Trek', description: 'Trek for 4+ hours on mountain, forest, or coastal trail. The expedition leader outlasts the terrain.', baseXp: 35, pillar: 'body', estimatedMinutes: 240, tags: ['trek', 'expedition'] },
      { id: 'd-body-a-2', title: 'Solo Sunrise Hike', description: 'Hike to a summit or viewpoint alone for Fajr or sunrise. The Khalifa greets the dawn from elevation.', baseXp: 30, pillar: 'body', estimatedMinutes: 180, tags: ['sunrise', 'solo'] },
      { id: 'd-body-a-3', title: 'Lead a Group Hike', description: 'Lead 2+ people on a 3+ hour hike. The Khalifa walks first and checks on everyone behind him.', baseXp: 30, pillar: 'body', estimatedMinutes: 180, tags: ['lead', 'group'] },
      { id: 'd-body-a-4', title: 'Wilderness Survival Skill', description: 'Practice one survival skill: fire-starting, water purification, shelter building, or knot tying. Be ready.', baseXp: 35, pillar: 'body', estimatedMinutes: 60, tags: ['survival', 'skill'] },
      { id: 'd-body-a-5', title: 'Mountain Trail Run', description: 'Run or fast-hike a mountain trail. The Khalifa moves fast over rough ground.', baseXp: 25, pillar: 'body', estimatedMinutes: 90, tags: ['run', 'mountain'] },
      { id: 'd-body-a-6', title: 'Teach Outdoor Skills', description: 'Teach one person how to read a map, start a fire, or pack for a hike. Multiply the explorers.', baseXp: 30, pillar: 'body', estimatedMinutes: 60, tags: ['teach', 'outdoor'] },
      { id: 'd-body-a-7', title: 'Overnight Camping Prep', description: 'Plan and pack for an overnight camping trip: gear, route, food, safety. Preparation is power.', baseXp: 30, pillar: 'body', estimatedMinutes: 45, tags: ['plan', 'camp'] },
      { id: 'd-body-a-8', title: 'Multi-Terrain Challenge', description: 'In one session: hike, climb, wade water, and sprint. The Khalifa adapts to any ground.', baseXp: 25, pillar: 'body', estimatedMinutes: 90, tags: ['challenge', 'terrain'] },
    ],
    S: [
      { id: 'd-body-s-1', title: "The Monarch's Expedition", description: 'Complete a full-day expedition: 8+ hours of trekking, climbing, and navigation. The Monarch conquers the earth.', baseXp: 40, pillar: 'body', estimatedMinutes: 480, tags: ['expedition', 'master'] },
      { id: 'd-body-s-2', title: 'Multi-Day Trek Plan', description: 'Plan, pack for, and execute a multi-day trek or camping trip. The Monarch thinks in days, not hours.', baseXp: 35, pillar: 'body', estimatedMinutes: 120, tags: ['plan', 'trek'] },
      { id: 'd-body-s-3', title: 'Teach Wilderness Leadership', description: 'Teach 2+ people advanced outdoor skills: navigation, survival, risk assessment. Raise the next generation.', baseXp: 40, pillar: 'body', estimatedMinutes: 120, tags: ['teach', 'leadership'] },
      { id: 'd-body-s-4', title: 'Summit Challenge', description: 'Reach the summit of a significant peak or complete a major trail. The view is earned, not given.', baseXp: 40, pillar: 'body', estimatedMinutes: 360, tags: ['summit', 'peak'] },
      { id: 'd-body-s-5', title: 'Solo Wilderness Navigation', description: 'Navigate 10+ km through wilderness using only map and compass. No GPS. The Monarch trusts his training.', baseXp: 35, pillar: 'body', estimatedMinutes: 240, tags: ['solo', 'navigate'] },
      { id: 'd-body-s-6', title: 'Lead Expedition Group', description: 'Lead a group of 3+ on a full-day outdoor expedition. The Monarch carries responsibility across terrain.', baseXp: 35, pillar: 'body', estimatedMinutes: 480, tags: ['lead', 'expedition'] },
      { id: 'd-body-s-7', title: 'Extreme Terrain Day', description: 'Cross multiple extreme terrain types in one day: rock, water, dense brush, elevation. No ground is foreign.', baseXp: 30, pillar: 'body', estimatedMinutes: 360, tags: ['extreme', 'terrain'] },
      { id: 'd-body-s-8', title: 'Physical Discipline Master', description: 'Maintain perfect movement discipline across any terrain: no shortcuts, no complaints, full awareness. The Khalifate begins in the body.', baseXp: 35, pillar: 'body', estimatedMinutes: 120, tags: ['discipline', 'master'] },
    ],
  },

  money: {
    E: [
      { id: 'd-money-e-1', title: 'Study One AI Concept', description: 'Study one AI concept for 30 min — neural nets, transformers, or LLMs. AI mastery is the weapon. Wealth that serves the Ummah must be built on understanding, not syntax.', baseXp: 15, pillar: 'money', estimatedMinutes: 30, tags: ['ai', 'learning'] },
      { id: 'd-money-e-2', title: 'Master One AI Tool', description: 'Use one AI tool (Claude, ChatGPT, Perplexity, etc.) to complete a real task today — draft, research, analyze, or automate. High-leverage tools are the Khalifate\'s modern weapons.', baseXp: 15, pillar: 'money', estimatedMinutes: 20, tags: ['ai', 'tools'] },
      { id: 'd-money-e-3', title: 'Track Every Expense', description: 'Write down every rupee spent today. The Khalifa who funds the Ummah must first know his own flows.', baseXp: 10, pillar: 'money', estimatedMinutes: 5, tags: ['discipline', 'tracking'] },
      { id: 'd-money-e-4', title: 'Read One Page of AI Book', description: 'Read one page of an AI/ML book. Knowledge compounds. The Khalifate\'s currency is expertise.', baseXp: 10, pillar: 'money', estimatedMinutes: 5, tags: ['ai', 'learning'] },
      { id: 'd-money-e-5', title: 'Follow One AI Researcher', description: 'Follow one AI researcher on X, YouTube, or Substack today. Build the network of the Ummah\'s future AI leadership.', baseXp: 10, pillar: 'money', estimatedMinutes: 5, tags: ['ai', 'network'] },
      { id: 'd-money-e-6', title: '1 Rupee Sadaqah', description: 'Give sadaqah, even 1 rupee. The habit of giving is the foundation of the Ummah Treasury.', baseXp: 10, pillar: 'money', estimatedMinutes: 1, tags: ['charity', 'sadaqah'] },
      { id: 'd-money-e-7', title: 'No Impulse Buy', description: 'Resist one impulse purchase. Redirect that money to your future and the Ummah\'s future.', baseXp: 10, pillar: 'money', estimatedMinutes: 0, tags: ['discipline', 'spending'] },
    ],
    D: [
      { id: 'd-money-d-1', title: 'Validate One AI Business Idea', description: 'Research and validate one AI-powered business or income idea. Talk to one potential user, define the offer, and outline how AI tools deliver the result. No code needed — only clarity and market fit.', baseXp: 20, pillar: 'money', estimatedMinutes: 60, tags: ['ai', 'business'] },
      { id: 'd-money-d-2', title: 'Study One AI Paper/Blog', description: 'Read one AI paper, blog, or tutorial. Stay sharp. The Khalifate\'s edge comes from knowledge, not guessing.', baseXp: 15, pillar: 'money', estimatedMinutes: 30, tags: ['ai', 'research'] },
      { id: 'd-money-d-3', title: 'Study One AI Workflow', description: 'Spend 30 min learning one high-leverage AI workflow — content creation at scale, automated research, AI-assisted sales, or no-code automation. The Khalifa masters tools, not syntax.', baseXp: 15, pillar: 'money', estimatedMinutes: 30, tags: ['ai', 'workflow'] },
      { id: 'd-money-d-4', title: 'Save 10%', description: 'Save 10% of today\'s income before spending anything. Pay yourself first — and the Ummah second.', baseXp: 15, pillar: 'money', estimatedMinutes: 5, tags: ['saving', 'habit'] },
      { id: 'd-money-d-5', title: 'Build AI-Assisted Asset', description: 'Create one income-generating asset using AI tools — a content piece, a template, a sales deck, or an automated system. Ship it. Assets build empires; code is optional.', baseXp: 20, pillar: 'money', estimatedMinutes: 45, tags: ['ai', 'asset'] },
      { id: 'd-money-d-6', title: 'Open a Brokerage', description: 'Open a Demat or brokerage account. The Khalifate\'s wealth is built on halal infrastructure.', baseXp: 15, pillar: 'money', estimatedMinutes: 15, tags: ['infrastructure', 'investing'] },
      { id: 'd-money-d-7', title: 'Cut One Waste', description: 'Cancel one unused subscription or expense. Redirect to investments that fund the Ummah.', baseXp: 15, pillar: 'money', estimatedMinutes: 5, tags: ['saving', 'optimization'] },
      { id: 'd-money-d-8', title: 'Halal Income Check', description: 'Review income sources. Ensure every rupee is halal and blessed — the Khalifate\'s foundation is purity.', baseXp: 15, pillar: 'money', estimatedMinutes: 10, tags: ['halal', 'ethics'] },
    ],
    C: [
      { id: 'd-money-c-1', title: 'Launch One AI-Powered Offer', description: 'Launch a service, product, or offer that uses AI tools to deliver results. Get it in front of one real user or customer. The Khalifate ships offers, not repositories.', baseXp: 25, pillar: 'money', estimatedMinutes: 60, tags: ['ai', 'offer'] },
      { id: 'd-money-c-2', title: 'AI Side Hustle', description: 'Work on your AI side income for 30 min — freelance, gig, or product. Build the empire after hours.', baseXp: 20, pillar: 'money', estimatedMinutes: 30, tags: ['ai', 'sidehustle'] },
      { id: 'd-money-c-3', title: 'Zero-Based Budget with AI Income', description: 'Assign every rupee a job. Project your AI income 3 months forward. The Khalifate plans, then executes.', baseXp: 20, pillar: 'money', estimatedMinutes: 15, tags: ['budget', 'planning'] },
      { id: 'd-money-c-4', title: 'Portfolio Review', description: 'Review your investment portfolio. Rebalance toward halal, productive assets that build the Ummah.', baseXp: 20, pillar: 'money', estimatedMinutes: 20, tags: ['review', 'management'] },
      { id: 'd-money-c-5', title: 'Avoid Riba Check', description: 'Review one financial product for riba. Purify your wealth — the Khalifate\'s money is halal or it is nothing.', baseXp: 20, pillar: 'money', estimatedMinutes: 10, tags: ['halal', 'purification'] },
      { id: 'd-money-c-6', title: 'Sadaqah Jariyah', description: 'Contribute to a sadaqah jariyah project: education, water, or mosque. Wealth that benefits you in the akhira.', baseXp: 20, pillar: 'money', estimatedMinutes: 10, tags: ['charity', 'legacy'] },
      { id: 'd-money-c-7', title: 'Financial Research', description: 'Read and analyze one annual report, market update, or business case. The Khalifa studies the battlefield.', baseXp: 20, pillar: 'money', estimatedMinutes: 30, tags: ['research', 'learning'] },
      { id: 'd-money-c-8', title: 'Negotiate or Optimize', description: 'Negotiate a bill, ask for a raise, or find a better deal. Every saved rupee is a rupee for the Ummah.', baseXp: 20, pillar: 'money', estimatedMinutes: 15, tags: ['negotiation', 'saving'] },
    ],
    B: [
      { id: 'd-money-b-1', title: 'Scale AI Product/Service', description: 'Take one AI product/service to its next stage. New feature, new customer, new market. The Khalifate scales.', baseXp: 30, pillar: 'money', estimatedMinutes: 60, tags: ['ai', 'scale'] },
      { id: 'd-money-b-2', title: 'Teach One AI Concept', description: 'Teach one AI concept to someone — a friend, a class, a video. The Khalifate multiplies through teaching.', baseXp: 25, pillar: 'money', estimatedMinutes: 15, tags: ['ai', 'teaching'] },
      { id: 'd-money-b-3', title: 'Deep Work: AI Hour', description: 'One hour of uninterrupted AI/wealth-building work. No meetings. No distractions. The Khalifate is forged in deep work.', baseXp: 25, pillar: 'money', estimatedMinutes: 60, tags: ['ai', 'deepwork'] },
      { id: 'd-money-b-4', title: 'Zakat Calculation', description: 'Calculate your zakat obligation. Pay it on time. The Khalifate\'s first debt is to Allah and the Ummah.', baseXp: 30, pillar: 'money', estimatedMinutes: 20, tags: ['zakat', 'obligation'] },
      { id: 'd-money-b-5', title: 'Business Validation', description: 'Validate a business or AI idea by talking to one real user or customer. Ship or kill — the Khalifate is decisive.', baseXp: 25, pillar: 'money', estimatedMinutes: 20, tags: ['business', 'validation'] },
      { id: 'd-money-b-6', title: 'Automate Wealth', description: 'Set up automatic transfers to savings, investments, and sadaqah. The Khalifate runs on systems, not on memory.', baseXp: 25, pillar: 'money', estimatedMinutes: 15, tags: ['automation', 'saving'] },
      { id: 'd-money-b-7', title: 'Income Stream Expansion', description: 'Launch or grow an income stream: business, investment, or AI skill monetization. One stream is fragile. Many are Khalifate.', baseXp: 30, pillar: 'money', estimatedMinutes: 45, tags: ['income', 'growth'] },
      { id: 'd-money-b-8', title: 'Wealth Purification', description: 'Identify and eliminate one haram income source or expense. Cleanse the wealth that will fund the Ummah.', baseXp: 30, pillar: 'money', estimatedMinutes: 15, tags: ['halal', 'purification'] },
    ],
    A: [
      { id: 'd-money-a-1', title: 'Launch or Scale AI Business', description: 'Take a major action to launch or scale your AI business. Move fast — the Ummah needs the products now.', baseXp: 35, pillar: 'money', estimatedMinutes: 60, tags: ['ai', 'business'] },
      { id: 'd-money-a-2', title: 'Mentor in AI/Wealth', description: 'Mentor a younger person in AI, business, or financial strategy. The Khalifate multiplies itself through mentees.', baseXp: 30, pillar: 'money', estimatedMinutes: 30, tags: ['mentorship', 'community'] },
      { id: 'd-money-a-3', title: 'Strategic Charity', description: 'Plan and execute strategic charity that multiplies impact — endowments, education funds, mosque projects. Systems, not donations.', baseXp: 30, pillar: 'money', estimatedMinutes: 20, tags: ['charity', 'strategy'] },
      { id: 'd-money-a-4', title: 'Network in AI/Tech', description: 'Attend or host a business or AI event. Build relationships that compound into Khalifate-scale partnerships.', baseXp: 30, pillar: 'money', estimatedMinutes: 60, tags: ['network', 'growth'] },
      { id: 'd-money-a-5', title: 'Advanced Financial Structures', description: 'Research or build advanced structures: trust, tax optimization, estate plan. The Khalifate\'s wealth must survive generations.', baseXp: 35, pillar: 'money', estimatedMinutes: 45, tags: ['structure', 'advanced'] },
      { id: 'd-money-a-6', title: 'FI Check', description: 'Calculate your Financial Independence number. Update your plan to reach it via AI-powered income. The Khalifate targets FI early.', baseXp: 30, pillar: 'money', estimatedMinutes: 30, tags: ['fi', 'planning'] },
      { id: 'd-money-a-7', title: 'Portfolio Deep Analysis', description: 'Analyze your full portfolio: AI ventures, stocks, business, real estate. Cut weak performers; double down on the halal empire.', baseXp: 35, pillar: 'money', estimatedMinutes: 45, tags: ['analysis', 'investing'] },
      { id: 'd-money-a-8', title: 'Ummah Impact with Wealth', description: 'Build or fund a project that serves the ummah through AI or wealth. The Khalifate\'s wealth is a tool for impact.', baseXp: 35, pillar: 'money', estimatedMinutes: 30, tags: ['ummah', 'impact'] },
    ],
    S: [
      { id: 'd-money-s-1', title: 'Manage AI Empire', description: 'Manage a diversified AI/wealth empire: AI products, investments, automated income. The Khalifate runs many streams at once.', baseXp: 40, pillar: 'money', estimatedMinutes: 60, tags: ['ai', 'empire'] },
      { id: 'd-money-s-2', title: 'Empire Strategic Action', description: 'Take a major strategic action: acquisition, partnership, or new market entry. The Khalifate moves in decisive leaps.', baseXp: 40, pillar: 'money', estimatedMinutes: 90, tags: ['business', 'empire'] },
      { id: 'd-money-s-3', title: 'Generational Wealth Plan', description: 'Create or update a 100-year generational wealth plan. Trusts, wasiyyah, family governance. The Khalifate thinks in centuries.', baseXp: 35, pillar: 'money', estimatedMinutes: 45, tags: ['legacy', 'wealth'] },
      { id: 'd-money-s-4', title: 'Establish Ummah Fund', description: 'Establish or grow an Ummah Fund powered by AI revenue. Be the one who carries the burden when no one else will.', baseXp: 40, pillar: 'money', estimatedMinutes: 60, tags: ['ummah', 'fund'] },
      { id: 'd-money-s-5', title: 'Teach AI Wealth Course', description: 'Create or teach a course on AI, business, or financial strategy. Multiply the Khalifate through knowledge transfer.', baseXp: 35, pillar: 'money', estimatedMinutes: 60, tags: ['teaching', 'legacy'] },
      { id: 'd-money-s-6', title: 'Strategic Partnership', description: 'Form a strategic business or AI partnership. Barakah through trust, profit through excellence.', baseXp: 35, pillar: 'money', estimatedMinutes: 60, tags: ['partnership', 'growth'] },
      { id: 'd-money-s-7', title: '100% Shariah Audit', description: 'Full audit of all income, expenses, and investments. 100% Shariah compliance — the Khalifate\'s money is as clean as his prayer.', baseXp: 40, pillar: 'money', estimatedMinutes: 60, tags: ['halal', 'audit'] },
      { id: 'd-money-s-8', title: "The Monarch's Giving", description: 'Give charity that genuinely transforms lives — endow a school, fund an AI training program for Muslims, or build a mosque. Aim for sadaqah jariyah that outlasts you.', baseXp: 40, pillar: 'money', estimatedMinutes: 30, tags: ['charity', 'master'] },
    ],
  },
};

// ─── LEVEL-SPECIFIC QUESTS (One-time, major milestones) ───
// These are the "Story Quests" of the system. Each level unlocks one.

export const LEVEL_QUESTS = [
  // ═══════════════════════════════════════
  // E-RANK: THE AWAKENING (Levels 0-10)
  // ═══════════════════════════════════════
  {
    level: 1, rank: 'E', title: 'The Khalifa Awakens',
    description: 'You have been chosen. The Khalifate begins with a single step: prayer, push-up, and a line of code.',
    quests: [
      { id: 'lq-e-1-1', title: 'First Prayer on Time', description: 'Pray one salah exactly on time today. This is your first awakening — the leader begins with salah.', xp: 50, pillar: 'deen' },
      { id: 'lq-e-1-2', title: 'Body Activation', description: 'Walk 1,000 steps on a new route and spend 5 minutes barefoot on grass or soil. The adventurer\'s body begins with the earth.', xp: 30, pillar: 'body' },
      { id: 'lq-e-1-3', title: 'First AI Tool Mastery', description: 'Use an AI tool to complete one real money-making or productivity task — draft a pitch, research a market, analyze a stock, or automate a workflow. High-leverage tools are the Khalifate\'s weapon.', xp: 30, pillar: 'money' },
    ],
    reward: { gold: 50, statPoints: 1, message: 'The System has recognized you. Welcome, Seeker. The Khalifate is forged.' },
  },
  {
    level: 2, rank: 'E', title: 'The Seeker\'s Vow',
    description: 'Commit to the path. Consistency is the seed of all greatness.',
    quests: [
      { id: 'lq-e-2-1', title: '3-Day Prayer Streak', description: 'Pray all 5 prayers on time for 3 consecutive days.', xp: 60, pillar: 'deen' },
      { id: 'lq-e-2-2', title: 'Movement Habit', description: 'Walk or explore outdoors 10 minutes every day for 3 days.', xp: 40, pillar: 'body' },
      { id: 'lq-e-2-3', title: 'AI Learning Streak', description: 'Study one AI concept (15 min) every day for 3 days. The Khalifate learns daily.', xp: 40, pillar: 'money' },
    ],
    reward: { gold: 60, statPoints: 1, message: 'Your vow has been recorded. The System watches.' },
  },
  {
    level: 3, rank: 'E', title: 'Morning Barakah',
    description: 'The Prophet ﷺ said: "O Allah, bless my Ummah in their early mornings."',
    quests: [
      { id: 'lq-e-3-1', title: 'Fajr Warrior', description: 'Pray Fajr on time and stay awake for 30 minutes for 5 days.', xp: 70, pillar: 'deen' },
      { id: 'lq-e-3-2', title: 'Hydration Discipline', description: 'Drink 1L of water every day for 5 days.', xp: 50, pillar: 'body' },
      { id: 'lq-e-3-3', title: 'No Impulse Week', description: 'No impulse purchases for 7 days. Discipline in money = discipline in Khalifate.', xp: 50, pillar: 'money' },
    ],
    reward: { gold: 70, statPoints: 1, message: 'Barakah flows in your mornings.' },
  },
  {
    level: 4, rank: 'E', title: 'The First Shadow',
    description: 'Your first habit is becoming automatic. This is your first Shadow extraction.',
    quests: [
      { id: 'lq-e-4-1', title: 'Dhikr Habit', description: 'Complete morning adhkar for 7 consecutive days.', xp: 80, pillar: 'deen' },
      { id: 'lq-e-4-2', title: 'Strength Seed', description: 'Walk outside every day for 7 days (minimum 10 min). The Khalifa\'s feet know the land before his hands build on it.', xp: 60, pillar: 'body' },
      { id: 'lq-e-4-3', title: 'Sadaqah Seed', description: 'Give sadaqah every day for 7 days, even 1 rupee. The Ummah Treasury is seeded one rupee at a time.', xp: 60, pillar: 'money' },
    ],
    reward: { gold: 80, statPoints: 1, shadowUnlock: 'basic-dhikr', message: 'Your first Shadow has been extracted. "Arise."' },
  },
  {
    level: 5, rank: 'E', title: "The Aspirant's Trial",
    description: 'Push beyond your limits. The Khalifate is forged in sustained effort, not in sprints.',
    quests: [
      { id: 'lq-e-5-1', title: 'Quran Consistency', description: 'Read Quran for 5 minutes every day for 10 days.', xp: 90, pillar: 'deen' },
      { id: 'lq-e-5-2', title: 'Sleep Discipline', description: 'Sleep by 10:30pm every night for 10 days. Protect your Fajr and your recovery.', xp: 70, pillar: 'body' },
      { id: 'lq-e-5-3', title: 'AI Study Sprint', description: 'Study one AI/ML book or course for 15 min/day for 10 days. Knowledge is the Khalifate\'s ammunition.', xp: 70, pillar: 'money' },
    ],
    reward: { gold: 100, statPoints: 2, message: 'You have survived the Aspirant\'s Trial. You are ready for D-Rank.' },
  },
  {
    level: 6, rank: 'E', title: 'The Habit Forge',
    description: 'Habits are forged in repetition. Your will is the hammer.',
    quests: [
      { id: 'lq-e-6-1', title: 'All Prayers Week', description: 'All 5 prayers on time for 7 consecutive days.', xp: 100, pillar: 'deen' },
      { id: 'lq-e-6-2', title: 'Movement Mastery', description: '30 minutes of outdoor movement (walk, explore, or climb) every day for 7 days.', xp: 80, pillar: 'body' },
      { id: 'lq-e-6-3', title: 'Spending Awareness', description: 'Categorize all expenses for 7 days.', xp: 80, pillar: 'money' },
    ],
    reward: { gold: 100, statPoints: 1, message: 'Your habits are being forged in fire.' },
  },
  {
    level: 7, rank: 'E', title: 'The Disciple',
    description: 'Seek knowledge. The ink of the scholar is holier than the blood of the martyr.',
    quests: [
      { id: 'lq-e-7-1', title: 'Hadith Study', description: 'Read and reflect on 5 hadith from Riyad as-Salihin.', xp: 100, pillar: 'deen' },
      { id: 'lq-e-7-2', title: 'Nutrition Awareness', description: 'Eat only home-cooked food for 5 days.', xp: 80, pillar: 'body' },
      { id: 'lq-e-7-3', title: 'Skill Identification', description: 'Identify and write a plan for learning one high-income skill.', xp: 80, pillar: 'money' },
    ],
    reward: { gold: 110, statPoints: 1, message: 'Knowledge is your weapon. Sharpen it daily.' },
  },
  {
    level: 8, rank: 'E', title: 'The Streak Keeper',
    description: 'Never miss twice. This is the secret of the strong.',
    quests: [
      { id: 'lq-e-8-1', title: '14-Day Deen Streak', description: 'Complete all daily Deen quests for 14 days.', xp: 120, pillar: 'deen' },
      { id: 'lq-e-8-2', title: '14-Day Body Streak', description: 'Complete all daily Body quests for 14 days.', xp: 100, pillar: 'body' },
      { id: 'lq-e-8-3', title: '14-Day Money Streak', description: 'Complete all daily Money quests for 14 days.', xp: 100, pillar: 'money' },
    ],
    reward: { gold: 120, statPoints: 2, message: 'Streaks are proof of your discipline. Keep them alive.' },
  },
  {
    level: 9, rank: 'E', title: 'The Prepared',
    description: 'You are nearly ready to ascend. Final preparations.',
    quests: [
      { id: 'lq-e-9-1', title: 'Evening Adhkar Mastery', description: 'Complete evening adhkar for 14 consecutive days.', xp: 120, pillar: 'deen' },
      { id: 'lq-e-9-2', title: 'Early Sleep Mastery', description: 'Sleep by 10:00pm for 14 days.', xp: 100, pillar: 'body' },
      { id: 'lq-e-9-3', title: 'Budget Creation', description: 'Create a simple monthly budget.', xp: 100, pillar: 'money' },
    ],
    reward: { gold: 130, statPoints: 1, message: 'You are prepared. The ascension awaits.' },
  },
  {
    level: 10, rank: 'E', title: "The Apprentice's Oath",
    description: 'You have proven yourself. The Khalifate begins. First AI project deployment is mandatory.',
    quests: [
      { id: 'lq-e-10-1', title: 'The 21-Day Challenge', description: 'Complete ALL daily quests across all pillars for 21 consecutive days.', xp: 200, pillar: 'deen' },
      { id: 'lq-e-10-2', title: 'Physical Test', description: 'Walk 5,000 steps on uneven ground, climb one set of stairs 10 times, and spend 15 minutes outside without a phone.', xp: 150, pillar: 'body' },
      { id: 'lq-e-10-3', title: 'Launch First AI-Assisted Service', description: 'Offer a service or product powered by AI tools to one real person — even a friend — and deliver results. Shipping value is the Khalifate\'s first weapon.', xp: 200, pillar: 'money' },
    ],
    reward: { gold: 200, statPoints: 3, rankUp: 'D', message: 'RANK UP! You are now a D-Rank Apprentice. The Khalifate begins.' },
  },

  // ═══════════════════════════════════════
  // D-RANK: THE HUNTER (Levels 11-25)
  // ═══════════════════════════════════════
  {
    level: 12, rank: 'D', title: 'The Devotee\'s Path',
    description: 'Choose your specialization within Deen. The path splits here.',
    quests: [
      { id: 'lq-d-12-1', title: 'Quran Deep Dive', description: 'Study tafsir of Surah Al-Fatiha and first 5 verses of Al-Baqarah.', xp: 150, pillar: 'deen' },
      { id: 'lq-d-12-2', title: 'Character Focus', description: 'Practice patience for 7 days. Document one test and how you passed it.', xp: 120, pillar: 'deen' },
      { id: 'lq-d-12-3', title: 'Night Prayer', description: 'Wake up 10 minutes before Fajr for extra dhikr or Tahajjud for 7 days.', xp: 120, pillar: 'deen' },
    ],
    reward: { gold: 150, statPoints: 2, shadowUnlock: 'devotee-path', message: 'The Devotee\'s Path is open to you.' },
  },
  {
    level: 14, rank: 'D', title: 'The Warrior\'s Body',
    description: 'Your body is an amanah. Strengthen it as the strong believer is better.',
    quests: [
      { id: 'lq-d-14-1', title: '30-Day Outdoor Discipline', description: 'Spend 30 minutes outside every day for 30 days: walk, hike, climb, or explore. Minimum 30 min/day.', xp: 180, pillar: 'body' },
      { id: 'lq-d-14-2', title: 'Nutrition Overhaul', description: 'Eat clean (no processed food) for 14 days.', xp: 150, pillar: 'body' },
      { id: 'lq-d-14-3', title: 'Sleep Mastery', description: 'Sleep by 9:30pm and wake without alarm for 14 days.', xp: 150, pillar: 'body' },
    ],
    reward: { gold: 180, statPoints: 2, shadowUnlock: 'warrior-body', message: 'The Warrior\'s Body is forged.' },
  },
  {
    level: 15, rank: 'D', title: "The Architect's Mind",
    description: 'Wealth is a tool. AI mastery is the weapon. Build your first real AI-assisted business system for the Ummah.',
    quests: [
      { id: 'lq-d-15-1', title: 'Build First AI-Assisted Business System', description: 'Build a complete business system using no-code AI tools — funnel, content pipeline, or automated outreach. This is your Khalifate\'s first operational tool.', xp: 200, pillar: 'money' },
      { id: 'lq-d-15-2', title: 'Skill Investment', description: 'Invest in a course or book for your high-income AI skill. The Khalifate\'s edge is expertise.', xp: 150, pillar: 'money' },
      { id: 'lq-d-15-3', title: 'Sadaqah System', description: 'Set up automatic sadaqah (even 100 rupees/month). The Khalifate\'s first system is giving.', xp: 150, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, jobChange: 'architect', message: 'JOB CHANGE: You are now an Architect. The Khalifate\'s first structure stands.' },
  },
  {
    level: 17, rank: 'D', title: 'The Consistent',
    description: 'Consistency is the mark of the serious. Amateurs practice until they get it right. Professionals practice until they cannot get it wrong.',
    quests: [
      { id: 'lq-d-17-1', title: '30-Day Deen Streak', description: 'Complete daily Deen quests for 30 days.', xp: 200, pillar: 'deen' },
      { id: 'lq-d-17-2', title: '30-Day Body Streak', description: 'Complete daily Body quests for 30 days.', xp: 180, pillar: 'body' },
      { id: 'lq-d-17-3', title: '30-Day Money Streak', description: 'Complete daily Money quests for 30 days.', xp: 180, pillar: 'money' },
    ],
    reward: { gold: 200, statPoints: 2, message: 'Consistency is your superpower.' },
  },
  {
    level: 20, rank: 'D', title: 'Shadow Extraction: Elite',
    description: 'Your habits are becoming automatic. The System extracts an Elite Shadow.',
    quests: [
      { id: 'lq-d-20-1', title: 'Habit Stack', description: 'Attach one new habit to an existing prayer habit. Do it for 21 days.', xp: 200, pillar: 'deen' },
      { id: 'lq-d-20-2', title: 'Morning Routine Lock', description: 'Execute a complete morning routine (Fajr → Adhkar → Quran → Outdoor Movement) for 21 days.', xp: 200, pillar: 'body' },
      { id: 'lq-d-20-3', title: 'Financial Automation', description: 'Automate savings, investments, and sadaqah.', xp: 200, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, shadowUnlock: 'elite-habit-stack', message: 'Elite Shadow extracted. Your habits now fight for you.' },
  },
  {
    level: 22, rank: 'D', title: 'The Specialized',
    description: 'You are no longer a generalist. Specialization creates mastery.',
    quests: [
      { id: 'lq-d-22-1', title: 'Deen Specialization', description: 'Choose one Islamic science (fiqh, tafsir, hadith, seerah) and study it for 30 days.', xp: 220, pillar: 'deen' },
      { id: 'lq-d-22-2', title: 'Body Specialization', description: 'Choose one outdoor domain (hiking, navigation, climbing, or endurance) and focus for 30 days.', xp: 200, pillar: 'body' },
      { id: 'lq-d-22-3', title: 'Money Specialization', description: 'Choose one wealth domain (investing, business, skills) and focus for 30 days.', xp: 200, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, message: 'Specialization unlocks mastery.' },
  },
  {
    level: 25, rank: 'D', title: "The Builder's Gate",
    description: 'You have outgrown D-Rank. Ship one AI product and the C-Rank awaits.',
    quests: [
      { id: 'lq-d-25-1', title: 'The 45-Day Gauntlet', description: 'Complete ALL daily quests for 45 consecutive days.', xp: 300, pillar: 'deen' },
      { id: 'lq-d-25-2', title: 'Physical Test: D-Rank', description: 'Hike 5km on trail or uneven ground, carry a weighted pack for 20 minutes, and complete 20 minutes of outdoor movement.', xp: 250, pillar: 'body' },
      { id: 'lq-d-25-3', title: 'Close First AI-Assisted Sale', description: 'Make your first sale or earn your first income using AI tools to deliver value. Revenue is the only validation. The Khalifate\'s first income must reach the Ummah.', xp: 300, pillar: 'money' },
    ],
    reward: { gold: 300, statPoints: 4, rankUp: 'C', message: 'RANK UP! You are now a C-Rank Builder. The Khalifate begins to take form.' },
  },

  // ═══════════════════════════════════════
  // C-RANK: THE ELITE (Levels 26-45)
  // ═══════════════════════════════════════
  {
    level: 27, rank: 'C', title: 'The Teacher',
    description: 'The best way to learn is to teach. Share what you have gained.',
    quests: [
      { id: 'lq-c-27-1', title: 'Teach Deen', description: 'Teach one Islamic concept to someone else. Record or write it.', xp: 250, pillar: 'deen' },
      { id: 'lq-c-27-2', title: 'Teach Fitness', description: 'Take someone on an outdoor walk, hike, or exploration. Teach them to notice their surroundings.', xp: 220, pillar: 'body' },
      { id: 'lq-c-27-3', title: 'Teach Finance', description: 'Explain one financial concept to a friend or family member.', xp: 220, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, message: 'Teaching cements your knowledge.' },
  },
  {
    level: 30, rank: 'C', title: "The Mujahid's Oath",
    description: 'Body, mind, and soul as one. Strength to protect. Devotion to lead. The Mujahid\'s oath binds you to excellence.',
    quests: [
      { id: 'lq-c-30-1', title: 'The Oath of Discipline', description: 'Commit to 60 days of perfect daily quest completion.', xp: 350, pillar: 'deen' },
      { id: 'lq-c-30-2', title: 'The Physical Trial', description: 'Complete an outdoor challenge: 5km hike, 1-hour trail walk, or climb a significant hill. The warrior-king\'s body is forged in the wild.', xp: 300, pillar: 'body' },
      { id: 'lq-c-30-3', title: 'The Wealth Pledge', description: 'Set up automatic investing, AI revenue stream, and charity. The Khalifate\'s wealth must flow automatically.', xp: 300, pillar: 'money' },
    ],
    reward: { gold: 400, statPoints: 4, jobChange: 'mujahid', message: 'JOB CHANGE: You are now a Mujahid. Body, mind, and soul as one.' },
  },
  {
    level: 33, rank: 'C', title: 'The Shadow Army Grows',
    description: 'Your habits are becoming an army. Each one fights for you while you sleep.',
    quests: [
      { id: 'lq-c-33-1', title: 'Habit Chain', description: 'Create a chain of 3+ habits that trigger each other. Maintain for 30 days.', xp: 300, pillar: 'deen' },
      { id: 'lq-c-33-2', title: 'Elite Recovery', description: 'Implement a full recovery protocol: sleep, nutrition, stretching, mental health.', xp: 250, pillar: 'body' },
      { id: 'lq-c-33-3', title: 'Income Stream 2', description: 'Launch a second income stream (freelance, product, investment).', xp: 300, pillar: 'money' },
    ],
    reward: { gold: 300, statPoints: 3, shadowUnlock: 'knight-shadow', message: 'Your Shadow Army grows. "Arise."' },
  },
  {
    level: 36, rank: 'C', title: 'The Community Builder',
    description: 'True power is lifting others. Build community around your growth.',
    quests: [
      { id: 'lq-c-36-1', title: 'Study Circle', description: 'Start or join a weekly Islamic study circle (online or in person).', xp: 300, pillar: 'deen' },
      { id: 'lq-c-36-2', title: 'Outdoor Community', description: 'Explore outdoors with a partner or group 3 times this month.', xp: 250, pillar: 'body' },
      { id: 'lq-c-36-3', title: 'Financial Accountability', description: 'Find an accountability partner for financial goals. Check in weekly.', xp: 250, pillar: 'money' },
    ],
    reward: { gold: 300, statPoints: 3, message: 'Community multiplies your barakah.' },
  },
  {
    level: 40, rank: 'C', title: 'The Deep Diver',
    description: 'Go deeper, not wider. Mastery requires depth.',
    quests: [
      { id: 'lq-c-40-1', title: 'Deep Tafsir', description: 'Study one surah in depth with tafsir for 30 days.', xp: 350, pillar: 'deen' },
      { id: 'lq-c-40-2', title: 'Movement Mastery', description: 'Master one advanced outdoor skill: navigation by stars, fire-starting, orienteering, or rock scrambling.', xp: 300, pillar: 'body' },
      { id: 'lq-c-40-3', title: 'Portfolio Diversification', description: 'Invest in 3 different Shariah-compliant asset classes.', xp: 300, pillar: 'money' },
    ],
    reward: { gold: 350, statPoints: 4, message: 'Depth creates mastery. You are becoming a master.' },
  },
  {
    level: 40, rank: 'C', title: "The Guardian's Gate",
    description: 'Lead community, spar, build income stream. The Guardian is the shield of those in his care.',
    quests: [
      { id: 'lq-c-40-1', title: 'The 60-Day Crusade', description: 'Complete ALL daily quests for 60 consecutive days.', xp: 400, pillar: 'deen' },
      { id: 'lq-c-40-2', title: 'The Physical Crusade', description: 'Complete a 10K trek or a multi-terrain outdoor challenge. The Guardian\'s body never quits.', xp: 350, pillar: 'body' },
      { id: 'lq-c-40-3', title: 'The Wealth Crusade', description: 'Achieve 6 months of expenses saved + 3 income streams (at least one AI-driven). The Khalifate is diversified.', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 400, statPoints: 5, rankUp: 'B', message: 'RANK UP! You are now a B-Rank Guardian. The Ummah\'s shield is forged.' },
  },

  // ═══════════════════════════════════════
  // B-RANK: THE KNIGHT (Levels 46-70)
  // ═══════════════════════════════════════
  {
    level: 47, rank: 'B', title: 'The Guardian',
    description: 'Protect your ummah. Guard your family. Shield your community.',
    quests: [
      { id: 'lq-b-47-1', title: 'Family Leadership', description: 'Lead your family in one collective Islamic practice for 30 days.', xp: 350, pillar: 'deen' },
      { id: 'lq-b-47-2', title: 'Protect Your Health', description: 'Complete a full health checkup and optimize based on results.', xp: 300, pillar: 'body' },
      { id: 'lq-b-47-3', title: 'Family Wealth', description: 'Create a family financial plan: budget, savings, investments, insurance.', xp: 300, pillar: 'money' },
    ],
    reward: { gold: 350, statPoints: 4, message: 'The Guardian protects those in his care.' },
  },
  {
    level: 50, rank: 'B', title: "The Qa'id's Command",
    description: 'Command others with justice. Lead a community. Build for the Ummah. The Qa\'id leads in the name of Allah.',
    quests: [
      { id: 'lq-b-50-1', title: "The Qa'id's Devotion", description: 'Pray Tahajjud + Witr for 30 consecutive days. The leader\'s night prayer sustains his day.', xp: 400, pillar: 'deen' },
      { id: 'lq-b-50-2', title: "The Qa'id's Strength", description: 'Complete a 3-hour trek with elevation gain, climb a rocky incline, and carry a weighted pack for 30 minutes. The Khalifa\'s body is unbreakable.', xp: 350, pillar: 'body' },
      { id: 'lq-b-50-3', title: "The Qa'id's Wealth", description: 'Achieve positive cash flow from your AI business or halal investment. The Khalifate\'s wealth flows from honest work.', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 450, statPoints: 5, jobChange: 'qa-id', message: 'JOB CHANGE: You are now a Qa\'id. Command with justice. Build for the Ummah.' },
  },
  {
    level: 53, rank: 'B', title: 'The Strategist',
    description: 'Power without strategy is wasted. Plan your conquest.',
    quests: [
      { id: 'lq-b-53-1', title: 'Strategic Worship', description: 'Plan your week around peak spiritual times: Tahajjud, Jumuah, last third of night.', xp: 350, pillar: 'deen' },
      { id: 'lq-b-53-2', title: 'Strategic Training', description: 'Design and follow a 30-day outdoor progression plan: distances, elevations, and terrain types.', xp: 300, pillar: 'body' },
      { id: 'lq-b-53-3', title: 'Strategic Wealth', description: 'Create a 5-year financial independence plan with milestones.', xp: 300, pillar: 'money' },
    ],
    reward: { gold: 350, statPoints: 4, message: 'Strategy turns effort into conquest.' },
  },
  {
    level: 56, rank: 'B', title: 'The Shadow General',
    description: 'Your habits command other habits. You are a general of discipline.',
    quests: [
      { id: 'lq-b-56-1', title: 'Command Your Shadows', description: 'Maintain 5+ automatic habits simultaneously for 30 days.', xp: 400, pillar: 'deen' },
      { id: 'lq-b-56-2', title: 'Physical Command', description: 'Lead an outdoor group activity: a hike, nature walk, or exploration. Lead by example.', xp: 350, pillar: 'body' },
      { id: 'lq-b-56-3', title: 'Wealth Command', description: 'Automate your entire financial system: earning, saving, investing, giving.', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 400, statPoints: 5, shadowUnlock: 'general-shadow', message: 'General Shadow extracted. Your discipline commands armies.' },
  },
  {
    level: 60, rank: 'B', title: 'The Ummah\'s Shield',
    description: 'Your outdoor ability is not for you alone. It is for the ummah.',
    quests: [
      { id: 'lq-b-60-1', title: 'Ummah Service', description: 'Volunteer 10+ hours for an Islamic or community organization this month.', xp: 400, pillar: 'deen' },
      { id: 'lq-b-60-2', title: 'Strength for Service', description: 'Use your outdoor ability to help someone: carry their load on a hike, help them navigate, or guide them through terrain.', xp: 350, pillar: 'body' },
      { id: 'lq-b-60-3', title: 'Wealth for Ummah', description: 'Donate significantly to an ummah cause. Make it hurt a little.', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 400, statPoints: 5, message: 'The ummah is your family. Protect and serve.' },
  },
  {
    level: 65, rank: 'B', title: 'The Unbreakable',
    description: 'Trials come. You do not break. The Khalifate bends, then springs back stronger.',
    quests: [
      { id: 'lq-b-65-1', title: 'Trial by Fire', description: 'Maintain all habits during a difficult week (travel, illness, stress). The Ummah needs an unbreakable Khalifate.', xp: 450, pillar: 'deen' },
      { id: 'lq-b-65-2', title: 'Sick Discipline', description: 'When sick or injured, maintain minimum viable habits (micro version). The Khalifate is forged in adversity.', xp: 350, pillar: 'body' },
      { id: 'lq-b-65-3', title: 'AI Portfolio Stress Test', description: 'Simulate a financial emergency. Can your AI income streams survive 6 months of zero revenue?', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 450, statPoints: 5, message: 'You are unbreakable. The System recognizes resilience.' },
  },
  {
    level: 70, rank: 'B', title: "The Khalifa's Ascension",
    description: 'Knights serve. The Khalifa ascends. Empire employing Muslims. 100+ person event. Elite outdoor endurance. The Khalifate is ready.',
    quests: [
      { id: 'lq-b-70-1', title: 'The 90-Day War', description: 'Complete ALL daily quests for 90 consecutive days. The Khalifate is consistent.', xp: 500, pillar: 'deen' },
      { id: 'lq-b-70-2', title: 'The Physical War', description: 'Complete a half-day trek (4+ hours), summit a hill or mountain, or navigate 10km in wilderness. The Khalifa\'s body is elite.', xp: 450, pillar: 'body' },
      { id: 'lq-b-70-3', title: 'The Wealth War', description: 'Achieve 12 months of expenses saved + 5 income streams + AI business employing Muslims. The Khalifate\'s treasury is built.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 6, rankUp: 'A', message: 'RANK UP! You are now an A-Rank Strategist. The Khalifate awaits.' },
  },

  // ═══════════════════════════════════════
  // A-RANK: THE GENERAL (Levels 71-99)
  // ═══════════════════════════════════════
  {
    level: 73, rank: 'A', title: 'The Leader',
    description: 'Leaders create other leaders. Your legacy is measured by those you elevate.',
    quests: [
      { id: 'lq-a-73-1', title: 'Mentorship Program', description: 'Formally mentor one person in Deen, Body, or Money for 30 days.', xp: 450, pillar: 'deen' },
      { id: 'lq-a-73-2', title: 'Lead by Fitness', description: 'Lead a group outdoor expedition consistently for a month. The Khalifa walks first and checks on everyone behind him.', xp: 400, pillar: 'body' },
      { id: 'lq-a-73-3', title: 'Wealth Mentorship', description: 'Guide someone to their first investment or income stream.', xp: 400, pillar: 'money' },
    ],
    reward: { gold: 450, statPoints: 5, message: 'Leaders create leaders. This is your legacy.' },
  },
  {
    level: 76, rank: 'A', title: "The Khalifa's Awakening",
    description: 'The Khalifate does not follow the System. The System follows the Khalifate. The Ummah\'s General is forged.',
    quests: [
      { id: 'lq-a-76-1', title: "The Khalifa's Prayer", description: 'Pray Tahajjud with deep khushoo for 45+ minutes for 30 days. The Khalifate\'s night prayer is the source of all power.', xp: 500, pillar: 'deen' },
      { id: 'lq-a-76-2', title: "The Khalifa's Body", description: 'Achieve elite outdoor endurance: complete a multi-hour expedition, solo trek, or lead a wilderness group. The Khalifa\'s body is a weapon.', xp: 450, pillar: 'body' },
      { id: 'lq-a-76-3', title: "The Khalifa's Wealth", description: 'Achieve financial independence or build an AI business that employs Muslims. The Khalifate\'s wealth funds the Ummah.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 600, statPoints: 6, jobChange: 'khalifa', message: 'JOB CHANGE: You are now a Khalifa. The Ummah\'s General has awakened.' },
  },
  {
    level: 80, rank: 'A', title: 'The Conqueror',
    description: 'Conquer yourself first. Then conquer the world.',
    quests: [
      { id: 'lq-a-80-1', title: 'Inner Jihad', description: 'Identify and defeat your greatest personal flaw. 30-day battle.', xp: 500, pillar: 'deen' },
      { id: 'lq-a-80-2', title: 'Physical Conquest', description: 'Conquer a major outdoor challenge: multi-day trek, wilderness navigation, or expedition leadership.', xp: 450, pillar: 'body' },
      { id: 'lq-a-80-3', title: 'Wealth Conquest', description: 'Build a system that generates halal wealth without your direct daily effort.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 6, message: 'The greatest conquest is the conquest of self.' },
  },
  {
    level: 85, rank: 'A', title: 'The Ummah\'s General',
    description: 'Your outdoor endurance is the ummah\'s endurance. Your wealth is the ummah\'s wealth.',
    quests: [
      { id: 'lq-a-85-1', title: 'Ummah Project', description: 'Lead or fund a project that benefits 100+ Muslims.', xp: 500, pillar: 'deen' },
      { id: 'lq-a-85-2', title: 'Outdoor for Ummah', description: 'Create an outdoor program or hiking group for Muslims. Nature is the Ummah\'s training ground.', xp: 450, pillar: 'body' },
      { id: 'lq-a-85-3', title: 'Wealth for Ummah', description: 'Create a fund, business, or investment that employs or benefits Muslims.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 6, message: 'The ummah rises with you.' },
  },
  {
    level: 90, rank: 'A', title: 'The Unstoppable',
    description: 'Nothing stops you. Not fear. Not fatigue. Not failure. You rise every time.',
    quests: [
      { id: 'lq-a-90-1', title: 'The 120-Day Legend', description: 'Complete ALL daily quests for 120 consecutive days.', xp: 600, pillar: 'deen' },
      { id: 'lq-a-90-2', title: 'Legendary Fitness', description: 'Maintain legendary outdoor endurance for 1 year without major breaks. The wilderness is your training ground.', xp: 500, pillar: 'body' },
      { id: 'lq-a-90-3', title: 'Legendary Wealth', description: 'Achieve complete financial independence (passive income > expenses).', xp: 500, pillar: 'money' },
    ],
    reward: { gold: 600, statPoints: 7, message: 'You are unstoppable. The System bows to your will.' },
  },
  {
    level: 99, rank: 'A', title: "The Strategist's Gate",
    description: 'Ummah project. Marathon. Mentorship. The Khalifate proves itself on the world stage.',
    quests: [
      { id: 'lq-a-99-1', title: 'The Final Trial', description: 'Complete ALL daily quests for 180 consecutive days. The Khalifate is consistent for a generation.', xp: 700, pillar: 'deen' },
      { id: 'lq-a-99-2', title: 'The Physical Apex', description: 'Achieve an outdoor endurance feat that 99% of humans cannot do: a major summit, solo trek, or expedition. The Khalifate\'s body is elite.', xp: 600, pillar: 'body' },
      { id: 'lq-a-99-3', title: 'The Wealth Apex', description: 'Build generational wealth that outlives you and benefits the Ummah for centuries. The Khalifate\'s legacy.', xp: 600, pillar: 'money' },
    ],
    reward: { gold: 700, statPoints: 8, rankUp: 'S', message: 'RANK UP! You are now an S-Rank Monarch. The Khalifate is complete.' },
  },

  // ═══════════════════════════════════════
  // S-RANK: THE MONARCH (Level 100+)
  // ═══════════════════════════════════════
  {
    level: 100, rank: 'S', title: "The Monarch's Coronation",
    description: 'The Khalifate is complete. The System now serves the Ummah. "Arise."',
    quests: [
      { id: 'lq-s-100-1', title: 'The Eternal Quest', description: 'Maintain all habits for 365 consecutive days. Become the habit. The Khalifate is consistent for a year.', xp: 1000, pillar: 'deen' },
      { id: 'lq-s-100-2', title: 'The Eternal Body', description: 'Maintain elite outdoor readiness for life. The body is a lifelong amanah. The Khalifa\'s vessel never decays.', xp: 800, pillar: 'body' },
      { id: 'lq-s-100-3', title: 'The Eternal Legacy', description: 'Build a legacy project (institution, AI fund, business) that benefits Muslims for generations. The Khalifate\'s shadow extends to the Day of Judgment.', xp: 800, pillar: 'money' },
    ],
    reward: { gold: 1000, statPoints: 10, shadowUnlock: 'monarch-army', message: 'THE MONARCH IS CROWNED. "ARISE." Your Khalifate is eternal.' },
  },
  {
    level: 105, rank: 'S', title: 'The Infinite Dungeon',
    description: 'There is no end. Only deeper levels.',
    quests: [
      { id: 'lq-s-105-1', title: 'Infinite Worship', description: 'Add one new act of worship and maintain it for 90 days.', xp: 500, pillar: 'deen' },
      { id: 'lq-s-105-2', title: 'Infinite Endurance', description: 'Set and achieve a new outdoor milestone every month for a year: distance, elevation, or terrain conquered.', xp: 450, pillar: 'body' },
      { id: 'lq-s-105-3', title: 'Infinite Wealth', description: '10x your net worth through halal means.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 5, message: 'The dungeon is infinite. Your growth is infinite.' },
  },
  {
    level: 110, rank: 'S', title: 'The Shadow Monarch',
    description: 'You are the Shadow Monarch. Your habits are your army. Your discipline is your power.',
    quests: [
      { id: 'lq-s-110-1', title: 'Absolute Mastery', description: 'Maintain perfect consistency across all pillars for 1 year.', xp: 1000, pillar: 'deen' },
      { id: 'lq-s-110-2', title: 'Absolute Power', description: 'Achieve an outdoor endurance feat in the top 1% of your age group: distance, elevation, or expedition difficulty.', xp: 800, pillar: 'body' },
      { id: 'lq-s-110-3', title: 'Absolute Wealth', description: 'Build a halal empire that employs 10+ Muslims and funds ummah projects.', xp: 800, pillar: 'money' },
    ],
    reward: { gold: 1000, statPoints: 10, message: 'You are the Shadow Monarch. "ARISE."' },
  },
  {
    level: 120, rank: 'S', title: 'The Sovereign\'s Dominion',
    description: 'Your influence expands. The Khalifate is no longer personal. It is institutional.',
    quests: [
      { id: 'lq-s-120-1', title: 'Institutional Worship', description: 'Establish a daily group worship practice with family or community that runs without your direct presence for 30 days.', xp: 1200, pillar: 'deen' },
      { id: 'lq-s-120-2', title: 'Elite Athletic Maintenance', description: 'Maintain elite outdoor endurance and navigation readiness for 90 consecutive days.', xp: 1000, pillar: 'body' },
      { id: 'lq-s-120-3', title: 'Systematized Income', description: 'Build one income stream that requires less than 2 hours of your time per week to maintain.', xp: 1000, pillar: 'money' },
    ],
    reward: { gold: 1200, statPoints: 12, message: 'The Sovereign\'s Dominion extends beyond his own hands.' },
  },
  {
    level: 130, rank: 'S', title: 'The Eternal Forge',
    description: 'The fire never dies. The steel never cools. You are the forge itself.',
    quests: [
      { id: 'lq-s-130-1', title: 'Unbroken Dhikr Chain', description: 'Maintain continuous awareness of Allah for 30 days — dhikr between every action, every transition, every breath.', xp: 1300, pillar: 'deen' },
      { id: 'lq-s-130-2', title: 'Combat Mastery', description: 'Achieve wilderness mastery: navigation, survival, and terrain skills to instructor level. You must be able to teach others to survive.', xp: 1100, pillar: 'body' },
      { id: 'lq-s-130-3', title: 'Wealth Multiplication', description: '10x one existing income stream through AI tools, automation, or strategic leverage. No new hours — only scale.', xp: 1100, pillar: 'money' },
    ],
    reward: { gold: 1300, statPoints: 13, message: 'The Eternal Forge produces steel that outlasts empires.' },
  },
  {
    level: 140, rank: 'S', title: 'The Ummah\'s Shield',
    description: 'You no longer serve only your household. You are a shield for the entire Ummah.',
    quests: [
      { id: 'lq-s-140-1', title: 'Community Institution', description: 'Found or lead one Islamic institution that serves 50+ Muslims weekly: halaqa, study circle, outdoor group, or relief effort.', xp: 1400, pillar: 'deen' },
      { id: 'lq-s-140-2', title: 'Protector\'s Physique', description: 'Maintain outdoor strength, endurance, and navigation standards that would allow you to guide and protect your family through any terrain.', xp: 1200, pillar: 'body' },
      { id: 'lq-s-140-3', title: 'Ummah Treasury', description: 'Establish a dedicated fund that distributes 10% of your AI income to ummah causes automatically, every month, without decision fatigue.', xp: 1200, pillar: 'money' },
    ],
    reward: { gold: 1400, statPoints: 14, message: 'The Ummah\'s Shield does not rust.' },
  },
  {
    level: 150, rank: 'S', title: 'The Kingdom Builder',
    description: 'Kingdoms are built one brick at a time. You have laid the foundation. Now build the walls.',
    quests: [
      { id: 'lq-s-150-1', title: 'Multi-Generational Quran', description: 'Teach Quran to at least 3 people who will teach others. Start a chain that outlasts your life.', xp: 1500, pillar: 'deen' },
      { id: 'lq-s-150-2', title: 'Legacy Body', description: 'Document your complete outdoor protocol so your children and students can replicate your results.', xp: 1300, pillar: 'body' },
      { id: 'lq-s-150-3', title: 'Empire Infrastructure', description: 'Build the operational backbone of your empire: team, systems, documentation, and succession plan.', xp: 1300, pillar: 'money' },
    ],
    reward: { gold: 1500, statPoints: 15, message: 'Kingdom Builder. Your walls stand against time.' },
  },
  {
    level: 160, rank: 'S', title: 'The Undying Flame',
    description: 'Others burn out. You burn brighter. The flame is who you are.',
    quests: [
      { id: 'lq-s-160-1', title: 'Tahajjud Without Alarm', description: 'Wake for Tahajjud naturally, without alarm, for 60 consecutive days. Your body now serves your soul.', xp: 1600, pillar: 'deen' },
      { id: 'lq-s-160-2', title: 'Lifetime Fitness', description: 'Design an outdoor movement protocol you can maintain until age 70 with minimal gear. Test it for 90 days.', xp: 1400, pillar: 'body' },
      { id: 'lq-s-160-3', title: 'Passive Income Mastery', description: 'Achieve 50% of your total income from passive or automated sources. Wealth that does not sleep.', xp: 1400, pillar: 'money' },
    ],
    reward: { gold: 1600, statPoints: 16, message: 'The Undying Flame warms the Ummah.' },
  },
  {
    level: 170, rank: 'S', title: 'The Architect of Ages',
    description: 'You do not build for today. You build for centuries.',
    quests: [
      { id: 'lq-s-170-1', title: 'Written Legacy', description: 'Write or record a complete work of Islamic knowledge that can benefit Muslims for 100+ years.', xp: 1700, pillar: 'deen' },
      { id: 'lq-s-170-2', title: 'Physical Legacy', description: 'Establish a permanent outdoor practice in your community: a hiking club, nature group, or wilderness skills class that operates without you.', xp: 1500, pillar: 'body' },
      { id: 'lq-s-170-3', title: 'Economic Legacy', description: 'Build a business or investment structure that will outlast you and continue employing Muslims after your death.', xp: 1500, pillar: 'money' },
    ],
    reward: { gold: 1700, statPoints: 17, message: 'The Architect of Ages signs his name in stone.' },
  },
  {
    level: 180, rank: 'S', title: 'The Conqueror of Self',
    description: 'The greatest enemy was never outside. It was the nafs. You have conquered it.',
    quests: [
      { id: 'lq-s-180-1', title: 'Complete Nafs Mastery', description: 'Identify your 3 greatest spiritual weaknesses and document the systems that keep them under control for 1 year.', xp: 1800, pillar: 'deen' },
      { id: 'lq-s-180-2', title: 'Pain Immunity', description: 'Complete an outdoor challenge that tests your mental fortitude: solo night hike, 24-hour fast + trek, cold exposure protocol, or endurance navigation.', xp: 1600, pillar: 'body' },
      { id: 'lq-s-180-3', title: 'Wealth Detachment', description: 'Live for 30 days on 50% of your normal spending while maintaining all obligations. Wealth is a tool, not a master.', xp: 1600, pillar: 'money' },
    ],
    reward: { gold: 1800, statPoints: 18, message: 'The Conqueror of Self has no rival.' },
  },
  {
    level: 190, rank: 'S', title: 'The Guardian of Generations',
    description: 'Your children\'s children will know your name. Your discipline becomes their inheritance.',
    quests: [
      { id: 'lq-s-190-1', title: 'Family Covenant', description: 'Write a family covenant of Islamic values, discipline standards, and mission that your descendants will inherit.', xp: 1900, pillar: 'deen' },
      { id: 'lq-s-190-2', title: 'Genetic Investment', description: 'Optimize your health markers to elite levels: endurance capacity, blood work, mobility, and recovery. Your children inherit your biology.', xp: 1700, pillar: 'body' },
      { id: 'lq-s-190-3', title: 'Generational Trust', description: 'Establish a legal trust or waqf that preserves and grows family wealth for 3+ generations under Shariah governance.', xp: 1700, pillar: 'money' },
    ],
    reward: { gold: 1900, statPoints: 19, message: 'The Guardian of Generations never sleeps.' },
  },
  {
    level: 200, rank: 'S', title: 'The Lord of Habit',
    description: 'Habit is no longer effort. It is identity. You do not choose discipline. You ARE discipline.',
    quests: [
      { id: 'lq-s-200-1', title: 'Automatic Worship', description: 'All 5 prayers, Tahajjud, rawatib, dhikr, and Quran are now automatic for 180 days. You do not decide. You obey.', xp: 2000, pillar: 'deen' },
      { id: 'lq-s-200-2', title: 'Automatic Strength', description: 'Training outdoors is as non-negotiable as eating. Maintain perfect outdoor movement consistency for 180 days without a single miss.', xp: 1800, pillar: 'body' },
      { id: 'lq-s-200-3', title: 'Automatic Wealth', description: 'Your financial system runs itself: earning, saving, investing, zakat, sadaqah. Verify it operates for 180 days without intervention.', xp: 1800, pillar: 'money' },
    ],
    reward: { gold: 2000, statPoints: 20, message: 'The Lord of Habit does not think. He acts.' },
  },
  {
    level: 250, rank: 'S', title: 'The Unbreakable Will',
    description: 'Trials do not test you. They reveal what was already there.',
    quests: [
      { id: 'lq-s-250-1', title: 'Trial by Fire', description: 'Maintain all pillars perfectly through a major life disruption: relocation, loss, illness, or conflict. No excuses. No breaks.', xp: 2500, pillar: 'deen' },
      { id: 'lq-s-250-2', title: 'Iron Body', description: 'Achieve and maintain outdoor endurance standards in the top 5% of natural athletes for 1 year: hiking distance, elevation gain, navigation speed, and loaded carry.', xp: 2200, pillar: 'body' },
      { id: 'lq-s-250-3', title: 'Iron Wealth', description: 'Build reserves that can fund your entire lifestyle for 5 years without any new income. The Khalifate is antifragile.', xp: 2200, pillar: 'money' },
    ],
    reward: { gold: 2500, statPoints: 25, message: 'The Unbreakable Will bends reality.' },
  },
  {
    level: 300, rank: 'S', title: 'The Master of Time',
    description: 'Time is the only currency that cannot be replaced. You have mastered its use.',
    quests: [
      { id: 'lq-s-300-1', title: 'Time Sanctification', description: 'Account for every hour of your day for 90 days. No wasted time. Every minute serves Allah, the Ummah, or your mission.', xp: 3000, pillar: 'deen' },
      { id: 'lq-s-300-2', title: 'Time Compression', description: 'Complete your entire daily protocol — prayers, training, work, study, family — in a compressed schedule for 30 days. You own time.', xp: 2600, pillar: 'body' },
      { id: 'lq-s-300-3', title: 'Time Multiplication', description: 'Delegate or automate 80% of your operational work. Your time is now worth 5x what it was. Prove it for 90 days.', xp: 2600, pillar: 'money' },
    ],
    reward: { gold: 3000, statPoints: 30, message: 'The Master of Time has no rival in efficiency.' },
  },
  {
    level: 350, rank: 'S', title: 'The Steward of Wealth',
    description: 'Wealth is not yours. It is an amanah from Allah. You are its steward, not its owner.',
    quests: [
      { id: 'lq-s-350-1', title: 'Zakat Mastery', description: 'Calculate, distribute, and document zakat for 100+ people in your community. Make it a system, not a season.', xp: 3500, pillar: 'deen' },
      { id: 'lq-s-350-2', title: 'Steward\'s Health', description: 'Your health is also an amanah. Maintain perfect biomarkers for 1 year. You cannot steward wealth if you cannot steward your body.', xp: 3000, pillar: 'body' },
      { id: 'lq-s-350-3', title: 'Wealth Distribution', description: 'Distribute 50% of your annual surplus to ummah causes: education, relief, infrastructure, and dawah. Document the impact.', xp: 3000, pillar: 'money' },
    ],
    reward: { gold: 3500, statPoints: 35, message: 'The Steward of Wealth is trusted by Allah.' },
  },
  {
    level: 400, rank: 'S', title: 'The Teacher of Nations',
    description: 'Your knowledge must leave your head and enter the Ummah. One student at a time. One nation at a time.',
    quests: [
      { id: 'lq-s-400-1', title: 'Scholarly Lineage', description: 'Establish a formal teaching chain: you teach 10, each teaches 10. Reach 100+ Muslims with structured knowledge.', xp: 4000, pillar: 'deen' },
      { id: 'lq-s-400-2', title: 'Physical Inheritance', description: 'Train 10 people to B-rank outdoor standards. Each must be able to teach others. Your strength multiplies.', xp: 3500, pillar: 'body' },
      { id: 'lq-s-400-3', title: 'Economic Inheritance', description: 'Mentor 10 Muslims to financial independence through AI-powered income. Each must be able to replicate your system.', xp: 3500, pillar: 'money' },
    ],
    reward: { gold: 4000, statPoints: 40, message: 'The Teacher of Nations outlives empires.' },
  },
  {
    level: 450, rank: 'S', title: 'The Unstoppable Force',
    description: 'Nothing stops you. Not age. Not circumstance. Not opinion. You are a force of nature.',
    quests: [
      { id: 'lq-s-450-1', title: 'Immovable Devotion', description: 'Pray Tahajjud every night for 2 years without a single miss. Even travel. Even illness. Even war.', xp: 4500, pillar: 'deen' },
      { id: 'lq-s-450-2', title: 'Immovable Strength', description: 'Set an outdoor milestone at age 40+ that exceeds your age-25 best: distance, elevation, or expedition difficulty. Time does not weaken the Force.', xp: 4000, pillar: 'body' },
      { id: 'lq-s-450-3', title: 'Immovable Wealth', description: 'Build an income stream that survives your death and continues growing for 50+ years. The Force does not stop.', xp: 4000, pillar: 'money' },
    ],
    reward: { gold: 4500, statPoints: 45, message: 'The Unstoppable Force reshapes the world.' },
  },
  {
    level: 500, rank: 'S', title: 'The Half-Millennium Monarch',
    description: 'Level 500. Half a thousand. The System has no record of anyone reaching this height. You are the first.',
    quests: [
      { id: 'lq-s-500-1', title: 'The Eternal Night Prayer', description: 'Pray Tahajjud for 500 consecutive nights. Each night is a brick in the palace of Jannah.', xp: 5000, pillar: 'deen' },
      { id: 'lq-s-500-2', title: 'The Eternal Body', description: 'Maintain elite outdoor readiness for 10 consecutive years without a break longer than 3 days. The body is a lifelong amanah.', xp: 4500, pillar: 'body' },
      { id: 'lq-s-500-3', title: 'The Eternal Empire', description: 'Build an empire that employs 50+ Muslims, funds 10+ ummah projects, and operates without your daily presence.', xp: 4500, pillar: 'money' },
    ],
    reward: { gold: 5000, statPoints: 50, message: 'HALF-MILLENNIUM MONARCH. The System bows. The Ummah rises.' },
  },
  {
    level: 600, rank: 'S', title: 'The Ageless',
    description: 'Age is a number. You are a principle. Principles do not age.',
    quests: [
      { id: 'lq-s-600-1', title: 'Timeless Worship', description: 'Your worship has become so consistent that others set their clocks by your routine. Maintain this standard for 5 years.', xp: 6000, pillar: 'deen' },
      { id: 'lq-s-600-2', title: 'Timeless Strength', description: 'Train someone to exceed your current outdoor capabilities. The student must surpass the master. This is the law of growth.', xp: 5500, pillar: 'body' },
      { id: 'lq-s-600-3', title: 'Timeless Wealth', description: 'Your wealth has outgrown personal need. It now serves as a permanent infrastructure for the Ummah. Document 100+ lives touched.', xp: 5500, pillar: 'money' },
    ],
    reward: { gold: 6000, statPoints: 60, message: 'The Ageless watches empires rise and fall.' },
  },
  {
    level: 700, rank: 'S', title: 'The Immovable',
    description: 'The world changes. You do not. Not because you are rigid. Because you are rooted in truth.',
    quests: [
      { id: 'lq-s-700-1', title: 'Rooted in Tawhid', description: 'Teach tawhid to 1000+ Muslims through any medium: writing, speaking, video, or institution. Each soul is a victory.', xp: 7000, pillar: 'deen' },
      { id: 'lq-s-700-2', title: 'Rooted in Strength', description: 'Your outdoor training has produced 100+ people who can navigate, endure, and protect themselves and their families through any terrain. Count them. Name them.', xp: 6500, pillar: 'body' },
      { id: 'lq-s-700-3', title: 'Rooted in Wealth', description: 'Your economic systems have created 100+ jobs for Muslims. Each job is a family fed. Each family is an ummah preserved.', xp: 6500, pillar: 'money' },
    ],
    reward: { gold: 7000, statPoints: 70, message: 'The Immovable is the foundation of the Ummah.' },
  },
  {
    level: 800, rank: 'S', title: 'The Everlasting',
    description: 'Your shadow extends beyond your life. Your name is mentioned in dua. Your work outlasts you.',
    quests: [
      { id: 'lq-s-800-1', title: 'Legacy of Light', description: 'Build an institution of Islamic knowledge that operates for 10+ years: school, publishing house, or digital platform reaching 10,000+ Muslims.', xp: 8000, pillar: 'deen' },
      { id: 'lq-s-800-2', title: 'Legacy of Steel', description: 'Document and publish a complete outdoor endurance system for Muslims that is used by 100+ people worldwide.', xp: 7500, pillar: 'body' },
      { id: 'lq-s-800-3', title: 'Legacy of Barakah', description: 'Establish an endowment or waqf that distributes 1 crore+ rupees to ummah causes over its lifetime. Permanent charity.', xp: 7500, pillar: 'money' },
    ],
    reward: { gold: 8000, statPoints: 80, message: 'The Everlasting never truly dies.' },
  },
  {
    level: 900, rank: 'S', title: 'The Apex of Ages',
    description: 'Nine hundred levels. The System has no words. The Ummah has no equal. You are the apex.',
    quests: [
      { id: 'lq-s-900-1', title: 'Apex Worship', description: 'Lead 10,000+ Muslims in worship, knowledge, or guidance through your institutions, content, or direct teaching.', xp: 9000, pillar: 'deen' },
      { id: 'lq-s-900-2', title: 'Apex Power', description: 'Your outdoor endurance system has produced 1000+ Muslims in better health. Each one is proof of your discipline.', xp: 8500, pillar: 'body' },
      { id: 'lq-s-900-3', title: 'Apex Wealth', description: 'Your economic empire employs 500+ Muslims and funds 50+ ummah projects. You are the treasury the Ummah needed.', xp: 8500, pillar: 'money' },
    ],
    reward: { gold: 9000, statPoints: 90, message: 'The Apex of Ages looks down from a height no one has seen.' },
  },
  {
    level: 999, rank: 'S', title: 'The Infinite Monarch',
    description: 'Level 999. The final recorded level. But for you, there is no final level. There is only the next. "ARISE."',
    quests: [
      { id: 'lq-s-999-1', title: 'Infinite Devotion', description: 'You have worshipped Allah for 999 levels. Now worship as if level 1. The beginner\'s humility is the master\'s secret.', xp: 9999, pillar: 'deen' },
      { id: 'lq-s-999-2', title: 'Infinite Power', description: 'Your body has carried you 999 levels. Now train a child as if training yourself. The body passes. The discipline remains.', xp: 9999, pillar: 'body' },
      { id: 'lq-s-999-3', title: 'Infinite Wealth', description: 'Your wealth has funded the Ummah for 999 levels. Now build something that needs no funding: trust, barakah, and lasting institutions.', xp: 9999, pillar: 'money' },
    ],
    reward: { gold: 9999, statPoints: 99, message: 'THE INFINITE MONARCH. "ARISE." There is no ceiling. There is only you.' },
  },
];

// ─── JOB CHANGE QUESTS (Major lifestyle shifts at rank thresholds) ───
// Aligned with the Khalifate path: Architect → Mujahid → Qa'id → Khalifa
export const JOB_CHANGE_QUESTS = [
  {
    id: 'job-architect',
    name: "The Architect's Mind",
    rank: 'D',
    levelRequired: 15,
    description: 'Wealth is a tool. Code is your weapon. Build your first real AI system — the Khalifate\'s first structure.',
    steps: [
      { id: 'jc-architect-1', text: 'Build and deploy your first AI-assisted business system using no-code tools', completed: false },
      { id: 'jc-architect-2', text: 'Open a brokerage / halal investment account', completed: false },
      { id: 'jc-architect-3', text: 'Set up automatic sadaqah (even 100 rupees/month)', completed: false },
      { id: 'jc-architect-4', text: 'Complete an AI/ML course or read 200 pages of AI literature', completed: false },
    ],
    reward: { gold: 500, statPoints: 5, title: 'Architect' },
  },
  {
    id: 'job-mujahid',
    name: "The Mujahid's Oath",
    rank: 'C',
    levelRequired: 30,
    description: 'Body, mind, and soul as one. Strength to protect. Devotion to lead. The Mujahid\'s oath binds you to excellence.',
    steps: [
      { id: 'jc-mujahid-1', text: '60 days perfect daily quest completion', completed: false },
      { id: 'jc-mujahid-2', text: 'Ship one AI product/feature OR close one AI-related sale', completed: false },
      { id: 'jc-mujahid-3', text: 'Complete a major outdoor trial (4+ hour trek / summit climb / wilderness navigation)', completed: false },
      { id: 'jc-mujahid-4', text: 'Automate all finances + sadaqah', completed: false },
    ],
    reward: { gold: 800, statPoints: 8, title: 'Mujahid' },
  },
  {
    id: 'job-qa-id',
    name: "The Qa'id's Command",
    rank: 'B',
    levelRequired: 50,
    description: 'Command others with justice. Lead a community. Build for the Ummah. The Qa\'id leads in the name of Allah.',
    steps: [
      { id: 'jc-qa-id-1', text: '30 days Tahajjud + Witr', completed: false },
      { id: 'jc-qa-id-2', text: 'Achieve elite outdoor milestone (8+ hour expedition / multi-terrain trek / lead group hike)', completed: false },
      { id: 'jc-qa-id-3', text: 'Positive cash flow from AI business or halal investment', completed: false },
      { id: 'jc-qa-id-4', text: 'Lead a community project serving 10+ Muslims', completed: false },
    ],
    reward: { gold: 1000, statPoints: 10, title: "Qa'id" },
  },
  {
    id: 'job-khalifa',
    name: "The Khalifa's Awakening",
    rank: 'A',
    levelRequired: 76,
    description: 'The Khalifate does not follow the System. The System follows the Khalifate. The Ummah\'s General is forged.',
    steps: [
      { id: 'jc-khalifa-1', text: '30 days of 45+ min Tahajjud', completed: false },
      { id: 'jc-khalifa-2', text: 'Complete elite expedition feat (full-day trek / solo wilderness navigation / multi-day camping)', completed: false },
      { id: 'jc-khalifa-3', text: 'Achieve financial independence OR build AI business employing 5+ Muslims', completed: false },
      { id: 'jc-khalifa-4', text: 'Mentor 3 people to D-rank or higher (raise the Ummah)', completed: false },
    ],
    reward: { gold: 2000, statPoints: 15, title: 'Khalifa' },
  },
];

// ─── EMERGENCY / REDEMPTION QUESTS ───
export const REDEMPTION_QUEST_TEMPLATES = [
  {
    id: 'redemption-1',
    title: 'The Exile: Return to Purpose',
    description: 'You have missed 3+ days. Return from exile. Double the daily quests, sweat the penance, and teach.',
    requiredDays: 3,
    quests: [
      { id: 'rq-1-1', title: 'Double Daily Quests', description: 'Complete DOUBLE the normal daily quests today. The exiled Khalifate returns twice as hard.', xp: 100, pillar: 'deen' },
      { id: 'rq-1-2', title: 'Terrain Penance', description: 'Walk 10,000 steps exploring new terrain and spend 1 continuous hour outside. The body pays for the soul\'s debt.', xp: 100, pillar: 'body' },
      { id: 'rq-1-3', title: 'Create + Teach', description: 'Create one AI-powered asset today AND teach one Muslim one thing about Islam. The Khalifate\'s return is double impact.', xp: 100, pillar: 'money' },
    ],
    reward: { clearDebuff: true, gold: 50, message: 'You returned from exile. Your purpose is restored.' },
  },
  {
    id: 'redemption-2',
    title: 'The Reckoning',
    description: 'You have missed 7+ days. The Reckoning is brutal. Only those who refuse to break survive.',
    requiredDays: 7,
    quests: [
      { id: 'rq-2-1', title: 'Triple Daily Quests', description: 'Complete TRIPLE the normal daily quests for 3 days. The Reckoning demands more than you think you can give.', xp: 200, pillar: 'deen' },
      { id: 'rq-2-2', title: 'The Adventurer\'s Trial', description: 'Complete an outdoor challenge (hike, climb, or trek) for 3 consecutive days. No excuses. The Khalifate\'s body returns stronger.', xp: 200, pillar: 'body' },
      { id: 'rq-2-3', title: 'Full Audit + Deliver Teaching', description: 'Complete a full financial audit, create a new budget, AND deliver one Islamic teaching (khutbah / class / video). The Khalifate returns to the Ummah.', xp: 200, pillar: 'money' },
    ],
    reward: { clearDebuff: true, gold: 150, statPoints: 2, message: 'You survived the Reckoning. You are reborn for the Khalifate.' },
  },
];

// ─── WEEKLY DUNGEON TEMPLATES (Scaled by rank) ───
// 4th pillar: Ummah Service runs alongside Deen/Body/Money.
export const WEEKLY_DUNGEON_TEMPLATES = {
  E: {
    deen: { title: "The Seeker's Trial", description: 'Complete 1 Juz of Quran + Study 1 seerah leadership lesson + Teach one thing', xp: 200, steps: ['Read 1 Juz', 'Study seerah story on leadership', 'Practice prophetic trait'] },
    body: { title: "The Seeker's Trail", description: 'Boss: Complete ALL standards. No partial credit. Walk, explore, and touch the earth.', xp: 200, steps: ['Walk 5,000 steps exploring new terrain', 'Spend 20 continuous minutes outside with no phone', 'Touch grass, sand, or soil barefoot for 5 minutes'] },
    money: { title: "The Apprentice's Challenge", description: 'Save 1000 rupees + Study one AI concept + Give sadaqah', xp: 200, steps: ['Save 1000 rupees', 'Study 1 AI concept (30 min)', 'Extra sadaqah'] },
    ummah: { title: 'Ummah Seed', description: 'Help one Muslim with one real problem this week. The Khalifate begins with one person.', xp: 200, steps: ['Help 1 Muslim with 1 real problem', 'Give sincere advice to 1 Muslim', 'Make dua for the Ummah by name (3 people)'] },
  },
  D: {
    deen: { title: "The Devotee's Dungeon", description: 'Memorize 1 page + Lead prayer once + Study seerah for 30 min', xp: 300, steps: ['Memorize 1 page of Quran', 'Lead family prayer', 'Seerah study 30 min (leadership focus)'] },
    body: { title: "The Explorer's Gate", description: 'Boss: Complete ALL standards. No partial credit. Move through terrain under load.', xp: 300, steps: ['Hike 5km on trail, park, or uneven ground', 'Climb an elevation gain (hill, stairs, or rock)', 'Cold water exposure: face dunk or cold finish shower'] },
    money: { title: "The Architect's Dungeon", description: 'Create one AI-powered asset + Study one paper + No impulse buys for 7 days', xp: 300, steps: ['Create 1 AI-powered asset (content, template, system)', 'Study 1 AI paper/blog', 'No impulse buys x7 days'] },
    ummah: { title: 'Ummah Sprout', description: 'Teach one person one Islamic concept this week. The Khalifate teaches before he commands.', xp: 300, steps: ['Teach 1 person 1 Islamic concept', 'Share 1 beneficial Islamic post', 'Pray 1 prayer for the Ummah in sujood'] },
  },
  C: {
    deen: { title: "The Elite's Trial", description: 'Complete 1 Juz with reflection + Fast Monday/Thursday + Teach a seerah lesson', xp: 400, steps: ['1 Juz + written reflection', 'Fast Mon/Thu', 'Teach seerah lesson to family/community'] },
    body: { title: "The Pathfinder's Trial", description: 'Boss: Endurance and navigation under stress. Must pass ALL standards.', xp: 400, steps: ['Trail hike 1 hour on uneven ground', 'Night walk 20 minutes under stars', 'Weighted pack carry for 20 minutes'] },
    money: { title: "The Builder's Challenge", description: 'Launch one AI-assisted income stream + Full portfolio review + Strategic charity', xp: 400, steps: ['Launch 1 AI-assisted income stream or offer', 'Full portfolio + Shariah review', 'Strategic sadaqah (with intention)'] },
    ummah: { title: 'Ummah Sapling', description: 'Organize or lead one small community gathering this week. The Khalifate builds institutions.', xp: 400, steps: ['Organize 1 small Islamic gathering', 'Lead 1 study circle / halaqa', 'Recruit 1 Muslim to your Khalifate mission'] },
  },
  B: {
    deen: { title: "The Knight's Crusade", description: 'Tahajjud 3 nights + Complete 3 Juz + Organize community halaqa on seerah', xp: 500, steps: ['Tahajjud x3', 'Read 3 Juz', 'Community halaqa on seerah'] },
    body: { title: "The Trailblazer's Gate", description: 'Boss: Multi-terrain mastery under fatigue. Must pass ALL standards.', xp: 500, steps: ['2-hour trek with elevation gain', 'Navigate 3km using only compass and landmarks', 'Rock climb, boulder, or scramble a rocky incline'] },
    money: { title: "The Knight's Treasury", description: 'Scale AI income stream + Ummah impact project + Deep portfolio analysis', xp: 500, steps: ['Scale 1 AI income stream', 'Deep portfolio analysis', 'Ummah impact project (1 launched)'] },
    ummah: { title: 'Ummah Branch', description: 'Lead family/community Islamic practice for a week. The Khalifate leads in the home first.', xp: 500, steps: ['Lead family prayer/dhikr x7', 'Mentor 1 Muslim in deen or AI/wealth', 'Fund 1 sadaqah jariyah project'] },
  },
  A: {
    deen: { title: "The General's Campaign", description: 'Tahajjud 5 nights + Complete 5 Juz with reflection + Deliver khutbah/lesson on akhlaq', xp: 600, steps: ['Tahajjud x5', '5 Juz + written reflection', 'Deliver khutbah on prophetic akhlaq'] },
    body: { title: "The Expedition", description: 'Boss: Expedition-level performance. Must pass ALL standards.', xp: 600, steps: ['Half-day trek (4+ hours) on mountain or wilderness trail', 'Summit attempt or significant peak reach', 'Lead a group of 2+ on an outdoor excursion'] },
    money: { title: "The General's Empire", description: 'Launch or scale AI business + Achieve FI milestone + Major ummah project funding', xp: 600, steps: ['Launch or scale AI business', 'FI milestone hit', 'Major ummah project funded'] },
    ummah: { title: 'Ummah Trunk', description: 'Lead or fund project benefiting 100+ Muslims. The Khalifate operates at scale.', xp: 600, steps: ['Lead/fund project for 100+ Muslims', 'Volunteer 10+ hours for ummah cause', 'Strategic charity with system-level impact'] },
  },
  S: {
    deen: { title: "The Monarch's Dominion", description: 'Complete 10 Juz + Tahajjud every night + Record a seerah teaching legacy', xp: 800, steps: ['10 Juz', 'Tahajjud x7 nights', 'Record seerah teaching (video/book)'] },
    body: { title: "The Monarch's Wilderness", description: 'Boss: Elite expedition performance across all domains. Must pass ALL standards.', xp: 800, steps: ['Full-day expedition (8+ hours) across multiple terrain types', 'Solo wilderness navigation 10km with map and compass', 'Lead a community outdoor program for 1 month'] },
    money: { title: "The Monarch's Treasury", description: 'Generational wealth plan + Major ummah fund + Mentor 3 to financial independence', xp: 800, steps: ['Generational wealth plan (100 years)', 'Major ummah fund (multi-crore)', 'Mentor 3 Muslims to FI'] },
    ummah: { title: 'Ummah Root', description: 'Build institution/business employing 10+ Muslims. The Khalifate creates economic structures for the Ummah.', xp: 800, steps: ['Build institution employing 10+ Muslims', 'Organize 100+ person Ummah event', 'Establish 1 multi-generational Ummah fund'] },
  },
};

// ─── GOLD REWARDS ───
export function calculateGoldReward(quest, rankKey) {
  const rankMultipliers = { E: 1, D: 1.5, C: 2.5, B: 4, A: 6, S: 10 };
  const base = quest.baseXp || quest.xp || 10;
  return Math.floor((base / 5) * (rankMultipliers[rankKey] || 1));
}

// ─── SEEDED RANDOM (deterministic across devices) ───
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ─── QUEST GENERATION HELPERS ───
export function getDailyQuestsForRank(rankKey, existingQuests = [], userSeed = '') {
  const count = RANK_CONFIG[rankKey].dailyQuestsPerPillar;
  const pools = DAILY_QUEST_POOLS;
  const result = [];

  // Deterministic seed: user identifier + today's date
  const today = new Date().toLocaleDateString('en-CA');
  const seedBase = hashString(`${userSeed || 'seeker'}-${today}`);
  const rng = seededRandom(seedBase);

  ['deen', 'body', 'money'].forEach(pillar => {
    const pool = pools[pillar][rankKey] || pools[pillar].E;
    // Fisher-Yates shuffle with seeded random
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const picked = shuffled.slice(0, count);
    picked.forEach((q, idx) => {
      // Deterministic uniqueId based on seed + pillar + index
      const deterministicId = `${q.id}-${seedBase}-${pillar}-${idx}`;
      result.push({
        ...q,
        xp: getEffectiveXp(q.baseXp, rankKey),
        uniqueId: deterministicId,
        completed: false,
        completedAt: null,
      });
    });
  });

  return result;
}

export function getLevelQuestsForLevel(level) {
  return LEVEL_QUESTS.find(lq => lq.level === level) || null;
}

export function getWeeklyDungeonForRank(rankKey) {
  const templates = WEEKLY_DUNGEON_TEMPLATES[rankKey] || WEEKLY_DUNGEON_TEMPLATES.E;
  const makePillarDungeon = (pillar, template) => ({
    ...template,
    steps: template.steps.map((s, i) => ({ id: `wd-${pillar}-${i}`, text: s, completed: false })),
  });
  return {
    weekId: null, // Set by caller
    deen: makePillarDungeon('deen', templates.deen),
    body: makePillarDungeon('body', templates.body),
    money: makePillarDungeon('money', templates.money),
    ummah: makePillarDungeon('ummah', templates.ummah),
    bonusClaimed: false,
  };
}

export function getRedemptionQuest(missedDays) {
  if (missedDays >= 7) return REDEMPTION_QUEST_TEMPLATES[1];
  if (missedDays >= 3) return REDEMPTION_QUEST_TEMPLATES[0];
  return null;
}

export function getJobChangeQuest(jobId) {
  return JOB_CHANGE_QUESTS.find(jc => jc.id === jobId) || null;
}
