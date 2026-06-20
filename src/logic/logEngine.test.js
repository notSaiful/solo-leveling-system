import { describe, expect, it } from 'vitest';
import { awardActivities } from './logEngine';

function baseState(overrides = {}) {
  return {
    user: { name: 'Seeker', currentRank: 'E', overallLevel: 0 },
    pillars: {
      deen: { level: 0, xp: 0, streak: 0 },
      body: { level: 0, xp: 0, streak: 0 },
      money: { level: 0, xp: 0, streak: 0 },
    },
    stats: { strength: 10, agility: 10, intelligence: 10, sense: 10, health: 10, mana: 10 },
    gold: 0,
    activities: {},
    history: [],
    systemMessages: [],
    flowState: { active: false, multiplier: 1, expiresAt: 0, questsInWindow: 0 },
    weeklyFocus: null,
    catalogOverrides: {},
    ...overrides,
  };
}

const pushups = { activityKey: 'pushups', name: 'Push-ups', pillar: 'body', quantity: 100, unit: 'reps', effortScore: 6, notes: null };

describe('awardActivities — basic catalog award', () => {
  it('awards rank-scaled base XP and records a log entry', () => {
    const next = awardActivities(baseState(), [pushups], '2026-06-20');
    // base 15 -> getEffectiveXp(15,'E',0)=15 -> statmod(10,10,...)=15 -> streak COMMON x1.0 -> 15
    expect(next.pillars.body.xp).toBe(15);
    expect(next.pillars.body.streak).toBe(1);
    expect(next.gold).toBe(7); // floor(15 * 0.5)
    expect(next.activities.pushups.streak).toBe(1);
    expect(next.activities.pushups.totalSessions).toBe(1);
    const last = next.history.at(-1);
    expect(last.type).toBe('log');
    expect(last.activityKey).toBe('pushups');
    expect(last.xp).toBe(15);
    expect(last.localDate).toBe('2026-06-20');
  });
});

describe('awardActivities — per-activity streak bonus', () => {
  it('applies the UNCOMMON x1.15 bonus on the 7th consecutive day and grants a freeze', () => {
    const seeded = baseState({
      activities: {
        pushups: { name: 'Push-ups', pillar: 'body', streak: 6, bestStreak: 6, totalSessions: 6, frozen: false, lastLoggedDate: '2026-06-19', createdAt: '2026-06-14' },
      },
    });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.activities.pushups.streak).toBe(7);
    expect(next.activities.pushups.frozen).toBe(true);
    expect(next.pillars.body.xp).toBe(17); // floor(15 * 1.15)
  });
});

describe('awardActivities — Never Miss Twice', () => {
  it('forgives a single missed day when a freeze is held (gap=2)', () => {
    const seeded = baseState({
      activities: {
        pushups: { name: 'Push-ups', pillar: 'body', streak: 7, bestStreak: 7, totalSessions: 7, frozen: true, lastLoggedDate: '2026-06-18', createdAt: '2026-06-11' },
      },
    });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.activities.pushups.streak).toBe(8); // continued, freeze spent
    expect(next.activities.pushups.frozen).toBe(false);
  });

  it('resets the streak to 1 after a gap of more than one missed day', () => {
    const seeded = baseState({
      activities: {
        pushups: { name: 'Push-ups', pillar: 'body', streak: 10, bestStreak: 10, totalSessions: 10, frozen: false, lastLoggedDate: '2026-06-17', createdAt: '2026-06-07' },
      },
    });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.activities.pushups.streak).toBe(1);
  });
});

describe('awardActivities — daily cap', () => {
  it('records but awards 0 XP for a 4th same-activity log in one day', () => {
    const seeded = baseState({
      activities: {
        pushups: { name: 'Push-ups', pillar: 'body', streak: 1, bestStreak: 1, totalSessions: 3, frozen: false, lastLoggedDate: '2026-06-20', createdAt: '2026-06-20' },
      },
      history: [
        { type: 'log', activityKey: 'pushups', localDate: '2026-06-20', completed: true, xp: 15 },
        { type: 'log', activityKey: 'pushups', localDate: '2026-06-20', completed: true, xp: 15 },
        { type: 'log', activityKey: 'pushups', localDate: '2026-06-20', completed: true, xp: 15 },
      ],
    });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.pillars.body.xp).toBe(0); // no XP this log (seeded body.xp 0)
    expect(next.history.at(-1).xp).toBe(0);
    expect(next.activities.pushups.totalSessions).toBe(4);
  });
});

describe('awardActivities — novel activity uses effort score', () => {
  it('computes base XP from effortScore * UNIT_XP when no catalog entry exists', () => {
    const novel = { activityKey: 'cold-shower', name: 'Cold shower', pillar: 'body', quantity: null, unit: null, effortScore: 5, notes: null };
    const next = awardActivities(baseState(), [novel], '2026-06-20');
    // 5 * 8 = 40 -> getEffectiveXp(40,'E',0)=40 -> x1.0 -> 40
    expect(next.pillars.body.xp).toBe(40);
    expect(next.activities['cold-shower'].streak).toBe(1);
  });
});

describe('awardActivities — pillar + overall rank-up', () => {
  it('levels the pillar and promotes overall rank when enough XP is earned', () => {
    const seeded = baseState({
      pillars: { deen: { level: 0, xp: 0, streak: 0 }, body: { level: 10, xp: 300, streak: 0 }, money: { level: 0, xp: 0, streak: 0 } },
    });
    // xpForNextLevel(10) = floor(100 * 1.12^10) = 310; award 15 -> 315 -> level 11, xp 5
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.pillars.body.level).toBe(11);
    expect(next.pillars.body.xp).toBe(5);
    expect(next.user.overallLevel).toBe(11);
    expect(next.user.currentRank).toBe('D');
  });
});

describe('awardActivities — flow multiplier (newly applied)', () => {
  it('multiplies XP when state.flowState is active', () => {
    const seeded = baseState({ flowState: { active: true, multiplier: 1.5, expiresAt: 0, questsInWindow: 3 } });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    // 15 base * 1.5 flow = floor(22.5) = 22
    expect(next.pillars.body.xp).toBe(22);
  });
});

describe('awardActivities — weekly focus', () => {
  it('adds a 1.5x bonus when weeklyFocus matches the pillar', () => {
    const seeded = baseState({ weeklyFocus: 'body' });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.pillars.body.xp).toBe(22); // 15 * 1.5
  });
});

describe('awardActivities — edge cases', () => {
  it('returns state unchanged for an empty activity list', () => {
    const state = baseState();
    expect(awardActivities(state, [], '2026-06-20')).toBe(state);
  });

  it('skips activities with no pillar', () => {
    const next = awardActivities(baseState(), [{ activityKey: 'x', name: 'X', pillar: 'body' }, { activityKey: 'y', name: 'Y', pillar: null }], '2026-06-20');
    expect(next.history).toHaveLength(1);
  });
});
