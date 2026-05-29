import { isSupabaseConfigured, getSupabase } from '../services/supabaseClient';
import { signInAnonymously, loadStateFromCloud, syncStateToCloud, queueCloudSync } from '../services/supabaseSync';

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
  lastActiveDate: new Date().toLocaleDateString('en-CA'),
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

  // Check if cloud has existing data
  const cloudState = await loadStateFromCloud();
  const localState = loadState();

  if (cloudState) {
    const today = new Date().toLocaleDateString('en-CA');
    const merged = {
      ...DEFAULT_STATE,
      ...cloudState,
      customQuests: cloudState.customQuests?.length ? cloudState.customQuests : localState.customQuests,
      history: cloudState.history?.length ? cloudState.history : localState.history,
      systemMessages: cloudState.systemMessages?.length ? cloudState.systemMessages : localState.systemMessages,
      aiDungeons: cloudState.aiDungeons?.length ? cloudState.aiDungeons : localState.aiDungeons,
      redemptionQuests: cloudState.redemptionQuests?.length ? cloudState.redemptionQuests : localState.redemptionQuests,
      levelQuests: cloudState.levelQuests?.length ? cloudState.levelQuests : localState.levelQuests,
      jobChangeQuests: cloudState.jobChangeQuests?.length ? cloudState.jobChangeQuests : localState.jobChangeQuests,
      completedJobChanges: cloudState.completedJobChanges?.length ? cloudState.completedJobChanges : localState.completedJobChanges,
      shadows: cloudState.shadows?.length ? cloudState.shadows : localState.shadows,
      purchasedRewards: cloudState.purchasedRewards?.length ? cloudState.purchasedRewards : localState.purchasedRewards,
      dailyQuests: localState.lastQuestDate === today && localState.dailyQuests.length > 0 && (!cloudState.lastQuestDate || cloudState.lastQuestDate !== localState.lastQuestDate)
        ? localState.dailyQuests
        : (cloudState.dailyQuests || []),
    };
    saveState(merged);
    await syncStateToCloud(merged);
    setCloudEnabled(true);
    return { success: true, source: 'merged', userId: user.id };
  }

  // No cloud data — migrate local up
  const result = await syncStateToCloud(localState);
  if (result.success) {
    setCloudEnabled(true);
    return { success: true, source: 'migrated', userId: user.id };
  }

  return { success: false, reason: 'sync_failed' };
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

export { queueCloudSync };
