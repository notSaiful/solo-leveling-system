export const PRESET_QUESTS = [
  // DEEN
  { id: 'deen-fajr', pillar: 'deen', title: 'Fajr on time', baseXp: 5, scaleFn: (rank) => 5, rankRequired: 'E', daily: true, category: 'prayer' },
  { id: 'deen-quran', pillar: 'deen', title: 'Quran reading', baseXp: 10, scaleFn: (rank) => 10 + (rankMultiplier(rank) * 8), rankRequired: 'E', daily: true, category: 'quran' },
  { id: 'deen-memorize', pillar: 'deen', title: 'Memorize ayah/page', baseXp: 20, scaleFn: (rank) => 20 + (rankMultiplier(rank) * 16), rankRequired: 'E', daily: true, category: 'memorization' },
  { id: 'deen-study', pillar: 'deen', title: 'Islamic study', baseXp: 15, scaleFn: (rank) => 15 + (rankMultiplier(rank) * 12), rankRequired: 'E', daily: true, category: 'study' },
  { id: 'deen-dhikr', pillar: 'deen', title: 'Daily dhikr 100x', baseXp: 5, scaleFn: (rank) => 5 + (rankMultiplier(rank) * 3), rankRequired: 'E', daily: true, category: 'dhikr' },

  // BODY
  { id: 'body-strength', pillar: 'body', title: 'Strength training', baseXp: 15, scaleFn: (rank) => 15 + (rankMultiplier(rank) * 17), rankRequired: 'E', daily: true, category: 'strength' },
  { id: 'body-cardio', pillar: 'body', title: 'Cardio / Steps', baseXp: 10, scaleFn: (rank) => 10 + (rankMultiplier(rank) * 8), rankRequired: 'E', daily: true, category: 'cardio' },
  { id: 'body-nutrition', pillar: 'body', title: 'Nutrition discipline', baseXp: 10, scaleFn: (rank) => 10 + (rankMultiplier(rank) * 6), rankRequired: 'E', daily: true, category: 'nutrition' },
  { id: 'body-sleep', pillar: 'body', title: 'Sleep discipline', baseXp: 5, scaleFn: (rank) => 5 + (rankMultiplier(rank) * 3), rankRequired: 'E', daily: true, category: 'sleep' },
  { id: 'body-cold', pillar: 'body', title: 'Cold shower', baseXp: 5, scaleFn: (rank) => 5 + (rankMultiplier(rank) * 2), rankRequired: 'E', daily: true, category: 'recovery' },

  // MONEY
  { id: 'money-track', pillar: 'money', title: 'Track all expenses', baseXp: 5, scaleFn: (rank) => 5 + (rankMultiplier(rank) * 4), rankRequired: 'E', daily: true, category: 'tracking' },
  { id: 'money-edu', pillar: 'money', title: 'Financial education', baseXp: 15, scaleFn: (rank) => 15 + (rankMultiplier(rank) * 13), rankRequired: 'E', daily: true, category: 'education' },
  { id: 'money-income', pillar: 'money', title: 'Income generation', baseXp: 20, scaleFn: (rank) => 20 + (rankMultiplier(rank) * 26), rankRequired: 'E', daily: true, category: 'income' },
  { id: 'money-sadaqah', pillar: 'money', title: 'Sadaqah / Zakat', baseXp: 10, scaleFn: (rank) => 10 + (rankMultiplier(rank) * 18), rankRequired: 'E', daily: true, category: 'charity' },
];

function rankMultiplier(rank) {
  const map = { E: 0, D: 1, C: 2, B: 3, A: 4, S: 5 };
  return map[rank] || 0;
}

export function getQuestXp(quest, rank) {
  return quest.scaleFn(rank);
}
