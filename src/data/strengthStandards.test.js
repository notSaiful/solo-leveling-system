import { describe, it, expect } from 'vitest';
import { getStrengthStandard, getBodyweightMilestone, STRENGTH_STANDARDS, BODYWEIGHT_PROGRESSIONS } from './strengthStandards';

describe('strengthStandards', () => {
  it('returns a bodyweight-multiple target for a barbell squat by rank', () => {
    const e = getStrengthStandard('squat', 'E', 70, 'barbell');
    const s = getStrengthStandard('squat', 'S', 70, 'barbell');
    expect(e.kg).toBeLessThan(s.kg);
    expect(s.kg).toBeGreaterThanOrEqual(70 * 2); // S-rank squat >= 2x BW
  });
  it('bodyweight equipment returns a progression milestone instead of a kg load', () => {
    const bw = getStrengthStandard('squat', 'E', 70, 'bodyweight');
    expect(bw.milestone).toBeTruthy();
    expect(bw.kg).toBeNull();
  });
  it('getBodyweightMilestone advances with reps', () => {
    // Progression ladders have DECREASING minReps (harder variation = fewer reps needed),
    // so reps below the first threshold map to the first step, and reps past every
    // threshold map to the final step.
    expect(getBodyweightMilestone('pushup', 8)).toBe('Push-up');          // 8 < 20 → first step
    expect(getBodyweightMilestone('pushup', 25)).toBe('One-arm Push-up'); // past all thresholds → final step
  });
  it('defines progressions for the four bodyweight families', () => {
    expect(BODYWEIGHT_PROGRESSIONS.pushup.length).toBeGreaterThanOrEqual(3);
    expect(BODYWEIGHT_PROGRESSIONS.squat.length).toBeGreaterThanOrEqual(3);
    expect(BODYWEIGHT_PROGRESSIONS.pull.length).toBeGreaterThanOrEqual(3);
    expect(BODYWEIGHT_PROGRESSIONS.hinge.length).toBeGreaterThanOrEqual(3);
  });
});