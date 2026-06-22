import { describe, it, expect } from 'vitest';
import { initializeWeeklyDungeon } from './questEngine';
import { checkAndApplyPenalties } from './penalties';
import { getCurrentWeekId } from './dungeons';
import { getLocalDateString } from '../utils/dateUtils';

// Reproduces the root cause of the "app closes itself on Monday" crash.
//
// The Monday-reset useEffect in App.jsx previously did:
//     let nextState = initializeWeeklyDungeon(state);
//     nextState = checkAndApplyPenalties(nextState);   // <-- BUG
//     ... nextState.pillars[p] ...
//
// checkAndApplyPenalties returns a RESULT ENVELOPE ({ penalties, updatedPillars,
// ... }), NOT a state object. Reassigning nextState to the envelope leaves
// nextState.pillars undefined, so `nextState.pillars[p]` throws
// "Cannot read properties of undefined (reading 'deen')". That throw lives inside
// a useEffect, which React Error Boundaries cannot catch — on iOS Capacitor the
// WebView crashes and the app closes itself.

function buildStaleWeekState(overrides = {}) {
  const thisWeek = getCurrentWeekId();
  const [y, m, d] = thisWeek.split('-').map(Number);
  const lastWeek = new Date(Date.UTC(y, m - 1, d - 7, 12));
  const lastWeekId = lastWeek.toISOString().slice(0, 10);

  return {
    user: { name: 'Seeker', currentRank: 'E', overallLevel: 5, joinedDate: '2026-05-01T00:00:00.000Z', jobClass: null },
    pillars: {
      deen: { level: 5, xp: 120, streak: 3, shadowsUnlocked: [], activeDebuff: null },
      body: { level: 4, xp: 80, streak: 2, shadowsUnlocked: [], activeDebuff: null },
      money: { level: 3, xp: 50, streak: 1, shadowsUnlocked: [], activeDebuff: null },
    },
    stats: { strength: 10, agility: 10, intelligence: 10, sense: 10, health: 10, mana: 10 },
    history: [],
    weeklyDungeons: { weekId: lastWeekId, deenCompleted: false, bodyCompleted: false, moneyCompleted: false, ummahCompleted: false, bonusClaimed: false },
    weeklyStats: { soloClear: false, aiPromptsUsed: 0, weekId: lastWeekId },
    weeklyFocus: null,
    redemptionQuests: [],
    failureStreaks: { deen: 0, body: 0, money: 0 },
    streakFrozen: { deen: false, body: false, money: false },
    // today => checkAndApplyPenalties returns a clean envelope (daysToCheck empty),
    // so the only throw path is the envelope-reassignment bug itself.
    lastPenaltyCheckDate: getLocalDateString(),
    lastActiveDate: getLocalDateString(),
    guidedMode: { enabled: true, lastQuestDate: null },
    ...overrides,
  };
}

describe('Monday reset effect — root cause + fix', () => {
  it('OLD logic: reassigning nextState to the penalty envelope throws (app closes itself)', () => {
    const state = buildStaleWeekState();
    const hadPreviousWeek = Boolean(state.weeklyDungeons.weekId);
    expect(hadPreviousWeek).toBe(true);

    let nextState = initializeWeeklyDungeon(state);
    if (hadPreviousWeek) {
      nextState = checkAndApplyPenalties(nextState); // BUG: envelope, not state
    }

    // Exact line the deployed effect crashed on.
    expect(() => {
      void nextState.pillars.deen;
    }).toThrow(TypeError);
  });

  it('NEW logic: read envelope fields separately — no throw, pillars preserved', () => {
    const state = buildStaleWeekState();
    const today = getLocalDateString();
    const currentWeek = getCurrentWeekId();
    const hadPreviousWeek = Boolean(state.weeklyDungeons.weekId);

    // Mirrors the fixed App.jsx effect (lines ~139-167).
    const nextState = initializeWeeklyDungeon(state);
    const penaltyResult = hadPreviousWeek ? checkAndApplyPenalties(nextState) : null;
    const sourcePillars = penaltyResult ? penaltyResult.updatedPillars : nextState.pillars;

    const cleanPillars = {};
    for (const p of ['deen', 'body', 'money']) {
      const pillar = sourcePillars?.[p];
      if (pillar) {
        const { _penaltyMeta, ...rest } = pillar;
        cleanPillars[p] = rest;
      } else {
        cleanPillars[p] = nextState.pillars?.[p];
      }
    }

    // No throw above. All three pillars intact, no transient _penaltyMeta leaks.
    expect(Object.keys(cleanPillars).sort()).toEqual(['body', 'deen', 'money']);
    for (const p of ['deen', 'body', 'money']) {
      expect(cleanPillars[p]).toBeTruthy();
      expect(cleanPillars[p]._penaltyMeta).toBeUndefined();
    }
    // Envelope carries lastPenaltyCheckDate for the new week.
    expect(penaltyResult.lastPenaltyCheckDate).toBe(today);
    // New week's dungeon is initialized.
    expect(nextState.weeklyDungeons.weekId).toBe(currentWeek);
  });

  it('NEW logic: realistic missed-week (penalties + extreme + dungeon) runs without throwing', () => {
    // Real user scenario: opened the app a week late with Guided Mode on, no completions,
    // last week's dungeon unclaimed. Exercises applyPenalty(missedThreeDays),
    // applyExtremePenalty (streak >= 3), and checkDungeonPenalty (Monday in window).
    const thisWeek = getCurrentWeekId();
    const [y, m, d] = thisWeek.split('-').map(Number);
    const lastWeek = new Date(Date.UTC(y, m - 1, d - 7, 12));
    const lastWeekId = lastWeek.toISOString().slice(0, 10);

    const state = buildStaleWeekState({
      lastPenaltyCheckDate: lastWeekId,
      lastActiveDate: lastWeekId,
      weeklyDungeons: { weekId: lastWeekId, deenCompleted: false, bodyCompleted: false, moneyCompleted: false, ummahCompleted: false, bonusClaimed: false },
      // Give pillars enough XP that a penalty is meaningful, and a non-zero prior failure streak.
      pillars: {
        deen: { level: 6, xp: 500, streak: 5, shadowsUnlocked: [], activeDebuff: null, lastDailyQuestCompletionDate: null },
        body: { level: 5, xp: 400, streak: 4, shadowsUnlocked: [], activeDebuff: null, lastDailyQuestCompletionDate: null },
        money: { level: 4, xp: 300, streak: 3, shadowsUnlocked: [], activeDebuff: null, lastDailyQuestCompletionDate: null },
      },
      failureStreaks: { deen: 2, body: 1, money: 0 },
    });

    const today = getLocalDateString();
    const hadPreviousWeek = Boolean(state.weeklyDungeons.weekId);
    expect(hadPreviousWeek).toBe(true);

    // Fixed effect logic — must not throw.
    const nextState = initializeWeeklyDungeon(state);
    const penaltyResult = checkAndApplyPenalties(nextState);
    const sourcePillars = penaltyResult.updatedPillars;

    const cleanPillars = {};
    for (const p of ['deen', 'body', 'money']) {
      const pillar = sourcePillars?.[p];
      if (pillar) {
        const { _penaltyMeta, ...rest } = pillar;
        cleanPillars[p] = rest;
      } else {
        cleanPillars[p] = nextState.pillars?.[p];
      }
    }

    // Penalty path actually ran (proves we exercised the heavy code, not just the empty case).
    expect(penaltyResult.penalties.length).toBeGreaterThan(0);
    // No throw, all pillars intact, no transient meta leaked into saved state.
    for (const p of ['deen', 'body', 'money']) {
      expect(cleanPillars[p]).toBeTruthy();
      expect(cleanPillars[p]._penaltyMeta).toBeUndefined();
    }
    expect(penaltyResult.lastPenaltyCheckDate).toBe(today);
  });

  it('NEW logic: no previous week (hadPreviousWeek=false) — still safe, uses nextState.pillars', () => {
    const state = buildStaleWeekState({
      weeklyDungeons: { weekId: null, deenCompleted: false, bodyCompleted: false, moneyCompleted: false, ummahCompleted: false, bonusClaimed: false },
    });
    const hadPreviousWeek = Boolean(state.weeklyDungeons.weekId);
    expect(hadPreviousWeek).toBe(false);

    const nextState = initializeWeeklyDungeon(state);
    const penaltyResult = hadPreviousWeek ? checkAndApplyPenalties(nextState) : null;
    const sourcePillars = penaltyResult ? penaltyResult.updatedPillars : nextState.pillars;

    expect(sourcePillars).toBe(nextState.pillars);
    expect(sourcePillars.deen).toBeTruthy();
  });
});