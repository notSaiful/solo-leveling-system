const STORAGE_KEY = 'soloLevelingData';
const SCHEMA_VERSION = 2;

export const DEFAULT_STATE = {
  version: SCHEMA_VERSION,
  user: { name: 'Seeker', currentRank: 'E', overallLevel: 0, joinedDate: new Date().toISOString(), jobClass: null },
  pillars: {
    deen: { level: 0, xp: 0, streak: 0, shadowsUnlocked: [], activeDebuff: null },
    body: { level: 0, xp: 0, streak: 0, shadowsUnlocked: [], activeDebuff: null },
    money: { level: 0, xp: 0, streak: 0, shadowsUnlocked: [], activeDebuff: null },
  },
  stats: { strength: 10, agility: 10, intelligence: 10, sense: 10, health: 10, mana: 10 },
  statPoints: 0,
  gold: 0,
  flowState: { active: false, multiplier: 1, expiresAt: 0, questsInWindow: 0 },
  purchasedRewards: [],
  customQuests: [],
  levelQuests: [],
  redemptionQuests: [],
  dailyQuests: [],
  lastQuestDate: null,
  shadows: [],
  jobChangeQuests: [],
  completedJobChanges: [],
  history: [],
  systemMessages: [],
  weeklyDungeons: { weekId: null, deenCompleted: false, bodyCompleted: false, moneyCompleted: false, bonusClaimed: false },
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // Schema mismatch: reset to default (prevents crashes from stale data)
    if (parsed.version !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return DEFAULT_STATE;
    }
    return { ...DEFAULT_STATE, ...parsed, pillars: { ...DEFAULT_STATE.pillars, ...parsed.pillars } };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportData() {
  return JSON.stringify(loadState(), null, 2);
}

export function importData(json) {
  const parsed = JSON.parse(json);
  saveState(parsed);
  return parsed;
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_STATE;
}
