import { describe, it, expect } from 'vitest';
import { logLift, recomputeTrainingMax, nextSessionLoad, advanceBodyweightProgression } from './strengthLog';

function freshLog() {
  return { bodyweightKg: 70, baselineTested: true, lifts: {
    squat: { trainingMax: 60, history: [], lastTested: null },
    deadlift: { trainingMax: 80, history: [], lastTested: null },
    press: { trainingMax: 35, history: [], lastTested: null },
    bench: { trainingMax: 50, history: [], lastTested: null },
    row: { trainingMax: 45, history: [], lastTested: null },
    pullup: { trainingMax: 0, history: [], lastTested: null },
  }};
}

describe('strengthLog', () => {
  it('logLift appends a session to the lift history', () => {
    const s = { strengthLog: freshLog() };
    const next = logLift(s, { lift: 'squat', date: '2026-06-24', sets: 3, reps: 5, weight: 50, rpe: 7 });
    expect(next.strengthLog.lifts.squat.history.length).toBe(1);
    expect(next.strengthLog.lifts.squat.history[0].weight).toBe(50);
  });
  it('recomputeTrainingMax uses Epley (90% training max) and stores lastTested', () => {
    const tm = recomputeTrainingMax({ trainingMax: 60, history: [], lastTested: null }, { weight: 60, reps: 5 });
    // Epley 1RM = 60 * (1 + 5/30) = 70; training max = 90% of 1RM = 63 (5/3/1 convention)
    expect(tm.trainingMax).toBe(63);
    expect(tm.lastTested).toBeTruthy();
  });
  it('nextSessionLoad prescribes 80% of training max for a 3x5', () => {
    const s = { strengthLog: freshLog() };
    const load = nextSessionLoad(s, 'squat');
    expect(load.kg).toBeCloseTo(60 * 0.8, 0); // ~48
    expect(load.sets).toBe(3);
    expect(load.reps).toBe(5);
  });
  it('advanceBodyweightProgression bumps pullup when reps meet the next milestone', () => {
    const s = { strengthLog: freshLog(), physicalPower: { equipment: 'bodyweight' } };
    const logged = logLift(s, { lift: 'pullup', date: '2026-06-24', sets: 3, reps: 12, weight: 0, rpe: 8 });
    const advanced = advanceBodyweightProgression(logged, 'pullup');
    // pullup family: Incline Row (12) → Pull-up (8). 12 reps met → advance.
    expect(advanced.strengthLog.lifts.pullup.milestone).toBe('Pull-up');
  });
});