import { loadStateFromCloud, syncStateToCloud, queueCloudSync, clearQueuedCloudSync } from '../services/cloudSync';
import { isCanonicalSyncConfigured } from '../services/canonicalSync';
import { getLocalDateString } from '../utils/dateUtils';
import { pruneExpiredCustomQuests } from '../logic/customQuests';

export const STORAGE_KEY = 'soloLevelingData';
const SCHEMA_VERSION = 2;
const CLOUD_ENABLED_KEY = 'cloudSyncEnabled';
let cloudHydratedForSession = !isCanonicalSyncConfigured();

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
  ummahImpactLedger: [],
  justiceResponseLedger: [],
  teachingPipelineLedger: [],
  familyCovenantLedger: [],
  livelihoodPipelineLedger: [],
  readinessProtocolLedger: [],
  missionWeeklyReviews: [],
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
  aiChatHistory: [],
  aiChatUpdatedAt: 0,
  lastActiveDate: getLocalDateString(),
  lastPenaltyCheckDate: null,
  lastUpdated: 0,
  syncRevision: 0,
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
  normalized.syncRevision = state.syncRevision || 0;
  normalized.customQuests = pruneExpiredCustomQuests(state.customQuests || []);
  normalized.ummahImpactLedger = state.ummahImpactLedger || [];
  normalized.justiceResponseLedger = state.justiceResponseLedger || [];
  normalized.teachingPipelineLedger = state.teachingPipelineLedger || [];
  normalized.familyCovenantLedger = state.familyCovenantLedger || [];
  normalized.livelihoodPipelineLedger = state.livelihoodPipelineLedger || [];
  normalized.readinessProtocolLedger = state.readinessProtocolLedger || [];
  normalized.missionWeeklyReviews = state.missionWeeklyReviews || [];
  normalized.aiChatHistory = Array.isArray(state.aiChatHistory) ? state.aiChatHistory : [];
  normalized.aiChatUpdatedAt = state.aiChatUpdatedAt || 0;
  return normalized;
}

// ─── localStorage helpers ───

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (parsed.version !== SCHEMA_VERSION) {
      // Upgrade: normalize old state with new defaults instead of wiping
      const upgraded = normalizeStateShape(parsed);
      upgraded.version = SCHEMA_VERSION;
      saveState(upgraded);
      return upgraded;
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

export function canQueueCloudSync() {
  return cloudHydratedForSession;
}

function markCloudHydratedForSession() {
  cloudHydratedForSession = true;
}

export async function initCloudSync() {
  if (!isCanonicalSyncConfigured()) {
    markCloudHydratedForSession();
    return { success: false, reason: 'not_configured' };
  }

  const localState = loadState();
  const cloudState = await loadStateFromCloud();

  if (cloudState) {
    const canonical = normalizeStateShape(cloudState);
    saveState(canonical);
    setCloudEnabled(true);
    markCloudHydratedForSession();
    return { success: true, source: 'cloud' };
  }

  // No cloud data — migrate local up
  const result = await syncStateToCloud(localState);
  if (result.success) {
    setCloudEnabled(true);
    markCloudHydratedForSession();
    return { success: true, source: 'migrated' };
  }

  return { success: false, reason: 'sync_failed' };
}

export async function reinitCloudSyncAfterLogin() {
  if (!isCanonicalSyncConfigured()) return { success: false, reason: 'not_configured' };

  const cloudState = await loadStateFromCloud();
  if (!cloudState) return { success: false, reason: 'no_cloud_data' };

  const canonical = normalizeStateShape(cloudState);
  saveState(canonical);
  setCloudEnabled(true);
  markCloudHydratedForSession();
  return { success: true, source: 'cloud' };
}

export async function fullCloudReset() {
  await syncStateToCloud({
    ...DEFAULT_STATE,
    lastActiveDate: getLocalDateString(),
    lastUpdated: Date.now(),
    syncRevision: 1,
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
