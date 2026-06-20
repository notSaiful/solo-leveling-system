export const UNIT_XP = 8;

export const CATALOG = {
  pushups:    { key: 'pushups',    name: 'Push-ups',          pillar: 'body',  baseXp: 15, unit: 'reps',    difficulty: 1 },
  pullups:    { key: 'pullups',    name: 'Pull-ups',          pillar: 'body',  baseXp: 20, unit: 'reps',    difficulty: 2 },
  run:        { key: 'run',        name: 'Running',           pillar: 'body',  baseXp: 20, unit: 'minutes', difficulty: 2 },
  hike:       { key: 'hike',       name: 'Hike / Trek',       pillar: 'body',  baseXp: 30, unit: 'minutes', difficulty: 3 },
  fajr:       { key: 'fajr',       name: 'Fajr on time',      pillar: 'deen',  baseXp: 15, unit: null,      difficulty: 1 },
  salah5:     { key: 'salah5',     name: 'All 5 prayers',     pillar: 'deen',  baseXp: 20, unit: null,      difficulty: 2 },
  adhkar:     { key: 'adhkar',     name: 'Adhkar',            pillar: 'deen',  baseXp: 10, unit: null,      difficulty: 1 },
  quran:      { key: 'quran',      name: 'Quran reading',     pillar: 'deen',  baseXp: 15, unit: 'minutes', difficulty: 2 },
  sadaqah:    { key: 'sadaqah',    name: 'Sadaqah',           pillar: 'deen',  baseXp: 10, unit: 'rupees',  difficulty: 1 },
  istighfar:  { key: 'istighfar',  name: 'Istighfar',         pillar: 'deen',  baseXp: 10, unit: 'count',   difficulty: 1 },
  aiTask:     { key: 'aiTask',     name: 'AI business task',  pillar: 'money', baseXp: 20, unit: null,      difficulty: 2 },
  aiLearn:    { key: 'aiLearn',    name: 'AI learning',       pillar: 'money', baseXp: 15, unit: 'minutes', difficulty: 1 },
  halalCheck: { key: 'halalCheck', name: 'Halal income check',pillar: 'money', baseXp: 15, unit: null,      difficulty: 1 },
  save:       { key: 'save',       name: 'Saved money',       pillar: 'money', baseXp: 15, unit: 'rupees',  difficulty: 1 },
};

export const SYNONYMS = {
  'push up': 'pushups', 'pushup': 'pushups', 'push-ups': 'pushups', 'pushups': 'pushups',
  'pull up': 'pullups', 'pullup': 'pullups', 'pull-ups': 'pullups',
  'running': 'run', 'run': 'run', 'jog': 'run', 'ran': 'run', 'walk': 'run', 'walking': 'run',
  'hike': 'hike', 'hiked': 'hike', 'trek': 'hike', 'trekking': 'hike',
  'fajr on time': 'fajr', 'prayed fajr': 'fajr', 'fajr': 'fajr',
  'all 5 prayers': 'salah5', '5 prayers': 'salah5', 'five prayers': 'salah5',
  'morning adhkar': 'adhkar', 'evening adhkar': 'adhkar', 'adhkar': 'adhkar',
  'read quran': 'quran', 'quran reading': 'quran', 'quran': 'quran',
  'gave sadaqah': 'sadaqah', 'charity': 'sadaqah', 'sadaqah': 'sadaqah',
  'astaghfirullah': 'istighfar', 'istighfar': 'istighfar',
  'ai business': 'aiTask', 'ai task': 'aiTask', 'business idea': 'aiTask', 'validated idea': 'aiTask',
  'studied ai': 'aiLearn', 'ai learning': 'aiLearn', 'ai paper': 'aiLearn',
  'halal income': 'halalCheck', 'halal check': 'halalCheck',
  'saved money': 'save', 'save money': 'save', 'saved': 'save', 'saving': 'save',
};

const SORTED_SYNONYMS = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length);

export function lookupActivity(text) {
  const lower = String(text || '').toLowerCase();
  for (const phrase of SORTED_SYNONYMS) {
    if (lower.includes(phrase)) {
      const key = SYNONYMS[phrase];
      return { ...CATALOG[key] };
    }
  }
  return null;
}

export function getCatalogEntry(key, overrides = {}) {
  const base = CATALOG[key];
  if (!base) return null;
  return { ...base, ...overrides };
}

export function promoteActivity(state, activityKey, fixedXp) {
  const overrides = state.catalogOverrides || {};
  return {
    ...state,
    catalogOverrides: { ...overrides, [activityKey]: { fixedXp } },
  };
}
