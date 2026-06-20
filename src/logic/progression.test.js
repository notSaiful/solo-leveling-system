import { describe, expect, it } from 'vitest';
import { getActivityStreakBonus, checkFlowState, recalculateOverallLevel } from './progression';

function baseState(overrides = {}) {
  return {
    user: { name: 'Seeker', currentRank: 'E', overallLevel: 0 },
    pillars: {
      deen: { level: 0, xp: 0, streak: 0 },
      body: { level: 0, xp: 0, streak: 0 },
      money: { level: 0, xp: 0, streak: 0 },
    },
    systemMessages: [],
    ...overrides,
  };
}

describe('getActivityStreakBonus', () => {
  it('returns tiers at the exact thresholds', () => {
    expect(getActivityStreakBonus(0)).toEqual({ multiplier: 1.0, label: 'COMMON' });
    expect(getActivityStreakBonus(6)).toEqual({ multiplier: 1.0, label: 'COMMON' });
    expect(getActivityStreakBonus(7)).toEqual({ multiplier: 1.15, label: 'UNCOMMON' });
    expect(getActivityStreakBonus(29)).toEqual({ multiplier: 1.15, label: 'UNCOMMON' });
    expect(getActivityStreakBonus(30)).toEqual({ multiplier: 1.3, label: 'RARE' });
    expect(getActivityStreakBonus(90)).toEqual({ multiplier: 1.5, label: 'EPIC' });
    expect(getActivityStreakBonus(180)).toEqual({ multiplier: 1.75, label: 'MYTHIC' });
    expect(getActivityStreakBonus(365)).toEqual({ multiplier: 2.0, label: 'LEGENDARY' });
  });
});

describe('checkFlowState', () => {
  it('is inactive when fewer than the rank threshold logs are in the window', () => {
    const history = [{ completed: true, date: new Date().toISOString() }];
    const state = checkFlowState(history, 'E');
    expect(state.active).toBe(false);
    expect(state.multiplier).toBe(1);
  });
});

describe('recalculateOverallLevel', () => {
  it('weights deen 0.5 / body 0.3 / money 0.2 and never drops below the strongest pillar', () => {
    const state = recalculateOverallLevel(baseState({
      pillars: { deen: { level: 5, xp: 0, streak: 0 }, body: { level: 3, xp: 0, streak: 0 }, money: { level: 2, xp: 0, streak: 0 } },
    }));
    // weighted = floor(5*0.5 + 3*0.3 + 2*0.2) = floor(3.8) = 3, but deen=5 is strongest
    expect(state.user.overallLevel).toBe(5);
    expect(state.user.currentRank).toBe('E'); // 0-10
  });

  it('never decreases overallLevel once earned', () => {
    const state = recalculateOverallLevel(baseState({
      user: { name: 'Seeker', currentRank: 'E', overallLevel: 10 },
      pillars: { deen: { level: 3, xp: 0, streak: 0 }, body: { level: 2, xp: 0, streak: 0 }, money: { level: 1, xp: 0, streak: 0 } },
    }));
    expect(state.user.overallLevel).toBe(10);
  });

  it('promotes currentRank into D at level 11', () => {
    const state = recalculateOverallLevel(baseState({
      pillars: { deen: { level: 11, xp: 0, streak: 0 }, body: { level: 0, xp: 0, streak: 0 }, money: { level: 0, xp: 0, streak: 0 } },
    }));
    expect(state.user.overallLevel).toBe(11);
    expect(state.user.currentRank).toBe('D');
  });
});
