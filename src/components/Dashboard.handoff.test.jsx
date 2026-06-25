import { describe, it, expect } from 'vitest';
import { applyPhysicalPowerSideEffects } from '../logic/physicalPowerSideEffects';
import { DEFAULT_STATE } from '../data/store';

describe('applyPhysicalPowerSideEffects', () => {
  it('logs a strength session when a strength-track body quest completes', () => {
    const quest = {
      id: 'd-body-c-1',
      pillar: 'body',
      track: 'strength',
      tags: ['strength', 'squat'],
      prescribed: { weight: 48, reps: 5, sets: 3 }
    };
    const next = applyPhysicalPowerSideEffects(DEFAULT_STATE, quest);
    expect(next.strengthLog.lifts.squat.history.length).toBe(1);
  });

  it('logs protein when a nutrition resilience quest completes', () => {
    const quest = {
      id: 'd-body-e-8',
      pillar: 'body',
      track: 'resilience',
      tags: ['resilience', 'nutrition']
    };
    const next = applyPhysicalPowerSideEffects(DEFAULT_STATE, quest);
    expect(next.recovery.proteinLog.length).toBe(1);
  });

  it('leaves non-body quests untouched', () => {
    const quest = { id: 'd-deen-1', pillar: 'deen' };
    const next = applyPhysicalPowerSideEffects(DEFAULT_STATE, quest);
    expect(next.strengthLog).toBe(DEFAULT_STATE.strengthLog);
  });
});
