import { describe, it, expect, vi, afterEach } from 'vitest';
import { awardActivities, runEndgameCycle } from './logEngine';
import * as monarchTrials from './monarchTrials';
import { DEFAULT_STATE } from '../data/store';
import { getLocalDateString, parseLocalDate } from '../utils/dateUtils';
import { JOB_CHANGE_GATES } from '../data/jobChangeGates';

// Phase 1 keystone tests: the daily log loop now drives shadow extraction, job-gate
// auto-advance, khalifate-objective initialization, and khalifate-gate level capping —
// all without crashing the pipeline. Mirrors the mondayReset.repro.test.js style.

const today = getLocalDateString();
const yesterday = getLocalDateString(new Date(parseLocalDate(today).getTime() - 24 * 60 * 60 * 1000));

function baseState(overrides = {}) {
  return {
    ...DEFAULT_STATE,
    ...overrides,
    user: { ...DEFAULT_STATE.user, ...(overrides.user || {}) },
    pillars: {
      deen: { ...DEFAULT_STATE.pillars.deen, ...(overrides.pillars?.deen || {}) },
      body: { ...DEFAULT_STATE.pillars.body, ...(overrides.pillars?.body || {}) },
      money: { ...DEFAULT_STATE.pillars.money, ...(overrides.pillars?.money || {}) },
    },
    activities: overrides.activities || {},
    shadows: overrides.shadows ?? [],
    jobChangeGates: overrides.jobChangeGates ?? [],
    khalifateObjectives: overrides.khalifateObjectives ?? [],
    history: overrides.history ?? [],
    systemMessages: overrides.systemMessages ?? [],
    monarchTrials: { ...DEFAULT_STATE.monarchTrials, ...(overrides.monarchTrials || {}) },
    ummahCommand: { ...DEFAULT_STATE.ummahCommand, ...(overrides.ummahCommand || {}) },
  };
}

function streakedActivity(key, streak, lastDate) {
  return { [key]: { streak, bestStreak: streak, totalSessions: streak, lastLoggedDate: lastDate, frozen: false, createdAt: lastDate } };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Phase 1 — endgame wired into the log loop', () => {
  it('1. a 7-day streak crossing extracts one shadow of the matching pillar', () => {
    const state = baseState({
      user: { overallLevel: 5, currentRank: 'E' },
      activities: streakedActivity('pushups', 6, yesterday),
    });
    const next = awardActivities(state, [{ activityKey: 'pushups', pillar: 'body', name: 'Push-ups', quantity: 50 }], today);

    expect(next.shadows.length).toBe(1);
    expect(next.shadows[0].id).toBe('basic-fitness');
    expect(next.shadows[0].pillar).toBe('body');
  });

  it('2. same-day repeat at the tier does not double-extract', () => {
    const state = baseState({
      user: { overallLevel: 5, currentRank: 'E' },
      activities: streakedActivity('pushups', 6, yesterday),
    });
    const once = awardActivities(state, [{ activityKey: 'pushups', pillar: 'body', name: 'Push-ups', quantity: 50 }], today);
    const twice = awardActivities(once, [{ activityKey: 'pushups', pillar: 'body', name: 'Push-ups', quantity: 50 }], today);

    expect(twice.shadows.length).toBe(1);
  });

  it('3. an extracted all-XP shadow boosts logged XP by its bonus', () => {
    const shadow = { id: 'test-all', name: 'Test', grade: 'NORMAL', pillar: 'all', passiveBonus: 0.10, effect: 'allXpBonus', extractedAt: '2026-01-01T00:00:00.000Z' };
    const activity = { activityKey: 'test-act', pillar: 'deen', name: 'Test', effortScore: 3 };

    const baseline = awardActivities(baseState({ user: { overallLevel: 0, currentRank: 'E' } }), [activity], today);
    const shadowed = awardActivities(baseState({ user: { overallLevel: 0, currentRank: 'E' }, shadows: [shadow] }), [activity], today);

    const baseXp = baseline.history.at(-1).xp;
    const boostedXp = shadowed.history.at(-1).xp;
    expect(boostedXp).toBe(Math.floor(baseXp * 1.10));
    expect(boostedXp).toBeGreaterThan(baseXp);
  });

  it('4. a fresh state populates khalifate objectives on first log', () => {
    const state = baseState({ khalifateObjectives: [] });
    const next = awardActivities(state, [{ activityKey: 'test-act', pillar: 'deen', name: 'Test', effortScore: 3 }], today);

    expect(next.khalifateObjectives.length).toBeGreaterThan(0);
    expect(next.khalifateObjectives.some((o) => o.id === 'kg-100-2')).toBe(true); // "First Income Stream"
  });

  it('5. reaching level 10 initializes the first job-change gate (no auto-advance from a non-matching log)', () => {
    const state = baseState({ user: { overallLevel: 10, currentRank: 'E' } });
    // Log a BODY activity; gate-d-10 step 0 is DEEN, so no auto-advance — gate is created but step 0 stays open.
    const next = awardActivities(state, [{ activityKey: 'pushups', pillar: 'body', name: 'Push-ups', quantity: 50 }], today);

    expect(next.jobChangeGates.length).toBe(1);
    expect(next.jobChangeGates[0].gateId).toBe('gate-d-10');
    expect(next.jobChangeGates[0].steps[0].completed).toBe(false);
  });

  it('6. a qualifying log auto-advances the active gate step', () => {
    const state = baseState({ user: { overallLevel: 10, currentRank: 'E' } });
    // Gate-d-10 step 0 is "Fajr Warrior" (pillar deen). A deen log qualifies.
    const next = awardActivities(state, [{ activityKey: 'fajr', pillar: 'deen', name: 'Fajr', effortScore: 5 }], today);

    expect(next.jobChangeGates.length).toBe(1);
    expect(next.jobChangeGates[0].steps[0].completed).toBe(true);
    expect(next.jobChangeGates[0].steps[0].completedAt).toBeTruthy();
  });

  it('7. a second qualifying log the same day does NOT advance the next step (one step per day)', () => {
    const template = JOB_CHANGE_GATES.find((g) => g.id === 'gate-d-10');
    const steps = template.steps.map((s, i) =>
      i === 0 ? { ...s, completed: true, completedAt: new Date().toISOString() } : { ...s, completed: false, completedAt: null }
    );
    const state = baseState({
      user: { overallLevel: 10, currentRank: 'E' },
      jobChangeGates: [{ gateId: 'gate-d-10', rank: 'D', levelRequired: 10, title: template.title, day: 2, totalDays: 7, steps, completed: false, completedAt: null, failed: false, failedAt: null, startedAt: new Date().toISOString() }],
    });
    // Step 1 is "Adventure Foundation" (pillar body). A body log WOULD qualify, but step 0
    // was already completed today → the one-step-per-day guard blocks any advance.
    const next = awardActivities(state, [{ activityKey: 'pushups', pillar: 'body', name: 'Push-ups', quantity: 50 }], today);

    expect(next.jobChangeGates[0].steps[1].completed).toBe(false);
  });

  it('8. level ascension caps at the first incomplete khalifate gate (L100) with no objectives done', () => {
    const state = baseState({
      user: { overallLevel: 99, currentRank: 'A' },
      pillars: { deen: { level: 105, xp: 0, streak: 0, shadowsUnlocked: [], activeDebuff: null } },
      khalifateObjectives: [],
    });
    // Log a body activity (does not touch deen's 105). Raw overall would be 105; gate holds it at 100.
    const next = awardActivities(state, [{ activityKey: 'pushups', pillar: 'body', name: 'Push-ups', quantity: 50 }], today);

    expect(next.user.overallLevel).toBe(100);
    expect(next.systemMessages.some((m) => String(m.title || '').includes('KHALIFATE GATE'))).toBe(true);
  });

  it('9. an endgame-cycle throw is caught — awardActivities still returns awarded XP (non-fatal)', () => {
    vi.spyOn(monarchTrials, 'initializeMonarchTrials').mockImplementation(() => {
      throw new Error('boom');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const state = baseState({ user: { overallLevel: 5, currentRank: 'E' } });
    const next = awardActivities(state, [{ activityKey: 'test-act', pillar: 'deen', name: 'Test', effortScore: 3 }], today);

    // XP was still awarded and the log loop survived.
    expect(next.history.some((h) => h.type === 'log' && h.xp > 0)).toBe(true);
    expect(typeof next.user.overallLevel).toBe('number');
    // The throw was actually caught by the endgame wrapper.
    expect(warnSpy.mock.calls.some((c) => String(c[0]).includes('[endgame]'))).toBe(true);
  });
});

// Monarch stage-4 now counts DISTINCT pillars (not 3 same-pillar logs).
// getLastNDays in monarchTrials.js uses d.toLocaleDateString('en-CA'); replicate it exactly
// so seeded history.localDate matches the days the check iterates.
function lastNDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-CA'));
  }
  return days;
}

function logsForDay(day, pillars) {
  return pillars.map((p, i) => ({
    type: 'log',
    activityKey: `seed-${p}-${day}-${i}`,
    pillar: p,
    xp: 10,
    gold: 5,
    completed: true,
    localDate: day,
    date: `${day}T12:00:00.000Z`,
  }));
}

describe('Phase 1 — monarch stage-4 distinct-pillar count', () => {
  it('10. 40 days of only-body logs do NOT complete ascension; 40 days of 3 distinct pillars DO', () => {
    const days = lastNDays(40);
    const startedAt = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();

    // Negative: 3 body logs every day → distinct pillars = 1 (< 3). Old buggy code would
    // have counted 3 completions and completed; the fix must NOT.
    const negativeHistory = days.flatMap((day) => logsForDay(day, ['body', 'body', 'body']));
    const negativeState = baseState({
      monarchTrials: { active: true, stage: 4, startedAt, completedAt: null },
      history: negativeHistory,
    });
    const negativeResult = monarchTrials.checkMonarchTrialProgress(negativeState);
    expect(negativeResult.monarchTrials.completedAt).toBe(null);
    expect(negativeResult.ummahCommand?.unlocked).not.toBe(true);

    // Positive: deen + body + money every day → distinct pillars = 3 → ascension completes.
    const positiveHistory = days.flatMap((day) => logsForDay(day, ['deen', 'body', 'money']));
    const positiveState = baseState({
      monarchTrials: { active: true, stage: 4, startedAt, completedAt: null },
      history: positiveHistory,
    });
    const positiveResult = monarchTrials.checkMonarchTrialProgress(positiveState);
    expect(positiveResult.monarchTrials.completedAt).toBeTruthy();
    expect(positiveResult.ummahCommand?.unlocked).toBe(true);
  });
});

describe('Phase 1 — runEndgameCycle chains the idempotent initializers', () => {
  it('11. is safe to call repeatedly (idempotent) on a fresh state', () => {
    const state = baseState({ user: { overallLevel: 5, currentRank: 'E' } });
    const once = runEndgameCycle(state, today);
    const twice = runEndgameCycle(once, today);
    // No duplicate gates, no duplicate seerah chains, objective set stable.
    expect(twice.jobChangeGates.length).toBe(once.jobChangeGates.length);
    expect(twice.seerahChains.length).toBe(once.seerahChains.length);
    expect(twice.khalifateObjectives.length).toBe(once.khalifateObjectives.length);
  });
});