/** ============================================================
 *  SUPABASE SYNC — Offline-First Cloud Persistence (v2)
 *  ============================================================
 *  Architecture:
 *  1. localStorage = primary source of truth (instant, offline)
 *  2. Supabase = async backup + cross-device sync
 *  3. On app load: auth user → fetch cloud state → merge if newer
 *  4. On state change: debounced save to Supabase (~3s delay)
 *  5. state_snapshots table stores complete JSON backup (no data loss)
 *  6. Granular tables for queries + future analytics
 *  ============================================================ */

import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { getLocalDateString } from '../utils/dateUtils';

const SYNC_DEBOUNCE_MS = 3000;
let syncTimeout = null;
let lastSyncAt = 0;

// ─── AUTH ───

export async function signInAnonymously() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (session?.user) return session.user;

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
  // Use getSession (local + no network round-trip) instead of getUser
  // for reliability during sync operations
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}

export async function signInWithEmail(email, password) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user };
}

export async function signUpWithEmail(email, password) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user };
}

export async function linkAnonymousToEmail(email, password) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  // Update the anonymous user's email + password
  const { data, error } = await supabase.auth.updateUser({ email, password });
  if (error) return { success: false, error: error.message };

  // Send email confirmation if needed (Supabase handles this based on config)
  return { success: true, user: data.user };
}

export async function getAuthStatus() {
  const supabase = getSupabase();
  if (!supabase) return { configured: false, loggedIn: false, user: null, isAnonymous: true };

  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;
  if (!user) return { configured: true, loggedIn: false, user: null, isAnonymous: true };

  const isAnonymous = user.is_anonymous === true || !user.email;
  return { configured: true, loggedIn: true, user, isAnonymous, email: user.email };
}

// ─── STATE SERIALIZATION / DESERIALIZATION ───

function serializeState(state) {
  return {
    user: {
      player_name: state.user?.name || 'Seeker',
      current_rank: state.user?.currentRank || 'E',
      overall_level: state.user?.overallLevel || 0,
      job_class: state.user?.jobClass || null,
      joined_at: state.user?.joinedDate || new Date().toISOString(),
    },
    gold: state.gold || 0,
    stat_points: state.statPoints || 0,
    schema_version: state.version || 2,
    flow_state: state.flowState || {},
    last_quest_date: state.lastQuestDate || null,
    last_active_date: state.lastActiveDate || null,
    last_penalty_check_date: state.lastPenaltyCheckDate || null,
    last_updated: state.lastUpdated || 0,
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
    flowState: profile.flow_state || { active: false, multiplier: 1, expiresAt: 0, questsInWindow: 0 },
    lastQuestDate: profile.last_quest_date || null,
    lastActiveDate: profile.last_active_date || null,
    lastPenaltyCheckDate: profile.last_penalty_check_date || null,
    lastUpdated: profile.last_updated || 0,
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
    // 1. Upsert profile
    await supabase.from('profiles').upsert({
      id: userId,
      ...core.user,
      gold: core.gold,
      stat_points: core.stat_points,
      schema_version: core.schema_version,
      flow_state: core.flow_state,
      last_quest_date: core.last_quest_date,
      last_active_date: core.last_active_date,
      last_penalty_check_date: core.last_penalty_check_date,
      last_updated: core.last_updated,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    // 2. Upsert pillars
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

    // 3. Upsert stats
    await supabase.from('stats').upsert({
      user_id: userId,
      ...(state.stats || {}),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // 4. Upsert daily quests (clean up old ones first to prevent bloat)
    if (state.lastQuestDate) {
      await supabase.from('daily_quests').delete()
        .eq('user_id', userId)
        .neq('quest_date', state.lastQuestDate);
    }
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

    // 5. Upsert shadows
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

    // 6. Upsert purchased rewards
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

    // 7. Upsert custom quests
    const customQuests = (state.customQuests || []).map(q => ({
      user_id: userId,
      quest_id: q.uniqueId || q.id,
      title: q.title,
      description: q.description,
      xp: q.xp || 20,
      pillar: q.pillar || 'deen',
      alignment_status: q.alignmentStatus || null,
      justification: q.justification || null,
      last_completed: q.lastCompleted || null,
      updated_at: new Date().toISOString(),
    }));
    if (customQuests.length > 0) {
      await supabase.from('custom_quests').upsert(customQuests, { onConflict: 'user_id,quest_id' });
    }

    // 8. Sync history (delete-then-insert to avoid duplicates)
    await supabase.from('history').delete().eq('user_id', userId);
    const history = (state.history || []).map(h => ({
      user_id: userId,
      type: h.type,
      quest_id: h.questId || null,
      title: h.title,
      pillar: h.pillar || null,
      xp: h.xp || 0,
      gold: h.gold || 0,
      completed_at: h.date || new Date().toISOString(),
    }));
    if (history.length > 0) {
      await supabase.from('history').insert(history);
    }

    // 9. Upsert redemption quests
    const redemptionQuests = (state.redemptionQuests || []).map(q => ({
      user_id: userId,
      quest_template_id: q.id,
      title: q.title,
      description: q.description,
      required_days: q.requiredDays || 1,
      completed: q.completed || false,
      completed_at: q.completedAt || null,
      reward_gold: q.rewardGold || 0,
      reward_stat_points: q.rewardStatPoints || 0,
      system_message: q.systemMessage || null,
      updated_at: new Date().toISOString(),
    }));
    if (redemptionQuests.length > 0) {
      await supabase.from('redemption_quests').upsert(redemptionQuests, { onConflict: 'user_id,quest_template_id' });
    }

    // 10. Sync system messages (delete-then-insert)
    await supabase.from('system_messages').delete().eq('user_id', userId);
    const systemMessages = (state.systemMessages || []).map(m => ({
      user_id: userId,
      type: m.type,
      title: m.title,
      subtitle: m.subtitle || null,
      message: m.message || null,
      created_at: new Date().toISOString(),
    }));
    if (systemMessages.length > 0) {
      await supabase.from('system_messages').insert(systemMessages);
    }

    // 11. Upsert job changes (pending + completed)
    const allJobChanges = [
      ...(state.jobChangeQuests || []),
      ...(state.completedJobChanges || []),
    ];
    const jobChanges = allJobChanges.map(j => ({
      user_id: userId,
      job_id: j.id,
      name: j.name,
      rank: j.rank || 'E',
      level_required: j.levelRequired || 0,
      description: j.description,
      completed: j.completed || false,
      completed_at: j.completedAt || null,
      reward_gold: j.rewardGold || 0,
      reward_stat_points: j.rewardStatPoints || 0,
      title: j.title || j.name,
      updated_at: new Date().toISOString(),
    }));
    if (jobChanges.length > 0) {
      await supabase.from('job_changes').upsert(jobChanges, { onConflict: 'user_id,job_id' });
    }

    // 12. Upsert AI dungeons
    const aiDungeons = (state.aiDungeons || []).map(d => ({
      user_id: userId,
      dungeon_id: d.id,
      title: d.title,
      description: d.description,
      pillar: d.pillar || 'deen',
      difficulty: d.difficulty || 'normal',
      steps: d.steps || [],
      completed: d.completed || false,
      completed_at: d.completedAt || null,
      reward_gold: d.rewardGold || 0,
      reward_xp: d.rewardXp || 0,
      reward_shadow_id: d.rewardShadowId || null,
      updated_at: new Date().toISOString(),
    }));
    if (aiDungeons.length > 0) {
      await supabase.from('ai_dungeons').upsert(aiDungeons, { onConflict: 'user_id,dungeon_id' });
    }

    // 13. Sync level quests + steps (delete-then-insert for relational integrity)
    const levelQuests = (state.levelQuests || []);
    if (levelQuests.length > 0) {
      // Delete existing quests and steps (cascade handles steps)
      const levelsToDelete = levelQuests.map(lq => lq.level);
      await supabase.from('level_quests').delete().eq('user_id', userId).in('level', levelsToDelete);

      // Insert parent quests
      const levelQuestRows = levelQuests.map(lq => ({
        user_id: userId,
        level: lq.level,
        rank: lq.rank || 'E',
        title: lq.title,
        description: lq.description,
        completed: lq.completed || false,
        completed_at: lq.completedAt || null,
        activated_at: lq.activatedAt || new Date().toISOString(),
        reward_gold: lq.rewards?.gold || 0,
        reward_stat_points: lq.rewards?.statPoints || 0,
        reward_rank_up: lq.rewards?.rankUp || null,
        reward_job_change: lq.rewards?.jobChange || null,
        reward_shadow_unlock: lq.rewards?.shadowUnlock || null,
        system_message: lq.systemMessage || null,
        updated_at: new Date().toISOString(),
      }));
      const { data: insertedQuests } = await supabase.from('level_quests').insert(levelQuestRows).select('id,level');

      // Insert steps with parent IDs
      if (insertedQuests?.length) {
        const steps = [];
        for (const lq of levelQuests) {
          const parent = insertedQuests.find(q => q.level === lq.level);
          if (!parent || !lq.quests?.length) continue;
          for (const [i, q] of lq.quests.entries()) {
            steps.push({
              level_quest_id: parent.id,
              step_id: q.id || `${lq.level}-step-${i}`,
              title: q.title,
              description: q.description,
              pillar: q.pillar,
              xp: q.xp || 0,
              completed: q.completed || false,
              completed_at: q.completedAt || null,
              updated_at: new Date().toISOString(),
            });
          }
        }
        if (steps.length > 0) {
          await supabase.from('level_quest_steps').insert(steps);
        }
      }
    }

    // 14. Sync weekly dungeons + steps (delete-then-insert)
    const wd = state.weeklyDungeons || {};
    if (wd.weekId) {
      await supabase.from('weekly_dungeons').delete().eq('user_id', userId).eq('week_id', wd.weekId);

      const pillars = ['deen', 'body', 'money'];
      const weeklyDungeonRows = pillars.map(p => {
        const dungeon = wd[p] || {};
        return {
          user_id: userId,
          week_id: wd.weekId,
          pillar: p,
          title: dungeon.title || `${p} Dungeon`,
          description: dungeon.description || null,
          xp: dungeon.xp || 200,
          completed: wd[`${p}Completed`] || false,
          completed_at: null,
          bonus_claimed: wd.bonusClaimed || false,
          updated_at: new Date().toISOString(),
        };
      });
      const { data: insertedDungeons } = await supabase.from('weekly_dungeons').insert(weeklyDungeonRows).select('id,pillar');

      if (insertedDungeons?.length) {
        const steps = [];
        for (const p of pillars) {
          const parent = insertedDungeons.find(d => d.pillar === p);
          const dungeon = wd[p] || {};
          if (!parent || !dungeon.steps?.length) continue;
          for (const [i, s] of dungeon.steps.entries()) {
            steps.push({
              dungeon_id: parent.id,
              step_id: s.id || `wd-${p}-${i}`,
              text: s.text || s.title || '',
              completed: s.completed || false,
              updated_at: new Date().toISOString(),
            });
          }
        }
        if (steps.length > 0) {
          await supabase.from('weekly_dungeon_steps').insert(steps);
        }
      }
    }

    // 15. Save full state snapshot (guaranteed no data loss)
    await supabase.from('state_snapshots').upsert({
      user_id: userId,
      snapshot: state,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

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
    // Try state snapshot first (guaranteed complete restore)
    const { data: snapshotRow } = await supabase
      .from('state_snapshots')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (snapshotRow?.snapshot) {
      return {
        ...snapshotRow.snapshot,
        version: snapshotRow.snapshot.version || 2,
      };
    }

    // Fallback: reconstruct from granular tables
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const { data: pillars } = await supabase
      .from('pillars')
      .select('*')
      .eq('user_id', userId);

    const { data: statsRow } = await supabase
      .from('stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: dailyQuests } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', userId)
      .order('quest_date', { ascending: false });

    const { data: shadows } = await supabase
      .from('shadows')
      .select('*')
      .eq('user_id', userId);

    const { data: purchasedRewards } = await supabase
      .from('purchased_rewards')
      .select('*')
      .eq('user_id', userId);

    const { data: customQuests } = await supabase
      .from('custom_quests')
      .select('*')
      .eq('user_id', userId);

    const { data: history } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId);

    const { data: redemptionQuests } = await supabase
      .from('redemption_quests')
      .select('*')
      .eq('user_id', userId);

    const { data: systemMessages } = await supabase
      .from('system_messages')
      .select('*')
      .eq('user_id', userId);

    const { data: jobChanges } = await supabase
      .from('job_changes')
      .select('*')
      .eq('user_id', userId);

    const { data: aiDungeons } = await supabase
      .from('ai_dungeons')
      .select('*')
      .eq('user_id', userId);

    const { data: levelQuests } = await supabase
      .from('level_quests')
      .select('*')
      .eq('user_id', userId);

    // Fetch level quest steps
    let levelQuestSteps = [];
    if (levelQuests?.length) {
      const levelQuestIds = levelQuests.map(lq => lq.id);
      const { data: steps } = await supabase
        .from('level_quest_steps')
        .select('*')
        .in('level_quest_id', levelQuestIds);
      levelQuestSteps = steps || [];
    }

    const { data: weeklyDungeons } = await supabase
      .from('weekly_dungeons')
      .select('*')
      .eq('user_id', userId);

    // Fetch weekly dungeon steps
    let weeklyDungeonSteps = [];
    if (weeklyDungeons?.length) {
      const dungeonIds = weeklyDungeons.map(d => d.id);
      const { data: steps } = await supabase
        .from('weekly_dungeon_steps')
        .select('*')
        .in('dungeon_id', dungeonIds);
      weeklyDungeonSteps = steps || [];
    }

    const partial = deserializeProfile(profile, pillars || [], statsRow);

    // Determine the most recent quest date from cloud daily quests
    const mostRecentQuestDate = (dailyQuests || []).length > 0
      ? dailyQuests[0].quest_date
      : partial.lastQuestDate;

    // Only include daily quests from the most recent day (old ones are irrelevant)
    const activeDailyQuests = (dailyQuests || [])
      .filter(q => q.quest_date === mostRecentQuestDate)
      .map(q => ({
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
      }));

    return {
      ...partial,
      lastQuestDate: mostRecentQuestDate,
      dailyQuests: activeDailyQuests,
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
      customQuests: (customQuests || []).map(q => ({
        id: q.quest_id,
        uniqueId: q.quest_id,
        title: q.title,
        description: q.description,
        xp: q.xp,
        pillar: q.pillar,
        alignmentStatus: q.alignment_status,
        justification: q.justification,
        lastCompleted: q.last_completed,
      })),
      history: (history || []).map(h => ({
        type: h.type,
        questId: h.quest_id,
        title: h.title,
        pillar: h.pillar,
        xp: h.xp,
        gold: h.gold,
        date: h.completed_at,
        completed: true,
      })),
      redemptionQuests: (redemptionQuests || []).map(q => ({
        id: q.quest_template_id,
        title: q.title,
        description: q.description,
        requiredDays: q.required_days,
        completed: q.completed,
        completedAt: q.completed_at,
        rewardGold: q.reward_gold,
        rewardStatPoints: q.reward_stat_points,
        systemMessage: q.system_message,
      })),
      systemMessages: (systemMessages || []).map(m => ({
        type: m.type,
        title: m.title,
        subtitle: m.subtitle,
        message: m.message,
      })),
      jobChangeQuests: (jobChanges || []).filter(j => !j.completed).map(j => ({
        id: j.job_id,
        name: j.name,
        rank: j.rank,
        levelRequired: j.level_required,
        description: j.description,
        completed: j.completed,
        completedAt: j.completed_at,
        rewardGold: j.reward_gold,
        rewardStatPoints: j.reward_stat_points,
        title: j.title,
      })),
      completedJobChanges: (jobChanges || []).filter(j => j.completed).map(j => ({
        id: j.job_id,
        name: j.name,
        rank: j.rank,
        levelRequired: j.level_required,
        description: j.description,
        completed: j.completed,
        completedAt: j.completed_at,
        rewardGold: j.reward_gold,
        rewardStatPoints: j.reward_stat_points,
        title: j.title,
      })),
      aiDungeons: (aiDungeons || []).map(d => ({
        id: d.dungeon_id,
        title: d.title,
        description: d.description,
        pillar: d.pillar,
        difficulty: d.difficulty,
        steps: d.steps || [],
        completed: d.completed,
        completedAt: d.completed_at,
        rewardGold: d.reward_gold,
        rewardXp: d.reward_xp,
        rewardShadowId: d.reward_shadow_id,
      })),
      levelQuests: (levelQuests || []).map(lq => {
        const steps = levelQuestSteps
          .filter(s => s.level_quest_id === lq.id)
          .map(s => ({
            id: s.step_id,
            title: s.title,
            description: s.description,
            pillar: s.pillar,
            xp: s.xp,
            completed: s.completed,
            completedAt: s.completed_at,
          }));
        return {
          level: lq.level,
          rank: lq.rank,
          title: lq.title,
          description: lq.description,
          completed: lq.completed,
          completedAt: lq.completed_at,
          activatedAt: lq.activated_at,
          quests: steps,
          rewards: {
            gold: lq.reward_gold,
            statPoints: lq.reward_stat_points,
            rankUp: lq.reward_rank_up,
            jobChange: lq.reward_job_change,
            shadowUnlock: lq.reward_shadow_unlock,
          },
          systemMessage: lq.system_message,
        };
      }),
      weeklyDungeons: (() => {
        const wds = weeklyDungeons || [];
        if (!wds.length) return { weekId: null, deenCompleted: false, bodyCompleted: false, moneyCompleted: false, bonusClaimed: false };
        const weekId = wds[0].week_id;
        const result = { weekId, deenCompleted: false, bodyCompleted: false, moneyCompleted: false, bonusClaimed: false };
        for (const wd of wds) {
          const steps = weeklyDungeonSteps
            .filter(s => s.dungeon_id === wd.id)
            .map(s => ({
              id: s.step_id,
              text: s.text,
              completed: s.completed,
            }));
          if (wd.pillar === 'deen') {
            result.deen = { title: wd.title, description: wd.description, xp: wd.xp, steps };
            result.deenCompleted = wd.completed;
          }
          if (wd.pillar === 'body') {
            result.body = { title: wd.title, description: wd.description, xp: wd.xp, steps };
            result.bodyCompleted = wd.completed;
          }
          if (wd.pillar === 'money') {
            result.money = { title: wd.title, description: wd.description, xp: wd.xp, steps };
            result.moneyCompleted = wd.completed;
          }
          result.bonusClaimed = wd.bonus_claimed || false;
        }
        return result;
      })(),
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
