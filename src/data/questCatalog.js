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

import { getGateForRank } from './physicsGates';

// ─── RANK CONFIGURATION ───
export const RANK_CONFIG = {
  E: { minLevel: 0,  maxLevel: 10,  title: 'Seeker',           name: 'Al-Bahith', color: 'text-gray-400',  hexColor: '#9ca3af', statPointsPerLevel: 1, dailyQuestsPerPillar: 2, xpMultiplier: 1.0 },
  D: { minLevel: 11, maxLevel: 25, title: 'Striver',          name: 'Al-Mujahid', color: 'text-cyan-400',  hexColor: '#22d3ee', statPointsPerLevel: 2, dailyQuestsPerPillar: 3, xpMultiplier: 1.3 },
  C: { minLevel: 26, maxLevel: 45, title: 'Disciplined',      name: 'Al-Murabit', color: 'text-blue-400',  hexColor: '#60a5fa', statPointsPerLevel: 3, dailyQuestsPerPillar: 3, xpMultiplier: 1.6 },
  B: { minLevel: 46, maxLevel: 70, title: 'Scholar',          name: 'Al-Alim', color: 'text-purple-400',hexColor: '#c084fc', statPointsPerLevel: 4, dailyQuestsPerPillar: 4, xpMultiplier: 2.0 },
  A: { minLevel: 71, maxLevel: 99, title: 'Guide',            name: 'Al-Hadi', color: 'text-orange-400',hexColor: '#fb923c', statPointsPerLevel: 5, dailyQuestsPerPillar: 4, xpMultiplier: 2.5 },
  S: { minLevel: 100,maxLevel: 999,title: 'Khalifa',           name: 'Al-Khalifa', color: 'text-yellow-400',hexColor: '#facc15', statPointsPerLevel: 6, dailyQuestsPerPillar: 5, xpMultiplier: 3.0 },
};

export function getRankByLevel(level) {
  for (const [key, config] of Object.entries(RANK_CONFIG)) {
    if (level >= config.minLevel && level <= config.maxLevel) return { key, ...config };
  }
  return { key: 'S', ...RANK_CONFIG.S };
}

// ─── XP CURVE (Generous — "Doomed for Success") ───
// Tiered: exponential early, linear ramp in S-rank so 999 is achievable
export function xpForNextLevel(level) {
  if (level <= 99) {
    // Early game: exponential (max ~83,522 at level 99)
    return Math.floor(100 * Math.pow(1.12, level));
  }
  if (level <= 299) {
    // S-I Monarch: 100k → 498k (adds ~2,000 per level)
    return 100000 + (level - 100) * 2000;
  }
  if (level <= 599) {
    // S-II Sovereign: 500k → 1.995M (adds ~5,000 per level)
    return 500000 + (level - 300) * 5000;
  }
  // S-III Divine: 2M → 5.99M (adds ~10,000 per level)
  return 2000000 + (level - 600) * 10000;
}

/** S-rank sub-tier helper */
export function getSRankSubTier(level) {
  if (level >= 600) return { key: 'S_III', name: 'Divine',     label: 'S-III' };
  if (level >= 300) return { key: 'S_II',  name: 'Sovereign',  label: 'S-II' };
  if (level >= 100) return { key: 'S_I',   name: 'Monarch',    label: 'S-I' };
  return null;
}

export function getEffectiveXp(baseXp, rankKey, level = 0) {
  let mult = RANK_CONFIG[rankKey]?.xpMultiplier || 1.0;
  // S-rank: scale base XP by level tier
  if (rankKey === 'S' && level >= 100) {
    const sub = getSRankSubTier(level);
    if (sub?.key === 'S_II')  baseXp = Math.floor(baseXp * 2.5);
    if (sub?.key === 'S_III') baseXp = Math.floor(baseXp * 5.0);
    // S-I uses base S multiplier (3.0x)
  }
  return Math.floor(baseXp * mult);
}

// ─── DAILY QUEST POOLS BY RANK & PILLAR ───
// Each day, the engine picks N quests from the pool for the user's current rank

export const DAILY_QUEST_POOLS = {
  deen: {
    E: [
      { id: 'd-deen-e-1', title: 'Fajr on Time', description: 'Pray Fajr within 10 min of adhan. The Prophet ﷺ said: "The two sunnah rakahs of Fajr are better than this world and everything in it." Leadership begins with showing up before the sun.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['salah', 'sunnah'] },
      { id: 'd-deen-e-2', title: 'Morning Adhkar', description: 'Say Ayat al-Kursi + 3x Ikhlas/Falaq/Nas after Fajr. The Prophet ﷺ never missed these. Armor for the day ahead.', baseXp: 10, pillar: 'deen', estimatedMinutes: 3, tags: ['adhkar', 'sunnah'] },
      { id: 'd-deen-e-3', title: 'Leadership Seed', description: 'Read or listen to one story for 2 minutes on how the Prophet ﷺ handled pressure. Emulate his character in one decision today.', steps: ['Open a seerah book, app, or YouTube. Search "Prophet patience" or "Prophet mercy".','Read or listen for 2 minutes.','Today, when someone annoys you, respond with patience or mercy instead of anger.'], baseXp: 10, pillar: 'deen', estimatedMinutes: 2, tags: ['seerah', 'leadership'] },
      { id: 'd-deen-e-4', title: 'Evening Adhkar', description: 'Say evening adhkar once after Maghrib or Isha. Protection as taught by the Prophet ﷺ — the Khalifa shields his household at night.', baseXp: 10, pillar: 'deen', estimatedMinutes: 3, tags: ['adhkar', 'evening'] },
      { id: 'd-deen-e-5', title: 'Reflection Before Sleep', description: 'Make specific dua before sleeping + seek forgiveness for any slips in character today. The leader audits himself daily.', baseXp: 10, pillar: 'deen', estimatedMinutes: 2, tags: ['dua', 'istighfar'] },
      { id: 'd-deen-e-6', title: 'All 5 Prayers', description: 'Pray all 5 daily prayers on time (±15 min window). The foundation of the believer — and the foundation of any Ummah you will lead.', baseXp: 20, pillar: 'deen', estimatedMinutes: 30, tags: ['salah', 'core'] },
      { id: 'd-deen-e-7', title: 'Quran Recitation Grind', description: 'Recite Quran for 5 minutes with translation and focus in private. Study the guidance of the verses.', baseXp: 12, pillar: 'deen', estimatedMinutes: 5, tags: ['quran', 'study'] },
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
      { id: 'd-deen-c-5', title: 'Prophetic Character Check', description: 'Practice one specific prophetic trait today: patience, truthfulness, mercy, or forgiveness. The Khalifate is built on character, not just knowledge.', steps: ['Pick one trait for today: patience, truthfulness, mercy, or forgiveness.','Write it on a note or set a phone reminder with that word.','When tested today, pause and choose that trait. Log what happened.'], baseXp: 20, pillar: 'deen', estimatedMinutes: 0, tags: ['character', 'akhlaq'] },
      { id: 'd-deen-c-6', title: 'Dua List', description: 'Make a list of 3 specific duas and make them at the times they are accepted. Lead your family in dua at one of these times today.', steps: ['Write 3 specific things you need: health, income, family peace, exam success.','Make each dua at one accepted time: after Fajr, between adhan and iqamah, or in sujood.','Ask one family member to make dua with you at one of these times.'], baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['dua', 'intention'] },
      { id: 'd-deen-c-7', title: 'Sadaqah Daily', description: 'Give any amount of sadaqah. The Prophet ﷺ was the most generous — and sadaqah purifies the wealth that will one day fund the Ummah.', baseXp: 15, pillar: 'deen', estimatedMinutes: 2, tags: ['charity', 'sadaqah'] },
      { id: 'd-deen-c-8', title: 'Qaylulah', description: 'Take a 15-20 minute midday nap (Qaylulah) for energy and Sunnah. The leader must be sharp, not exhausted.', baseXp: 10, pillar: 'deen', estimatedMinutes: 20, tags: ['health', 'sunnah'] },
    ],
    B: [
      { id: 'd-deen-b-1', title: 'Tahajjud + Witr', description: 'Pray Tahajjud (minimum 2 rakahs) + Witr before Fajr. The private conversation with Allah that gives public strength.', baseXp: 30, pillar: 'deen', estimatedMinutes: 20, tags: ['tahajjud', 'witr'] },
      { id: 'd-deen-b-2', title: 'Deep Seerah Study', description: 'Study seerah, hadith, or fiqh for 30 minutes. Deepen your understanding of the Prophet ﷺ — depth creates authority.', baseXp: 25, pillar: 'deen', estimatedMinutes: 30, tags: ['seerah', 'deep'] },
      { id: 'd-deen-b-3', title: 'Hadith Study Grind', description: 'Study 2 Hadiths from Sahih Bukhari or Sahih Muslim with commentary for 15 minutes in private. Extract one moral action item.', baseXp: 25, pillar: 'deen', estimatedMinutes: 15, tags: ['hadith', 'study'] },
      { id: 'd-deen-b-4', title: 'Itikaf Micro', description: 'Spend 10 minutes in quiet reflection/dhikr after any prayer. Sit with the Quran even if you don\'t recite — presence over performance.', steps: ['After any salah, sit where you prayed.','Do dhikr or just sit quietly for 10 minutes. No phone.','If you want, open the Quran and read one verse. Presence is the goal.'], baseXp: 20, pillar: 'deen', estimatedMinutes: 10, tags: ['dhikr', 'reflection'] },
      { id: 'd-deen-b-5', title: 'Complete Rawatib + Duha', description: 'Pray all 12 rawatib + Duha prayer (Salat al-Ishraq). Set the household rhythm — when you pray, they pray.', baseXp: 30, pillar: 'deen', estimatedMinutes: 25, tags: ['salah', 'nafl'] },
      { id: 'd-deen-b-6', title: 'Fasting Monday/Thursday', description: 'Fast Monday or Thursday (or both). The Sunnah fasts — discipline the body for the Ummah\'s sake.', baseXp: 30, pillar: 'deen', estimatedMinutes: 0, tags: ['fasting', 'sunnah'] },
      { id: 'd-deen-b-7', title: 'Night Adhkar + Wudu Before Bed', description: 'Sleep with wudu and complete night adhkar. End the day armored.', baseXp: 20, pillar: 'deen', estimatedMinutes: 5, tags: ['adhkar', 'wudu'] },
      { id: 'd-deen-b-8', title: 'Quran Tafseer Study', description: 'Study the Tafseer (commentary) of 3 verses of Surah Al-Kahf or Surah Al-Mulk for 15 minutes. Meditate on the lessons.', baseXp: 25, pillar: 'deen', estimatedMinutes: 15, tags: ['tafsir', 'study'] },
    ],
    A: [
      { id: 'd-deen-a-1', title: 'Tahajjud + Dua Marathon', description: 'Pray Tahajjud and make extended dua in sujood (20+ min total). Make dua for the Ummah, for the leadership of this ummah, for Imam Mahdi (AS).', baseXp: 35, pillar: 'deen', estimatedMinutes: 25, tags: ['tahajjud', 'dua'] },
      { id: 'd-deen-a-2', title: 'Scholarly Seerah Study', description: 'Study advanced seerah, hadith, or Islamic texts for 45 minutes. The scholars\' seerah is governance and statecraft — your future curriculum.', baseXp: 30, pillar: 'deen', estimatedMinutes: 45, tags: ['seerah', 'advanced'] },
      { id: 'd-deen-a-3', title: 'Islamic Jurisprudence Study', description: 'Study basic Fiqh (jurisprudence) or Aqeedah (theology) for 20 minutes from a trusted classical text in private.', baseXp: 35, pillar: 'deen', estimatedMinutes: 20, tags: ['fiqh', 'study'] },
      { id: 'd-deen-a-4', title: 'Tafseer Deep Study', description: 'Read Tafseer of a full Quran page for 20 minutes in private. Document the action items and guidelines it presents.', baseXp: 30, pillar: 'deen', estimatedMinutes: 20, tags: ['tafsir', 'deep'] },
      { id: 'd-deen-a-5', title: 'Complete Juz with Tafsir', description: 'Read or review 1/2 to 1 Juz of Quran with tafsir reflection. Read it as if you will lead with it tomorrow.', baseXp: 30, pillar: 'deen', estimatedMinutes: 45, tags: ['quran', 'tafsir'] },
      { id: 'd-deen-a-6', title: '6 Days of Shawwal / Weekly Fast', description: 'If in Shawwal, fast the 6 days. Otherwise, fast 3 days this week. The body is amanah, the fast is training.', baseXp: 30, pillar: 'deen', estimatedMinutes: 0, tags: ['fasting', 'sunnah'] },
      { id: 'd-deen-a-7', title: 'Muhasabah Deep Review', description: '30-minute self-accountability: review the week, seek forgiveness, plan fixes. The leader audits himself before others do.', baseXp: 25, pillar: 'deen', estimatedMinutes: 30, tags: ['muhasabah', 'review'] },
      { id: 'd-deen-a-8', title: 'Sahaba Biography Study', description: 'Study the biography, struggles, and character of a Sahaba (Companion of the Prophet ﷺ) for 20 minutes.', baseXp: 25, pillar: 'deen', estimatedMinutes: 20, tags: ['sahaba', 'seerah'] },
    ],
    S: [
      { id: 'd-deen-s-1', title: "The Monarch's Tahajjud", description: 'Pray Tahajjud with deep focus and extended Quran recitation (30+ min). Make dua for the Ummah by name — the Monarch carries the whole community in his sujood.', baseXp: 40, pillar: 'deen', estimatedMinutes: 35, tags: ['tahajjud', 'master'] },
      { id: 'd-deen-s-2', title: 'Seerah: Statecraft & Governance', description: '1 hour seerah mastery focused on governance — treaties, diplomacy, treaties with non-Muslims, treaties between tribes. The Khalifa\'s MBA.', baseXp: 35, pillar: 'deen', estimatedMinutes: 60, tags: ['seerah', 'governance'] },
      { id: 'd-deen-s-3', title: 'Islamic Governance & Statecraft', description: 'Study the governance, history, and caliphate treaties of the Rightly Guided Caliphs (Khulafa-e-Rashideen) for 45 minutes.', baseXp: 40, pillar: 'deen', estimatedMinutes: 45, tags: ['history', 'governance'] },
      { id: 'd-deen-s-4', title: 'Juz with Tafsir Reflection', description: 'Read 1 Juz with tafsir and write a 1-page reflection in your private study journal. Focus on the core guidance.', baseXp: 35, pillar: 'deen', estimatedMinutes: 60, tags: ['quran', 'mastery'] },
      { id: 'd-deen-s-5', title: 'Spiritual Retreat', description: 'Plan or execute a half-day itikaf or spiritual retreat. Recharge the source from which everything else flows.', baseXp: 40, pillar: 'deen', estimatedMinutes: 120, tags: ['itikaf', 'retreat'] },
      { id: 'd-deen-s-6', title: 'Deep Tafseer & Quran Mastery', description: 'Study the Tafseer of a Juz section and write down a private summary reflection on its guidance and laws.', baseXp: 35, pillar: 'deen', estimatedMinutes: 45, tags: ['quran', 'tafsir'] },
      { id: 'd-deen-s-7', title: 'Advanced Fasting', description: 'Fast Davidic fast: half the year (alternate days) or 3 days per month. The body is a tool — sharpen it for the Ummah.', baseXp: 40, pillar: 'deen', estimatedMinutes: 0, tags: ['fasting', 'advanced'] },
      { id: 'd-deen-s-8', title: 'Hadith Commentary Mastery', description: 'Study 5 Hadiths from Riyadh as-Salihin or Forty Hadith of Nawawi with commentary for 30 minutes in private.', baseXp: 35, pillar: 'deen', estimatedMinutes: 30, tags: ['hadith', 'commentary'] },
    ],
  },

  body: {
    E: [
      { id: 'd-body-e-1', title: 'First Forge — Push-ups 3×8', description: 'Three sets of eight push-ups. Chest to floor, full lockout. The first strike of the forge.', baseXp: 10, pillar: 'body', estimatedMinutes: 8, tags: ['strength','push'] },
      { id: 'd-body-e-2', title: 'Squat Foundation 3×10', description: 'Three sets of ten bodyweight squats. Below parallel, controlled tempo.', baseXp: 10, pillar: 'body', estimatedMinutes: 8, tags: ['strength','squat'] },
      { id: 'd-body-e-3', title: 'Incline Rows 3×6', description: 'Three sets of six incline rows under a table or bar. Pull the chest to the bar.', baseXp: 10, pillar: 'body', estimatedMinutes: 8, tags: ['strength','pull'] },
      { id: 'd-body-e-4', title: 'Broad Jump 5×3', description: 'Five sets of three standing broad jumps. Stick the landing, reset each rep.', baseXp: 10, pillar: 'body', estimatedMinutes: 7, tags: ['power','jump'] },
      { id: 'd-body-e-5', title: '1K Jog', description: 'One kilometer at an easy, conversational pace. Build the engine.', baseXp: 10, pillar: 'body', estimatedMinutes: 12, tags: ['endurance','run'] },
      { id: 'd-body-e-6', title: 'Plank + Dead Hang', description: '30-second plank, then 15-second dead hang. Two rounds.', baseXp: 8, pillar: 'body', estimatedMinutes: 6, tags: ['resilience','core','grip'] },
      { id: 'd-body-e-7', title: '5-Minute Mobility', description: 'Five minutes of hip + shoulder mobility. Slow, controlled, breathe.', baseXp: 8, pillar: 'body', estimatedMinutes: 5, tags: ['resilience','mobility'] },
      { id: 'd-body-e-8', title: 'Protein Hit', description: 'Hit your daily protein target (g/kg bodyweight). Fuel the forge.', baseXp: 8, pillar: 'body', estimatedMinutes: 5, tags: ['resilience','nutrition'] },
    ],
    D: [
      { id: 'd-body-d-1', title: 'Pull-up Negatives 5×3', description: 'Five slow negative pull-ups. Lower over five seconds, jump back up. The strong believer is more beloved to Allah.', baseXp: 12, pillar: 'body', estimatedMinutes: 10, tags: ['strength','pull'] },
      { id: 'd-body-d-2', title: 'Goblet Squat 3×10', description: 'Three sets of ten goblet squats with a dumbbell, kettlebell, or water jug. Below parallel, controlled.', baseXp: 12, pillar: 'body', estimatedMinutes: 10, tags: ['strength','squat'] },
      { id: 'd-body-d-3', title: 'Push-up Ladder 5-7-9', description: 'One set of 5, then 7, then 9 push-ups. No knees. Full range. The forge heats up.', baseXp: 12, pillar: 'body', estimatedMinutes: 10, tags: ['strength','push'] },
      { id: 'd-body-d-4', title: 'Broad Jump 5×3', description: 'Five sets of three broad jumps. Aim 1.8m, stick the landing, reset each rep.', baseXp: 12, pillar: 'body', estimatedMinutes: 8, tags: ['power','jump'] },
      { id: 'd-body-d-5', title: '1.6K Run', description: '1.6 km at an easy pace. Jog what you can, walk the rest — do not stop moving.', baseXp: 12, pillar: 'body', estimatedMinutes: 14, tags: ['endurance','run'] },
      { id: 'd-body-d-6', title: 'Interval Run 6×200m', description: 'Six 200m repeats. Hard effort, walk back, 90s rest. Lungs for the Ummah.', baseXp: 12, pillar: 'body', estimatedMinutes: 12, tags: ['endurance','interval','run'] },
      { id: 'd-body-d-7', title: 'Dead Hang 20s + Plank 45s', description: '20-second dead hang, then 45-second plank. Two rounds. Grip and core are the foundation of strength.', baseXp: 10, pillar: 'body', estimatedMinutes: 8, tags: ['resilience','grip','core'] },
      { id: 'd-body-d-8', title: 'Protein Target', description: 'Hit your daily protein target and log the grams. The body is an amanah — fuel it.', baseXp: 10, pillar: 'body', estimatedMinutes: 5, tags: ['resilience','nutrition'] },
      { id: 'd-body-d-9', title: '10-Minute Mobility', description: 'Ten minutes of hip, shoulder, and ankle mobility. The Khalifa maintains his weapon.', baseXp: 10, pillar: 'body', estimatedMinutes: 10, tags: ['resilience','mobility'] },
    ],
    C: [
      { id: 'd-body-c-1', title: 'Squat 3×5', description: 'Squat 3×5 at ~80% of your training max (see Power Log). Below parallel, braced, controlled.', baseXp: 18, pillar: 'body', estimatedMinutes: 15, tags: ['strength','squat'] },
      { id: 'd-body-c-2', title: 'Deadlift 3×5', description: 'Deadlift 3×5 at ~80% of your training max (see Power Log). Flat back, drive the floor.', baseXp: 18, pillar: 'body', estimatedMinutes: 15, tags: ['strength','lift'] },
      { id: 'd-body-c-3', title: 'Overhead Press 3×5', description: 'Overhead press 3×5 at ~80% of your training max (see Power Log). Strict, no leg drive.', baseXp: 18, pillar: 'body', estimatedMinutes: 12, tags: ['strength','push'] },
      { id: 'd-body-c-4', title: 'Pull-ups 5×5', description: 'Five sets of five strict pull-ups. Add weight if bodyweight is easy. The Khalifa pulls his own weight and more.', baseXp: 18, pillar: 'body', estimatedMinutes: 12, tags: ['strength','pull'] },
      { id: 'd-body-c-5', title: 'Hill Sprints 6×30m', description: 'Six 30m hill sprints. Walk down, full recovery. Power over gravity.', baseXp: 18, pillar: 'body', estimatedMinutes: 12, tags: ['power','sprint'] },
      { id: 'd-body-c-6', title: 'Box Jumps 5×3', description: 'Five sets of three box jumps. Step down, reset each rep. Explosive off the floor.', baseXp: 18, pillar: 'body', estimatedMinutes: 8, tags: ['power','jump'] },
      { id: 'd-body-c-7', title: '5K Run', description: '5 km at a steady pace. Run the whole distance if you can; jog what you cannot. Build the engine.', baseXp: 18, pillar: 'body', estimatedMinutes: 30, tags: ['endurance','run'] },
      { id: 'd-body-c-8', title: 'Interval Run 8×400m', description: 'Eight 400m repeats at hard effort. 90s walk rest between. Lungs for the Ummah.', baseXp: 18, pillar: 'body', estimatedMinutes: 25, tags: ['endurance','interval','run'] },
      { id: 'd-body-c-9', title: 'Mobility 10 Min', description: 'Ten minutes of hip, shoulder, and ankle mobility. Slow, controlled, breathe.', baseXp: 15, pillar: 'body', estimatedMinutes: 10, tags: ['resilience','mobility'] },
      { id: 'd-body-c-10', title: 'Sleep ≥7h', description: 'Sleep at least 7 hours tonight. Recovery is not optional — the Khalifa rests so he can rise.', baseXp: 15, pillar: 'body', estimatedMinutes: 0, tags: ['resilience','sleep'] },
    ],
    B: [
      { id: 'd-body-b-1', title: 'Squat 5×5', description: 'Squat 5×5 at ~80% of your training max (see Power Log). Add 2.5kg next session if all reps hit.', baseXp: 25, pillar: 'body', estimatedMinutes: 20, tags: ['strength','squat'] },
      { id: 'd-body-b-2', title: 'Deadlift 5×5', description: 'Deadlift 5×5 at ~80% of your training max (see Power Log). Add 2.5kg next session if all reps hit.', baseXp: 25, pillar: 'body', estimatedMinutes: 18, tags: ['strength','lift'] },
      { id: 'd-body-b-3', title: 'Overhead Press 5×5', description: 'Overhead press 5×5 at ~80% of your training max (see Power Log). Add 1kg next session if all reps hit.', baseXp: 25, pillar: 'body', estimatedMinutes: 15, tags: ['strength','push'] },
      { id: 'd-body-b-4', title: 'Pull-ups ×8', description: 'Eight strict pull-ups. Add weight if bodyweight is easy. The Khalifa pulls his own weight and more.', baseXp: 25, pillar: 'body', estimatedMinutes: 12, tags: ['strength','pull'] },
      { id: 'd-body-b-5', title: 'Box Jumps 5×5', description: 'Five sets of five box jumps. Step down, reset each rep. Explosive off the floor.', baseXp: 25, pillar: 'body', estimatedMinutes: 10, tags: ['power','jump'] },
      { id: 'd-body-b-6', title: 'Hill Sprints 8×40m', description: 'Eight 40m hill sprints. Walk down, full recovery. Power over gravity.', baseXp: 25, pillar: 'body', estimatedMinutes: 15, tags: ['power','sprint'] },
      { id: 'd-body-b-7', title: 'Ruck 10kg / 3km', description: 'Carry a 10kg pack for 3km. Walk or jog — do not stop. The Khalifa carries his load.', baseXp: 25, pillar: 'body', estimatedMinutes: 40, tags: ['endurance','ruck'] },
      { id: 'd-body-b-8', title: '400m Intervals 8×', description: 'Eight 400m repeats at hard effort. 90s walk rest between. Lungs for the Ummah.', baseXp: 25, pillar: 'body', estimatedMinutes: 25, tags: ['endurance','interval','run'] },
      { id: 'd-body-b-9', title: 'Farmer\'s Carry 2×40m', description: 'Heavy farmer\'s carry, 40m there and back. Grip and core under load. The Khalifa carries weight others avoid.', baseXp: 25, pillar: 'body', estimatedMinutes: 8, tags: ['strength','carry'] },
      { id: 'd-body-b-10', title: 'Recovery Audit', description: 'Review sleep, protein, and soreness. If recovery is red, deload 10% next session (see Power Log).', baseXp: 20, pillar: 'body', estimatedMinutes: 10, tags: ['resilience','sleep'] },
      { id: 'd-body-b-11', title: 'Plank 90s + Hang 30s', description: '90-second plank, then 30-second dead hang. Two rounds. The foundation under every lift.', baseXp: 20, pillar: 'body', estimatedMinutes: 8, tags: ['resilience','core','grip'] },
    ],
    A: [
      { id: 'd-body-a-1', title: 'Squat PR 3×3', description: 'Squat 3×3 at ~90% of your training max (see Power Log). Then a single at ~95% if all reps hit.', baseXp: 30, pillar: 'body', estimatedMinutes: 20, tags: ['strength','squat'] },
      { id: 'd-body-a-2', title: 'Deadlift PR 3×3', description: 'Deadlift 3×3 at ~90% of your training max (see Power Log). Then a single at ~95% if all reps hit.', baseXp: 30, pillar: 'body', estimatedMinutes: 18, tags: ['strength','lift'] },
      { id: 'd-body-a-3', title: 'Overhead Press PR 3×3', description: 'Overhead press 3×3 at ~90% of your training max (see Power Log). Then a single at ~95% if all reps hit.', baseXp: 30, pillar: 'body', estimatedMinutes: 15, tags: ['strength','push'] },
      { id: 'd-body-a-4', title: 'Weighted Pull-ups 5×5', description: 'Five sets of five pull-ups with 10-20% bodyweight added. Strict, full hang. The Khalifa pulls more than his own weight.', baseXp: 30, pillar: 'body', estimatedMinutes: 12, tags: ['strength','pull'] },
      { id: 'd-body-a-5', title: 'Plyo Circuit 5 Rounds', description: 'Five rounds: box jumps, broad jumps, depth jumps. Explosive intent on every rep.', baseXp: 30, pillar: 'body', estimatedMinutes: 15, tags: ['power','plyo','jump'] },
      { id: 'd-body-a-6', title: 'Sprints 8×100m', description: 'Eight 100m sprints. Walk back, full recovery. Maximum effort, maximum output.', baseXp: 30, pillar: 'body', estimatedMinutes: 15, tags: ['power','sprint'] },
      { id: 'd-body-a-7', title: '10K Run', description: '10 km at a steady pace. Run the whole distance. The Khalifa does not stop.', baseXp: 30, pillar: 'body', estimatedMinutes: 55, tags: ['endurance','run'] },
      { id: 'd-body-a-8', title: 'Heavy Ruck 20kg / 5km', description: 'Carry a 20kg pack for 5km. Walk or jog — do not stop. The Khalifa carries the Ummah\'s weight.', baseXp: 30, pillar: 'body', estimatedMinutes: 60, tags: ['endurance','ruck'] },
      { id: 'd-body-a-9', title: 'Interval Run 10×400m', description: 'Ten 400m repeats at hard effort. 60s rest between. Lungs of iron.', baseXp: 30, pillar: 'body', estimatedMinutes: 30, tags: ['endurance','interval','run'] },
      { id: 'd-body-a-10', title: 'Competition Day', description: 'Enter and complete a competition: 5K, powerlifting meet, or obstacle event. Prove your capacity against others.', baseXp: 30, pillar: 'body', estimatedMinutes: 60, tags: ['endurance','run'] },
      { id: 'd-body-a-11', title: 'Recovery Audit + Plank 2min', description: 'Audit sleep, protein, and soreness. Then a 2-minute plank. The Khalifa rests to rise again.', baseXp: 25, pillar: 'body', estimatedMinutes: 12, tags: ['resilience','sleep','core'] },
    ],
    S: [
      { id: 'd-body-s-1', title: 'Squat 2×BW Work Sets', description: 'Squat 3×3 at 2× bodyweight (see Power Log). Then a single at 2.25×BW. The Monarch moves mountains.', baseXp: 40, pillar: 'body', estimatedMinutes: 25, tags: ['strength','squat'] },
      { id: 'd-body-s-2', title: 'Deadlift 2.5×BW', description: 'Deadlift 3×3 at 2.5× bodyweight (see Power Log). Then a single at 2.75×BW.', baseXp: 40, pillar: 'body', estimatedMinutes: 20, tags: ['strength','lift'] },
      { id: 'd-body-s-3', title: 'Overhead Press 1.5×BW', description: 'Overhead press 3×3 at 1.5× bodyweight (see Power Log). Strict, no leg drive.', baseXp: 40, pillar: 'body', estimatedMinutes: 18, tags: ['strength','push'] },
      { id: 'd-body-s-4', title: 'Weighted Pull-ups ×12', description: 'Twelve pull-ups with 20-30% bodyweight added. Strict, full hang. The Monarch pulls his own weight and the Ummah\'s.', baseXp: 40, pillar: 'body', estimatedMinutes: 15, tags: ['strength','pull'] },
      { id: 'd-body-s-5', title: 'Depth + Broad Jumps 6×3', description: 'Six sets of three depth jumps into broad jumps. Maximum explosive output. Reset each rep.', baseXp: 40, pillar: 'body', estimatedMinutes: 18, tags: ['power','plyo','jump'] },
      { id: 'd-body-s-6', title: 'Sprints 10×150m', description: 'Ten 150m sprints. Walk back, full recovery. The Monarch\'s pace breaks the wind.', baseXp: 40, pillar: 'body', estimatedMinutes: 20, tags: ['power','sprint'] },
      { id: 'd-body-s-7', title: 'Half-Marathon Prep 16km', description: '16 km at a steady pace. The half-marathon is the next gate — build the distance.', baseXp: 40, pillar: 'body', estimatedMinutes: 90, tags: ['endurance','run'] },
      { id: 'd-body-s-8', title: 'Heavy Ruck 30kg / 10km', description: 'Carry a 30kg pack for 10km. Walk or jog — do not stop. The Monarch carries what others cannot.', baseXp: 40, pillar: 'body', estimatedMinutes: 120, tags: ['endurance','ruck'] },
      { id: 'd-body-s-9', title: 'Interval Run 12×400m', description: 'Twelve 400m repeats at hard effort. 60s rest between. Lungs of iron, will of steel.', baseXp: 40, pillar: 'body', estimatedMinutes: 35, tags: ['endurance','interval','run'] },
      { id: 'd-body-s-10', title: 'Lead Group Session', description: 'Lead 3+ people through a 60-minute strength, run, or ruck session. The Monarch carries the community forward.', baseXp: 40, pillar: 'body', estimatedMinutes: 60, tags: ['endurance','ruck','run'] },
      { id: 'd-body-s-11', title: 'Recovery Audit + Sleep 8h', description: 'Audit the week: sleep, protein, soreness, training max. Sleep 8+ hours. The Monarch recovers to reign.', baseXp: 35, pillar: 'body', estimatedMinutes: 15, tags: ['resilience','sleep'] },
      { id: 'd-body-s-12', title: 'Plank 3min + Hang 60s', description: 'Three-minute plank, then 60-second dead hang. Two rounds. The foundation under every Monarch\'s lift.', baseXp: 35, pillar: 'body', estimatedMinutes: 12, tags: ['resilience','core','grip'] },
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
      { id: 'd-money-s-1', title: 'Manage AI Empire', description: 'Manage a diversified AI/wealth empire: AI products, investments, automated income. The Khalifate runs many streams at once.', steps: ['Review your active income streams: products, clients, investments, content.','Fix one broken or slow stream: update a listing, message a client, rebalance a portfolio, or publish new content.','Log one action per stream you touched today.'], baseXp: 40, pillar: 'money', estimatedMinutes: 60, tags: ['ai', 'empire'] },
      { id: 'd-money-s-2', title: 'Empire Strategic Action', description: 'Take a major strategic action: acquisition, partnership, or new market entry. The Khalifate moves in decisive leaps.', steps: ['Pick one strategic move: email a potential partner, apply to a new market, buy a tool, or hire a freelancer.','Draft and send the message, make the payment, or sign the agreement.','Log the action and the expected result. Follow up in 7 days.'], baseXp: 40, pillar: 'money', estimatedMinutes: 90, tags: ['business', 'empire'] },
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

const RAW_LEVEL_QUESTS = [
  // ═══════════════════════════════════════
  // E-RANK: THE AWAKENING (Levels 0-10)
  // ═══════════════════════════════════════
  {
    level: 1, rank: 'E', title: 'The Khalifa Awakens',
    description: 'You have been chosen. The Khalifate begins with a single step: prayer, first steps on earth, and a line of code.',
    quests: [
      { id: 'lq-e-1-1', title: 'First Prayer on Time', description: 'Pray one salah exactly on time today. This is your first awakening — the leader begins with salah.', steps: ['Check prayer time for your city.','When the time enters, stop what you are doing and pray within 5 minutes.','Say one dua after the prayer asking Allah to accept it.'], xp: 50, pillar: 'deen' },
      { id: 'lq-e-1-2', title: 'First Forge Activation', description: 'Walk 1,000 steps, then 10 push-ups and 10 bodyweight squats. The forge ignites with the first rep on the earth Allah placed under your feet.', steps: ['Open your step counter or health app.','Walk a street or path you have never walked before until you hit 1,000 steps.','Find grass, soil, or sand. Stand barefoot for 5 minutes, then do 10 push-ups and 10 squats. Breathe.'], xp: 30, pillar: 'body' },
      { id: 'lq-e-1-3', title: 'First AI Tool Mastery', description: 'Use an AI tool to complete one real money-making or productivity task — draft a pitch, research a market, analyze a stock, or automate a workflow. High-leverage tools are the Khalifate\'s weapon.', steps: ['Open Claude, ChatGPT, or any AI tool.','Pick one real task you need done today: write an email, research a topic, make a list, or summarize a document.','Type your request, get the result, and use it.'], xp: 30, pillar: 'money' },
    ],
    reward: { gold: 50, statPoints: 1, message: 'The System has recognized you. Welcome, Seeker. The Khalifate is forged.' },
  },
  {
    level: 2, rank: 'E', title: 'The Seeker\'s Vow',
    description: 'Commit to the path. Consistency is the seed of all greatness.',
    quests: [
      { id: 'lq-e-2-1', title: '3-Day Prayer Streak', description: 'Pray all 5 prayers on time for 3 consecutive days.', steps: ['Set prayer reminders on your phone for all 5 prayers.','When each reminder fires, pray within 10 minutes.','Do this for 3 days in a row. If you miss one, restart the count.'], xp: 60, pillar: 'deen' },
      { id: 'lq-e-2-2', title: 'Movement Habit', description: 'Walk or train outdoors 10 minutes every day for 3 days.', steps: ['Put on shoes and step outside.','Walk for exactly 10 minutes. No phone scrolling. Just walk and observe.','Repeat for 3 days in a row. Log each day.'], xp: 40, pillar: 'body' },
      { id: 'lq-e-2-3', title: 'AI Learning Streak', description: 'Study one AI concept (15 min) every day for 3 days. The Khalifate learns daily.', steps: ['Pick one topic: what is ChatGPT, how do LLMs work, or what is a neural net.','Read one article or watch one video for 15 minutes.','Write one sentence summarizing what you learned. Repeat for 3 days.'], xp: 40, pillar: 'money' },
    ],
    reward: { gold: 60, statPoints: 1, message: 'Your vow has been recorded. The System watches.' },
  },
  {
    level: 3, rank: 'E', title: 'Morning Barakah',
    description: 'The Prophet ﷺ said: "O Allah, bless my Ummah in their early mornings."',
    quests: [
      { id: 'lq-e-3-1', title: 'Fajr Warrior', description: 'Pray Fajr on time and stay awake for 30 minutes for 5 days.', steps: ['Set an alarm for Fajr or sleep early enough to wake naturally.','Pray Fajr within 10 minutes of the time entering.','Stay awake for 30 minutes after Fajr: read Quran, make dhikr, or plan your day.','Do this for 5 days.'], xp: 70, pillar: 'deen' },
      { id: 'lq-e-3-2', title: 'Hydration Discipline', description: 'Drink 1L of water every day for 5 days.', steps: ['Fill a 1-liter bottle or jar with water every morning.','Finish it before Maghrib.','Do this for 5 days. Log each day.'], xp: 50, pillar: 'body' },
      { id: 'lq-e-3-3', title: 'No Impulse Week', description: 'No impulse purchases for 7 days. Discipline in money = discipline in Khalifate.', steps: ['Before buying anything non-essential, wait 24 hours.','Write the item and the price in a note.','After 24 hours, decide if you still need it. If not, skip it.','Do this for 7 days.'], xp: 50, pillar: 'money' },
    ],
    reward: { gold: 70, statPoints: 1, message: 'Barakah flows in your mornings.' },
  },
  {
    level: 4, rank: 'E', title: 'The First Shadow',
    description: 'Your first habit is becoming automatic. This is your first Shadow extraction.',
    quests: [
      { id: 'lq-e-4-1', title: 'Dhikr Habit', description: 'Complete morning adhkar for 7 consecutive days.', steps: ['After Fajr, say: Ayat al-Kursi once, Surah Ikhlas 3x, Surah Falaq 3x, Surah Nas 3x.','Add: "SubhanAllah, Alhamdulillah, Allahu Akbar" 33 times each.','Do this for 7 days in a row. Log each day.'], xp: 80, pillar: 'deen' },
      { id: 'lq-e-4-2', title: 'Strength Seed', description: 'Walk outside every day for 7 days (minimum 10 min). The Khalifa\'s feet know the land before his hands build on it.', steps: ['Put on shoes and go outside.','Walk for at least 10 minutes. Count your steps if you want.','Do this for 7 days. Any weather. Any mood.'], xp: 60, pillar: 'body' },
      { id: 'lq-e-4-3', title: 'Sadaqah Seed', description: 'Give sadaqah every day for 7 days, even 1 rupee. The Ummah Treasury is seeded one rupee at a time.', steps: ['Find a charity box, a needy person, or an online cause.','Give something every day: 1 rupee, 5 rupees, food, or a kind act.','Do this for 7 days. Log the amount or act each day.'], xp: 60, pillar: 'money' },
    ],
    reward: { gold: 80, statPoints: 1, shadowUnlock: 'basic-dhikr', message: 'Your first Shadow has been extracted. "Arise."' },
  },
  {
    level: 5, rank: 'E', title: "The Aspirant's Trial",
    description: 'Push beyond your limits. The Khalifate is forged in sustained effort, not in sprints.',
    quests: [
      { id: 'lq-e-5-1', title: 'Quran Consistency', description: 'Read Quran for 5 minutes every day for 10 days.', steps: ['Open the Quran app or mushaf.','Read for exactly 5 minutes. It can be one page or half a page.','Do this for 10 days. Same time if possible.'], xp: 90, pillar: 'deen' },
      { id: 'lq-e-5-2', title: 'Sleep Discipline', description: 'Sleep by 10:30pm every night for 10 days. Protect your Fajr and your recovery.', steps: ['Set a phone alarm for 10:00pm as a wind-down reminder.','By 10:30pm, turn off all screens and lie down.','Do this for 10 days. Log each night.'], xp: 70, pillar: 'body' },
      { id: 'lq-e-5-3', title: 'AI Study Sprint', description: 'Study one AI/ML book or course for 15 min/day for 10 days. Knowledge is the Khalifate\'s ammunition.', steps: ['Open your AI book, course, or YouTube playlist.','Study for 15 minutes. No multitasking.','Write one sentence of notes. Do this for 10 days.'], xp: 70, pillar: 'money' },
    ],
    reward: { gold: 100, statPoints: 2, message: 'You have survived the Aspirant\'s Trial. You are ready for D-Rank.' },
  },
  {
    level: 6, rank: 'E', title: 'The Habit Forge',
    description: 'Habits are forged in repetition. Your will is the hammer.',
    quests: [
      { id: 'lq-e-6-1', title: 'All Prayers Week', description: 'All 5 prayers on time for 7 consecutive days.', steps: ['Set 5 prayer reminders on your phone.','Pray each salah within 15 minutes of its time.','Do this for 7 days. If you miss one, restart.'], xp: 100, pillar: 'deen' },
      { id: 'lq-e-6-2', title: 'Movement Mastery', description: '30 minutes of outdoor training (walk, ruck, or calisthenics) every day for 7 days.', steps: ['Go outside.','Walk, ruck, or do calisthenics for 30 minutes.','Do this for 7 days. Log the route or duration each day.'], xp: 80, pillar: 'body' },
      { id: 'lq-e-6-3', title: 'Spending Awareness', description: 'Categorize all expenses for 7 days.', steps: ['Open a notes app or spreadsheet.','Every time you spend money, write the amount and category: food, transport, bills, entertainment, etc.','Review after 7 days. See where your money actually goes.'], xp: 80, pillar: 'money' },
    ],
    reward: { gold: 100, statPoints: 1, message: 'Your habits are being forged in fire.' },
  },
  {
    level: 7, rank: 'E', title: 'The Disciple',
    description: 'Seek knowledge. The ink of the scholar is holier than the blood of the martyr.',
    quests: [
      { id: 'lq-e-7-1', title: 'Hadith Study', description: 'Read and reflect on 5 hadith from Riyad as-Salihin.', steps: ['Open Riyad as-Salihin or a hadith app.','Read 5 hadith.','For each, write one sentence: what character trait it teaches and one way you will apply it today.'], xp: 100, pillar: 'deen' },
      { id: 'lq-e-7-2', title: 'Nutrition Awareness', description: 'Eat only home-cooked food for 5 days.', steps: ['Plan 5 days of meals you can cook or someone at home can cook.','Do not order delivery or eat outside for 5 days.','Log what you ate each day.'], xp: 80, pillar: 'body' },
      { id: 'lq-e-7-3', title: 'Skill Identification', description: 'Identify and write a plan for learning one high-income skill.', steps: ['Pick one skill: coding, AI prompting, copywriting, design, sales, or data analysis.','Write why this skill fits you and the Muslim market.','List 3 free resources to start learning it and the first task you will do.'], xp: 80, pillar: 'money' },
    ],
    reward: { gold: 110, statPoints: 1, message: 'Knowledge is your weapon. Sharpen it daily.' },
  },
  {
    level: 8, rank: 'E', title: 'The Streak Keeper',
    description: 'Never miss twice. This is the secret of the strong.',
    quests: [
      { id: 'lq-e-8-1', title: '14-Day Deen Streak', description: 'Complete all daily Deen quests for 14 days.', steps: ['Open the app every day.','Complete every Deen quest shown that day.','Do this for 14 days. If you miss one, restart.'], xp: 120, pillar: 'deen' },
      { id: 'lq-e-8-2', title: '14-Day Training Streak', description: 'Complete all daily Body quests for 14 days.', steps: ['Open the app every day.','Complete every Body quest shown that day.','Do this for 14 days. If you miss one, restart.'], xp: 100, pillar: 'body' },
      { id: 'lq-e-8-3', title: '14-Day Money Streak', description: 'Complete all daily Money quests for 14 days.', steps: ['Open the app every day.','Complete every Money quest shown that day.','Do this for 14 days. If you miss one, restart.'], xp: 100, pillar: 'money' },
    ],
    reward: { gold: 120, statPoints: 2, message: 'Streaks are proof of your discipline. Keep them alive.' },
  },
  {
    level: 9, rank: 'E', title: 'The Prepared',
    description: 'You are nearly ready to ascend. Final preparations.',
    quests: [
      { id: 'lq-e-9-1', title: 'Evening Adhkar Mastery', description: 'Complete evening adhkar for 14 consecutive days.', steps: ['After Maghrib or before sleep, say: Ayat al-Kursi, 3x Ikhlas, 3x Falaq, 3x Nas.','Add: "SubhanAllah, Alhamdulillah, Allahu Akbar" 33 times each.','Do this for 14 days. Log each night.'], xp: 120, pillar: 'deen' },
      { id: 'lq-e-9-2', title: 'Early Sleep Mastery', description: 'Sleep by 10:00pm for 14 days.', steps: ['Set a wind-down alarm for 9:30pm.','By 10:00pm, be in bed with all screens off.','Do this for 14 days. Log each night.'], xp: 100, pillar: 'body' },
      { id: 'lq-e-9-3', title: 'Budget Creation', description: 'Create a simple monthly budget.', steps: ['List all income sources for the month.','List all fixed expenses: rent, bills, food, transport.','Subtract expenses from income. Allocate 10% to savings and 5% to sadaqah. Write it down.'], xp: 100, pillar: 'money' },
    ],
    reward: { gold: 130, statPoints: 1, message: 'You are prepared. The ascension awaits.' },
  },
  {
    level: 10, rank: 'E', title: "The Apprentice's Oath",
    description: 'You have proven yourself. The Khalifate begins. First AI project deployment is mandatory.',
    quests: [
      { id: 'lq-e-10-1', title: 'The 21-Day Challenge', description: 'Complete ALL daily quests across all pillars for 21 consecutive days.', steps: ['Open the app every single day.','Complete every daily quest shown: Deen, Physical Power, and Money.','Do this for 21 days. If you miss even one quest, restart.'], xp: 200, pillar: 'deen' },
      { id: 'lq-e-10-2', title: 'First Forge Test', description: 'Walk 5,000 steps, climb one set of stairs 10 times, do 20 push-ups and 20 squats, and spend 15 minutes outside without a phone.', steps: ['Walk 5,000 steps on grass, gravel, or any uneven surface.','Find stairs. Climb them 10 times.','Do 20 push-ups and 20 squats. Then sit or walk outside for 15 minutes with your phone in airplane mode.'], xp: 150, pillar: 'body' },
      { id: 'lq-e-10-3', title: 'Launch First AI-Assisted Service', description: 'Offer a service or product powered by AI tools to one real person — even a friend — and deliver results. Shipping value is the Khalifate\'s first weapon.', steps: ['Pick one thing you can do with AI help: write a resume, design a flyer, research a topic, or draft emails.','Message one person offering to help them with it for free or for a small fee.','Use AI to deliver the result. Send it. Get feedback.'], xp: 200, pillar: 'money' },
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
      { id: 'lq-d-12-1', title: 'Quran Deep Dive', description: 'Study tafsir of Surah Al-Fatiha and first 5 verses of Al-Baqarah.', steps: ['Open a tafsir book or app (Ibn Kathir, Maariful Quran, or a trusted video series).','Read or listen to the tafsir of Al-Fatiha and the first 5 verses of Al-Baqarah.','Write 3 sentences: one lesson from Al-Fatiha, one lesson from Al-Baqarah 1-5, and one action you will take.'], xp: 150, pillar: 'deen' },
      { id: 'lq-d-12-2', title: 'Character Focus', description: 'Practice patience for 7 days. Document one test and how you passed it.', steps: ['Decide that for 7 days you will pause 5 seconds before reacting to annoyance.','When someone irritates you, count to 5 before responding.','Write one sentence each day: what tested you and what you did.'], xp: 120, pillar: 'deen' },
      { id: 'lq-d-12-3', title: 'Night Prayer', description: 'Wake up 10 minutes before Fajr for extra dhikr or Tahajjud for 7 days.', steps: ['Set an alarm 10 minutes before Fajr time.','When it rings, get up, make wudu, and pray 2 rakahs of Tahajjud or make dhikr for 10 minutes.','Do this for 7 days. If you miss one, restart.'], xp: 120, pillar: 'deen' },
    ],
    reward: { gold: 150, statPoints: 2, shadowUnlock: 'devotee-path', message: 'The Devotee\'s Path is open to you.' },
  },
  {
    level: 14, rank: 'D', title: 'The Warrior\'s Forge',
    description: 'Your outdoor readiness is an amanah. Strengthen it as the strong believer is better.',
    quests: [
      { id: 'lq-d-14-1', title: '30-Day Outdoor Discipline', description: 'Spend 30 minutes outside every day for 30 days: walk, ruck, climb stairs, or train. Minimum 30 min/day.', steps: ['Go outside every day.','Spend 30 minutes walking, rucking, climbing stairs, or training.','Do this for 30 days. Log each day. Rain or shine.'], xp: 180, pillar: 'body' },
      { id: 'lq-d-14-2', title: 'Nutrition Overhaul', description: 'Eat clean (no processed food) for 14 days.', steps: ['For 14 days, eat only food that was cooked at home or whole foods: rice, dal, vegetables, eggs, fruit, nuts.','Avoid packaged snacks, chips, soda, instant noodles, and restaurant food.','Log what you ate for 3 days to prove discipline.'], xp: 150, pillar: 'body' },
      { id: 'lq-d-14-3', title: 'Sleep Mastery', description: 'Sleep by 9:30pm and wake without alarm for 14 days.', steps: ['Start winding down at 9:00pm.','Be in bed by 9:30pm with all screens off.','Try to wake at Fajr without an alarm. If you fail, use a soft alarm. Do this for 14 days.'], xp: 150, pillar: 'body' },
    ],
    reward: { gold: 180, statPoints: 2, shadowUnlock: 'warrior-body', message: 'The Warrior\'s Forge is lit.' },
  },
  {
    level: 15, rank: 'D', title: "The Architect's Mind",
    description: 'Wealth is a tool. AI mastery is the weapon. Build your first real AI-assisted business system for the Ummah.',
    quests: [
      { id: 'lq-d-15-1', title: 'Build First AI-Assisted Business System', description: 'Build a complete business system using no-code AI tools — funnel, content pipeline, or automated outreach. This is your Khalifate\'s first operational tool.', steps: ['Pick one system: a landing page, an email sequence, a content calendar, or an outreach template.','Use a no-code tool (Carrd, Notion, Mailchimp, or just ChatGPT) to build it.','Test it by sending one real message or publishing one real page.'], xp: 200, pillar: 'money' },
      { id: 'lq-d-15-2', title: 'Skill Investment', description: 'Invest in a course or book for your high-income AI skill. The Khalifate\'s edge is expertise.', steps: ['Pick one skill gap: coding, prompting, automation, sales, or design.','Buy one book, course, or subscription under 2000 rupees.','Complete the first module or chapter and write 3 sentences of notes.'], xp: 150, pillar: 'money' },
      { id: 'lq-d-15-3', title: 'Sadaqah System', description: 'Set up automatic sadaqah (even 100 rupees/month). The Khalifate\'s first system is giving.', steps: ['Pick a charity or cause you trust.','Set up an automatic monthly transfer of 100 rupees or more.','Confirm the first payment went through.'], xp: 150, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, jobChange: 'architect', message: 'JOB CHANGE: You are now an Architect. The Khalifate\'s first structure stands.' },
  },
  {
    level: 17, rank: 'D', title: 'The Consistent',
    description: 'Consistency is the mark of the serious. Amateurs practice until they get it right. Professionals practice until they cannot get it wrong.',
    quests: [
      { id: 'lq-d-17-1', title: '30-Day Deen Streak', description: 'Complete daily Deen quests for 30 days.', steps: ['Open the app every day.','Complete every Deen quest shown.','Do this for 30 days. If you miss one, restart.'], xp: 200, pillar: 'deen' },
      { id: 'lq-d-17-2', title: '30-Day Training Streak', description: 'Complete daily Body quests for 30 days.', steps: ['Open the app every day.','Complete every Body quest shown.','Do this for 30 days. If you miss one, restart.'], xp: 180, pillar: 'body' },
      { id: 'lq-d-17-3', title: '30-Day Money Streak', description: 'Complete daily Money quests for 30 days.', steps: ['Open the app every day.','Complete every Money quest shown.','Do this for 30 days. If you miss one, restart.'], xp: 180, pillar: 'money' },
    ],
    reward: { gold: 200, statPoints: 2, message: 'Consistency is your superpower.' },
  },
  {
    level: 20, rank: 'D', title: 'Shadow Extraction: Elite',
    description: 'Your habits are becoming automatic. The System extracts an Elite Shadow.',
    quests: [
      { id: 'lq-d-20-1', title: 'Habit Stack', description: 'Attach one new habit to an existing prayer habit. Do it for 21 days.', steps: ['Pick a new habit: drink water, read 1 verse, or make 1 minute of dhikr.','Do it immediately after an existing prayer habit: right after Fajr, after every salah, or before sleep.','Do this for 21 days. The trigger is the prayer. The habit is the add-on.'], xp: 200, pillar: 'deen' },
      { id: 'lq-d-20-2', title: 'Morning Routine Lock', description: 'Execute a complete morning routine (Fajr → Adhkar → Quran → Outdoor Movement) for 21 days.', steps: ['After Fajr, do morning adhkar.','Read 1 verse or 1 page of Quran.','Go outside and move for 10 minutes.','Do this exact sequence for 21 days.'], xp: 200, pillar: 'body' },
      { id: 'lq-d-20-3', title: 'Financial Automation', description: 'Automate savings, investments, and sadaqah.', steps: ['Set an automatic transfer to savings on payday.','Set an automatic transfer to an investment account.','Set an automatic monthly sadaqah payment.','Verify all three are running without you touching them.'], xp: 200, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, shadowUnlock: 'elite-habit-stack', message: 'Elite Shadow extracted. Your habits now fight for you.' },
  },
  {
    level: 22, rank: 'D', title: 'The Specialized',
    description: 'You are no longer a generalist. Specialization creates mastery.',
    quests: [
      { id: 'lq-d-22-1', title: 'Deen Specialization', description: 'Choose one Islamic science (fiqh, tafsir, hadith, seerah) and study it for 30 days.', steps: ['Pick one topic: fiqh of salah, tafsir of Juz Amma, 40 hadith of Nawawi, or seerah of Madinah.','Find one book, course, or video series on it.','Study it for 15 minutes every day for 30 days. Write one sentence of notes each day.'], xp: 220, pillar: 'deen' },
      { id: 'lq-d-22-2', title: 'Training Specialization', description: 'Choose one training domain (running, calisthenics, rucking, or mobility) and focus for 30 days.', steps: ['Pick one skill: push-up progression, squat progression, ruck walking, or mobility flow.','Practice it 3 times per week for 30 days.','Log each session: what you did, what you learned, and what to improve.'], xp: 200, pillar: 'body' },
      { id: 'lq-d-22-3', title: 'Money Specialization', description: 'Choose one wealth domain (investing, business, skills) and focus for 30 days.', steps: ['Pick one domain: stock analysis, freelance writing, AI automation, or e-commerce.','Study or practice it for 30 minutes, 3 times per week for 30 days.','Ship one real output: a stock note, a portfolio, a client pitch, or a product listing.'], xp: 200, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, message: 'Specialization unlocks mastery.' },
  },
  {
    level: 25, rank: 'D', title: "The Builder's Gate",
    description: 'You have outgrown D-Rank. Ship one AI product and the C-Rank awaits.',
    quests: [
      { id: 'lq-d-25-1', title: 'The 45-Day Gauntlet', description: 'Complete ALL daily quests for 45 consecutive days.', steps: ['Open the app every single day.','Complete every daily quest shown.','Do this for 45 days. One miss = restart.'], xp: 300, pillar: 'deen' },
      { id: 'lq-d-25-2', title: 'Forge Test: D-Rank', description: 'Ruck 5km on ground or stairs, carry a weighted pack for 20 minutes, and complete 20 minutes of outdoor training.', steps: ['Walk 5km on ground, a park path, or stairs.','Fill a backpack with 2-5kg and carry it for 20 minutes.','Do 20 more minutes of outdoor training: walking, climbing stairs, or calisthenics.'], xp: 250, pillar: 'body' },
      { id: 'lq-d-25-3', title: 'Close First AI-Assisted Sale', description: 'Make your first sale or earn your first income using AI tools to deliver value. Revenue is the only validation. The Khalifate\'s first income must reach the Ummah.', steps: ['Pick a service you can deliver with AI help: writing, research, design, translation, or data work.','Find one client: friend, family, Fiverr, LinkedIn, or WhatsApp group.','Deliver the work using AI tools. Collect payment. Screenshot or note the amount.'], xp: 300, pillar: 'money' },
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
      { id: 'lq-c-27-2', title: 'Teach Outdoor Movement', description: 'Take someone on an outdoor training walk or ruck. Teach them to move with intention and observe their surroundings.', xp: 220, pillar: 'body' },
      { id: 'lq-c-27-3', title: 'Teach Finance', description: 'Explain one financial concept to a friend or family member.', xp: 220, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, message: 'Teaching cements your knowledge.' },
  },
  {
    level: 30, rank: 'C', title: "The Mujahid's Oath",
    description: 'Body, mind, and soul as one. Readiness to serve. Devotion to lead. The Mujahid\'s oath binds you to excellence.',
    quests: [
      { id: 'lq-c-30-1', title: 'The Oath of Discipline', description: 'Commit to 60 days of perfect daily quest completion.', xp: 350, pillar: 'deen' },
      { id: 'lq-c-30-2', title: 'The Forge Trial', description: 'Complete a training challenge: 5km ruck, 1-hour strength circuit, or climb a significant hill. The Khalifa is forged in the fire of training.', xp: 300, pillar: 'body' },
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
      { id: 'lq-c-36-2', title: 'Outdoor Community', description: 'Train outdoors with a partner or group 3 times this month.', xp: 250, pillar: 'body' },
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
      { id: 'lq-c-40-2', title: 'The Forge Crusade', description: 'Complete a 10K ruck or a heavy loaded-carry circuit. The Guardian does not retreat from the forge.', xp: 350, pillar: 'body' },
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
      { id: 'lq-b-50-2', title: "The Qa'id's Strength", description: 'Complete a 3-hour ruck with elevation gain, climb a rocky incline, and carry a weighted pack for 30 minutes. The Khalifa\'s body is unbreakable.', xp: 350, pillar: 'body' },
      { id: 'lq-b-50-3', title: "The Qa'id's Wealth", description: 'Achieve positive cash flow from your AI business or halal investment. The Khalifate\'s wealth flows from honest work.', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 450, statPoints: 5, jobChange: 'qa-id', message: 'JOB CHANGE: You are now a Qa\'id. Command with justice. Build for the Ummah.' },
  },
  {
    level: 53, rank: 'B', title: 'The Strategist',
    description: 'Power without strategy is wasted. Plan your conquest.',
    quests: [
      { id: 'lq-b-53-1', title: 'Strategic Worship', description: 'Plan your week around peak spiritual times: Tahajjud, Jumuah, last third of night.', xp: 350, pillar: 'deen' },
      { id: 'lq-b-53-2', title: 'Strategic Training', description: 'Design and follow a 30-day training progression plan: distances, elevations, and load types.', xp: 300, pillar: 'body' },
      { id: 'lq-b-53-3', title: 'Strategic Wealth', description: 'Create a 5-year financial independence plan with milestones.', xp: 300, pillar: 'money' },
    ],
    reward: { gold: 350, statPoints: 4, message: 'Strategy turns effort into conquest.' },
  },
  {
    level: 56, rank: 'B', title: 'The Shadow General',
    description: 'Your habits command other habits. You are a general of discipline.',
    quests: [
      { id: 'lq-b-56-1', title: 'Command Your Shadows', description: 'Maintain 5+ automatic habits simultaneously for 30 days.', xp: 400, pillar: 'deen' },
      { id: 'lq-b-56-2', title: 'Training Command', description: 'Lead an outdoor group training session: a ruck walk, calisthenics circuit, or strength class. Lead by example.', xp: 350, pillar: 'body' },
      { id: 'lq-b-56-3', title: 'Wealth Command', description: 'Automate your entire financial system: earning, saving, investing, giving.', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 400, statPoints: 5, shadowUnlock: 'general-shadow', message: 'General Shadow extracted. Your discipline commands armies.' },
  },
  {
    level: 60, rank: 'B', title: 'The Ummah\'s Shield',
    description: 'Your outdoor ability is not for you alone. It is for the ummah.',
    quests: [
      { id: 'lq-b-60-1', title: 'Ummah Service', description: 'Volunteer 10+ hours for an Islamic or community organization this month.', xp: 400, pillar: 'deen' },
      { id: 'lq-b-60-2', title: 'Strength for Service', description: 'Use your strength to help someone: carry their load on a ruck, help them train, or guide them through a hard session.', xp: 350, pillar: 'body' },
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
      { id: 'lq-b-70-2', title: 'The Forge War', description: 'Complete a half-day ruck (4+ hours), summit a hill or mountain, or carry a heavy load for 10km. The Khalifa is forged for burden.', xp: 450, pillar: 'body' },
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
      { id: 'lq-a-73-1', title: 'Mentorship Program', description: 'Formally mentor one person in Deen, Physical Power, or Money for 30 days.', xp: 450, pillar: 'deen' },
      { id: 'lq-a-73-2', title: 'Lead by Outdoor Endurance', description: 'Lead a group outdoor training session consistently for a month. The Khalifa walks first and checks on everyone behind him.', xp: 400, pillar: 'body' },
      { id: 'lq-a-73-3', title: 'Wealth Mentorship', description: 'Guide someone to their first investment or income stream.', xp: 400, pillar: 'money' },
    ],
    reward: { gold: 450, statPoints: 5, message: 'Leaders create leaders. This is your legacy.' },
  },
  {
    level: 76, rank: 'A', title: "The Khalifa's Awakening",
    description: 'The Khalifate does not follow the System. The System follows the Khalifate. The Ummah\'s General is forged.',
    quests: [
      { id: 'lq-a-76-1', title: "The Khalifa's Prayer", description: 'Pray Tahajjud with deep khushoo for 45+ minutes for 30 days. The Khalifate\'s night prayer is the source of all power.', xp: 500, pillar: 'deen' },
      { id: 'lq-a-76-2', title: "The Khalifa's Forge", description: 'Achieve elite strength: complete a multi-hour training session, solo ruck, or lead a training group. The Khalifa moves with purpose through any load.', xp: 450, pillar: 'body' },
      { id: 'lq-a-76-3', title: "The Khalifa's Wealth", description: 'Achieve financial independence or build an AI business that employs Muslims. The Khalifate\'s wealth funds the Ummah.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 600, statPoints: 6, jobChange: 'khalifa', message: 'JOB CHANGE: You are now a Khalifa. The Ummah\'s General has awakened.' },
  },
  {
    level: 80, rank: 'A', title: 'The Conqueror',
    description: 'Conquer yourself first. Then conquer the world.',
    quests: [
      { id: 'lq-a-80-1', title: 'Inner Jihad', description: 'Identify and defeat your greatest personal flaw. 30-day battle.', xp: 500, pillar: 'deen' },
      { id: 'lq-a-80-2', title: 'Forge Conquest', description: 'Conquer a major training challenge: multi-day ruck, heavy loaded carry, or strength milestone.', xp: 450, pillar: 'body' },
      { id: 'lq-a-80-3', title: 'Wealth Conquest', description: 'Build a system that generates halal wealth without your direct daily effort.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 6, message: 'The greatest conquest is the conquest of self.' },
  },
  {
    level: 85, rank: 'A', title: 'The Ummah\'s General',
    description: 'Your outdoor endurance is the ummah\'s endurance. Your wealth is the ummah\'s wealth.',
    quests: [
      { id: 'lq-a-85-1', title: 'Ummah Project', description: 'Lead or fund a project that benefits 100+ Muslims.', xp: 500, pillar: 'deen' },
      { id: 'lq-a-85-2', title: 'Outdoor for Ummah', description: 'Create an outdoor training program or strength group for Muslims. The Ummah\'s body is a training ground.', xp: 450, pillar: 'body' },
      { id: 'lq-a-85-3', title: 'Wealth for Ummah', description: 'Create a fund, business, or investment that employs or benefits Muslims.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 6, message: 'The ummah rises with you.' },
  },
  {
    level: 90, rank: 'A', title: 'The Unstoppable',
    description: 'Nothing stops you. Not fear. Not fatigue. Not failure. You rise every time.',
    quests: [
      { id: 'lq-a-90-1', title: 'The 120-Day Legend', description: 'Complete ALL daily quests for 120 consecutive days.', xp: 600, pillar: 'deen' },
      { id: 'lq-a-90-2', title: 'Legendary Endurance', description: 'Maintain legendary outdoor endurance for 1 year without major breaks. The forge is your training ground.', xp: 500, pillar: 'body' },
      { id: 'lq-a-90-3', title: 'Legendary Wealth', description: 'Achieve complete financial independence (passive income > expenses).', xp: 500, pillar: 'money' },
    ],
    reward: { gold: 600, statPoints: 7, message: 'You are unstoppable. The System bows to your will.' },
  },
  {
    level: 99, rank: 'A', title: "The Strategist's Gate",
    description: 'Ummah project. Marathon. Mentorship. The Khalifate proves itself on the world stage.',
    quests: [
      { id: 'lq-a-99-1', title: 'The Final Trial', description: 'Complete ALL daily quests for 180 consecutive days. The Khalifate is consistent for a generation.', xp: 700, pillar: 'deen' },
      { id: 'lq-a-99-2', title: 'The Forge Apex', description: 'Achieve a strength feat that 99% of humans cannot do: a major summit carry, solo ruck, or elite lift. The Khalifate is forged for burden.', xp: 600, pillar: 'body' },
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
      { id: 'lq-s-100-2', title: 'The Eternal Strength', description: 'Maintain elite training for life. Strength, conditioning, and recovery become lifelong amanah.', xp: 800, pillar: 'body' },
      { id: 'lq-s-100-3', title: 'The Eternal Legacy', description: 'Build a legacy project (institution, AI fund, business) that benefits Muslims for generations. The Khalifate\'s shadow extends to the Day of Judgment.', xp: 800, pillar: 'money' },
    ],
    reward: { gold: 1000, statPoints: 10, shadowUnlock: 'monarch-army', message: 'THE MONARCH IS CROWNED. "ARISE." Your Khalifate is eternal.' },
  },
  {
    level: 105, rank: 'S', title: 'The Infinite Dungeon',
    description: 'There is no end. Only deeper levels.',
    quests: [
      { id: 'lq-s-105-1', title: 'Infinite Worship', description: 'Add one new act of worship and maintain it for 90 days.', xp: 500, pillar: 'deen' },
      { id: 'lq-s-105-2', title: 'Infinite Endurance', description: 'Set and achieve a new training milestone every month for a year: distance, elevation, or load conquered.', xp: 450, pillar: 'body' },
      { id: 'lq-s-105-3', title: 'Infinite Wealth', description: '10x your net worth through halal means.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 5, message: 'The dungeon is infinite. Your growth is infinite.' },
  },
  {
    level: 110, rank: 'S', title: 'The Shadow Monarch',
    description: 'You are the Shadow Monarch. Your habits are your army. Your discipline is your power.',
    quests: [
      { id: 'lq-s-110-1', title: 'Absolute Mastery', description: 'Maintain perfect consistency across all pillars for 1 year.', xp: 1000, pillar: 'deen' },
      { id: 'lq-s-110-2', title: 'Absolute Power', description: 'Achieve a strength feat in the top 1% of your age group: distance, elevation, or load carried.', xp: 800, pillar: 'body' },
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
      { id: 'lq-s-130-2', title: 'Combat Mastery', description: 'Achieve strength and resilience mastery: load carriage, conditioning, and recovery to instructor level. You must be able to teach others to endure.', xp: 1100, pillar: 'body' },
      { id: 'lq-s-130-3', title: 'Wealth Multiplication', description: '10x one existing income stream through AI tools, automation, or strategic leverage. No new hours — only scale.', xp: 1100, pillar: 'money' },
    ],
    reward: { gold: 1300, statPoints: 13, message: 'The Eternal Forge produces steel that outlasts empires.' },
  },
  {
    level: 140, rank: 'S', title: 'The Ummah\'s Shield',
    description: 'You no longer serve only your household. You are a shield for the entire Ummah.',
    quests: [
      { id: 'lq-s-140-1', title: 'Community Institution', description: 'Found or lead one Islamic institution that serves 50+ Muslims weekly: halaqa, study circle, outdoor group, or relief effort.', xp: 1400, pillar: 'deen' },
      { id: 'lq-s-140-2', title: 'Protector\'s Physique', description: 'Maintain strength, endurance, and resilience standards that would allow you to guide and protect your family through any burden.', xp: 1200, pillar: 'body' },
      { id: 'lq-s-140-3', title: 'Ummah Treasury', description: 'Establish a dedicated fund that distributes 10% of your AI income to ummah causes automatically, every month, without decision fatigue.', xp: 1200, pillar: 'money' },
    ],
    reward: { gold: 1400, statPoints: 14, message: 'The Ummah\'s Shield does not rust.' },
  },
  {
    level: 150, rank: 'S', title: 'The Kingdom Builder',
    description: 'Kingdoms are built one brick at a time. You have laid the foundation. Now build the walls.',
    quests: [
      { id: 'lq-s-150-1', title: 'Multi-Generational Quran', description: 'Teach Quran to at least 3 people who will teach others. Start a chain that outlasts your life.', xp: 1500, pillar: 'deen' },
      { id: 'lq-s-150-2', title: 'Legacy Training', description: 'Document your complete training protocol so your children and students can replicate your results.', xp: 1300, pillar: 'body' },
      { id: 'lq-s-150-3', title: 'Empire Infrastructure', description: 'Build the operational backbone of your empire: team, systems, documentation, and succession plan.', xp: 1300, pillar: 'money' },
    ],
    reward: { gold: 1500, statPoints: 15, message: 'Kingdom Builder. Your walls stand against time.' },
  },
  {
    level: 160, rank: 'S', title: 'The Undying Flame',
    description: 'Others burn out. You burn brighter. The flame is who you are.',
    quests: [
      { id: 'lq-s-160-1', title: 'Tahajjud Without Alarm', description: 'Wake for Tahajjud naturally, without alarm, for 60 consecutive days. Your body now serves your soul.', xp: 1600, pillar: 'deen' },
      { id: 'lq-s-160-2', title: 'Lifetime Endurance', description: 'Design an outdoor movement protocol you can maintain until age 70 with minimal gear. Test it for 90 days.', xp: 1400, pillar: 'body' },
      { id: 'lq-s-160-3', title: 'Passive Income Mastery', description: 'Achieve 50% of your total income from passive or automated sources. Wealth that does not sleep.', xp: 1400, pillar: 'money' },
    ],
    reward: { gold: 1600, statPoints: 16, message: 'The Undying Flame warms the Ummah.' },
  },
  {
    level: 170, rank: 'S', title: 'The Architect of Ages',
    description: 'You do not build for today. You build for centuries.',
    quests: [
      { id: 'lq-s-170-1', title: 'Written Legacy', description: 'Write or record a complete work of Islamic knowledge that can benefit Muslims for 100+ years.', xp: 1700, pillar: 'deen' },
      { id: 'lq-s-170-2', title: 'Training Legacy', description: 'Establish a permanent training practice in your community: a strength club, conditioning group, or mobility class that operates without you.', xp: 1500, pillar: 'body' },
      { id: 'lq-s-170-3', title: 'Economic Legacy', description: 'Build a business or investment structure that will outlast you and continue employing Muslims after your death.', xp: 1500, pillar: 'money' },
    ],
    reward: { gold: 1700, statPoints: 17, message: 'The Architect of Ages signs his name in stone.' },
  },
  {
    level: 180, rank: 'S', title: 'The Conqueror of Self',
    description: 'The greatest enemy was never outside. It was the nafs. You have conquered it.',
    quests: [
      { id: 'lq-s-180-1', title: 'Complete Nafs Mastery', description: 'Identify your 3 greatest spiritual weaknesses and document the systems that keep them under control for 1 year.', xp: 1800, pillar: 'deen' },
      { id: 'lq-s-180-2', title: 'Pain Immunity', description: 'Complete a training challenge that tests your mental fortitude: solo night ruck, 24-hour fast + loaded carry, cold exposure protocol, or endurance session.', xp: 1600, pillar: 'body' },
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
      { id: 'lq-s-250-2', title: 'Iron Strength', description: 'Achieve and maintain strength standards in the top 5% of natural athletes for 1 year: ruck distance, elevation gain, lift numbers, and loaded carry.', xp: 2200, pillar: 'body' },
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
      { id: 'lq-s-400-2', title: 'Training Inheritance', description: 'Train 10 people to elite training readiness: session planning, progression, safety protocols, salah timing in the field, and the ability to teach others. Your strength multiplies through them.', xp: 3500, pillar: 'body' },
      { id: 'lq-s-400-3', title: 'Economic Inheritance', description: 'Mentor 10 Muslims to financial independence through AI-powered income. Each must be able to replicate your system.', xp: 3500, pillar: 'money' },
    ],
    reward: { gold: 4000, statPoints: 40, message: 'The Teacher of Nations outlives empires.' },
  },
  {
    level: 450, rank: 'S', title: 'The Unstoppable Force',
    description: 'Nothing stops you. Not age. Not circumstance. Not opinion. You are a force of nature.',
    quests: [
      { id: 'lq-s-450-1', title: 'Immovable Devotion', description: 'Pray Tahajjud every night for 2 years without a single miss. Even travel. Even illness. Even war.', xp: 4500, pillar: 'deen' },
      { id: 'lq-s-450-2', title: 'Immovable Strength', description: 'Set a strength milestone at age 40+ that exceeds your age-25 best: distance, elevation, or load carried. Time does not weaken the Force.', xp: 4000, pillar: 'body' },
      { id: 'lq-s-450-3', title: 'Immovable Wealth', description: 'Build an income stream that survives your death and continues growing for 50+ years. The Force does not stop.', xp: 4000, pillar: 'money' },
    ],
    reward: { gold: 4500, statPoints: 45, message: 'The Unstoppable Force reshapes the world.' },
  },
  {
    level: 500, rank: 'S', title: 'The Half-Millennium Monarch',
    description: 'Level 500. Half a thousand. The System has no record of anyone reaching this height. You are the first.',
    quests: [
      { id: 'lq-s-500-1', title: 'The Eternal Night Prayer', description: 'Pray Tahajjud for 500 consecutive nights. Each night is a brick in the palace of Jannah.', xp: 5000, pillar: 'deen' },
      { id: 'lq-s-500-2', title: 'The Eternal Forge', description: 'Maintain elite training for 10 consecutive years without a break longer than 3 days. The forge is a lifelong amanah.', xp: 4500, pillar: 'body' },
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
      { id: 'lq-s-700-2', title: 'Rooted in Strength', description: 'Your training has produced 100+ people who can endure, carry, and protect themselves and their families through any burden. Count them. Name them.', xp: 6500, pillar: 'body' },
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

const PHYSICAL_POWER_LEVEL_QUEST_OVERRIDES = {
  '1:lq-e-1-2:First Forge Activation': {
    title: 'First Forge Activation',
    description: "Walk 1,000 steps and complete 10 push-ups + 10 bodyweight squats. The Khalifa's body is forged with the first rep on the earth Allah placed under his feet.",
  },
  '2:lq-e-2-2:Movement Habit': {
    title: 'Training Habit',
    description: 'Train outdoors for 10 minutes every day for 3 days. Record one observation each day: breathing, posture, route, or quiet reflection.',
  },
  '3:lq-e-3-2:Hydration Discipline': {
    title: 'Forge Hydration Check',
    description: 'Carry 1L of water every day for 5 days and log how much you drank. Training begins with preparation, not impulse.',
  },
  '4:lq-e-4-2:Strength Seed': {
    title: 'First Strength Standard',
    description: 'Walk outside every day for 7 days and identify one ground - park, stairs, open field, or open space - you can use for daily push-ups, squats, and ruck walks.',
  },
  '5:lq-e-5-2:Sleep Discipline': {
    title: 'Dawn Training Preparation',
    description: 'Prepare clothes, water, and training plan the night before, then complete one early push-up + squat session within 30 minutes after Fajr for 10 days.',
  },
  '6:lq-e-6-2:Movement Mastery': {
    title: 'Seven-Day Training Loop',
    description: 'Complete 30 minutes of outdoor training every day for 7 days: walk, climb stairs, do calisthenics, or run a new loop.',
  },
  '7:lq-e-7-2:Nutrition Awareness': {
    title: 'Training Fuel Discipline',
    description: 'Prepare a simple halal training meal plan for 5 days. No careless buying on the road. The Khalifa carries the fuel his training demands.',
  },
  '8:lq-e-8-2:14-Day Training Streak': {
    title: '14-Day Training Streak',
    description: 'Complete all daily Body quests for 14 days. Streaks prove you can return to the forge repeatedly.',
  },
  '9:lq-e-9-2:Early Sleep Mastery': {
    title: 'Sunrise Training',
    description: 'Complete 3 sunrise or early-morning training sessions within 14 days: push-ups, squats, and a walk. Observe breathing, posture, and one standard worth beating.',
  },
  '10:lq-e-10-2:First Forge Test': {
    title: 'E-Rank Forge Test',
    description: 'Walk 5,000 steps, climb stairs or a hill 10 times, complete 20 push-ups + 20 squats, and spend 15 minutes outside without phone distraction. Submit one training note.',
  },
  '14:lq-d-14-1:30-Day Outdoor Discipline': {
    title: '30-Day Training Discipline',
    description: 'Spend 30 minutes outside every day for 30 days: walk, climb stairs, train calisthenics, or run a loop. Build a body that answers every call.',
  },
  '14:lq-d-14-2:Nutrition Overhaul': {
    title: 'Training Kit Audit',
    description: 'Build a basic training kit: water, proper shoes, resistance band or weighted pack, prayer mat or clean prayer plan, and weather-ready clothing.',
  },
  '14:lq-d-14-3:Sleep Mastery': {
    title: 'Weekly Training Plan Library',
    description: 'Create a list of 7 weekly training sessions with target reps, distance, intensity, prayer options, and recovery notes.',
  },
  '17:lq-d-17-2:30-Day Training Streak': {
    title: '30-Day Training Streak',
    description: 'Complete daily Body quests for 30 days. Build consistency across push-ups, squats, ruck walks, and weather.',
  },
  '20:lq-d-20-2:Morning Routine Lock': {
    title: 'Fajr-to-Forge Routine',
    description: 'Execute a complete morning training routine for 21 days: Fajr, adhkar, mobility drill, push-ups + squats, and one observation logged.',
  },
  '22:lq-d-22-2:Training Specialization': {
    title: 'Training Specialization',
    description: 'Choose one training domain - running, calisthenics, rucking, mobility, weighted carry, or strength circuits - and train it for 30 days.',
  },
  '25:lq-d-25-2:Forge Test: D-Rank': {
    title: 'D-Rank Forge Test',
    description: 'Complete a 5km ruck on ground or stairs, carry a loaded pack for 20 minutes, and log the session for future repeat use.',
  },
  '27:lq-c-27-2:Teach Outdoor Movement': {
    title: 'Teach Training Basics',
    description: 'Take someone on an outdoor walk or training session. Teach breathing, posture, push-up and squat form, prayer planning, and respect for the body Allah gave you.',
  },
  '30:lq-c-30-2:The Forge Trial': {
    title: 'C-Rank Forge Trial',
    description: 'Complete one training challenge: 5km ruck, 1-hour strength circuit, hill climb, or loaded carry. Record lessons for your training archive.',
  },
  '33:lq-c-33-2:Elite Recovery': {
    title: 'Training Recovery Protocol',
    description: 'Build a recovery protocol for training days: hydration, sleep, stretching, mobility, protein, and next-session notes.',
  },
  '36:lq-c-36-2:Outdoor Community': {
    title: 'Training Community',
    description: 'Train outdoors with a partner or group 3 times this month. Keep it halal, safe, punctual with salah, and beneficial.',
  },
  '40:lq-c-40-2:Movement Mastery': {
    title: 'Training Skill Mastery',
    description: 'Master one training skill: handstand push-up progression, pistol squat, muscle-up, loaded carry, or mobility flow.',
  },
  '40:lq-c-40-2:The Forge Crusade': {
    title: 'C-Rank Forge Crusade',
    description: 'Complete a 10km ruck or heavy loaded-carry circuit. Document distance, time, load, effort, and one lesson for others.',
  },
  '47:lq-b-47-2:Protect Your Health': {
    title: 'Training Safety Audit',
    description: 'Audit your training readiness: footwear, mobility, warm-up, load progression, recovery, prayer plan, and injury risk.',
  },
  '50:lq-b-50-2:The Qa\'id\'s Strength': {
    title: "The Qa'id's Forge",
    description: 'Complete a 3-hour ruck with elevation gain, a rocky incline or stair climb, and a loaded pack. Lead yourself with discipline.',
  },
  '53:lq-b-53-2:Strategic Training': {
    title: 'Strategic Training Plan',
    description: 'Design and follow a 30-day training progression plan: routes, distances, loads, reps, weather windows, and recovery notes.',
  },
  '56:lq-b-56-2:Training Command': {
    title: 'Training Command',
    description: 'Lead an outdoor group training session: ruck walk, calisthenics circuit, strength class, or mobility flow. Lead with safety, salah timing, and service.',
  },
  '60:lq-b-60-2:Strength for Service': {
    title: 'Strength for Service',
    description: 'Use your strength to help someone: carry their load, teach a lift, guide a training session, or support a struggling brother.',
  },
  '65:lq-b-65-2:Sick Discipline': {
    title: 'Low-Energy Training Protocol',
    description: 'Create and test a minimum viable training protocol for difficult days: mobility on the balcony, short walk, light bodyweight work, or breathing.',
  },
  '70:lq-b-70-2:The Forge War': {
    title: 'B-Rank Forge Gate',
    description: 'Complete a half-day ruck, summit a hill or mountain, or carry a heavy load for 10km using planned waypoints. The Khalifa is forged for burden.',
  },
  '73:lq-a-73-2:Lead by Outdoor Endurance': {
    title: 'Lead a Training Circle',
    description: 'Lead a group outdoor training session consistently for a month. Include safety brief, prayer timing, warm-up, the workout, and post-session reflection.',
  },
  '76:lq-a-76-2:The Khalifa\'s Forge': {
    title: "The Khalifa's Forge",
    description: 'Complete an elite training project: multi-hour strength session, solo ruck, loaded carry, or guided group workout with documented lessons.',
  },
  '80:lq-a-80-2:Forge Conquest': {
    title: 'Forge Conquest',
    description: 'Conquer a major training challenge: multi-day ruck plan, heavy loaded carry, strength milestone, running PR, or leading a hard session.',
  },
  '85:lq-a-85-2:Outdoor for Ummah': {
    title: 'Training for Ummah',
    description: 'Create an outdoor training program, strength class, ruck group, or mobility session for Muslims. Make the body a lawful training ground and reflection space.',
  },
  '90:lq-a-90-2:Legendary Endurance': {
    title: 'Legendary Training Consistency',
    description: 'Maintain serious training consistency for 1 year: monthly milestone, weekly session, training archive, and recovery discipline.',
  },
  '99:lq-a-99-2:The Forge Apex': {
    title: 'A-Rank Forge Apex',
    description: 'Achieve a training feat most people never attempt: major summit carry, solo ruck, elite lift, or published training guide.',
  },
  '100:lq-s-100-2:The Eternal Strength': {
    title: 'The Eternal Strength',
    description: 'Design your lifetime training doctrine: strength standards, conditioning rules, recovery principles, family participation, and Ummah benefit.',
  },
  '105:lq-s-105-2:Infinite Endurance': {
    title: 'Infinite Training Milestones',
    description: 'Set and complete one new training milestone every month for a year: distance, load, reps, strength standard, or leadership.',
  },
  '110:lq-s-110-2:Absolute Power': {
    title: 'Absolute Strength Standard',
    description: 'Complete a training feat in the top 1% of your circle: distance, load, lift difficulty, rep standard, or leadership complexity.',
  },
  '120:lq-s-120-2:Elite Athletic Maintenance': {
    title: 'Elite Training Maintenance',
    description: 'Maintain elite strength and conditioning for 90 consecutive days with session logs, recovery care, and progression discipline.',
  },
  '130:lq-s-130-2:Combat Mastery': {
    title: 'Training Mastery',
    description: 'Achieve training mastery: strength progressions, conditioning, mobility, recovery, and teaching others to train safely.',
  },
  '140:lq-s-140-2:Protector\'s Physique': {
    title: "Protector's Forge Readiness",
    description: 'Maintain strength, conditioning, and loaded-carry standards that let you guide family or community through demanding loads and long days.',
  },
  '150:lq-s-150-2:Legacy Training': {
    title: 'Legacy Training Protocol',
    description: 'Document your complete training protocol so family, students, and Muslims can replicate it safely: sessions, loads, adab, salah, and recovery.',
  },
  '160:lq-s-160-2:Lifetime Endurance': {
    title: 'Lifetime Training Protocol',
    description: 'Design a training protocol you can maintain until age 70 with modest gear. Test it for 90 days and refine it.',
  },
  '170:lq-s-170-2:Training Legacy': {
    title: 'Permanent Training Practice',
    description: 'Establish a permanent training practice in your community: strength club, ruck group, conditioning class, or mobility session.',
  },
  '180:lq-s-180-2:Pain Immunity': {
    title: 'Fortitude Session',
    description: 'Complete a training session that tests mental fortitude: solo night ruck, long fast plus training, cold-rain session, or demanding loaded carry.',
  },
  '190:lq-s-190-2:Genetic Investment': {
    title: 'Family Training Inheritance',
    description: 'Build a family training system: child-safe sessions, spouse-friendly training, recovery rules, training adab, and recurring strength memories.',
  },
  '200:lq-s-200-2:Automatic Strength': {
    title: 'Automatic Training',
    description: 'Maintain perfect training consistency for 180 days: weekly session, monthly milestone, recovery checklist, and training archive.',
  },
  '250:lq-s-250-2:Iron Strength': {
    title: 'Iron Strength Standard',
    description: 'Achieve and maintain top-tier strength standards for 1 year: ruck distance, elevation gain, lift numbers, and loaded carry.',
  },
  '300:lq-s-300-2:Time Compression': {
    title: 'Training Time Mastery',
    description: 'Complete a training protocol inside a compressed schedule for 30 days: session, prayer, work, family duty, and recovery without chaos.',
  },
  '350:lq-s-350-2:Steward\'s Health': {
    title: "Steward's Body Amanah",
    description: 'Maintain training readiness for 1 year while stewarding wealth and service. You cannot guide others if your own body collapses.',
  },
  '400:lq-s-400-2:Training Inheritance': {
    title: 'Training Inheritance',
    description: 'Train 10 Muslims to B-rank training standards: session planning, progression, safety, salah timing, and teaching others.',
  },
  '450:lq-s-450-2:Immovable Strength': {
    title: 'Immovable Training',
    description: 'Set a training milestone at age 40+ that exceeds an earlier benchmark: distance, load, lift difficulty, or session leadership.',
  },
  '500:lq-s-500-2:The Eternal Forge': {
    title: 'The Eternal Forge',
    description: 'Maintain elite training for 10 consecutive years without a break longer than 3 days. The forge becomes legacy, not hobby.',
  },
  '600:lq-s-600-2:Timeless Strength': {
    title: 'Timeless Training Mentorship',
    description: 'Train someone to exceed your current strength in lifts, ruck distance, conditioning, or session leadership.',
  },
  '700:lq-s-700-2:Rooted in Strength': {
    title: 'Rooted in Training',
    description: 'Build a training system that produces 100+ Muslims who can carry, endure, reflect, and protect themselves through any burden.',
  },
  '800:lq-s-800-2:Legacy of Steel': {
    title: 'Legacy of the Forge',
    description: 'Document and publish a complete training system for Muslims used by 100+ people worldwide: sessions, safety, adab, and reflection.',
  },
  '900:lq-s-900-2:Apex Power': {
    title: 'Apex Strength Impact',
    description: 'Your training system has produced 1000+ Muslims in better strength, conditioning, and discipline. Document the proof.',
  },
  '999:lq-s-999-2:Infinite Power': {
    title: 'Infinite Strength Legacy',
    description: 'Level 999: build a training legacy that outlives you - programs, guides, teaching chains, family sessions, and Ummah benefit.',
  },
};

// ─── S-RANK GENERATED LEVEL QUESTS (fill 101-998 gaps) ───
// Philosophy: The level is a reflection. The mission is the reality.
// Every generated quest must push real-world mission progress, not grinding.
const EXISTING_S_LEVELS = new Set(RAW_LEVEL_QUESTS.filter(q => q.rank === 'S').map(q => q.level));

function getMissionQuestForLevel(level) {
  const baseXp = Math.floor(500 + (level - 100) * 5);
  const gold = Math.floor(500 + (level - 100) * 5);
  const statPoints = Math.max(3, Math.floor(5 + (level - 100) / 50));

  // Cycle through mission archetypes
  const archetypes = [
    {
      title: lvl => `The Monarch's Mission ${lvl}`,
      desc: lvl => `Level ${lvl}. The Khalifate is not a number. It is a project. Build it before you level.`,
      q1: { title: 'Worship as Foundation', desc: lvl => `At level ${lvl}, worship is not an extra. It is the foundation. Maintain all daily worship practices with zero misses for 30 days.`, pillar: 'deen' },
      q2: { title: 'Build the Mission', desc: lvl => `At level ${lvl}, take one concrete action to advance your primary Khalifate venture. Ship something real. The level waits for the mission.`, pillar: 'money' },
      q3: { title: 'Strengthen the Vessel', desc: lvl => `At level ${lvl}, your body must carry the mission for decades. Add one new strength standard - push, pull, squat, or carry - and hold it for 30 days.`, pillar: 'body' },
    },
    {
      title: lvl => `Sovereign Duty ${lvl}`,
      desc: lvl => `Level ${lvl}. Sovereign means self-ruling. Your systems must serve the Ummah without your daily hand.`,
      q1: { title: 'Systematize Worship', desc: lvl => `At level ${lvl}, build one worship system that runs without willpower: automated reminders, family rhythm, or accountability chain.`, pillar: 'deen' },
      q2: { title: 'Automate Impact', desc: lvl => `At level ${lvl}, automate or delegate one operational task in your venture. Free your hands for higher strategy.`, pillar: 'money' },
      q3: { title: 'Teach One', desc: lvl => `At level ${lvl}, teach one Muslim one strength or mobility drill from your training. Multiply your forge through them.`, pillar: 'body' },
    },
    {
      title: lvl => `Divine Proof ${lvl}`,
      desc: lvl => `Level ${lvl}. The Divine does not ask for levels. The Divine asks for impact. Prove yours.`,
      q1: { title: 'Impact Audit', desc: lvl => `At level ${lvl}, audit your real-world impact: how many Muslims benefited from your work this month? Document it.`, pillar: 'deen' },
      q2: { title: 'Revenue Proof', desc: lvl => `At level ${lvl}, your venture must generate revenue or save costs. Numbers do not lie. Show the proof.`, pillar: 'money' },
      q3: { title: 'Endurance Under Load', desc: lvl => `At level ${lvl}, complete one loaded carry session with your work load: ruck with pack, sandbag, or weighted vest. The Khalifa trains under burden.`, pillar: 'body' },
    },
    {
      title: lvl => `The Infinite Gate ${lvl}`,
      desc: lvl => `Level ${lvl}. Another gate. Another mission checkpoint. The infinite path demands infinite proof.`,
      q1: { title: 'Gate of Worship', desc: lvl => `At level ${lvl}, add one layer of worship depth: tafsir study, dhikr count, or Quran memorization. Maintain for 30 days.`, pillar: 'deen' },
      q2: { title: 'Gate of Wealth', desc: lvl => `At level ${lvl}, cross one financial threshold in your venture: new client, new market, or new product. The gate opens with proof.`, pillar: 'money' },
      q3: { title: 'Gate of Strength', desc: lvl => `At level ${lvl}, conquer one new strength standard you have never attempted: heavier carry, more reps, or a harder progression. The gate rewards the brave.`, pillar: 'body' },
    },
    {
      title: lvl => `Shadow March ${lvl}`,
      desc: lvl => `Level ${lvl}. Your Shadow Army is your automated systems. March them forward.`,
      q1: { title: 'Shadow Worship', desc: lvl => `At level ${lvl}, make one worship habit so automatic that you do it before conscious thought. 30 days, zero misses.`, pillar: 'deen' },
      q2: { title: 'Shadow Wealth', desc: lvl => `At level ${lvl}, build one revenue or savings system that operates while you sleep. Document the automation.`, pillar: 'money' },
      q3: { title: 'Shadow Strength', desc: lvl => `At level ${lvl}, establish one training routine so consistent that missing it feels stranger than doing it. 30 days.`, pillar: 'body' },
    },
    {
      title: lvl => `The Ummah's Checkpoint ${lvl}`,
      desc: lvl => `Level ${lvl}. The Ummah does not need your level. The Ummah needs your work. Checkpoint: show the work.`,
      q1: { title: 'Serve One', desc: lvl => `At level ${lvl}, serve one Muslim in a way they cannot repay: mentorship, funding, connection, or relief. Document the service.`, pillar: 'deen' },
      q2: { title: 'Ummah Revenue', desc: lvl => `At level ${lvl}, direct 10% of your venture's revenue or your income to an ummah cause. Make it systematic, not spontaneous.`, pillar: 'money' },
      q3: { title: 'Ummah Strength', desc: lvl => `At level ${lvl}, use your strength to serve: carry someone's load, lead a training session, or protect a family. Strength exists to serve.`, pillar: 'body' },
    },
    {
      title: lvl => `Crown of Proof ${lvl}`,
      desc: lvl => `Level ${lvl}. The crown is not given. It is earned by mission completion. Prove your right to wear it.`,
      q1: { title: 'Proof of Worship', desc: lvl => `At level ${lvl}, lead one family or community member in a worship practice for 30 days. Leadership begins at home.`, pillar: 'deen' },
      q2: { title: 'Proof of Wealth', desc: lvl => `At level ${lvl}, close one business milestone: sale, partnership, investment, or launch. The crown demands revenue.`, pillar: 'money' },
      q3: { title: 'Proof of Strength', desc: lvl => `At level ${lvl}, achieve one strength milestone that scares you slightly: a new PR, a longer ruck, or a harder progression. The crown is forged in discomfort.`, pillar: 'body' },
    },
    {
      title: lvl => `The Eternal Checkpoint ${lvl}`,
      desc: lvl => `Level ${lvl}. Eternity is built one checkpoint at a time. Prove this one.`,
      q1: { title: 'Eternal Worship', desc: lvl => `At level ${lvl}, memorize one new verse or hadith and teach it to someone within the week. Knowledge that moves is eternal.`, pillar: 'deen' },
      q2: { title: 'Eternal Wealth', desc: lvl => `At level ${lvl}, build one asset — content, system, or relationship — that will benefit Muslims after your death.`, pillar: 'money' },
      q3: { title: 'Eternal Strength', desc: lvl => `At level ${lvl}, document your complete training protocol so others can replicate it. Strength that is shared is eternal.`, pillar: 'body' },
    },
    {
      title: lvl => `Forge of Mission ${lvl}`,
      desc: lvl => `Level ${lvl}. The forge does not produce levels. It produces results. Show your results.`,
      q1: { title: 'Forge Worship', desc: lvl => `At level ${lvl}, endure one spiritual test without breaking your routine: travel, illness, or conflict. The forge tests the steel.`, pillar: 'deen' },
      q2: { title: 'Forge Wealth', desc: lvl => `At level ${lvl}, survive one business test: delayed payment, lost client, or market shift. Adapt and document the lesson.`, pillar: 'money' },
      q3: { title: 'Forge Strength', desc: lvl => `At level ${lvl}, train in adverse conditions: heat, rain, or fatigue. The forge is hot for a reason.`, pillar: 'body' },
    },
    {
      title: lvl => `The Khalifa's Checkpoint ${lvl}`,
      desc: lvl => `Level ${lvl}. The Khalifa does not chase levels. He chases mission completion. Checkpoint.`,
      q1: { title: "Khalifa's Worship", desc: lvl => `At level ${lvl}, worship with such consistency that others set their schedules by yours. Be the clock of the community.`, pillar: 'deen' },
      q2: { title: "Khalifa's Wealth", desc: lvl => `At level ${lvl}, your venture must employ, serve, or benefit one more Muslim than last month. Growth is responsibility.`, pillar: 'money' },
      q3: { title: "Khalifa's Strength", desc: lvl => `At level ${lvl}, lead one training session for family or community. The Khalifa trains first and checks on everyone behind him.`, pillar: 'body' },
    },
  ];

  const a = archetypes[level % archetypes.length];
  return {
    level,
    rank: 'S',
    title: a.title(level),
    description: a.desc(level),
    quests: [
      { id: `lq-s-${level}-1`, title: a.q1.title, description: a.q1.desc(level), xp: baseXp, pillar: a.q1.pillar },
      { id: `lq-s-${level}-2`, title: a.q2.title, description: a.q2.desc(level), xp: Math.floor(baseXp * 0.85), pillar: a.q2.pillar },
      { id: `lq-s-${level}-3`, title: a.q3.title, description: a.q3.desc(level), xp: Math.floor(baseXp * 0.85), pillar: a.q3.pillar },
    ],
    reward: { gold, statPoints, message: `Level ${level} complete. Mission checkpoint passed. The Khalifate advances.` },
  };
}

const S_RANK_GENERATED_QUESTS = [];
for (let level = 101; level < 999; level++) {
  if (EXISTING_S_LEVELS.has(level)) continue;
  S_RANK_GENERATED_QUESTS.push(getMissionQuestForLevel(level));
}

export const LEVEL_QUESTS = [...RAW_LEVEL_QUESTS, ...S_RANK_GENERATED_QUESTS].map(levelQuest => ({
  ...levelQuest,
  quests: (levelQuest.quests || []).map(quest => {
    if (quest.pillar !== 'body') return quest;
    const override = PHYSICAL_POWER_LEVEL_QUEST_OVERRIDES[`${levelQuest.level}:${quest.id}:${quest.title}`];
    return override ? { ...quest, ...override } : quest;
  }),
}));

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
      { id: 'jc-mujahid-3', text: 'Complete a major training block (4+ hour ruck / summit carry / loaded march)', completed: false },
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
      { id: 'jc-qa-id-2', text: 'Achieve elite strength milestone (8+ hour ruck / heavy loaded carry / lead a training group)', completed: false },
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
      { id: 'jc-khalifa-2', text: 'Complete elite strength feat (full-day ruck / solo loaded carry / multi-day training block)', completed: false },
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
      { id: 'rq-1-1', title: 'Double Daily Quests', description: 'Complete DOUBLE the normal daily quests today. The exiled Khalifate returns twice as hard.', steps: ['Look at today\'s daily quests in the app.','Complete every single one.','Then complete them all again: pray on time twice more, walk double the steps, do double the AI study.'], xp: 100, pillar: 'deen' },
      { id: 'rq-1-2', title: 'Forge Penance', description: 'Walk 10,000 steps, do 50 push-ups and 50 squats, and spend 1 continuous hour in training. The forge pays the soul\'s debt.', steps: ['Walk until your step counter shows 10,000, then do 50 push-ups and 50 squats.','Then train outside for 1 full hour: ruck, calisthenics, or pray and move in a park.','Do not check social media during the hour. Just breathe and forge.'], xp: 100, pillar: 'body' },
      { id: 'rq-1-3', title: 'Create + Teach', description: 'Create one AI-powered asset today AND teach one Muslim one thing about Islam. The Khalifate\'s return is double impact.', steps: ['Use ChatGPT or Claude to create one useful thing: a resume, a flyer, a summary, or a plan.','Message one Muslim and teach them one thing: a verse, a hadith, or one fact about salah.','Send both. Screenshot or note what you sent.'], xp: 100, pillar: 'money' },
    ],
    reward: { clearDebuff: true, gold: 50, message: 'You returned from exile. Your purpose is restored.' },
  },
  {
    id: 'redemption-2',
    title: 'The Reckoning',
    description: 'You have missed 7+ days. The Reckoning is brutal. Only those who refuse to break survive.',
    requiredDays: 7,
    quests: [
      { id: 'rq-2-1', title: 'Triple Daily Quests', description: 'Complete TRIPLE the normal daily quests for 3 days. The Reckoning demands more than you think you can give.', steps: ['For 3 days, open the app.','Complete every daily quest.','Then complete them again. Then a third time. Same day.'], xp: 200, pillar: 'deen' },
      { id: 'rq-2-2', title: 'Reclaim the Forge', description: 'Complete a training challenge (ruck, calisthenics, or loaded carry) for 3 consecutive days. No excuses. The Khalifate returns forge-ready.', steps: ['Day 1: Walk 5,000 steps outside, then 30 push-ups.','Day 2: Walk 7,000 steps, climb stairs or a hill, then 30 squats.','Day 3: Walk 10,000 steps with a weighted pack. Log each day.'], xp: 200, pillar: 'body' },
      { id: 'rq-2-3', title: 'Full Audit + Deliver Teaching', description: 'Complete a full financial audit, create a new budget, AND deliver one Islamic teaching (khutbah / class / video). The Khalifate returns to the Ummah.', steps: ['List every source of income and every expense from the last 30 days.','Create a simple budget: income minus fixed costs, savings, sadaqah.','Teach one Islamic topic to one person or record a 2-minute video on your phone.'], xp: 200, pillar: 'money' },
    ],
    reward: { clearDebuff: true, gold: 150, statPoints: 2, message: 'You survived the Reckoning. You are reborn for the Khalifate.' },
  },
];

// ─── WEEKLY DUNGEON TEMPLATES (Scaled by rank) ───
// 4th pillar: Ummah Service runs alongside Deen/Physical Power/Money.
export const WEEKLY_DUNGEON_TEMPLATES = {
  E: {
    deen: { title: "The Seeker's Trial", description: 'Complete 1 Juz of Quran + Study 1 seerah leadership lesson + Teach one thing', xp: 200, steps: ['Read 1 Juz', 'Study seerah story on leadership', 'Practice prophetic trait'] },
    body: { title: getGateForRank('E').name, description: `Boss: Pass ${getGateForRank('E').name}. Complete ALL four standards — strength, power, endurance, resilience. No partial credit. The forge demands everything.`, xp: 200, steps: getGateForRank('E').events.map(ev => `${ev.label}: ${ev.standard}`) },
    money: { title: "The Apprentice's Challenge", description: 'Save 1000 rupees + Study one AI concept + Give sadaqah', xp: 200, steps: ['Save 1000 rupees', 'Study 1 AI concept (30 min)', 'Extra sadaqah'] },
    ummah: { title: 'Ummah Seed', description: 'Help one Muslim with one real problem this week. The Khalifate begins with one person.', xp: 200, steps: ['Help 1 Muslim with 1 real problem', 'Give sincere advice to 1 Muslim', 'Make dua for the Ummah by name (3 people)'] },
  },
  D: {
    deen: { title: "The Devotee's Dungeon", description: 'Memorize 1 page + Lead prayer once + Study seerah for 30 min', xp: 300, steps: ['Memorize 1 page of Quran', 'Lead family prayer', 'Seerah study 30 min (leadership focus)'] },
    body: { title: getGateForRank('D').name, description: `Boss: Pass ${getGateForRank('D').name}. Complete ALL four standards — strength, power, endurance, resilience. No partial credit. The forge demands everything.`, xp: 300, steps: getGateForRank('D').events.map(ev => `${ev.label}: ${ev.standard}`) },
    money: { title: "The Architect's Dungeon", description: 'Create one AI-powered asset + Study one paper + No impulse buys for 7 days', xp: 300, steps: ['Create 1 AI-powered asset (content, template, system)', 'Study 1 AI paper/blog', 'No impulse buys x7 days'] },
    ummah: { title: 'Ummah Sprout', description: 'Teach one person one Islamic concept this week. The Khalifate teaches before he commands.', xp: 300, steps: ['Teach 1 person 1 Islamic concept', 'Share 1 beneficial Islamic post', 'Pray 1 prayer for the Ummah in sujood'] },
  },
  C: {
    deen: { title: "The Elite's Trial", description: 'Complete 1 Juz with reflection + Fast Monday/Thursday + Teach a seerah lesson', xp: 400, steps: ['1 Juz + written reflection', 'Fast Mon/Thu', 'Teach seerah lesson to family/community'] },
    body: { title: getGateForRank('C').name, description: `Boss: Pass ${getGateForRank('C').name}. Complete ALL four standards — strength, power, endurance, resilience. No partial credit. The forge demands everything.`, xp: 400, steps: getGateForRank('C').events.map(ev => `${ev.label}: ${ev.standard}`) },
    money: { title: "The Builder's Challenge", description: 'Launch one AI-assisted income stream + Full portfolio review + Strategic charity', xp: 400, steps: ['Launch 1 AI-assisted income stream or offer', 'Full portfolio + Shariah review', 'Strategic sadaqah (with intention)'] },
    ummah: { title: 'Ummah Sapling', description: 'Organize or lead one small community gathering this week. The Khalifate builds institutions.', xp: 400, steps: ['Organize 1 small Islamic gathering', 'Lead 1 study circle / halaqa', 'Recruit 1 Muslim to your Khalifate mission'] },
  },
  B: {
    deen: { title: "The Knight's Crusade", description: 'Tahajjud 3 nights + Complete 3 Juz + Organize community halaqa on seerah', xp: 500, steps: ['Tahajjud x3', 'Read 3 Juz', 'Community halaqa on seerah'] },
    body: { title: getGateForRank('B').name, description: `Boss: Pass ${getGateForRank('B').name}. Complete ALL four standards — strength, power, endurance, resilience. No partial credit. The forge demands everything.`, xp: 500, steps: getGateForRank('B').events.map(ev => `${ev.label}: ${ev.standard}`) },
    money: { title: "The Knight's Treasury", description: 'Scale AI income stream + Ummah impact project + Deep portfolio analysis', xp: 500, steps: ['Scale 1 AI income stream', 'Deep portfolio analysis', 'Ummah impact project (1 launched)'] },
    ummah: { title: 'Ummah Branch', description: 'Lead family/community Islamic practice for a week. The Khalifate leads in the home first.', xp: 500, steps: ['Lead family prayer/dhikr x7', 'Mentor 1 Muslim in deen or AI/wealth', 'Fund 1 sadaqah jariyah project'] },
  },
  A: {
    deen: { title: "The General's Campaign", description: 'Tahajjud 5 nights + Complete 5 Juz with reflection + Deliver khutbah/lesson on akhlaq', xp: 600, steps: ['Tahajjud x5', '5 Juz + written reflection', 'Deliver khutbah on prophetic akhlaq'] },
    body: { title: getGateForRank('A').name, description: `Boss: Pass ${getGateForRank('A').name}. Complete ALL four standards — strength, power, endurance, resilience. No partial credit. The forge demands everything.`, xp: 600, steps: getGateForRank('A').events.map(ev => `${ev.label}: ${ev.standard}`) },
    money: { title: "The General's Empire", description: 'Launch or scale AI business + Achieve FI milestone + Major ummah project funding', xp: 600, steps: ['Launch or scale AI business', 'FI milestone hit', 'Major ummah project funded'] },
    ummah: { title: 'Ummah Trunk', description: 'Lead or fund project benefiting 100+ Muslims. The Khalifate operates at scale.', xp: 600, steps: ['Lead/fund project for 100+ Muslims', 'Volunteer 10+ hours for ummah cause', 'Strategic charity with system-level impact'] },
  },
  S: {
    deen: { title: "The Monarch's Dominion", description: 'Complete 10 Juz + Tahajjud every night + Record a seerah teaching legacy', xp: 800, steps: ['10 Juz', 'Tahajjud x7 nights', 'Record seerah teaching (video/book)'] },
    body: { title: getGateForRank('S').name, description: `Boss: Pass ${getGateForRank('S').name}. Complete ALL four standards — strength, power, endurance, resilience. No partial credit. The forge demands everything.`, xp: 800, steps: getGateForRank('S').events.map(ev => `${ev.label}: ${ev.standard}`) },
    money: { title: "The Monarch's Treasury", description: 'Generational wealth plan + Major ummah fund + Mentor 3 to financial independence', xp: 800, steps: ['Generational wealth plan (100 years)', 'Major ummah fund (multi-crore)', 'Mentor 3 Muslims to FI'] },
    ummah: { title: 'Ummah Root', description: 'Build institution/business employing 10+ Muslims. The Khalifate creates economic structures for the Ummah.', xp: 800, steps: ['Build institution employing 10+ Muslims', 'Organize 100+ person Ummah event', 'Establish 1 multi-generational Ummah fund'] },
  },
  S_II: {
    deen: { title: "The Sovereign's Decree", description: 'Complete 20 Juz + Tahajjud + Qiyam for 30 nights + Author a book or course on Islamic governance', xp: 2500, steps: ['20 Juz with tafsir notes', 'Tahajjud + Qiyam x30 nights', 'Author 1 book or course on Islamic governance'] },
    body: { title: "The Sovereign's Apex", description: "Boss: The Sovereign's Apex. The body is forged until it outlasts empires. Pass ALL four standards — the Ummah cannot wait for the weak.", xp: 2500, steps: ['Multi-day heavy ruck: 25 kg / 15 km across two consecutive days — the Sovereign carries the Ummah\'s weight without setting it down', 'Loaded carry: farmer\'s carry 2×BW × 50 m, sled drag, sandbag carry — strength that holds under fatigue', '2×BW squat work sets ×5, deadlift 3×BW for reps, weighted pull-up +75% BW — the bar does not bend the Khalifa', 'Half-marathon < 1:45 same week as the strength block, then lead 5+ Muslims through the full training — forge others as you were forged'] },
    money: { title: "The Sovereign's Vault", description: 'Build a waqf or endowment that funds 100+ ummah projects per year. Permanent wealth for the Ummah.', xp: 2500, steps: ['Establish waqf or endowment (registered)', 'Annual distribution: 100+ ummah projects funded', 'Self-sustaining: no personal capital injection needed'] },
    ummah: { title: 'Ummah Empire', description: 'Build an organization that directly benefits 1000+ Muslims annually. The Sovereign builds nations.', xp: 2500, steps: ['Organization serves 1000+ Muslims per year', 'Employ 50+ Muslims with halal livelihoods', 'Create 1 multi-generational institution (10+ year plan)'] },
  },
  S_III: {
    deen: { title: "The Divine Command", description: 'Complete the entire Quran with deep reflection + Lead 1000+ Muslims in knowledge or worship + Establish a permanent Islamic institution', xp: 5000, steps: ['Complete Quran with written reflection (114 surahs)', 'Lead/govern 1000+ Muslims in deen', 'Build permanent Islamic institution (school, waqf, or platform)'] },
    body: {
      title: "The Khalifa's Crucible",
      description: "Boss: The Khalifa's Crucible. The body is the Ummah's last instrument — forge it past breaking. Pass ALL four standards. The Khalifate does not pass on weakness.",
      xp: 5000,
      steps: [
        'Strength peak: 2.5×BW squat work sets ×3, 3.5×BW deadlift for reps, weighted pull-up +100% BW — the Khalifa\'s frame bears what no man\'s should.',
        'Power peak: farmer\'s carry 2.5×BW × 100 m, sled drag, sandbag carry — move impossible loads across impossible ground.',
        'Endurance peak: Ironman-distance — 3.8 km swim, 180 km bike, 42 km run within 17 hours. The body does not break.',
        'Resilience & command: build a national physical-training program producing 100+ Muslims at S-rank combat readiness; document a complete training field manual for Ummah-wide distribution.',
      ],
    },
    money: { title: "The Divine Treasury", description: 'Wealth is an amanah. Build systems that fund the Ummah for 100+ years without your presence.', xp: 5000, steps: ['100-year autonomous wealth system operational', 'Funds 500+ ummah projects per year without your input', 'Mentor 50+ Muslims to financial independence'] },
    ummah: { title: 'Ummah of Ages', description: 'The Ummah is one body. You have healed, strengthened, and funded 10,000+ Muslims. This is the Khalifate at its apex.', xp: 5000, steps: ['Direct impact: 10,000+ Muslims benefited', 'Economic engine: 500+ Muslim jobs created', 'Legacy system: operates for 25+ years after you step back'] },
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
export function getDailyQuestsForRank(rankKey, existingQuests = [], userSeed = '', level = 0) {
  const count = RANK_CONFIG[rankKey]?.dailyQuestsPerPillar || 2;
  const pools = DAILY_QUEST_POOLS;
  const result = [];

  // Deterministic seed: user identifier + today's date
  const today = new Date().toLocaleDateString('en-CA');
  const seedBase = hashString(`${userSeed || 'seeker'}-${today}`);
  const rng = seededRandom(seedBase);

  ['deen', 'body', 'money'].forEach(pillar => {
    // S-rank: use S pool for all sub-tiers
    const poolKey = rankKey.startsWith('S_') ? 'S' : rankKey;
    const pool = pools[pillar][poolKey] || pools[pillar].E;
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
        xp: getEffectiveXp(q.baseXp, rankKey, level),
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

export function getWeeklyDungeonForRank(rankKey, level = 0) {
  // S-rank sub-tier selection by level
  let templateKey = rankKey;
  if (rankKey === 'S') {
    const sub = getSRankSubTier(level);
    templateKey = sub?.key || 'S';
  }
  const templates = WEEKLY_DUNGEON_TEMPLATES[templateKey] || WEEKLY_DUNGEON_TEMPLATES.E;
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
