import { CATALOG, UNIT_XP } from '../data/activityCatalog';
import { getRankByLevel, getEffectiveXp, xpForNextLevel } from '../data/questCatalog';
import { applyStatModifiers, autoAssignStatPoints } from '../data/stats';
import { getLocalDateString, getDayDiff, toLocalDateString } from '../utils/dateUtils';
import { recalculateOverallLevel, getActivityStreakBonus } from './progression';
import { applyShadowBonuses, getUnlockedShadows, extractShadow } from '../data/shadows';
import { initializeSeerahChain } from '../data/seerahChains';
import { initializeJobChangeGate, completeGateStep, getActiveJobChangeGate } from '../data/jobChangeGates';
import { initializeMonarchTrials, checkMonarchTrialProgress } from './monarchTrials';
import { initializeKhalifateObjectives } from '../data/missionGates';

const MAX_SAME_ACTIVITY_LOGS_PER_DAY = 3;
const FREEZE_TIERS = [7, 30, 90, 180, 365];

function createEventId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function resolvePreBase(activity, state) {
  const key = activity.activityKey;
  if (CATALOG[key]) return CATALOG[key].baseXp;
  const override = state.catalogOverrides?.[key];
  if (override?.fixedXp) return override.fixedXp;
  const effort = Math.max(1, Math.min(10, activity.effortScore || 3));
  return effort * UNIT_XP;
}

function countSameDayLogs(state, activityKey, today) {
  return (state.history || []).filter(
    (h) => h.type === 'log' && h.activityKey === activityKey && h.localDate === today && h.completed
  ).length;
}

function updateActivityStreak(activityRecord, today) {
  const rec = activityRecord
    ? { ...activityRecord }
    : { streak: 0, bestStreak: 0, totalSessions: 0, totalReps: 0, frozen: false, lastLoggedDate: null, createdAt: today };

  if (rec.lastLoggedDate === today) {
    rec.totalSessions = (rec.totalSessions || 0) + 1;
    return rec; // same-day repeat: no streak change
  }

  const isFirstLog = rec.lastLoggedDate === null;
  const gap = rec.lastLoggedDate ? getDayDiff(rec.lastLoggedDate, today) : null;

  if (isFirstLog) {
    rec.streak = 1;
    rec.frozen = false;
  } else if (gap === 1) {
    rec.streak = (rec.streak || 0) + 1;
  } else if (gap === 2 && rec.frozen) {
    rec.streak = (rec.streak || 0) + 1; // Never Miss Twice: one missed day forgiven
    rec.frozen = false;
  } else {
    rec.streak = 1; // gap too large (or freeze already spent): reset
    rec.frozen = false;
  }

  rec.bestStreak = Math.max(rec.bestStreak || 0, rec.streak);
  rec.totalSessions = (rec.totalSessions || 0) + 1;
  rec.lastLoggedDate = today;
  if (FREEZE_TIERS.includes(rec.streak)) rec.frozen = true;
  return rec;
}

export function awardActivities(state, activities, today = getLocalDateString()) {
  if (!Array.isArray(activities) || activities.length === 0) return state;

  let next = { ...state };
  next.activities = { ...(state.activities || {}) };
  next.pillars = { ...state.pillars };
  next.history = [...(state.history || [])];
  next.systemMessages = [...(state.systemMessages || [])];
  next.stats = { ...(state.stats || {}) };
  let gold = state.gold || 0;
  // Pillars whose activity streak crossed a FREEZE_TIER this session. Shadow extraction
  // runs AFTER level recalculation so unlock checks use the current level/rank, not the
  // pre-session one (otherwise a tier crossing on the same session a level reaches an
  // unlock threshold would miss extraction — the tier trigger fires only on that day).
  const pendingExtractions = [];

  const rank = getRankByLevel(state.user.overallLevel || 0);

  for (const activity of activities) {
    if (!activity || !activity.pillar || !next.pillars[activity.pillar]) continue;
    const pillar = activity.pillar;

    const sameDayCount = countSameDayLogs(next, activity.activityKey, today);
    const countsForXp = sameDayCount < MAX_SAME_ACTIVITY_LOGS_PER_DAY;

    // 1. catalog/effort base -> rank scale
    const preBase = resolvePreBase(activity, next);
    const base = getEffectiveXp(preBase, rank.key, state.user.overallLevel || 0);

    // 2. update the activity streak ledger FIRST so the bonus reflects today
    const prevRec = next.activities[activity.activityKey];
    const rec = updateActivityStreak(prevRec, today);
    rec.name = activity.name || rec.name || activity.activityKey;
    rec.pillar = pillar;
    if (activity.quantity != null) rec.totalReps = (rec.totalReps || 0) + Number(activity.quantity);
    next.activities[activity.activityKey] = rec;

    // Track streak tier crossings for shadow extraction (performed after recalculation).
    const prevStreak = prevRec?.streak || 0;
    if (FREEZE_TIERS.includes(rec.streak) && rec.streak > prevStreak) {
      pendingExtractions.push(pillar);
    }

    let final = base;
    if (countsForXp) {
      // 3. stat modifiers (body->strength, deen->intelligence, money->sense, +agility)
      final = applyStatModifiers(final, next.stats, pillar);
      // 4. per-activity streak bonus (newly applied)
      const bonus = getActivityStreakBonus(rec.streak);
      final = Math.floor(final * bonus.multiplier);
      // shadow army bonus — extracted shadows boost log XP (no-op if army empty)
      final = applyShadowBonuses(final, pillar, next);
      // 5. flow multiplier (newly applied; reads pre-existing state.flowState)
      if (state.flowState?.active) final = Math.floor(final * (state.flowState.multiplier || 1));
      // 6. weekly focus
      if (state.weeklyFocus === pillar) final = Math.floor(final * 1.5);
    } else {
      final = 0; // beyond the daily cap: recorded, no XP
    }

    // 7. pillar XP + streak + level-up
    const pillarState = { ...next.pillars[pillar] };
    pillarState.xp = (pillarState.xp || 0) + final;
    pillarState.streak = (pillarState.streak || 0) + 1;
    pillarState.lastDailyQuestCompletionDate = today;

    let autoStatResult = null;
    const needed = xpForNextLevel(pillarState.level || 0);
    if (pillarState.xp >= needed) {
      pillarState.level = (pillarState.level || 0) + 1;
      pillarState.xp -= needed;
      const pillarRank = getRankByLevel(pillarState.level);
      autoStatResult = autoAssignStatPoints(next.stats, pillar, pillarRank.statPointsPerLevel || 1);
    }
    next.pillars[pillar] = pillarState;

    if (autoStatResult) {
      next.stats = autoStatResult.stats;
      const assignments = autoStatResult.assignments.map((a) => `${a.stat.toUpperCase()} +${a.points}`).join(', ');
      next.systemMessages.push({
        type: 'levelUp',
        title: `${pillar.toUpperCase()} LEVEL UP`,
        subtitle: `Level ${pillarState.level}`,
        message: `SYSTEM auto-assigned: ${assignments}.`,
      });
    }

    // 8. gold
    const goldGain = Math.floor(final * 0.5);
    gold += goldGain;

    // 9. history
    next.history.push({
      eventId: createEventId('log'),
      type: 'log',
      activityKey: activity.activityKey,
      title: activity.name || activity.activityKey,
      description: activity.notes || '',
      pillar,
      quantity: activity.quantity ?? null,
      unit: activity.unit ?? null,
      xp: final,
      gold: goldGain,
      date: new Date().toISOString(),
      localDate: today,
      completed: true,
    });
  }

  next.gold = gold;
  next = recalculateOverallLevel(next);

  // Shadow extraction — for each pillar whose activity streak crossed a freeze tier this
  // session, extract the highest unlocked-but-unextracted shadow. Done post-recalc so
  // unlock checks use the current level/rank. Wrapped so a failure can't crash the log.
  for (const pillar of new Set(pendingExtractions)) {
    try {
      const avail = getUnlockedShadows(next)
        .filter((s) => !s.extracted && (s.pillar === pillar || s.pillar === 'all'));
      if (avail.length > 0) {
        const highest = avail.sort((a, b) => b.passiveBonus - a.passiveBonus)[0];
        next = extractShadow(next, highest.id);
      }
    } catch (err) {
      console.warn('[shadow extraction] non-fatal:', err);
    }
  }

  // Reactivate the v3 endgame state machine from the log loop. Wrapped so an endgame
  // failure can never crash the daily pipeline (the Monday-crash lesson).
  try {
    next = runEndgameCycle(next, today);
  } catch (err) {
    console.warn('[endgame] cycle error (non-fatal):', err);
  }
  return next;
}

// Reactivate the v3 endgame state machine from the log loop. Chains the idempotent
// initializers (NO quest generation — v8 has no daily quests), checks monarch trial
// progress, and auto-advances the active job-change gate from today's logs. Every
// initializer guards on "already initialized"; the whole cycle is try/catch-wrapped
// at the call site so an endgame throw can never crash the daily log pipeline.
export function runEndgameCycle(state, today = getLocalDateString()) {
  let s = state;
  s = initializeSeerahChain(s);
  s = initializeJobChangeGate(s);
  s = initializeMonarchTrials(s);
  s = checkMonarchTrialProgress(s);
  s = initializeKhalifateObjectives(s);
  s = autoAdvanceJobGate(s, today);
  return s;
}

// Auto-advance the active job-change gate by one step per day when today's logs qualify
// for the current step's pillar. One step per day (guarded by completedAt date). The
// manual "Complete Step" button in Legion remains as an override fallback.
function autoAdvanceJobGate(state, today) {
  const gate = getActiveJobChangeGate(state);
  if (!gate) return state;
  const idx = gate.steps.findIndex((s) => !s.completed);
  if (idx < 0) return state;
  const alreadyToday = gate.steps.some(
    (s) => s.completedAt && toLocalDateString(s.completedAt) === today
  );
  if (alreadyToday) return state;
  const todayLogs = (state.history || []).filter(
    (h) => h.localDate === today && h.completed && (h.xp || 0) > 0
  );
  const stepPillar = gate.steps[idx].pillar;
  const qualifies = stepPillar === 'all'
    ? todayLogs.length >= 1
    : todayLogs.some((h) => h.pillar === stepPillar);
  return qualifies ? completeGateStep(state, gate.gateId, idx) : state;
}