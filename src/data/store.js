import { loadStateFromCloud, syncStateToCloud, queueCloudSync, clearQueuedCloudSync } from '../services/cloudSync';
import { isCanonicalSyncConfigured } from '../services/canonicalSync';
import { getLocalDateString } from '../utils/dateUtils';
import { pruneExpiredCustomQuests } from '../logic/customQuests';

export const STORAGE_KEY = 'soloLevelingData';
const SCHEMA_VERSION = 8;
const BUILD_VERSION = '2026-06-24-physical-power';
const CLOUD_ENABLED_KEY = 'cloudSyncEnabled';
const STALE_ADVENTURE_DAILY_TITLES = new Set([
  // pre-v8 sprint/combat titles (kept)
  'Combat Mobility 5 Min',
  'Sprint Drills',
  'Outdoor Sprints',
  'Outdoor Sprint Intervals',
  'Hill Sprint Repeats',
  'Outdoor Movement Circuit',
  'Outdoor Circuit Challenge',
  // v8 roaming/adventure titles being replaced by Physical Power (all from DAILY_QUEST_POOLS.body, ranks E→S)
  'Explore a New Street',
  'Barefoot on Earth',
  'Park Visit',
  'Landmark Count',
  'Phone-Free Outdoors',
  'Sunset Watch',
  '2,000 Explorer Steps',
  'Green Route Walk',
  'Route Sketch',
  'Adventure Kit Check',
  'Phone-Free Scout',
  'Terrain Notes',
  '5,000 Step Expedition',
  'Weather Reading',
  'Masjid Route Scout',
  'Night Sky Orientation',
  'Trail Hike 45 Min',
  'Compass Direction Drill',
  'Safe Night Walk',
  'Elevation Route',
  'Local Resource Map',
  'Water Route Survey',
  'Pack Route Test',
  'Terrain Photo Log',
  '2-Hour Trek',
  'Tent or Shelter Setup',
  'Rock Route Survey',
  'Water Crossing Plan',
  'Orienteering Walk',
  'Hill Route Audit',
  'Wilderness Navigation',
  'Emergency Exit Map',
  'Half-Day Trek',
  'Solo Sunrise Hike',
  'Lead a Group Hike',
  'Wilderness Survival Skill',
  'Mountain Route Log',
  'Teach Outdoor Skills',
  'Overnight Camping Prep',
  'Multi-Terrain Survey',
  "The Monarch's Expedition",
  'Multi-Day Trek Plan',
  'Teach Wilderness Leadership',
  'Summit Challenge',
  'Solo Wilderness Navigation',
  'Lead Expedition Group',
  'Extreme Terrain Day',
  'Adventure Discipline Master',
]);

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
  weeklyDungeons: { weekId: null, deenCompleted: false, bodyCompleted: false, moneyCompleted: false, ummahCompleted: false, bonusClaimed: false },
  aiDungeons: [],
  aiChatHistory: [],
  aiChatUpdatedAt: 0,
  lastActiveDate: getLocalDateString(),
  lastPenaltyCheckDate: null,
  lastUpdated: 0,
  syncRevision: 0,
  // v3 Ultimate Evolution fields
  ummahBurden: {
    score: 0,
    familySupported: 0,
    zakatPaid: 0,
    sadaqahJariyah: 0,
    muslimVentures: 0,
  },
  skills: [],
  skillPoints: 0,
  equipment: { weapon: null, armor: null, ring: null },
  seerahChains: [],
  nabawiTraits: [],
  legacyShadows: [],
  legacyShadowProgress: {},
  jobChangeGates: [],
  monarchTrials: { active: false, stage: 0, startedAt: null, completedAt: null },
  ummahCommand: { unlocked: false, linkedMembers: [] },
  weeklyStats: { soloClear: false, aiPromptsUsed: 0, weekId: null },
  failureStreaks: { deen: 0, body: 0, money: 0 },
  streakFrozen: { deen: false, body: false, money: false },
  weeklyFocus: null,
  // v8 Listen & Level fields
  activities: {},
  logTargets: [],
  pendingLogs: [],
  guidedMode: { enabled: true, lastQuestDate: null },
  catalogOverrides: {},
  khalifateObjectives: [],
  // v9 Physical Power fields
  strengthLog: {
    bodyweightKg: null,
    baselineTested: false,
    lifts: {
      squat: { trainingMax: null, history: [], lastTested: null, milestone: null },
      deadlift: { trainingMax: null, history: [], lastTested: null, milestone: null },
      press: { trainingMax: null, history: [], lastTested: null, milestone: null },
      bench: { trainingMax: null, history: [], lastTested: null, milestone: null },
      row: { trainingMax: null, history: [], lastTested: null, milestone: null },
      pullup: { trainingMax: null, history: [], lastTested: null, milestone: null },
    },
  },
  recovery: {
    proteinTarget: null,
    proteinLog: [],
    sleepLog: [],
    hydrationLog: [],
    mobilityMinutes: 0,
    injury: null,
    deloadState: null,
  },
  physicalPower: {
    equipment: null, // 'barbell' | 'bodyweight' | 'mixed' | 'kettlebell' — set on first launch
    trackProgress: { strength: 0, power: 0, endurance: 0, resilience: 0 },
    gateResults: [],
  },
  buildVersion: BUILD_VERSION,
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
  // v3 Ultimate Evolution normalization
  normalized.ummahBurden = {
    score: state.ummahBurden?.score || 0,
    familySupported: state.ummahBurden?.familySupported || 0,
    zakatPaid: state.ummahBurden?.zakatPaid || 0,
    sadaqahJariyah: state.ummahBurden?.sadaqahJariyah || 0,
    muslimVentures: state.ummahBurden?.muslimVentures || 0,
  };
  normalized.skills = Array.isArray(state.skills) ? state.skills : [];
  normalized.skillPoints = state.skillPoints || 0;
  normalized.equipment = {
    weapon: state.equipment?.weapon || null,
    armor: state.equipment?.armor || null,
    ring: state.equipment?.ring || null,
  };
  normalized.seerahChains = Array.isArray(state.seerahChains) ? state.seerahChains : [];
  normalized.nabawiTraits = Array.isArray(state.nabawiTraits) ? state.nabawiTraits : [];
  normalized.legacyShadows = Array.isArray(state.legacyShadows) ? state.legacyShadows : [];
  normalized.legacyShadowProgress = state.legacyShadowProgress || {};
  normalized.jobChangeGates = Array.isArray(state.jobChangeGates) ? state.jobChangeGates : [];
  normalized.monarchTrials = {
    active: state.monarchTrials?.active || false,
    stage: state.monarchTrials?.stage || 0,
    startedAt: state.monarchTrials?.startedAt || null,
    completedAt: state.monarchTrials?.completedAt || null,
  };
  normalized.ummahCommand = {
    unlocked: state.ummahCommand?.unlocked || false,
    linkedMembers: Array.isArray(state.ummahCommand?.linkedMembers) ? state.ummahCommand.linkedMembers : [],
  };
  normalized.weeklyStats = {
    soloClear: state.weeklyStats?.soloClear || false,
    aiPromptsUsed: state.weeklyStats?.aiPromptsUsed || 0,
    weekId: state.weeklyStats?.weekId || null,
  };
  normalized.failureStreaks = {
    deen: state.failureStreaks?.deen || 0,
    body: state.failureStreaks?.body || 0,
    money: state.failureStreaks?.money || 0,
  };
  normalized.streakFrozen = {
    deen: state.streakFrozen?.deen || false,
    body: state.streakFrozen?.body || false,
    money: state.streakFrozen?.money || false,
  };
  normalized.weeklyFocus = state.weeklyFocus || null;
  normalized.khalifateObjectives = Array.isArray(state.khalifateObjectives) ? state.khalifateObjectives : [];
  // v8 Listen & Level normalization
  normalized.activities = state.activities && typeof state.activities === 'object' ? state.activities : {};
  normalized.logTargets = Array.isArray(state.logTargets) ? state.logTargets : [];
  normalized.pendingLogs = Array.isArray(state.pendingLogs) ? state.pendingLogs : [];
  normalized.guidedMode = {
    // Guided Mode (quest-based progression) is now the default XP path — the
    // voice/text log flow was removed. Default to ON when unspecified; an
    // explicit user toggle (true/false) is always respected.
    enabled: state.guidedMode?.enabled ?? true,
    lastQuestDate: state.guidedMode?.lastQuestDate || null,
  };
  normalized.catalogOverrides = state.catalogOverrides && typeof state.catalogOverrides === 'object' ? state.catalogOverrides : {};
  // v9 Physical Power normalization (additive, no data loss)
  normalized.strengthLog = state.strengthLog && typeof state.strengthLog === 'object'
    ? { ...DEFAULT_STATE.strengthLog, ...state.strengthLog, lifts: { ...DEFAULT_STATE.strengthLog.lifts, ...(state.strengthLog.lifts || {}) } }
    : DEFAULT_STATE.strengthLog;
  normalized.recovery = state.recovery && typeof state.recovery === 'object'
    ? { ...DEFAULT_STATE.recovery, ...state.recovery }
    : DEFAULT_STATE.recovery;
  normalized.physicalPower = state.physicalPower && typeof state.physicalPower === 'object'
    ? { ...DEFAULT_STATE.physicalPower, ...state.physicalPower, trackProgress: { ...DEFAULT_STATE.physicalPower.trackProgress, ...(state.physicalPower.trackProgress || {}) } }
    : DEFAULT_STATE.physicalPower;
  normalized.buildVersion = state.buildVersion || BUILD_VERSION;
  return normalized;
}

export function upgradeStateForCurrentBuild(state, { resetGeneratedContent = false } = {}) {
  const upgraded = normalizeStateShape(state || DEFAULT_STATE);
  upgraded.version = SCHEMA_VERSION;
  upgraded.buildVersion = BUILD_VERSION;

  // The log flow is gone; quest-based progression (Guided Mode) is now the
  // default XP path. Flip Guided ON for anyone upgrading from a build where it
  // defaulted to OFF, so existing states start earning XP via quests. A later
  // manual toggle OFF in Settings is still respected — it persists across loads
  // once buildVersion matches and no upgrade runs.
  upgraded.guidedMode = { ...upgraded.guidedMode, enabled: true };

  if (resetGeneratedContent) {
    // Quest catalogs are code-owned. Regenerate them after content migrations
    // while preserving earned progress, ledgers, history, and profile data.
    upgraded.dailyQuests = [];
    upgraded.levelQuests = [];
    upgraded.redemptionQuests = [];
    upgraded.customQuests = pruneExpiredCustomQuests(upgraded.customQuests || []);
    upgraded.lastQuestDate = null;
    // NOTE: weeklyDungeons is NOT reset here. The dungeon templates are code-owned,
    // but user step completions and week progress must survive build upgrades.
    // initializeWeeklyDungeon() will refresh templates naturally on Monday.
  }

  return upgraded;
}

function needsBuildUpgrade(state = {}) {
  return state.version !== SCHEMA_VERSION || state.buildVersion !== BUILD_VERSION;
}

function hasStaleGeneratedQuestContent(state = {}) {
  return (state.dailyQuests || []).some(quest =>
    quest?.pillar === 'body' && STALE_ADVENTURE_DAILY_TITLES.has(quest.title)
  );
}

// ─── localStorage helpers ───

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (needsBuildUpgrade(parsed) || hasStaleGeneratedQuestContent(parsed)) {
      // Upgrade: normalize old state with new defaults instead of wiping
      const upgraded = upgradeStateForCurrentBuild(parsed, { resetGeneratedContent: true });
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

export async function initCloudSync() {
  if (!isCanonicalSyncConfigured()) {
    return { success: false, reason: 'not_configured' };
  }

  const localState = loadState();
  const cloudState = await loadStateFromCloud();

  if (cloudState) {
    const cloudNeedsUpgrade = needsBuildUpgrade(cloudState) || hasStaleGeneratedQuestContent(cloudState);
    const canonicalCloud = upgradeStateForCurrentBuild(cloudState, { resetGeneratedContent: cloudNeedsUpgrade });

    const localTime = localState?.lastUpdated || 0;
    const cloudTime = canonicalCloud?.lastUpdated || 0;
    // If local is newer, push local to cloud instead of overwriting
    if (localTime > cloudTime) {
      const result = await syncStateToCloud(localState);
      if (result.success) {
        const merged = result.state ? upgradeStateForCurrentBuild(result.state) : localState;
        saveState(merged);
        setCloudEnabled(true);
        return { success: true, source: 'local_migrated' };
      }
    }

    const canonical = cloudNeedsUpgrade
      ? (await syncStateToCloud(canonicalCloud)).state || canonicalCloud
      : canonicalCloud;
    saveState(canonical);
    setCloudEnabled(true);
    return { success: true, source: 'cloud', upgraded: cloudNeedsUpgrade };
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

  const cloudNeedsUpgrade = needsBuildUpgrade(cloudState) || hasStaleGeneratedQuestContent(cloudState);
  const canonical = upgradeStateForCurrentBuild(cloudState, { resetGeneratedContent: cloudNeedsUpgrade });
  saveState(canonical);
  if (cloudNeedsUpgrade) await syncStateToCloud(canonical);
  setCloudEnabled(true);
  return { success: true, source: 'cloud', upgraded: cloudNeedsUpgrade };
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
