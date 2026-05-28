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
  E: { minLevel: 0,  maxLevel: 10,  title: 'Hunter Candidate', color: 'text-gray-400',  statPointsPerLevel: 1, dailyQuestsPerPillar: 2, xpMultiplier: 1.0 },
  D: { minLevel: 11, maxLevel: 25, title: 'Hunter',         color: 'text-cyan-400',  statPointsPerLevel: 2, dailyQuestsPerPillar: 3, xpMultiplier: 1.3 },
  C: { minLevel: 26, maxLevel: 45, title: 'Elite Hunter',   color: 'text-blue-400',  statPointsPerLevel: 3, dailyQuestsPerPillar: 3, xpMultiplier: 1.6 },
  B: { minLevel: 46, maxLevel: 70, title: 'Knight',         color: 'text-purple-400',statPointsPerLevel: 4, dailyQuestsPerPillar: 4, xpMultiplier: 2.0 },
  A: { minLevel: 71, maxLevel: 99, title: 'General',        color: 'text-orange-400',statPointsPerLevel: 5, dailyQuestsPerPillar: 4, xpMultiplier: 2.5 },
  S: { minLevel: 100,maxLevel: 999,title: 'Monarch',        color: 'text-yellow-400',statPointsPerLevel: 6, dailyQuestsPerPillar: 5, xpMultiplier: 3.0 },
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
      { id: 'd-deen-e-1', title: 'Fajr on Time', description: 'Pray Fajr within 10 min of adhan. The foundation of barakah.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['salah', 'foundational'] },
      { id: 'd-deen-e-2', title: 'Morning Dhikr', description: 'Say Ayat al-Kursi + 3x Ikhlas/Falaq/Nas after Fajr.', baseXp: 10, pillar: 'deen', estimatedMinutes: 3, tags: ['adhkar', 'morning'] },
      { id: 'd-deen-e-3', title: '2-Minute Quran', description: 'Read or listen to Quran for 2 minutes. Consistency > intensity.', baseXp: 10, pillar: 'deen', estimatedMinutes: 2, tags: ['quran', 'micro'] },
      { id: 'd-deen-e-4', title: 'Evening Adhkar', description: 'Say evening adhkar once after Maghrib or Isha.', baseXp: 10, pillar: 'deen', estimatedMinutes: 3, tags: ['adhkar', 'evening'] },
      { id: 'd-deen-e-5', title: 'Dua Before Sleep', description: 'Make specific dua before sleeping + recite Ayat al-Kursi.', baseXp: 10, pillar: 'deen', estimatedMinutes: 2, tags: ['dua', 'night'] },
      { id: 'd-deen-e-6', title: 'All 5 Prayers', description: 'Pray all 5 daily prayers on time (±15 min window).', baseXp: 20, pillar: 'deen', estimatedMinutes: 30, tags: ['salah', 'core'] },
    ],
    D: [
      { id: 'd-deen-d-1', title: 'Fajr + 2 Sunnah', description: 'Pray Fajr with its 2 Sunnah rakahs. The Prophet ﷺ never abandoned them.', baseXp: 15, pillar: 'deen', estimatedMinutes: 10, tags: ['salah', 'sunnah'] },
      { id: 'd-deen-d-2', title: '10-Minute Quran Block', description: 'Read Quran with translation for 10 minutes after Fajr or Dhuhr.', baseXp: 15, pillar: 'deen', estimatedMinutes: 10, tags: ['quran', 'focus'] },
      { id: 'd-deen-d-3', title: 'Morning Adhkar Complete', description: 'Full morning adhkar: Ayat al-Kursi, 3 Quls, protection duas.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['adhkar', 'morning'] },
      { id: 'd-deen-d-4', title: 'One Hadith', description: 'Read and reflect on one hadith from Riyad as-Salihin or similar.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['knowledge', 'hadith'] },
      { id: 'd-deen-d-5', title: 'Dhuhr in Congregation', description: 'Pray Dhuhr in congregation (masjid, home, or work).', baseXp: 15, pillar: 'deen', estimatedMinutes: 15, tags: ['salah', 'congregation'] },
      { id: 'd-deen-d-6', title: 'Tasbih After Salah', description: 'Say 33x SubhanAllah, Alhamdulillah, Allahu Akbar after each obligatory prayer.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['dhikr', 'post-salah'] },
      { id: 'd-deen-d-7', title: 'Istighfar 100x', description: 'Say Astaghfirullah 100 times throughout the day. Can be split.', baseXp: 15, pillar: 'deen', estimatedMinutes: 3, tags: ['dhikr', 'istighfar'] },
      { id: 'd-deen-d-8', title: 'Sleep After Isha', description: 'Go to bed within 30 minutes of Isha. Protect your Fajr.', baseXp: 15, pillar: 'deen', estimatedMinutes: 0, tags: ['sleep', 'discipline'] },
    ],
    C: [
      { id: 'd-deen-c-1', title: 'Tahajjud Attempt', description: 'Wake up 10 minutes before Fajr for Tahajjud or extra dhikr.', baseXp: 20, pillar: 'deen', estimatedMinutes: 10, tags: ['tahajjud', 'night'] },
      { id: 'd-deen-c-2', title: '20-Minute Tafsir', description: 'Study tafsir of 1-2 verses for 20 minutes. Deep > wide.', baseXp: 20, pillar: 'deen', estimatedMinutes: 20, tags: ['quran', 'tafsir'] },
      { id: 'd-deen-c-3', title: 'Rawatib Prayers', description: 'Pray the 12 rawatib (Sunnah before/after fard) throughout the day.', baseXp: 25, pillar: 'deen', estimatedMinutes: 20, tags: ['salah', 'rawatib'] },
      { id: 'd-deen-c-4', title: 'Memorize 1 Verse', description: 'Memorize and review one new verse from a surah you are learning.', baseXp: 20, pillar: 'deen', estimatedMinutes: 15, tags: ['hifz', 'quran'] },
      { id: 'd-deen-c-5', title: 'Character Check', description: 'Practice one specific character trait: patience, forgiveness, or controlling anger.', baseXp: 20, pillar: 'deen', estimatedMinutes: 0, tags: ['character', 'akhlaq'] },
      { id: 'd-deen-c-6', title: 'Dua List', description: 'Make a list of 3 specific duas and make them at the times they are accepted.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['dua', 'intention'] },
      { id: 'd-deen-c-7', title: 'Sadaqah Daily', description: 'Give any amount of sadaqah, even 1 rupee. The habit matters more than the amount.', baseXp: 15, pillar: 'deen', estimatedMinutes: 2, tags: ['charity', 'sadaqah'] },
      { id: 'd-deen-c-8', title: 'Qaylulah', description: 'Take a 15-20 minute midday nap (Qaylulah) for energy and Sunnah.', baseXp: 10, pillar: 'deen', estimatedMinutes: 20, tags: ['health', 'sunnah'] },
    ],
    B: [
      { id: 'd-deen-b-1', title: 'Tahajjud + Witr', description: 'Pray Tahajjud (minimum 2 rakahs) + Witr before Fajr.', baseXp: 30, pillar: 'deen', estimatedMinutes: 20, tags: ['tahajjud', 'witr'] },
      { id: 'd-deen-b-2', title: '30-Minute Deep Study', description: 'Study Islamic sciences: fiqh, aqeedah, or seerah for 30 minutes.', baseXp: 25, pillar: 'deen', estimatedMinutes: 30, tags: ['knowledge', 'deep'] },
      { id: 'd-deen-b-3', title: 'Teach Someone', description: 'Teach one Islamic concept to a family member or friend.', baseXp: 25, pillar: 'deen', estimatedMinutes: 10, tags: ['teaching', 'dawah'] },
      { id: 'd-deen-b-4', title: 'Itikaf Micro', description: 'Spend 10 minutes in quiet reflection/dhikr after any prayer.', baseXp: 20, pillar: 'deen', estimatedMinutes: 10, tags: ['dhikr', 'reflection'] },
      { id: 'd-deen-b-5', title: 'Complete Rawatib + Duha', description: 'Pray all 12 rawatib + Duha prayer (Salat al-Ishraq).', baseXp: 30, pillar: 'deen', estimatedMinutes: 25, tags: ['salah', 'nafl'] },
      { id: 'd-deen-b-6', title: 'Fasting Monday/Thursday', description: 'Fast Monday or Thursday (or both). The Sunnah fasts.', baseXp: 30, pillar: 'deen', estimatedMinutes: 0, tags: ['fasting', 'sunnah'] },
      { id: 'd-deen-b-7', title: 'Night Adhkar + Wudu Before Bed', description: 'Sleep with wudu and complete night adhkar.', baseXp: 20, pillar: 'deen', estimatedMinutes: 5, tags: ['adhkar', 'wudu'] },
      { id: 'd-deen-b-8', title: 'Gratitude Journal', description: 'Write 3 things you are grateful for and connect each to Allah.', baseXp: 15, pillar: 'deen', estimatedMinutes: 5, tags: ['gratitude', 'reflection'] },
    ],
    A: [
      { id: 'd-deen-a-1', title: 'Tahajjud + Dua Marathon', description: 'Pray Tahajjud and make extended dua in sujood (20+ min total).', baseXp: 35, pillar: 'deen', estimatedMinutes: 25, tags: ['tahajjud', 'dua'] },
      { id: 'd-deen-a-2', title: '45-Minute Scholarly Study', description: 'Study advanced Islamic texts or lectures for 45 minutes.', baseXp: 30, pillar: 'deen', estimatedMinutes: 45, tags: ['knowledge', 'advanced'] },
      { id: 'd-deen-a-3', title: 'Lead Prayer or Khutbah', description: 'Lead your family in prayer or prepare a 5-minute khutbah/lesson.', baseXp: 35, pillar: 'deen', estimatedMinutes: 15, tags: ['leadership', 'imam'] },
      { id: 'd-deen-a-4', title: 'Mentorship Check-in', description: 'Check in on a younger Muslim or new Muslim. Guide them.', baseXp: 30, pillar: 'deen', estimatedMinutes: 15, tags: ['mentorship', 'community'] },
      { id: 'd-deen-a-5', title: 'Complete Hizb or Juz', description: 'Read or review 1/2 to 1 Juz of Quran in a day.', baseXp: 30, pillar: 'deen', estimatedMinutes: 45, tags: ['quran', 'quantity'] },
      { id: 'd-deen-a-6', title: '6 Days of Shawwal Fasting', description: 'If in Shawwal, fast the 6 days. Otherwise, fast 3 days this week.', baseXp: 30, pillar: 'deen', estimatedMinutes: 0, tags: ['fasting', 'sunnah'] },
      { id: 'd-deen-a-7', title: 'Muhasabah Deep Review', description: '30-minute self-accountability: review week, seek forgiveness, plan fixes.', baseXp: 25, pillar: 'deen', estimatedMinutes: 30, tags: ['muhasabah', 'review'] },
      { id: 'd-deen-a-8', title: 'Dawah Action', description: 'Share one beneficial Islamic post, video, or message online or in person.', baseXp: 25, pillar: 'deen', estimatedMinutes: 10, tags: ['dawah', 'social'] },
    ],
    S: [
      { id: 'd-deen-s-1', title: 'The Monarch\'s Tahajjud', description: 'Pray Tahajjud with deep focus and extended Quran recitation (30+ min).', baseXp: 40, pillar: 'deen', estimatedMinutes: 35, tags: ['tahajjud', 'master'] },
      { id: 'd-deen-s-2', title: '1-Hour Deep Study', description: 'Study with a scholar or advanced text for 1 hour.', baseXp: 35, pillar: 'deen', estimatedMinutes: 60, tags: ['knowledge', 'master'] },
      { id: 'd-deen-s-3', title: 'Community Leadership', description: 'Organize or lead a community halaqa, study circle, or volunteering event.', baseXp: 40, pillar: 'deen', estimatedMinutes: 60, tags: ['leadership', 'community'] },
      { id: 'd-deen-s-4', title: 'Complete 1 Juz with Reflection', description: 'Read 1 Juz with tafsir and write 1-page reflection.', baseXp: 35, pillar: 'deen', estimatedMinutes: 60, tags: ['quran', 'mastery'] },
      { id: 'd-deen-s-5', title: 'Spiritual Retreat Plan', description: 'Plan or execute a half-day itikaf or spiritual retreat.', baseXp: 40, pillar: 'deen', estimatedMinutes: 120, tags: ['itikaf', 'retreat'] },
      { id: 'd-deen-s-6', title: 'Legacy Teaching', description: 'Record or write a teaching that can benefit people after you.', baseXp: 35, pillar: 'deen', estimatedMinutes: 45, tags: ['legacy', 'teaching'] },
      { id: 'd-deen-s-7', title: 'Advanced Fasting', description: 'Fast Davidic fast: half the year (alternate days) or 3 days per month.', baseXp: 40, pillar: 'deen', estimatedMinutes: 0, tags: ['fasting', 'advanced'] },
      { id: 'd-deen-s-8', title: 'Guidance Counsel', description: 'Provide detailed Islamic guidance to someone seeking help.', baseXp: 35, pillar: 'deen', estimatedMinutes: 30, tags: ['counsel', 'community'] },
    ],
  },

  body: {
    E: [
      { id: 'd-body-e-1', title: '5 Push-ups', description: 'Do 5 push-ups. Can be on knees. Just move your body.', baseXp: 10, pillar: 'body', estimatedMinutes: 2, tags: ['strength', 'micro'] },
      { id: 'd-body-e-2', title: '10-Minute Walk', description: 'Walk for 10 minutes. After any prayer is ideal.', baseXp: 10, pillar: 'body', estimatedMinutes: 10, tags: ['cardio', 'walk'] },
      { id: 'd-body-e-3', title: 'Drink 1L Water', description: 'Drink at least 1 liter of water throughout the day.', baseXp: 10, pillar: 'body', estimatedMinutes: 0, tags: ['hydration', 'nutrition'] },
      { id: 'd-body-e-4', title: 'Sleep by 10:30pm', description: 'Be in bed with intention to sleep by 10:30pm.', baseXp: 15, pillar: 'body', estimatedMinutes: 0, tags: ['sleep', 'recovery'] },
      { id: 'd-body-e-5', title: 'No Sugar Day', description: 'Avoid added sugar for one day. Read labels.', baseXp: 10, pillar: 'body', estimatedMinutes: 0, tags: ['nutrition', 'discipline'] },
      { id: 'd-body-e-6', title: 'Stretch 5 Minutes', description: 'Stretch your body for 5 minutes after Dhuhr or Asr.', baseXp: 10, pillar: 'body', estimatedMinutes: 5, tags: ['mobility', 'recovery'] },
    ],
    D: [
      { id: 'd-body-d-1', title: '15 Push-ups + 15 Squats', description: 'Complete 15 push-ups and 15 bodyweight squats.', baseXp: 15, pillar: 'body', estimatedMinutes: 5, tags: ['strength', 'calisthenics'] },
      { id: 'd-body-d-2', title: '20-Minute Walk or Light Jog', description: 'Walk briskly or light jog for 20 minutes.', baseXp: 15, pillar: 'body', estimatedMinutes: 20, tags: ['cardio', 'endurance'] },
      { id: 'd-body-d-3', title: '2L Water + No Sugary Drinks', description: 'Drink 2L water. No soda, energy drinks, or packaged juices.', baseXp: 15, pillar: 'body', estimatedMinutes: 0, tags: ['hydration', 'nutrition'] },
      { id: 'd-body-d-4', title: 'Sleep by 10:00pm', description: 'Be in bed by 10:00pm. Aim for 7-8 hours.', baseXp: 15, pillar: 'body', estimatedMinutes: 0, tags: ['sleep', 'recovery'] },
      { id: 'd-body-d-5', title: '10 Squats Every Hour', description: 'Do 10 squats every hour during work/study (6-8 sets = 60-80 total).', baseXp: 15, pillar: 'body', estimatedMinutes: 5, tags: ['strength', 'habit'] },
      { id: 'd-body-d-6', title: 'Home Workout 15 Min', description: 'Follow any 15-minute home workout video or routine.', baseXp: 15, pillar: 'body', estimatedMinutes: 15, tags: ['workout', 'structured'] },
      { id: 'd-body-d-7', title: 'Protein at Every Meal', description: 'Ensure each meal has a protein source (eggs, chicken, lentils, dairy).', baseXp: 15, pillar: 'body', estimatedMinutes: 0, tags: ['nutrition', 'protein'] },
      { id: 'd-body-d-8', title: 'Cold Shower Finish', description: 'End your shower with 30 seconds of cold water. Builds discipline.', baseXp: 10, pillar: 'body', estimatedMinutes: 0, tags: ['discipline', 'recovery'] },
    ],
    C: [
      { id: 'd-body-c-1', title: '30 Push-ups + 30 Squats + 10 Pull-ups', description: 'Complete the calisthenics triad. Use assisted pull-ups if needed.', baseXp: 20, pillar: 'body', estimatedMinutes: 15, tags: ['strength', 'calisthenics'] },
      { id: 'd-body-c-2', title: '30-Minute Run or Cardio', description: 'Run, cycle, swim, or skip rope for 30 minutes.', baseXp: 20, pillar: 'body', estimatedMinutes: 30, tags: ['cardio', 'endurance'] },
      { id: 'd-body-c-3', title: 'Meal Prep / Clean Eating', description: 'Eat 3 home-cooked/clean meals. No fast food.', baseXp: 20, pillar: 'body', estimatedMinutes: 0, tags: ['nutrition', 'clean'] },
      { id: 'd-body-c-4', title: 'Sleep by 9:30pm + Wake Without Alarm', description: 'Sleep early enough to wake naturally for Fajr.', baseXp: 20, pillar: 'body', estimatedMinutes: 0, tags: ['sleep', 'circadian'] },
      { id: 'd-body-c-5', title: 'Full Body Stretch 15 Min', description: 'Complete full-body stretching or yoga for 15 minutes.', baseXp: 15, pillar: 'body', estimatedMinutes: 15, tags: ['mobility', 'yoga'] },
      { id: 'd-body-c-6', title: '100 Reps Challenge', description: 'Pick one exercise. Do 100 reps throughout the day (squats, push-ups, dips).', baseXp: 20, pillar: 'body', estimatedMinutes: 10, tags: ['strength', 'volume'] },
      { id: 'd-body-c-7', title: 'No Processed Food', description: 'Zero processed food for the day. Whole foods only.', baseXp: 20, pillar: 'body', estimatedMinutes: 0, tags: ['nutrition', 'discipline'] },
      { id: 'd-body-c-8', title: 'Plank 2 Minutes', description: 'Hold a plank for 2 minutes total (can be split into sets).', baseXp: 15, pillar: 'body', estimatedMinutes: 5, tags: ['core', 'strength'] },
    ],
    B: [
      { id: 'd-body-b-1', title: '5×5 Strength Workout', description: '5 sets of 5 reps of squats, push-ups, and rows/pull-ups.', baseXp: 30, pillar: 'body', estimatedMinutes: 35, tags: ['strength', 'power'] },
      { id: 'd-body-b-2', title: '45-Minute Intense Cardio', description: 'High-intensity run, HIIT, or sports for 45 minutes.', baseXp: 25, pillar: 'body', estimatedMinutes: 45, tags: ['cardio', 'hiit'] },
      { id: 'd-body-b-3', title: 'Macro-Tracked Day', description: 'Track protein, carbs, fats for the day. Hit protein target (0.8g per kg).', baseXp: 25, pillar: 'body', estimatedMinutes: 10, tags: ['nutrition', 'tracking'] },
      { id: 'd-body-b-4', title: 'Perfect Sleep Hygiene', description: 'No screens 1 hour before bed. Sleep by 9:30pm. Wake for Tahajjud.', baseXp: 25, pillar: 'body', estimatedMinutes: 0, tags: ['sleep', 'discipline'] },
      { id: 'd-body-b-5', title: 'Mobility + Recovery Session', description: '20-minute foam rolling, stretching, or hijama/cupping if available.', baseXp: 20, pillar: 'body', estimatedMinutes: 20, tags: ['recovery', 'mobility'] },
      { id: 'd-body-b-6', title: '200 Reps Bodyweight', description: '200 total reps of bodyweight exercises (any combination).', baseXp: 25, pillar: 'body', estimatedMinutes: 20, tags: ['strength', 'endurance'] },
      { id: 'd-body-b-7', title: 'Fasted Morning Walk', description: '30-minute walk before breakfast (if safe for your health).', baseXp: 20, pillar: 'body', estimatedMinutes: 30, tags: ['cardio', 'fasted'] },
      { id: 'd-body-b-8', title: 'Mental Training', description: '10 minutes of meditation, deep breathing, or Quran listening for mental clarity.', baseXp: 20, pillar: 'body', estimatedMinutes: 10, tags: ['mind', 'mental'] },
    ],
    A: [
      { id: 'd-body-a-1', title: 'Advanced Calisthenics', description: 'Muscle-ups, pistol squats, or handstand practice (30 min).', baseXp: 35, pillar: 'body', estimatedMinutes: 35, tags: ['strength', 'advanced'] },
      { id: 'd-body-a-2', title: '60-Minute Endurance', description: 'Run 5K+ or equivalent endurance activity for 60 minutes.', baseXp: 30, pillar: 'body', estimatedMinutes: 60, tags: ['cardio', 'endurance'] },
      { id: 'd-body-a-3', title: 'Nutrition Mastery', description: 'Plan and execute a full day of optimized nutrition for your goals.', baseXp: 30, pillar: 'body', estimatedMinutes: 15, tags: ['nutrition', 'mastery'] },
      { id: 'd-body-a-4', title: 'Physical Challenge', description: 'Complete a physical challenge: 100 burpees, 5K run, or 500 reps.', baseXp: 35, pillar: 'body', estimatedMinutes: 45, tags: ['challenge', 'test'] },
      { id: 'd-body-a-5', title: 'Recovery Protocol', description: 'Full recovery day: stretching, ice bath/cold shower, adequate sleep, hydration.', baseXp: 25, pillar: 'body', estimatedMinutes: 30, tags: ['recovery', 'protocol'] },
      { id: 'd-body-a-6', title: 'Train Someone', description: 'Take a friend or family member through a workout.', baseXp: 30, pillar: 'body', estimatedMinutes: 45, tags: ['teaching', 'community'] },
      { id: 'd-body-a-7', title: 'Strength PR', description: 'Attempt a personal record in any lift or bodyweight movement.', baseXp: 30, pillar: 'body', estimatedMinutes: 30, tags: ['strength', 'pr'] },
      { id: 'd-body-a-8', title: 'Mind-Body Connection', description: '20 minutes of mindful movement: tai chi, yoga, or prayer-focused stretching.', baseXp: 25, pillar: 'body', estimatedMinutes: 20, tags: ['mind', 'movement'] },
    ],
    S: [
      { id: 'd-body-s-1', title: 'The Monarch\'s Gauntlet', description: 'Complete a high-volume workout: 500+ reps or 10K+ run.', baseXp: 40, pillar: 'body', estimatedMinutes: 60, tags: ['challenge', 'master'] },
      { id: 'd-body-s-2', title: 'Elite Athletic Performance', description: 'Train like an athlete: structured program, timing, nutrition, recovery.', baseXp: 35, pillar: 'body', estimatedMinutes: 60, tags: ['athlete', 'elite'] },
      { id: 'd-body-s-3', title: 'Body Mastery Routine', description: 'Complete a full mobility + strength + cardio + recovery protocol.', baseXp: 40, pillar: 'body', estimatedMinutes: 90, tags: ['mastery', 'protocol'] },
      { id: 'd-body-s-4', title: 'Compete or Test', description: 'Enter a race, competition, or do a max-effort fitness test.', baseXp: 40, pillar: 'body', estimatedMinutes: 60, tags: ['compete', 'test'] },
      { id: 'd-body-s-5', title: 'Holistic Health Day', description: 'Perfect nutrition, sleep, training, and mental health practices in one day.', baseXp: 35, pillar: 'body', estimatedMinutes: 0, tags: ['holistic', 'perfect'] },
      { id: 'd-body-s-6', title: 'Train a Group', description: 'Lead a group workout or sports session for your community.', baseXp: 35, pillar: 'body', estimatedMinutes: 60, tags: ['leadership', 'community'] },
      { id: 'd-body-s-7', title: 'Advanced Recovery', description: 'Hijama, ice bath, sauna, deep tissue work, or professional recovery.', baseXp: 30, pillar: 'body', estimatedMinutes: 60, tags: ['recovery', 'advanced'] },
      { id: 'd-body-s-8', title: 'Physical Discipline Master', description: 'Maintain perfect form, intention, and consistency across all training.', baseXp: 35, pillar: 'body', estimatedMinutes: 60, tags: ['discipline', 'master'] },
    ],
  },

  money: {
    E: [
      { id: 'd-money-e-1', title: 'Track 1 Expense', description: 'Write down one expense you made today. Awareness is the first step.', baseXp: 10, pillar: 'money', estimatedMinutes: 2, tags: ['tracking', 'awareness'] },
      { id: 'd-money-e-2', title: 'No Impulse Buy', description: 'Resist one impulse purchase today. Wait 24 hours before buying.', baseXp: 10, pillar: 'money', estimatedMinutes: 0, tags: ['discipline', 'spending'] },
      { id: 'd-money-e-3', title: 'Read 1 Finance Page', description: 'Read one page or article about personal finance or investing.', baseXp: 10, pillar: 'money', estimatedMinutes: 5, tags: ['knowledge', 'learning'] },
      { id: 'd-money-e-4', title: 'Check Bank Balance', description: 'Log into your bank account and check your balance. Face the numbers.', baseXp: 10, pillar: 'money', estimatedMinutes: 2, tags: ['awareness', 'tracking'] },
      { id: 'd-money-e-5', title: '1 Rupee Sadaqah', description: 'Give 1 rupee (or any small amount) in sadaqah. The habit matters.', baseXp: 10, pillar: 'money', estimatedMinutes: 1, tags: ['charity', 'sadaqah'] },
      { id: 'd-money-e-6', title: 'Identify 1 Skill', description: 'Write down one skill you could learn to increase your income.', baseXp: 10, pillar: 'money', estimatedMinutes: 5, tags: ['skills', 'planning'] },
    ],
    D: [
      { id: 'd-money-d-1', title: 'Track All Expenses', description: 'Track every rupee spent today. Use an app or notebook.', baseXp: 15, pillar: 'money', estimatedMinutes: 5, tags: ['tracking', 'budget'] },
      { id: 'd-money-d-2', title: 'No Dining Out', description: 'Eat only home-cooked food today. Save money, eat healthier.', baseXp: 15, pillar: 'money', estimatedMinutes: 0, tags: ['saving', 'nutrition'] },
      { id: 'd-money-d-3', title: 'Read 1 Finance Chapter', description: 'Read one chapter of a finance book or watch one educational video.', baseXp: 15, pillar: 'money', estimatedMinutes: 20, tags: ['knowledge', 'learning'] },
      { id: 'd-money-d-4', title: 'Calculate Net Worth', description: 'List your assets and liabilities. Calculate your approximate net worth.', baseXp: 15, pillar: 'money', estimatedMinutes: 15, tags: ['tracking', 'networth'] },
      { id: 'd-money-d-5', title: 'Daily Sadaqah 1%', description: 'Give 1% of your daily income (or 10-50 rupees) in sadaqah.', baseXp: 15, pillar: 'money', estimatedMinutes: 2, tags: ['charity', 'habit'] },
      { id: 'd-money-d-6', title: 'Skill Study 15 Min', description: 'Study a high-income skill for 15 minutes (coding, copywriting, design, etc.).', baseXp: 15, pillar: 'money', estimatedMinutes: 15, tags: ['skills', 'growth'] },
      { id: 'd-money-d-7', title: 'Cancel 1 Subscription', description: 'Find and cancel one unused subscription or recurring expense.', baseXp: 15, pillar: 'money', estimatedMinutes: 5, tags: ['saving', 'optimization'] },
      { id: 'd-money-d-8', title: 'Halal Income Check', description: 'Review your income sources. Ensure they are halal and ethical.', baseXp: 15, pillar: 'money', estimatedMinutes: 10, tags: ['halal', 'ethics'] },
    ],
    C: [
      { id: 'd-money-c-1', title: 'Zero-Based Budget', description: 'Create a budget where every rupee is assigned a job before the day starts.', baseXp: 20, pillar: 'money', estimatedMinutes: 15, tags: ['budget', 'planning'] },
      { id: 'd-money-c-2', title: 'Execute 1 Investment', description: 'Buy one stock, mutual fund, or asset. Start small. Start now.', baseXp: 25, pillar: 'money', estimatedMinutes: 15, tags: ['investing', 'action'] },
      { id: 'd-money-c-3', title: 'Side Income Action', description: 'Work on a side project or freelance gig for 30 minutes.', baseXp: 20, pillar: 'money', estimatedMinutes: 30, tags: ['income', 'sidehustle'] },
      { id: 'd-money-c-4', title: 'Financial Review', description: 'Review weekly spending, investments, and progress toward goals.', baseXp: 20, pillar: 'money', estimatedMinutes: 20, tags: ['review', 'tracking'] },
      { id: 'd-money-c-5', title: 'Sadaqah Jariyah', description: 'Contribute to a sadaqah jariyah project (well, mosque, education).', baseXp: 20, pillar: 'money', estimatedMinutes: 10, tags: ['charity', 'legacy'] },
      { id: 'd-money-c-6', title: 'Skill Practice 30 Min', description: 'Practice your money-making skill for 30 minutes.', baseXp: 20, pillar: 'money', estimatedMinutes: 30, tags: ['skills', 'practice'] },
      { id: 'd-money-c-7', title: 'Negotiate or Research', description: 'Negotiate a bill, ask for a raise, or research a better deal.', baseXp: 20, pillar: 'money', estimatedMinutes: 15, tags: ['negotiation', 'saving'] },
      { id: 'd-money-c-8', title: 'Avoid Riba Check', description: 'Review one financial product for riba/interest. Purify your wealth.', baseXp: 20, pillar: 'money', estimatedMinutes: 10, tags: ['halal', 'purification'] },
    ],
    B: [
      { id: 'd-money-b-1', title: 'Investment Strategy Review', description: 'Review and rebalance your investment portfolio. Check Shariah compliance.', baseXp: 30, pillar: 'money', estimatedMinutes: 30, tags: ['investing', 'strategy'] },
      { id: 'd-money-b-2', title: 'Income Stream Expansion', description: 'Launch or grow a second income stream. Take concrete action.', baseXp: 30, pillar: 'money', estimatedMinutes: 45, tags: ['income', 'growth'] },
      { id: 'd-money-b-3', title: 'Teach Finance', description: 'Teach someone one financial concept you have learned.', baseXp: 25, pillar: 'money', estimatedMinutes: 15, tags: ['teaching', 'community'] },
      { id: 'd-money-b-4', title: 'Zakat Calculation', description: 'Calculate your zakat obligation. Prepare to pay it.', baseXp: 30, pillar: 'money', estimatedMinutes: 20, tags: ['zakat', 'obligation'] },
      { id: 'd-money-b-5', title: 'Business Idea Validation', description: 'Validate a business idea by talking to 1 potential customer.', baseXp: 25, pillar: 'money', estimatedMinutes: 20, tags: ['business', 'validation'] },
      { id: 'd-money-b-6', title: 'Automate Savings', description: 'Set up an automatic transfer to savings/investment on payday.', baseXp: 25, pillar: 'money', estimatedMinutes: 10, tags: ['automation', 'saving'] },
      { id: 'd-money-b-7', title: 'Premium Skill Work', description: 'Work on your highest-value skill for 1 hour.', baseXp: 25, pillar: 'money', estimatedMinutes: 60, tags: ['skills', 'deepwork'] },
      { id: 'd-money-b-8', title: 'Wealth Purification', description: 'Identify and eliminate one haram income source or expense.', baseXp: 30, pillar: 'money', estimatedMinutes: 15, tags: ['halal', 'purification'] },
    ],
    A: [
      { id: 'd-money-a-1', title: 'Portfolio Deep Analysis', description: 'Analyze your full portfolio. Check returns, risk, and Shariah compliance.', baseXp: 35, pillar: 'money', estimatedMinutes: 45, tags: ['investing', 'analysis'] },
      { id: 'd-money-a-2', title: 'Launch or Scale Business', description: 'Take a major action to launch or scale your business/side income.', baseXp: 35, pillar: 'money', estimatedMinutes: 60, tags: ['business', 'scale'] },
      { id: 'd-money-a-3', title: 'Mentor Someone Financially', description: 'Mentor a younger person or family member on personal finance.', baseXp: 30, pillar: 'money', estimatedMinutes: 30, tags: ['mentorship', 'community'] },
      { id: 'd-money-a-4', title: 'Strategic Charity', description: 'Plan and execute strategic charity that multiplies impact.', baseXp: 30, pillar: 'money', estimatedMinutes: 20, tags: ['charity', 'strategy'] },
      { id: 'd-money-a-5', title: 'Network Building', description: 'Attend or host a networking event. Build relationships for barakah.', baseXp: 30, pillar: 'money', estimatedMinutes: 60, tags: ['network', 'growth'] },
      { id: 'd-money-a-6', title: 'Advanced Investment', description: 'Research or execute an advanced investment (real estate, private equity, etc.).', baseXp: 35, pillar: 'money', estimatedMinutes: 45, tags: ['investing', 'advanced'] },
      { id: 'd-money-a-7', title: 'Financial Independence Check', description: 'Calculate your FI number and update your plan to reach it.', baseXp: 30, pillar: 'money', estimatedMinutes: 30, tags: ['fi', 'planning'] },
      { id: 'd-money-a-8', title: 'Ummah Impact Investment', description: 'Invest in or donate to a project that benefits the ummah.', baseXp: 35, pillar: 'money', estimatedMinutes: 30, tags: ['ummah', 'impact'] },
    ],
    S: [
      { id: 'd-money-s-1', title: 'The Monarch\'s Portfolio', description: 'Manage a diversified, Shariah-compliant portfolio across multiple asset classes.', baseXp: 40, pillar: 'money', estimatedMinutes: 60, tags: ['investing', 'master'] },
      { id: 'd-money-s-2', title: 'Business Empire Action', description: 'Take a major strategic action for your business or income empire.', baseXp: 40, pillar: 'money', estimatedMinutes: 90, tags: ['business', 'empire'] },
      { id: 'd-money-s-3', title: 'Generational Wealth Plan', description: 'Create or update a generational wealth and inheritance plan.', baseXp: 35, pillar: 'money', estimatedMinutes: 45, tags: ['legacy', 'wealth'] },
      { id: 'd-money-s-4', title: 'Ummah Fund', description: 'Establish or contribute significantly to a fund for ummah projects.', baseXp: 40, pillar: 'money', estimatedMinutes: 60, tags: ['ummah', 'fund'] },
      { id: 'd-money-s-5', title: 'Teach a Course', description: 'Create or teach a course on halal wealth, investing, or business.', baseXp: 35, pillar: 'money', estimatedMinutes: 60, tags: ['teaching', 'legacy'] },
      { id: 'd-money-s-6', title: 'Strategic Partnership', description: 'Form a strategic business or investment partnership for barakah.', baseXp: 35, pillar: 'money', estimatedMinutes: 60, tags: ['partnership', 'growth'] },
      { id: 'd-money-s-7', title: 'Wealth Purification Audit', description: 'Full audit of all income, expenses, and investments for Shariah compliance.', baseXp: 40, pillar: 'money', estimatedMinutes: 60, tags: ['halal', 'audit'] },
      { id: 'd-money-s-8', title: 'Monarch\'s Giving', description: 'Give charity that genuinely impacts lives. Aim for sadaqah jariyah.', baseXp: 40, pillar: 'money', estimatedMinutes: 30, tags: ['charity', 'master'] },
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
    level: 1, rank: 'E', title: 'The System Awakens',
    description: 'You have been chosen. The path of the Seeker begins with a single step.',
    quests: [
      { id: 'lq-e-1-1', title: 'First Prayer on Time', description: 'Pray one salah exactly on time today. This is your first awakening.', xp: 50, pillar: 'deen' },
      { id: 'lq-e-1-2', title: 'Body Activation', description: 'Do 10 push-ups and 10 squats in one session.', xp: 30, pillar: 'body' },
      { id: 'lq-e-1-3', title: 'Wealth Awareness', description: 'Write down your current bank balance and one financial goal.', xp: 30, pillar: 'money' },
    ],
    reward: { gold: 50, statPoints: 1, message: 'The System has recognized you. Welcome, Seeker.' },
  },
  {
    level: 2, rank: 'E', title: 'The Seeker\'s Vow',
    description: 'Commit to the path. Consistency is the seed of all greatness.',
    quests: [
      { id: 'lq-e-2-1', title: '3-Day Prayer Streak', description: 'Pray all 5 prayers on time for 3 consecutive days.', xp: 60, pillar: 'deen' },
      { id: 'lq-e-2-2', title: 'Movement Habit', description: 'Walk 10 minutes every day for 3 days.', xp: 40, pillar: 'body' },
      { id: 'lq-e-2-3', title: 'Expense Tracking', description: 'Track every expense for 3 days.', xp: 40, pillar: 'money' },
    ],
    reward: { gold: 60, statPoints: 1, message: 'Your vow has been recorded. The System watches.' },
  },
  {
    level: 3, rank: 'E', title: 'Morning Barakah',
    description: 'The Prophet ﷺ said: "O Allah, bless my Ummah in their early mornings."',
    quests: [
      { id: 'lq-e-3-1', title: 'Fajr Warrior', description: 'Pray Fajr on time and stay awake for 30 minutes for 5 days.', xp: 70, pillar: 'deen' },
      { id: 'lq-e-3-2', title: 'Hydration Discipline', description: 'Drink 1L of water every day for 5 days.', xp: 50, pillar: 'body' },
      { id: 'lq-e-3-3', title: 'No Impulse Week', description: 'No impulse purchases for 7 days.', xp: 50, pillar: 'money' },
    ],
    reward: { gold: 70, statPoints: 1, message: 'Barakah flows in your mornings.' },
  },
  {
    level: 4, rank: 'E', title: 'The First Shadow',
    description: 'Your first habit is becoming automatic. This is your first Shadow extraction.',
    quests: [
      { id: 'lq-e-4-1', title: 'Dhikr Habit', description: 'Complete morning adhkar for 7 consecutive days.', xp: 80, pillar: 'deen' },
      { id: 'lq-e-4-2', title: 'Strength Seed', description: 'Do push-ups every day for 7 days (start with 5, add 1 each day).', xp: 60, pillar: 'body' },
      { id: 'lq-e-4-3', title: 'Sadaqah Seed', description: 'Give sadaqah every day for 7 days, even 1 rupee.', xp: 60, pillar: 'money' },
    ],
    reward: { gold: 80, statPoints: 1, shadowUnlock: 'basic-dhikr', message: 'Your first Shadow has been extracted. "Arise."' },
  },
  {
    level: 5, rank: 'E', title: 'The Weakling\'s Gauntlet',
    description: 'Push beyond your limits. The System only grows those who struggle.',
    quests: [
      { id: 'lq-e-5-1', title: 'Quran Consistency', description: 'Read Quran for 5 minutes every day for 10 days.', xp: 90, pillar: 'deen' },
      { id: 'lq-e-5-2', title: 'Sleep Discipline', description: 'Sleep by 10:30pm every night for 10 days.', xp: 70, pillar: 'body' },
      { id: 'lq-e-5-3', title: 'Finance Foundation', description: 'Read 10 pages of a personal finance book.', xp: 70, pillar: 'money' },
    ],
    reward: { gold: 100, statPoints: 2, message: 'You have survived the gauntlet. You are no longer a weakling.' },
  },
  {
    level: 6, rank: 'E', title: 'The Habit Forge',
    description: 'Habits are forged in repetition. Your will is the hammer.',
    quests: [
      { id: 'lq-e-6-1', title: 'All Prayers Week', description: 'All 5 prayers on time for 7 consecutive days.', xp: 100, pillar: 'deen' },
      { id: 'lq-e-6-2', title: 'Movement Mastery', description: '30 minutes of movement (walk, workout, stretch) every day for 7 days.', xp: 80, pillar: 'body' },
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
    level: 10, rank: 'E', title: 'RANK UP: The Hunter\'s Threshold',
    description: 'You have proven yourself. The System promotes you to D-Rank.',
    quests: [
      { id: 'lq-e-10-1', title: 'The 21-Day Challenge', description: 'Complete ALL daily quests across all pillars for 21 consecutive days.', xp: 200, pillar: 'deen' },
      { id: 'lq-e-10-2', title: 'Physical Test', description: 'Do 25 push-ups, 25 squats, and a 15-minute jog in one session.', xp: 150, pillar: 'body' },
      { id: 'lq-e-10-3', title: 'Financial Snapshot', description: 'Calculate net worth and set 3 financial goals for the year.', xp: 150, pillar: 'money' },
    ],
    reward: { gold: 200, statPoints: 3, rankUp: 'D', message: 'RANK UP! You are now a D-Rank Hunter. New powers awaken.' },
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
      { id: 'lq-d-14-1', title: '30-Day Calisthenics', description: 'Follow a 30-day bodyweight program. Minimum 15 min/day.', xp: 180, pillar: 'body' },
      { id: 'lq-d-14-2', title: 'Nutrition Overhaul', description: 'Eat clean (no processed food) for 14 days.', xp: 150, pillar: 'body' },
      { id: 'lq-d-14-3', title: 'Sleep Mastery', description: 'Sleep by 9:30pm and wake without alarm for 14 days.', xp: 150, pillar: 'body' },
    ],
    reward: { gold: 180, statPoints: 2, shadowUnlock: 'warrior-body', message: 'The Warrior\'s Body is forged.' },
  },
  {
    level: 15, rank: 'D', title: 'JOB CHANGE: The Merchant\'s Mind',
    description: 'Wealth is a tool. Learn to wield it for the ummah.',
    quests: [
      { id: 'lq-d-15-1', title: 'First Investment', description: 'Open a brokerage account and buy your first Shariah-compliant stock or fund.', xp: 200, pillar: 'money' },
      { id: 'lq-d-15-2', title: 'Skill Investment', description: 'Invest in a course or book for your high-income skill.', xp: 150, pillar: 'money' },
      { id: 'lq-d-15-3', title: 'Sadaqah System', description: 'Set up automatic sadaqah (even 100 rupees/month).', xp: 150, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, jobChange: 'merchant', message: 'JOB CHANGE: You have become a Merchant. Wealth flows to you.' },
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
      { id: 'lq-d-20-2', title: 'Morning Routine Lock', description: 'Execute a complete morning routine (Fajr → Adhkar → Quran → Workout) for 21 days.', xp: 200, pillar: 'body' },
      { id: 'lq-d-20-3', title: 'Financial Automation', description: 'Automate savings, investments, and sadaqah.', xp: 200, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, shadowUnlock: 'elite-habit-stack', message: 'Elite Shadow extracted. Your habits now fight for you.' },
  },
  {
    level: 22, rank: 'D', title: 'The Specialized',
    description: 'You are no longer a generalist. Specialization creates mastery.',
    quests: [
      { id: 'lq-d-22-1', title: 'Deen Specialization', description: 'Choose one Islamic science (fiqh, tafsir, hadith, seerah) and study it for 30 days.', xp: 220, pillar: 'deen' },
      { id: 'lq-d-22-2', title: 'Body Specialization', description: 'Choose one fitness domain (strength, cardio, mobility) and focus for 30 days.', xp: 200, pillar: 'body' },
      { id: 'lq-d-22-3', title: 'Money Specialization', description: 'Choose one wealth domain (investing, business, skills) and focus for 30 days.', xp: 200, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, message: 'Specialization unlocks mastery.' },
  },
  {
    level: 25, rank: 'D', title: 'RANK UP: The Elite Threshold',
    description: 'You have outgrown D-Rank. The Elite rank awaits.',
    quests: [
      { id: 'lq-d-25-1', title: 'The 45-Day Gauntlet', description: 'Complete ALL daily quests for 45 consecutive days.', xp: 300, pillar: 'deen' },
      { id: 'lq-d-25-2', title: 'Physical Test: D-Rank', description: '50 push-ups, 50 squats, 20 pull-ups/assisted, 20-minute run.', xp: 250, pillar: 'body' },
      { id: 'lq-d-25-3', title: 'Financial Milestone', description: 'Have 3 months of expenses saved and 1 active investment.', xp: 250, pillar: 'money' },
    ],
    reward: { gold: 300, statPoints: 4, rankUp: 'C', message: 'RANK UP! You are now a C-Rank Elite Hunter. Shadows tremble.' },
  },

  // ═══════════════════════════════════════
  // C-RANK: THE ELITE (Levels 26-45)
  // ═══════════════════════════════════════
  {
    level: 27, rank: 'C', title: 'The Teacher',
    description: 'The best way to learn is to teach. Share what you have gained.',
    quests: [
      { id: 'lq-c-27-1', title: 'Teach Deen', description: 'Teach one Islamic concept to someone else. Record or write it.', xp: 250, pillar: 'deen' },
      { id: 'lq-c-27-2', title: 'Teach Fitness', description: 'Take someone through a workout. Teach proper form.', xp: 220, pillar: 'body' },
      { id: 'lq-c-27-3', title: 'Teach Finance', description: 'Explain one financial concept to a friend or family member.', xp: 220, pillar: 'money' },
    ],
    reward: { gold: 250, statPoints: 3, message: 'Teaching cements your knowledge.' },
  },
  {
    level: 30, rank: 'C', title: 'JOB CHANGE: The Knight\'s Oath',
    description: 'You must choose your true path. The Knight\'s Oath binds you to excellence.',
    quests: [
      { id: 'lq-c-30-1', title: 'The Oath of Discipline', description: 'Commit to 60 days of perfect daily quest completion.', xp: 350, pillar: 'deen' },
      { id: 'lq-c-30-2', title: 'The Physical Trial', description: 'Complete a physical challenge: 100 burpees, 5K run, or 1-hour workout.', xp: 300, pillar: 'body' },
      { id: 'lq-c-30-3', title: 'The Wealth Pledge', description: 'Set up automatic investing and charity. Wealth must flow.', xp: 300, pillar: 'money' },
    ],
    reward: { gold: 400, statPoints: 4, jobChange: 'knight', message: 'JOB CHANGE: You are now a Knight. Your oath is your power.' },
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
      { id: 'lq-c-36-2', title: 'Fitness Community', description: 'Work out with a partner or group 3 times this month.', xp: 250, pillar: 'body' },
      { id: 'lq-c-36-3', title: 'Financial Accountability', description: 'Find an accountability partner for financial goals. Check in weekly.', xp: 250, pillar: 'money' },
    ],
    reward: { gold: 300, statPoints: 3, message: 'Community multiplies your barakah.' },
  },
  {
    level: 40, rank: 'C', title: 'The Deep Diver',
    description: 'Go deeper, not wider. Mastery requires depth.',
    quests: [
      { id: 'lq-c-40-1', title: 'Deep Tafsir', description: 'Study one surah in depth with tafsir for 30 days.', xp: 350, pillar: 'deen' },
      { id: 'lq-c-40-2', title: 'Movement Mastery', description: 'Master one advanced movement: muscle-up, pistol squat, handstand, etc.', xp: 300, pillar: 'body' },
      { id: 'lq-c-40-3', title: 'Portfolio Diversification', description: 'Invest in 3 different Shariah-compliant asset classes.', xp: 300, pillar: 'money' },
    ],
    reward: { gold: 350, statPoints: 4, message: 'Depth creates mastery. You are becoming a master.' },
  },
  {
    level: 45, rank: 'C', title: 'RANK UP: The Knight\'s Threshold',
    description: 'You have proven yourself worthy of the Knight rank. The test is brutal.',
    quests: [
      { id: 'lq-c-45-1', title: 'The 60-Day Crusade', description: 'Complete ALL daily quests for 60 consecutive days.', xp: 400, pillar: 'deen' },
      { id: 'lq-c-45-2', title: 'The Physical Crusade', description: 'Complete a 10K run or 500-rep bodyweight challenge.', xp: 350, pillar: 'body' },
      { id: 'lq-c-45-3', title: 'The Wealth Crusade', description: 'Achieve 6 months of expenses saved + 3 income streams.', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 400, statPoints: 5, rankUp: 'B', message: 'RANK UP! You are now a B-Rank Knight. The battlefield is yours.' },
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
    level: 50, rank: 'B', title: 'JOB CHANGE: The Templar',
    description: 'The Templar combines martial discipline with spiritual devotion.',
    quests: [
      { id: 'lq-b-50-1', title: 'The Templar\'s Devotion', description: 'Pray Tahajjud + Witr for 30 consecutive days.', xp: 400, pillar: 'deen' },
      { id: 'lq-b-50-2', title: 'The Templar\'s Strength', description: 'Achieve a strength milestone: 50 push-ups, 20 pull-ups, 100 squats in one session.', xp: 350, pillar: 'body' },
      { id: 'lq-b-50-3', title: 'The Templar\'s Wealth', description: 'Achieve positive cash flow from a side business or investment.', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 450, statPoints: 5, jobChange: 'templar', message: 'JOB CHANGE: You are now a Templar. Devotion and strength as one.' },
  },
  {
    level: 53, rank: 'B', title: 'The Strategist',
    description: 'Power without strategy is wasted. Plan your conquest.',
    quests: [
      { id: 'lq-b-53-1', title: 'Strategic Worship', description: 'Plan your week around peak spiritual times: Tahajjud, Jumuah, last third of night.', xp: 350, pillar: 'deen' },
      { id: 'lq-b-53-2', title: 'Strategic Training', description: 'Design and follow a periodized training program for 30 days.', xp: 300, pillar: 'body' },
      { id: 'lq-b-53-3', title: 'Strategic Wealth', description: 'Create a 5-year financial independence plan with milestones.', xp: 300, pillar: 'money' },
    ],
    reward: { gold: 350, statPoints: 4, message: 'Strategy turns effort into conquest.' },
  },
  {
    level: 56, rank: 'B', title: 'The Shadow General',
    description: 'Your habits command other habits. You are a general of discipline.',
    quests: [
      { id: 'lq-b-56-1', title: 'Command Your Shadows', description: 'Maintain 5+ automatic habits simultaneously for 30 days.', xp: 400, pillar: 'deen' },
      { id: 'lq-b-56-2', title: 'Physical Command', description: 'Train others in fitness. Lead by example.', xp: 350, pillar: 'body' },
      { id: 'lq-b-56-3', title: 'Wealth Command', description: 'Automate your entire financial system: earning, saving, investing, giving.', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 400, statPoints: 5, shadowUnlock: 'general-shadow', message: 'General Shadow extracted. Your discipline commands armies.' },
  },
  {
    level: 60, rank: 'B', title: 'The Ummah\'s Shield',
    description: 'Your strength is not for you alone. It is for the ummah.',
    quests: [
      { id: 'lq-b-60-1', title: 'Ummah Service', description: 'Volunteer 10+ hours for an Islamic or community organization this month.', xp: 400, pillar: 'deen' },
      { id: 'lq-b-60-2', title: 'Strength for Service', description: 'Use your fitness to help someone: move furniture, help elderly, etc.', xp: 350, pillar: 'body' },
      { id: 'lq-b-60-3', title: 'Wealth for Ummah', description: 'Donate significantly to an ummah cause. Make it hurt a little.', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 400, statPoints: 5, message: 'The ummah is your family. Protect and serve.' },
  },
  {
    level: 65, rank: 'B', title: 'The Unbreakable',
    description: 'Trials come. You do not break. You bend, then spring back stronger.',
    quests: [
      { id: 'lq-b-65-1', title: 'Trial by Fire', description: 'Maintain all habits during a difficult week (travel, illness, stress).', xp: 450, pillar: 'deen' },
      { id: 'lq-b-65-2', title: 'Sick Discipline', description: 'When sick or injured, maintain minimum viable habits (micro version).', xp: 350, pillar: 'body' },
      { id: 'lq-b-65-3', title: 'Financial Stress Test', description: 'Simulate a financial emergency. Can you survive 6 months?', xp: 350, pillar: 'money' },
    ],
    reward: { gold: 450, statPoints: 5, message: 'You are unbreakable. The System recognizes resilience.' },
  },
  {
    level: 70, rank: 'B', title: 'RANK UP: The General\'s Threshold',
    description: 'Knights serve. Generals lead. You are ready to lead.',
    quests: [
      { id: 'lq-b-70-1', title: 'The 90-Day War', description: 'Complete ALL daily quests for 90 consecutive days.', xp: 500, pillar: 'deen' },
      { id: 'lq-b-70-2', title: 'The Physical War', description: 'Complete a half-marathon, 1000-rep challenge, or equivalent.', xp: 450, pillar: 'body' },
      { id: 'lq-b-70-3', title: 'The Wealth War', description: 'Achieve 12 months of expenses saved + 5 income streams.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 6, rankUp: 'A', message: 'RANK UP! You are now an A-Rank General. Armies follow you.' },
  },

  // ═══════════════════════════════════════
  // A-RANK: THE GENERAL (Levels 71-99)
  // ═══════════════════════════════════════
  {
    level: 73, rank: 'A', title: 'The Leader',
    description: 'Leaders create other leaders. Your legacy is measured by those you elevate.',
    quests: [
      { id: 'lq-a-73-1', title: 'Mentorship Program', description: 'Formally mentor one person in Deen, Body, or Money for 30 days.', xp: 450, pillar: 'deen' },
      { id: 'lq-a-73-2', title: 'Lead by Fitness', description: 'Lead a group workout or sports team consistently for a month.', xp: 400, pillar: 'body' },
      { id: 'lq-a-73-3', title: 'Wealth Mentorship', description: 'Guide someone to their first investment or income stream.', xp: 400, pillar: 'money' },
    ],
    reward: { gold: 450, statPoints: 5, message: 'Leaders create leaders. This is your legacy.' },
  },
  {
    level: 76, rank: 'A', title: 'JOB CHANGE: The Monarch\'s Awakening',
    description: 'The Monarch does not follow the System. The System follows the Monarch.',
    quests: [
      { id: 'lq-a-76-1', title: 'The Monarch\'s Prayer', description: 'Pray Tahajjud with deep khushoo for 45+ minutes for 30 days.', xp: 500, pillar: 'deen' },
      { id: 'lq-a-76-2', title: 'The Monarch\'s Body', description: 'Achieve elite fitness: complete a marathon, advanced calisthenics, or competitive sport.', xp: 450, pillar: 'body' },
      { id: 'lq-a-76-3', title: 'The Monarch\'s Wealth', description: 'Achieve financial independence or build a business that employs Muslims.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 600, statPoints: 6, jobChange: 'monarch', message: 'JOB CHANGE: The Monarch awakens. You command the System itself.' },
  },
  {
    level: 80, rank: 'A', title: 'The Conqueror',
    description: 'Conquer yourself first. Then conquer the world.',
    quests: [
      { id: 'lq-a-80-1', title: 'Inner Jihad', description: 'Identify and defeat your greatest personal flaw. 30-day battle.', xp: 500, pillar: 'deen' },
      { id: 'lq-a-80-2', title: 'Physical Conquest', description: 'Conquer a major physical challenge: marathon, triathlon, martial arts test.', xp: 450, pillar: 'body' },
      { id: 'lq-a-80-3', title: 'Wealth Conquest', description: 'Build a system that generates halal wealth without your direct daily effort.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 6, message: 'The greatest conquest is the conquest of self.' },
  },
  {
    level: 85, rank: 'A', title: 'The Ummah\'s General',
    description: 'Your strength is the ummah\'s strength. Your wealth is the ummah\'s wealth.',
    quests: [
      { id: 'lq-a-85-1', title: 'Ummah Project', description: 'Lead or fund a project that benefits 100+ Muslims.', xp: 500, pillar: 'deen' },
      { id: 'lq-a-85-2', title: 'Fitness for Ummah', description: 'Create a fitness program or facility for Muslims.', xp: 450, pillar: 'body' },
      { id: 'lq-a-85-3', title: 'Wealth for Ummah', description: 'Create a fund, business, or investment that employs or benefits Muslims.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 6, message: 'The ummah rises with you.' },
  },
  {
    level: 90, rank: 'A', title: 'The Unstoppable',
    description: 'Nothing stops you. Not fear. Not fatigue. Not failure. You rise every time.',
    quests: [
      { id: 'lq-a-90-1', title: 'The 120-Day Legend', description: 'Complete ALL daily quests for 120 consecutive days.', xp: 600, pillar: 'deen' },
      { id: 'lq-a-90-2', title: 'Legendary Fitness', description: 'Maintain elite fitness for 1 year without major breaks.', xp: 500, pillar: 'body' },
      { id: 'lq-a-90-3', title: 'Legendary Wealth', description: 'Achieve complete financial independence (passive income > expenses).', xp: 500, pillar: 'money' },
    ],
    reward: { gold: 600, statPoints: 7, message: 'You are unstoppable. The System bows to your will.' },
  },
  {
    level: 99, rank: 'A', title: 'RANK UP: The Monarch\'s Threshold',
    description: 'This is the final threshold. Beyond this lies divinity.',
    quests: [
      { id: 'lq-a-99-1', title: 'The Final Trial', description: 'Complete ALL daily quests for 180 consecutive days.', xp: 700, pillar: 'deen' },
      { id: 'lq-a-99-2', title: 'The Physical Apex', description: 'Achieve a physical feat that 99% of humans cannot do.', xp: 600, pillar: 'body' },
      { id: 'lq-a-99-3', title: 'The Wealth Apex', description: 'Build generational wealth that outlives you and benefits the ummah.', xp: 600, pillar: 'money' },
    ],
    reward: { gold: 700, statPoints: 8, rankUp: 'S', message: 'RANK UP! You are now an S-Rank Monarch. All shadows kneel.' },
  },

  // ═══════════════════════════════════════
  // S-RANK: THE MONARCH (Level 100+)
  // ═══════════════════════════════════════
  {
    level: 100, rank: 'S', title: 'THE MONARCH\'S CORONATION',
    description: 'You have transcended. The System is now your shadow.',
    quests: [
      { id: 'lq-s-100-1', title: 'The Eternal Quest', description: 'Maintain all habits for 365 consecutive days. Become the habit.', xp: 1000, pillar: 'deen' },
      { id: 'lq-s-100-2', title: 'The Eternal Body', description: 'Maintain elite fitness for life. The body is a lifelong amanah.', xp: 800, pillar: 'body' },
      { id: 'lq-s-100-3', title: 'The Eternal Legacy', description: 'Build a legacy project (institution, fund, business) that benefits Muslims for generations.', xp: 800, pillar: 'money' },
    ],
    reward: { gold: 1000, statPoints: 10, shadowUnlock: 'monarch-army', message: 'THE MONARCH HAS CROWNED. "ARISE." Your shadows are infinite.' },
  },
  {
    level: 105, rank: 'S', title: 'The Infinite Dungeon',
    description: 'There is no end. Only deeper levels.',
    quests: [
      { id: 'lq-s-105-1', title: 'Infinite Worship', description: 'Add one new act of worship and maintain it for 90 days.', xp: 500, pillar: 'deen' },
      { id: 'lq-s-105-2', title: 'Infinite Strength', description: 'Set and achieve a new physical PR every month for a year.', xp: 450, pillar: 'body' },
      { id: 'lq-s-105-3', title: 'Infinite Wealth', description: '10x your net worth through halal means.', xp: 450, pillar: 'money' },
    ],
    reward: { gold: 500, statPoints: 5, message: 'The dungeon is infinite. Your growth is infinite.' },
  },
  {
    level: 110, rank: 'S', title: 'The Shadow Monarch',
    description: 'You are the Shadow Monarch. Your habits are your army. Your discipline is your power.',
    quests: [
      { id: 'lq-s-110-1', title: 'Absolute Mastery', description: 'Maintain perfect consistency across all pillars for 1 year.', xp: 1000, pillar: 'deen' },
      { id: 'lq-s-110-2', title: 'Absolute Power', description: 'Achieve a physical feat in the top 1% of your age group.', xp: 800, pillar: 'body' },
      { id: 'lq-s-110-3', title: 'Absolute Wealth', description: 'Build a halal empire that employs 10+ Muslims and funds ummah projects.', xp: 800, pillar: 'money' },
    ],
    reward: { gold: 1000, statPoints: 10, message: 'You are the Shadow Monarch. "ARISE."' },
  },
];

// ─── JOB CHANGE QUESTS (Major lifestyle shifts at rank thresholds) ───
export const JOB_CHANGE_QUESTS = [
  {
    id: 'job-merchant',
    name: 'The Merchant\'s Mind',
    rank: 'D',
    levelRequired: 15,
    description: 'Wealth is a tool. Learn to wield it for the ummah.',
    steps: [
      { id: 'jc-merchant-1', text: 'Open a brokerage/investment account', completed: false },
      { id: 'jc-merchant-2', text: 'Buy first Shariah-compliant investment', completed: false },
      { id: 'jc-merchant-3', text: 'Set up automatic sadaqah', completed: false },
      { id: 'jc-merchant-4', text: 'Complete a finance course or book', completed: false },
    ],
    reward: { gold: 500, statPoints: 5, title: 'Merchant' },
  },
  {
    id: 'job-knight',
    name: 'The Knight\'s Oath',
    rank: 'C',
    levelRequired: 30,
    description: 'Swear the oath of discipline. Body, mind, and soul as one.',
    steps: [
      { id: 'jc-knight-1', text: '60 days perfect daily quest completion', completed: false },
      { id: 'jc-knight-2', text: 'Complete a major physical trial', completed: false },
      { id: 'jc-knight-3', text: 'Automate all finances', completed: false },
      { id: 'jc-knight-4', text: 'Teach someone your core skill', completed: false },
    ],
    reward: { gold: 800, statPoints: 8, title: 'Knight' },
  },
  {
    id: 'job-templar',
    name: 'The Templar',
    rank: 'B',
    levelRequired: 50,
    description: 'Combine martial discipline with spiritual devotion.',
    steps: [
      { id: 'jc-templar-1', text: '30 days Tahajjud + Witr', completed: false },
      { id: 'jc-templar-2', text: 'Achieve elite strength milestone', completed: false },
      { id: 'jc-templar-3', text: 'Positive cash flow from business/investment', completed: false },
      { id: 'jc-templar-4', text: 'Lead a community project', completed: false },
    ],
    reward: { gold: 1000, statPoints: 10, title: 'Templar' },
  },
  {
    id: 'job-monarch',
    name: 'The Monarch\'s Awakening',
    rank: 'A',
    levelRequired: 76,
    description: 'The Monarch does not follow the System. The System follows the Monarch.',
    steps: [
      { id: 'jc-monarch-1', text: '30 days of 45+ min Tahajjud', completed: false },
      { id: 'jc-monarch-2', text: 'Complete elite physical feat', completed: false },
      { id: 'jc-monarch-3', text: 'Achieve financial independence or ummah-employing business', completed: false },
      { id: 'jc-monarch-4', text: 'Mentor 3 people to D-rank or higher', completed: false },
    ],
    reward: { gold: 2000, statPoints: 15, title: 'Monarch' },
  },
];

// ─── EMERGENCY / REDEMPTION QUESTS ───
export const REDEMPTION_QUEST_TEMPLATES = [
  {
    id: 'redemption-1',
    title: 'The Penalty Zone: Desert Survival',
    description: 'You have missed 3+ days. Survive the Penalty Zone to restore your power.',
    requiredDays: 3,
    quests: [
      { id: 'rq-1-1', title: 'Double Daily Quests', description: 'Complete DOUBLE the normal daily quests today.', xp: 100, pillar: 'deen' },
      { id: 'rq-1-2', title: 'Physical Penance', description: 'Complete 100 push-ups, 100 squats, and a 10-minute run.', xp: 100, pillar: 'body' },
      { id: 'rq-1-3', title: 'Financial Penance', description: 'Track every expense for the past 3 days and give extra sadaqah.', xp: 100, pillar: 'money' },
    ],
    reward: { clearDebuff: true, gold: 50, message: 'You survived the Penalty Zone. Your power is restored.' },
  },
  {
    id: 'redemption-2',
    title: 'The Redemption Gauntlet',
    description: 'You have missed 7+ days. Only the strong survive the gauntlet.',
    requiredDays: 7,
    quests: [
      { id: 'rq-2-1', title: 'Triple Daily Quests', description: 'Complete TRIPLE the normal daily quests for 3 days.', xp: 200, pillar: 'deen' },
      { id: 'rq-2-2', title: 'The Solo Leveling Workout', description: '100 push-ups, 100 squats, 100 sit-ups, 10-min run for 3 days.', xp: 200, pillar: 'body' },
      { id: 'rq-2-3', title: 'Financial Reset', description: 'Complete a full financial audit and create a new budget.', xp: 200, pillar: 'money' },
    ],
    reward: { clearDebuff: true, gold: 150, statPoints: 2, message: 'You conquered the Gauntlet. You are reborn.' },
  },
];

// ─── WEEKLY DUNGEON TEMPLATES (Scaled by rank) ───
export const WEEKLY_DUNGEON_TEMPLATES = {
  E: {
    deen: { title: "The Seeker's Trial", description: 'Complete 1 Juz of Quran + Write 1-page reflection + Teach someone 1 thing', xp: 200, steps: ['Read 1 Juz', 'Write reflection', 'Teach someone'] },
    body: { title: "The Weakling's Gauntlet", description: 'Complete full workout + Perfect nutrition day + Sleep by 10pm', xp: 200, steps: ['Full workout (20+ min)', 'Zero sugar, 1.5L water', 'Sleep by 10pm'] },
    money: { title: "The Apprentice's Challenge", description: 'Full expense review + Make 1 financial action + Give sadaqah', xp: 200, steps: ['Review all expenses', 'Execute 1 financial action', 'Extra sadaqah'] },
  },
  D: {
    deen: { title: "The Devotee's Dungeon", description: 'Memorize 1 page + Lead prayer once + Complete all rawatib for a day', xp: 300, steps: ['Memorize 1 page', 'Lead family prayer', 'All 12 rawatib'] },
    body: { title: "The Hunter's Gauntlet", description: '5K run or equivalent + 100 bodyweight reps + Perfect sleep 3 nights', xp: 300, steps: ['5K run / 30-min cardio', '100 bodyweight reps', 'Perfect sleep x3'] },
    money: { title: "The Merchant's Dungeon", description: 'Full budget review + Make 1 investment + No impulse buys for 7 days', xp: 300, steps: ['Full budget review', 'Make 1 investment', 'No impulse buys x7'] },
  },
  C: {
    deen: { title: "The Elite's Trial", description: 'Complete 1 Juz with tafsir + Fast Monday/Thursday + Teach a study circle', xp: 400, steps: ['1 Juz with tafsir', 'Fast Mon/Thu', 'Lead study circle'] },
    body: { title: "The Elite's Gauntlet", description: '10K run + 200 bodyweight reps + 7-day clean eating', xp: 400, steps: ['10K run', '200 bodyweight reps', '7-day clean eating'] },
    money: { title: "The Elite's Challenge", description: 'Launch side income action + Full portfolio review + Strategic charity', xp: 400, steps: ['Side income action', 'Portfolio review', 'Strategic charity'] },
  },
  B: {
    deen: { title: "The Knight's Crusade", description: 'Tahajjud 3 nights + Complete 3 Juz + Organize community event', xp: 500, steps: ['Tahajjud x3', 'Read 3 Juz', 'Community event'] },
    body: { title: "The Knight's Gauntlet", description: 'Half-marathon or 500-rep challenge + Perfect recovery protocol + Train 2 people', xp: 500, steps: ['Half-marathon/500 reps', 'Recovery protocol', 'Train 2 people'] },
    money: { title: "The Knight's Treasury", description: 'Full net worth analysis + Scale income stream + Ummah investment', xp: 500, steps: ['Net worth analysis', 'Scale income', 'Ummah investment'] },
  },
  A: {
    deen: { title: "The General's Campaign", description: 'Tahajjud 5 nights + Complete 5 Juz with reflection + Deliver khutbah/lesson', xp: 600, steps: ['Tahajjud x5', '5 Juz + reflection', 'Deliver khutbah'] },
    body: { title: "The General's War", description: 'Marathon or equivalent + Elite fitness test + Lead group for month', xp: 600, steps: ['Marathon/equivalent', 'Elite fitness test', 'Lead group x1 month'] },
    money: { title: "The General's Empire", description: 'Launch/scale business + Achieve FI milestone + Major ummah project', xp: 600, steps: ['Launch/scale business', 'FI milestone', 'Major ummah project'] },
  },
  S: {
    deen: { title: "The Monarch's Dominion", description: 'Complete 10 Juz + Tahajjud every night + Record a teaching legacy', xp: 800, steps: ['10 Juz', 'Tahajjud x7', 'Record teaching'] },
    body: { title: "The Monarch's Apex", description: 'Ultimate physical challenge + Maintain elite fitness + Train a community', xp: 800, steps: ['Ultimate challenge', 'Elite fitness', 'Train community'] },
    money: { title: "The Monarch's Treasury", description: 'Generational wealth plan + Major ummah fund + Mentor 3 to financial independence', xp: 800, steps: ['Generational plan', 'Ummah fund', 'Mentor x3'] },
  },
};

// ─── GOLD REWARDS ───
export function calculateGoldReward(quest, rankKey) {
  const rankMultipliers = { E: 1, D: 1.5, C: 2.5, B: 4, A: 6, S: 10 };
  const base = quest.baseXp || quest.xp || 10;
  return Math.floor((base / 5) * (rankMultipliers[rankKey] || 1));
}

// ─── QUEST GENERATION HELPERS ───
export function getDailyQuestsForRank(rankKey, existingQuests = []) {
  const count = RANK_CONFIG[rankKey].dailyQuestsPerPillar;
  const pools = DAILY_QUEST_POOLS;
  const result = [];

  ['deen', 'body', 'money'].forEach(pillar => {
    const pool = pools[pillar][rankKey] || pools[pillar].E;
    // Shuffle and pick
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);
    picked.forEach(q => {
      result.push({
        ...q,
        xp: getEffectiveXp(q.baseXp, rankKey),
        uniqueId: `${q.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
  return {
    weekId: null, // Set by caller
    deen: { ...templates.deen, steps: templates.deen.steps.map((s, i) => ({ id: `wd-deen-${i}`, text: s, completed: false })) },
    body: { ...templates.body, steps: templates.body.steps.map((s, i) => ({ id: `wd-body-${i}`, text: s, completed: false })) },
    money: { ...templates.money, steps: templates.money.steps.map((s, i) => ({ id: `wd-money-${i}`, text: s, completed: false })) },
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
