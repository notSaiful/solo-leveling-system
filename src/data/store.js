import { isSupabaseConfigured, getSupabase } from '../services/supabaseClient';
import { signInAnonymously, loadStateFromCloud, syncStateToCloud, queueCloudSync, getAuthStatus, getCurrentUser } from '../services/supabaseSync';
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
    const merged = { ...DEFAULT_STATE, ...parsed };
    merged.pillars = {
      deen: { ...DEFAULT_STATE.pillars.deen, ...(parsed.pillars?.deen || {}) },
      body: { ...DEFAULT_STATE.pillars.body, ...(parsed.pillars?.body || {}) },
      money: { ...DEFAULT_STATE.pillars.money, ...(parsed.pillars?.money || {}) },
    };
    merged.stats = { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) };
    merged.flowState = { ...DEFAULT_STATE.flowState, ...(parsed.flowState || {}) };
    merged.weeklyDungeons = { ...DEFAULT_STATE.weeklyDungeons, ...(parsed.weeklyDungeons || {}) };
    return merged;
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
    const merged = { ...DEFAULT_STATE, ...parsed };
    merged.pillars = {
      deen: { ...DEFAULT_STATE.pillars.deen, ...(parsed.pillars?.deen || {}) },
      body: { ...DEFAULT_STATE.pillars.body, ...(parsed.pillars?.body || {}) },
      money: { ...DEFAULT_STATE.pillars.money, ...(parsed.pillars?.money || {}) },
    };
    merged.stats = { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) };
    merged.flowState = { ...DEFAULT_STATE.flowState, ...(parsed.flowState || {}) };
    merged.weeklyDungeons = { ...DEFAULT_STATE.weeklyDungeons, ...(parsed.weeklyDungeons || {}) };
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
  return localStorage.getItem(CLOUD_ENABLED_KEY) === 'true' && isSupabaseConfigured();
}

export function setCloudEnabled(enabled) {
  localStorage.setItem(CLOUD_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function initCloudSync() {
  if (!isSupabaseConfigured()) return { success: false, reason: 'not_configured' };

  const user = await signInAnonymously();
  if (!user) return { success: false, reason: 'auth_failed' };

  const localState = loadState();

  // Step 1: Push local progress to cloud FIRST so this device's latest state
  // is recorded before we potentially load older cloud data.
  if (localState.lastUpdated > 0) {
    await syncStateToCloud(localState);
  }

  // Step 2: Load cloud state (now guaranteed to be at least as fresh as local)
  const cloudState = await loadStateFromCloud();

  if (cloudState) {
    // Step 3: Timestamp-aware merge. Newest state wins.
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
      ...DEFAULT_STATE,
      ...winner,
      dailyQuests: finalDailyQuests,
      lastUpdated: Math.max(localTime, cloudTime),
    };

    saveState(merged);
    setCloudEnabled(true);
    return { success: true, source, userId: user.id };
  }

  // No cloud data — migrate local up
  const result = await syncStateToCloud(localState);
  if (result.success) {
    setCloudEnabled(true);
    return { success: true, source: 'migrated', userId: user.id };
  }

  return { success: false, reason: 'sync_failed' };
}

export async function reinitCloudSyncAfterLogin() {
  if (!isSupabaseConfigured()) return { success: false, reason: 'not_configured' };

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
    ...DEFAULT_STATE,
    ...winner,
    version: SCHEMA_VERSION,
    lastUpdated: Math.max(localTime, cloudTime),
  };
  saveState(merged);
  setCloudEnabled(true);
  return { success: true, source, userId: (await getCurrentUser())?.id };
}

export async function fullCloudReset() {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const userId = user.id;

  // Delete all user data (order matters for FK constraints)
  await supabase.from('level_quest_steps').delete().eq('user_id', userId);
  await supabase.from('level_quests').delete().eq('user_id', userId);
  await supabase.from('weekly_dungeon_steps').delete().eq('user_id', userId);
  await supabase.from('weekly_dungeons').delete().eq('user_id', userId);
  await supabase.from('job_change_steps').delete().eq('user_id', userId);
  await supabase.from('job_changes').delete().eq('user_id', userId);
  await supabase.from('ai_dungeons').delete().eq('user_id', userId);
  await supabase.from('system_messages').delete().eq('user_id', userId);
  await supabase.from('history').delete().eq('user_id', userId);
  await supabase.from('redemption_quests').delete().eq('user_id', userId);
  await supabase.from('custom_quests').delete().eq('user_id', userId);
  await supabase.from('daily_quests').delete().eq('user_id', userId);
  await supabase.from('shadows').delete().eq('user_id', userId);
  await supabase.from('purchased_rewards').delete().eq('user_id', userId);
  await supabase.from('pillars').delete().eq('user_id', userId);
  await supabase.from('stats').delete().eq('user_id', userId);
  await supabase.from('state_snapshots').delete().eq('user_id', userId);
  await supabase.from('profiles').delete().eq('id', userId);

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CLOUD_ENABLED_KEY);
  window.location.reload();
}

export async function syncNow(state) {
  if (!isSupabaseConfigured()) return { success: false, reason: 'not_configured' };
  // Clear any pending debounced sync so we don't double-fire
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }
  const result = await syncStateToCloud(state);
  return result;
}

export { queueCloudSync };
