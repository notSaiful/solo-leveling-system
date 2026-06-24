import { describe, it, expect } from 'vitest';
import { DEFAULT_STATE, upgradeStateForCurrentBuild } from './store';

describe('Physical Power migration', () => {
  it('DEFAULT_STATE has the new Physical Power slices', () => {
    expect(DEFAULT_STATE.strengthLog).toBeDefined();
    expect(DEFAULT_STATE.strengthLog.lifts.squat.trainingMax).toBeNull();
    expect(DEFAULT_STATE.recovery).toBeDefined();
    expect(DEFAULT_STATE.physicalPower).toBeDefined();
    expect(DEFAULT_STATE.physicalPower.equipment).toBeNull();
  });
  it('upgradeStateForCurrentBuild initializes slices for an old state and resets generated quests', () => {
    const oldState = { version: 8, buildVersion: '2026-06-23-remove-log-guided-default', dailyQuests: [{ id: 'x', title: 'Explore a New Street', pillar: 'body' }], pillars: { deen: { level: 0 }, body: { level: 2 }, money: { level: 0 } } };
    const upgraded = upgradeStateForCurrentBuild(oldState, { resetGeneratedContent: true });
    expect(upgraded.strengthLog.lifts.squat.trainingMax).toBeNull();
    expect(upgraded.physicalPower.equipment).toBeNull();
    expect(upgraded.dailyQuests).toEqual([]); // generated content reset → re-rolled fresh
    expect(upgraded.buildVersion).toBe('2026-06-24-physical-power');
  });
});