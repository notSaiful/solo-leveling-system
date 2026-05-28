/** ============================================================
 *  SUPABASE SYNC — Offline-First Cloud Persistence
 *  ============================================================
 *  Architecture:
 *  1. localStorage = primary source of truth (instant, offline)
 *  2. Supabase = async backup + cross-device sync
 *  3. On app load: auth user → fetch cloud state → merge if newer
 *  4. On state change: debounced save to Supabase (~3s delay)
 *  5. No Supabase config? Falls back to localStorage only
 *  ============================================================ */

import { getSupabase, isSupabaseConfigured } from './supabaseClient';

const SYNC_DEBOUNCE_MS = 3000;
let syncTimeout = null;
let lastSyncAt = 0;

// ─── AUTH ───

export async function signInAnonymously() {
  const supabase = getSupabase();
  if (!supabase) return null;

  // Check existing session
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (session?.user) return session.user;

  // Try anonymous sign-in
  const { data: anonData, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn('Anonymous auth failed:', error.message);
    return null;
  }
  return anonData.user;
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// ─── STATE SERIALIZATION / DESERIALIZATION ───

function serializeState(state) {
  return {
    user: {
      player_name: state.user?.name || 'Seeker',
      current_rank: state.user?.currentRank || 'E',
      overall_level: state.user?.overallLevel || 0,
      job_class: state.user?.jobClass || null,
    },
    gold: state.gold || 0,
    stat_points: state.statPoints || 0,
    schema_version: state.version || 2,
    flow_state: state.flowState || {},
    last_quest_date: state.lastQuestDate || null,
    last_active_date: state.lastActiveDate || null,
  };
}

function deserializeProfile(profile, pillars, stats) {
  return {
    user: {
      name: profile.player_name || 'Seeker',
      currentRank: profile.current_rank,
      overallLevel: profile.overall_level,
      jobClass: profile.job_class,
      joinedDate: profile.joined_at,
    },
    pillars: {
      deen: pillars.find(p => p.pillar === 'deen') || { level: 0, xp: 0, streak: 0, shadowsUnlocked: [], activeDebuff: null },
      body: pillars.find(p => p.pillar === 'body') || { level: 0, xp: 0, streak: 0, shadowsUnlocked: [], activeDebuff: null },
      money: pillars.find(p => p.pillar === 'money') || { level: 0, xp: 0, streak: 0, shadowsUnlocked: [], activeDebuff: null },
    },
    stats: stats || { strength: 10, agility: 10, intelligence: 10, sense: 10, health: 10, mana: 10 },
    gold: profile.gold,
    statPoints: profile.stat_points,
    version: profile.schema_version,
  };
}

// ─── UPSERT (Local → Cloud) ───

export async function syncStateToCloud(state) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, reason: 'not_configured' };

  const user = await getCurrentUser();
  if (!user) return { success: false, reason: 'not_authenticated' };

  const userId = user.id;
  const core = serializeState(state);

  try {
    // Upsert profile
    await supabase.from('profiles').upsert({
      id: userId,
      ...core.user,
      gold: core.gold,
      stat_points: core.stat_points,
      schema_version: core.schema_version,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    // Upsert pillars
    const pillarEntries = Object.entries(state.pillars || {});
    for (const [pillar, data] of pillarEntries) {
      await supabase.from('pillars').upsert({
        user_id: userId,
        pillar,
        level: data.level || 0,
        xp: data.xp || 0,
        streak: data.streak || 0,
        active_debuff: data.activeDebuff || null,
        shadows_unlocked: data.shadowsUnlocked || [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,pillar' });
    }

    // Upsert stats
    await supabase.from('stats').upsert({
      user_id: userId,
      ...(state.stats || {}),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // Upsert daily quests (batch)
    const dailyQuests = (state.dailyQuests || []).map(q => ({
      user_id: userId,
      quest_id: q.id,
      unique_id: q.uniqueId,
      title: q.title,
      description: q.description,
      pillar: q.pillar,
      xp: q.xp || q.baseXp || 0,
      base_xp: q.baseXp || 0,
      completed: q.completed || false,
      completed_at: q.completedAt,
      quest_date: state.lastQuestDate,
      tags: q.tags || [],
      estimated_minutes: q.estimatedMinutes || 0,
    }));
    if (dailyQuests.length > 0) {
      await supabase.from('daily_quests').upsert(dailyQuests, { onConflict: 'user_id,unique_id' });
    }

    // Upsert shadows
    const shadows = (state.shadows || []).map(s => ({
      user_id: userId,
      shadow_id: s.id,
      name: s.name,
      description: s.description,
      grade: s.grade,
      pillar: s.pillar,
      passive_bonus: s.passiveBonus,
      effect: s.effect,
      special: s.special,
      extracted_at: s.extractedAt,
    }));
    if (shadows.length > 0) {
      await supabase.from('shadows').upsert(shadows, { onConflict: 'user_id,shadow_id' });
    }

    // Upsert purchased rewards
    const rewards = (state.purchasedRewards || []).map(r => ({
      user_id: userId,
      reward_id: r.id,
      name: r.name,
      cost: r.cost,
      category: r.category,
      description: r.description,
      unlock_rank: r.unlockRank,
      rarity: r.rarity,
      purchased_at: r.purchasedAt,
    }));
    if (rewards.length > 0) {
      await supabase.from('purchased_rewards').upsert(rewards, { onConflict: 'user_id,reward_id' });
    }

    lastSyncAt = Date.now();
    return { success: true };
  } catch (err) {
    console.error('Supabase sync error:', err);
    return { success: false, reason: 'error', error: err.message };
  }
}

// ─── FETCH (Cloud → Local) ───

export async function loadStateFromCloud() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  const userId = user.id;

  try {
    // Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    // Pillars
    const { data: pillars } = await supabase
      .from('pillars')
      .select('*')
      .eq('user_id', userId);

    // Stats
    const { data: statsRow } = await supabase
      .from('stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Daily quests (today)
    const today = new Date().toLocaleDateString('en-CA');
    const { data: dailyQuests } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_date', today);

    // Shadows
    const { data: shadows } = await supabase
      .from('shadows')
      .select('*')
      .eq('user_id', userId);

    // Purchased rewards
    const { data: purchasedRewards } = await supabase
      .from('purchased_rewards')
      .select('*')
      .eq('user_id', userId);

    const partial = deserializeProfile(profile, pillars || [], statsRow);

    return {
      ...partial,
      dailyQuests: (dailyQuests || []).map(q => ({
        id: q.quest_id,
        uniqueId: q.unique_id,
        title: q.title,
        description: q.description,
        pillar: q.pillar,
        xp: q.xp,
        baseXp: q.base_xp,
        completed: q.completed,
        completedAt: q.completed_at,
        tags: q.tags || [],
        estimatedMinutes: q.estimated_minutes,
      })),
      shadows: (shadows || []).map(s => ({
        id: s.shadow_id,
        name: s.name,
        description: s.description,
        grade: s.grade,
        pillar: s.pillar,
        passiveBonus: s.passive_bonus,
        effect: s.effect,
        special: s.special,
        extractedAt: s.extracted_at,
      })),
      purchasedRewards: (purchasedRewards || []).map(r => ({
        id: r.reward_id,
        name: r.name,
        cost: r.cost,
        category: r.category,
        description: r.description,
        unlockRank: r.unlock_rank,
        rarity: r.rarity,
        purchasedAt: r.purchased_at,
      })),
      flowState: profile.flow_state || { active: false, multiplier: 1, expiresAt: 0, questsInWindow: 0 },
      lastQuestDate: profile.last_quest_date,
      lastActiveDate: profile.last_active_date,
    };
  } catch (err) {
    console.error('Supabase load error:', err);
    return null;
  }
}

// ─── DEBOUNCED SYNC ───

export function queueCloudSync(state) {
  if (!isSupabaseConfigured()) return;

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncStateToCloud(state).catch(err => {
      console.warn('Cloud sync failed:', err);
    });
  }, SYNC_DEBOUNCE_MS);
}

// ─── MIGRATION HELPERS ───

export async function migrateLocalStorageToCloud(localState) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, reason: 'not_configured' };

  const user = await signInAnonymously();
  if (!user) return { success: false, reason: 'auth_failed' };

  const result = await syncStateToCloud(localState);
  return result;
}
