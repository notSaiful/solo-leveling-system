import { describe, it, expect } from 'vitest';
import { runEndgameCycle } from './endgame';
import { checkMonarchTrialProgress } from './monarchTrials';
import { DEFAULT_STATE } from '../data/store';
import { getLocalDateString } from '../utils/dateUtils';

const today = getLocalDateString();

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
    shadows: overrides.shadows ?? [],
    jobChangeGates: overrides.jobChangeGates ?? [],
    khalifateObjectives: overrides.khalifateObjectives ?? [],
    history: overrides.history ?? [],
    systemMessages: overrides.systemMessages ?? [],
    monarchTrials: { ...DEFAULT_STATE.monarchTrials, ...(overrides.monarchTrials || {}) },
    ummahCommand: { ...DEFAULT_STATE.ummahCommand, ...(overrides.ummahCommand || {}) },
  };
}

// getLastNDays in monarchTrials.js uses d.toLocaleDateString('en-CA'); replicate
// it exactly so seeded history.localDate matches the days the check iterates.
function lastNDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-CA'));
  }
  return days;
}

function questHistoryForDay(day, pillars) {
  return pillars.map((p, i) => ({
    type: 'daily',
    questId: `seed-${p}-${day}-${i}`,
    pillar: p,
    xp: 10,
    gold: 5,
    completed: true,
    localDate: day,
    date: `${day}T12:00:00.000Z`,
  }));
}

describe('monarch stage-4 distinct-pillar count (now driven by quest history)', () => {
  it('40 days of only-body quest completions do NOT complete ascension; 3 distinct pillars DO', () => {
    const days = lastNDays(40);
    const startedAt = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();

    // Negative: 3 body completions every day → distinct pillars = 1 (< 3).
    const negativeHistory = days.flatMap((day) => questHistoryForDay(day, ['body', 'body', 'body']));
    const negativeState = baseState({
      monarchTrials: { active: true, stage: 4, startedAt, completedAt: null },
      history: negativeHistory,
    });
    const negativeResult = checkMonarchTrialProgress(negativeState);
    expect(negativeResult.monarchTrials.completedAt).toBe(null);
    expect(negativeResult.ummahCommand?.unlocked).not.toBe(true);

    // Positive: deen + body + money every day → distinct pillars = 3 → ascension.
    const positiveHistory = days.flatMap((day) => questHistoryForDay(day, ['deen', 'body', 'money']));
    const positiveState = baseState({
      monarchTrials: { active: true, stage: 4, startedAt, completedAt: null },
      history: positiveHistory,
    });
    const positiveResult = checkMonarchTrialProgress(positiveState);
    expect(positiveResult.monarchTrials.completedAt).toBeTruthy();
    expect(positiveResult.ummahCommand?.unlocked).toBe(true);
  });
});

describe('runEndgameCycle chains the idempotent initializers', () => {
  it('is safe to call repeatedly (idempotent) on a fresh state', () => {
    const state = baseState({ user: { overallLevel: 5, currentRank: 'E' } });
    const once = runEndgameCycle(state, today);
    const twice = runEndgameCycle(once, today);
    // No duplicate gates, no duplicate seerah chains, objective set stable.
    expect(twice.jobChangeGates.length).toBe(once.jobChangeGates.length);
    expect(twice.seerahChains.length).toBe(once.seerahChains.length);
    expect(twice.khalifateObjectives.length).toBe(once.khalifateObjectives.length);
  });

  it('initializes the first job-change gate once overallLevel reaches 10', () => {
    const state = baseState({ user: { overallLevel: 10, currentRank: 'E' } });
    const next = runEndgameCycle(state, today);
    expect(next.jobChangeGates.length).toBe(1);
    expect(next.jobChangeGates[0].gateId).toBe('gate-d-10');
  });
});