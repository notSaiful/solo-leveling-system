import { loadStateFromCloud, syncStateToCloud, queueCloudSync, clearQueuedCloudSync } from '../services/cloudSync';
import { isCanonicalSyncConfigured } from '../services/canonicalSync';
import { getLocalDateString } from '../utils/dateUtils';

export const STORAGE_KEY = 'soloLevelingData';
const SCHEMA_VERSION = 2;
const CLOUD_ENABLED_KEY = 'cloudSyncEnabled';

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
  aiDungeons: [],
  lastActiveDate: getLocalDateString(),
  lastPenaltyCheckDate: null,
  lastUpdated: 0,
};

function normalizeStateShape(state) {
  const normalized = {
    ...DEFAULT_STATE,
    ...state,
  };
  normalized.pillars = {
    deen: { ...DEFAULT_STATE.pillars.deen, ...(state.pillars?.deen || {}) },
    body: { ...DEFAULT_STATE.pillars.body, ...(state.pillars?.body || {}) },
    money: { ...DEFAULT_STATE.pillars.money, ...(state.pillars?.money || {}) },
  };
  normalized.stats = { ...DEFAULT_STATE.stats, ...(state.stats || {}) };
  normalized.flowState = { ...DEFAULT_STATE.flowState, ...(state.flowState || {}) };
  normalized.weeklyDungeons = { ...DEFAULT_STATE.weeklyDungeons, ...(state.weeklyDungeons || {}) };
  normalized.customQuests = (state.customQuests || []).map(q => {
    const stableId = q.id || q.uniqueId || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      ...q,
      id: stableId,
      uniqueId: q.uniqueId || stableId,
    };
  });
  return normalized;
}

// ─── localStorage helpers ───

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (parsed.version !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return DEFAULT_STATE;
    }
    return normalizeStateShape(parsed);
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

export function exportData() {
  return JSON.stringify(loadState(), null, 2);
}

export function importData(json) {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid data');
    const merged = normalizeStateShape(parsed);
    saveState(merged);
    return merged;
  } catch (e) {
    console.error('Import failed:', e);
    throw e;
  }
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_STATE;
}

// ─── Cloud helpers ───

export function isCloudEnabled() {
  return localStorage.getItem(CLOUD_ENABLED_KEY) === 'true' && isCanonicalSyncConfigured();
}

export function setCloudEnabled(enabled) {
  localStorage.setItem(CLOUD_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function initCloudSync() {
  if (!isCanonicalSyncConfigured()) {
    return { success: false, reason: 'not_configured' };
  }

  const localState = loadState();
  const cloudState = await loadStateFromCloud();

  if (cloudState) {
    // Timestamp-aware merge. Newest state wins, so an older browser cannot
    // overwrite progress made on another device during startup.
    const cloudTime = cloudState.lastUpdated || 0;
    const localTime = localState.lastUpdated || 0;

    let winner = cloudState;
    let source = 'cloud';

    // If local is strictly newer (e.g. device was offline, then came back online
    // and local progress happened after the last successful sync), keep local
    // and push it again to overwrite stale cloud data.
    if (localTime > cloudTime) {
      winner = localState;
      source = 'local';
      await syncStateToCloud(localState);
    }

    // Daily quests are a special case: they rotate every day. Keep whichever
    // matches the more recent quest date, regardless of overall timestamp.
    const cloudQuestDate = cloudState.lastQuestDate;
    const localQuestDate = localState.lastQuestDate;
    let finalDailyQuests = winner.dailyQuests || [];
    if (localQuestDate && cloudQuestDate) {
      const localDateNum = parseInt(localQuestDate.replace(/-/g, ''), 10);
      const cloudDateNum = parseInt(cloudQuestDate.replace(/-/g, ''), 10);
      if (localDateNum > cloudDateNum) {
        finalDailyQuests = localState.dailyQuests || [];
      } else if (cloudDateNum > localDateNum) {
        finalDailyQuests = cloudState.dailyQuests || [];
      }
    } else if (localQuestDate && !cloudQuestDate) {
      finalDailyQuests = localState.dailyQuests || [];
    } else if (cloudQuestDate && !localQuestDate) {
      finalDailyQuests = cloudState.dailyQuests || [];
    }

    const merged = {
      ...normalizeStateShape(winner),
      dailyQuests: finalDailyQuests,
      lastUpdated: Math.max(localTime, cloudTime),
    };

    saveState(merged);
    setCloudEnabled(true);
    return { success: true, source };
  }

  // No cloud data — migrate local up
  const result = await syncStateToCloud(localState);
  if (result.success) {
    setCloudEnabled(true);
    return { success: true, source: 'migrated' };
  }

  return { success: false, reason: 'sync_failed' };
}

export async function reinitCloudSyncAfterLogin() {
  if (!isCanonicalSyncConfigured()) return { success: false, reason: 'not_configured' };

  const cloudState = await loadStateFromCloud();
  if (!cloudState) return { success: false, reason: 'no_cloud_data' };

  const localState = loadState();
  const cloudTime = cloudState.lastUpdated || 0;
  const localTime = localState.lastUpdated || 0;

  const winner = localTime > cloudTime ? localState : cloudState;
  const source = localTime > cloudTime ? 'local' : 'cloud';

  // If local is newer, push it to cloud before accepting
  if (localTime > cloudTime) {
    await syncStateToCloud(localState);
  }

  const merged = {
    ...normalizeStateShape(winner),
    version: SCHEMA_VERSION,
    lastUpdated: Math.max(localTime, cloudTime),
  };
  saveState(merged);
  setCloudEnabled(true);
  return { success: true, source };
}

export async function fullCloudReset() {
  await syncStateToCloud({
    ...DEFAULT_STATE,
    lastActiveDate: getLocalDateString(),
    lastUpdated: Date.now(),
  });
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CLOUD_ENABLED_KEY);
  window.location.reload();
}

export async function syncNow(state) {
  if (!isCanonicalSyncConfigured()) return { success: false, reason: 'not_configured' };
  clearQueuedCloudSync();
  const result = await syncStateToCloud(state);
  return result;
}

export { queueCloudSync };
