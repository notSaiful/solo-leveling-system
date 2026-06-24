import { describe, it, expect } from 'vitest';
import { proteinTarget, logProtein, logSleep, rollingSleepAvg, recoveryFlags } from './recovery';

function freshRecovery() { return { proteinTarget: null, proteinLog: [], sleepLog: [], hydrationLog: [], mobilityMinutes: 0, injury: null, deloadState: null }; }

describe('recovery', () => {
  it('proteinTarget is ~1.8 g/kg', () => {
    expect(proteinTarget(70)).toBeCloseTo(126, 0); // 70 * 1.8
  });
  it('logProtein appends and sets the rolling day total', () => {
    const s = { recovery: freshRecovery() };
    const next = logProtein(s, { date: '2026-06-24', grams: 40 });
    expect(next.recovery.proteinLog.length).toBe(1);
  });
  it('rollingSleepAvg averages the last N entries', () => {
    let s = { recovery: freshRecovery() };
    s = logSleep(s, { date: '2026-06-22', hours: 6, quality: 80 });
    s = logSleep(s, { date: '2026-06-23', hours: 8, quality: 90 });
    expect(rollingSleepAvg(s, 7)).toBeCloseTo(7, 5);
  });
  it('recoveryFlags flags low sleep average', () => {
    let s = { recovery: freshRecovery() };
    s = logSleep(s, { date: '2026-06-23', hours: 5, quality: 60 });
    const flags = recoveryFlags(s);
    expect(flags.underRecovered).toBe(true);
    expect(flags.reason).toContain('low sleep');
  });
});