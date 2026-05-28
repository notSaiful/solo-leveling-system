export const LEVEL_QUEST_TEMPLATES = {
  deen: [
    { id: 'deen-lq-{level}', title: 'Memorize {count} ayahs', baseCount: 3, xp: 30, category: 'memorization' },
    { id: 'deen-lq-{level}-2', title: 'Read {count} pages tafsir', baseCount: 2, xp: 25, category: 'study' },
    { id: 'deen-lq-{level}-3', title: 'Pray Tahajjud + Fajr', baseCount: 1, xp: 40, category: 'prayer' },
    { id: 'deen-lq-{level}-4', title: 'Teach someone {count} ayahs', baseCount: 1, xp: 35, category: 'teaching' },
    { id: 'deen-lq-{level}-5', title: 'Complete {count} pages Quran with translation', baseCount: 5, xp: 30, category: 'quran' },
  ],
  body: [
    { id: 'body-lq-{level}', title: 'Complete {count} pushups', baseCount: 50, xp: 35, category: 'strength' },
    { id: 'body-lq-{level}-2', title: 'Run {count} km', baseCount: 2, xp: 40, category: 'cardio' },
    { id: 'body-lq-{level}-3', title: 'Plank hold {count} seconds', baseCount: 60, xp: 30, category: 'strength' },
    { id: 'body-lq-{level}-4', title: 'Fast for {count} hours (intermittent)', baseCount: 16, xp: 35, category: 'nutrition' },
    { id: 'body-lq-{level}-5', title: '{count} pull-ups', baseCount: 10, xp: 40, category: 'strength' },
  ],
  money: [
    { id: 'money-lq-{level}', title: 'Save ₹{count}', baseCount: 100, xp: 30, category: 'savings' },
    { id: 'money-lq-{level}-2', title: 'Read {count} pages investment book', baseCount: 10, xp: 25, category: 'education' },
    { id: 'money-lq-{level}-3', title: 'Analyze {count} stocks', baseCount: 3, xp: 40, category: 'analysis' },
    { id: 'money-lq-{level}-4', title: 'Earn ₹{count} from side hustle', baseCount: 500, xp: 50, category: 'income' },
    { id: 'money-lq-{level}-5', title: 'Give sadaqah ₹{count}', baseCount: 50, xp: 35, category: 'charity' },
  ],
};

function getScaling(level) {
  // Every 5 levels, difficulty doubles
  const multiplier = Math.max(1, Math.floor(level / 5) + 1);
  return multiplier;
}

export function generateLevelQuests(pillar, level) {
  const templates = LEVEL_QUEST_TEMPLATES[pillar];
  if (!templates) return [];

  const scaling = getScaling(level);
  const index = level % templates.length;
  const template = templates[index];

  const count = template.baseCount * scaling;
  const xp = template.xp * scaling;

  return [{
    id: template.id.replace('{level}', level),
    pillar,
    title: template.title.replace('{count}', count),
    baseCount: count,
    xp,
    requiredLevel: level,
    isLevelQuest: true,
    completed: false,
  }];
}

export function getAvailableLevelQuests(state, pillar) {
  const currentLevel = state.pillars[pillar].level;
  const existing = state.levelQuests.filter(q => q.pillar === pillar && !q.completed);

  // If no active level quest for this pillar, generate one for current level
  if (existing.length === 0) {
    const newQuests = generateLevelQuests(pillar, currentLevel);
    return newQuests;
  }

  return existing;
}
