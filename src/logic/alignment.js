const ALIGNMENT_KEYWORDS = {
  deen: ['quran', 'islam', 'allah', 'prayer', 'salah', 'dhikr', 'hadith', 'fiqh', 'seerah', 'aqeedah', 'tafsir', 'dua', 'ramadan', 'zakat', 'hajj', 'umrah', 'mosque', 'masjid', 'ummah', 'sunnah'],
  body: ['outdoor', 'explore', 'hike', 'trek', 'trail', 'walk', 'nature', 'climb', 'camp', 'navigation', 'endurance', 'terrain', 'wilderness', 'run', 'strength', 'health', 'fasting', 'sleep', 'hydration', 'cold shower', 'meditation', 'mental'],
  money: ['income', 'investment', 'stock', 'business', 'side hustle', 'freelance', 'savings', 'expense', 'budget', 'finance', 'wealth', 'halal', 'sadaqah', 'charity', 'zakat', 'trade', 'money', 'profit', 'revenue', 'client'],
};

export function validateQuestAlignment(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();
  const scores = { deen: 0, body: 0, money: 0 };

  for (const [pillar, keywords] of Object.entries(ALIGNMENT_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) scores[pillar]++;
    }
  }

  const total = scores.deen + scores.body + scores.money;
  const max = Math.max(scores.deen, scores.body, scores.money);

  if (total === 0) {
    return { status: 'warning', reason: 'No strong keyword match — use AI evaluation for nuanced alignment confirmation, or proceed if you are confident.', scores };
  }

  if (max >= 2) {
    const pillar = Object.entries(scores).find(([_, v]) => v === max)[0];
    return { status: 'approved', pillar, reason: `Directly serves ${pillar} objective`, scores };
  }

  const suggestedPillar = Object.entries(scores).find(([_, v]) => v > 0)?.[0] || 'deen';
  return { status: 'warning', pillar: suggestedPillar, reason: 'Weak alignment. Please confirm objective mapping.', scores };
}
