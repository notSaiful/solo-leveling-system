import { describe, expect, it } from 'vitest';
import { getLocalDateString, getDaysBetween } from '../utils/dateUtils';
import { mergeStatesForSync } from './stateMerge';
import { completeRedemptionQuest, getRedemptionProgress } from './questEngine';
import { isDebuffActive } from './penalties';
import { executeAdminCommands } from './adminCommands';
import { pruneExpiredCustomQuests } from './customQuests';

function baseState(overrides = {}) {
  return {
    version: 2,
    user: { name: 'Seeker', currentRank: 'E', overallLevel: 0 },
    pillars: {
      deen: { level: 0, xp: 0, streak: 0, activeDebuff: null },
      body: { level: 0, xp: 0, streak: 0, activeDebuff: null },
      money: { level: 0, xp: 0, streak: 0, activeDebuff: null },
    },
    stats: { strength: 10, agility: 10, intelligence: 10, sense: 10, health: 10, mana: 10 },
    gold: 0,
    history: [],
    dailyQuests: [],
    customQuests: [],
    levelQuests: [],
    redemptionQuests: [],
    purchasedRewards: [],
    shadows: [],
    systemMessages: [],
    weeklyDungeons: {},
    aiDungeons: [],
    lastQuestDate: '2026-06-01',
    lastActiveDate: '2026-06-01',
    lastPenaltyCheckDate: '2026-06-01',
    lastUpdated: 1,
    syncRevision: 1,
    ...overrides,
  };
}

describe('date utilities', () => {
  it('uses Asia/Kolkata calendar boundaries', () => {
    expect(getLocalDateString(new Date('2026-05-31T18:29:59.000Z'))).toBe('2026-05-31');
    expect(getLocalDateString(new Date('2026-05-31T18:30:00.000Z'))).toBe('2026-06-01');
  });

  it('iterates System calendar days', () => {
    expect(getDaysBetween('2026-05-30', '2026-06-02')).toEqual(['2026-05-30', '2026-05-31', '2026-06-01']);
  });
});

describe('sync conflict merge', () => {
  it('preserves different quest completions from two devices', () => {
    const current = baseState({
      gold: 5,
      pillars: { ...baseState().pillars, deen: { level: 0, xp: 10, streak: 1, activeDebuff: null } },
      history: [{
        eventId: 'a',
        type: 'daily',
        questId: 'q-a',
        title: 'A',
        pillar: 'deen',
        xp: 10,
        gold: 5,
        localDate: '2026-06-01',
        date: '2026-06-01T04:00:00.000Z',
        completed: true,
      }],
      lastUpdated: 10,
      syncRevision: 2,
    });
    const incoming = baseState({
      gold: 8,
      pillars: { ...baseState().pillars, deen: { level: 0, xp: 20, streak: 1, activeDebuff: null } },
      history: [{
        eventId: 'b',
        type: 'daily',
        questId: 'q-b',
        title: 'B',
        pillar: 'deen',
        xp: 20,
        gold: 8,
        localDate: '2026-06-01',
        date: '2026-06-01T05:00:00.000Z',
        completed: true,
      }],
      lastUpdated: 9,
      syncRevision: 2,
    });

    const merged = mergeStatesForSync(current, incoming);
    expect(merged.history.map(h => h.eventId).sort()).toEqual(['a', 'b']);
    expect(merged.pillars.deen.xp).toBe(30);
    expect(merged.gold).toBe(13);
    expect(merged.syncRevision).toBe(3);
  });
});

describe('custom quest expiry', () => {
  it('removes custom quests after their creation day', () => {
    const quests = [
      {
        id: 'old',
        uniqueId: 'old',
        title: 'Old Quest',
        createdAt: '2026-05-31T05:00:00.000Z',
        createdLocalDate: '2026-05-31',
      },
      {
        id: 'today',
        uniqueId: 'today',
        title: 'Today Quest',
        createdAt: '2026-06-01T05:00:00.000Z',
        createdLocalDate: '2026-06-01',
      },
    ];

    expect(pruneExpiredCustomQuests(quests, '2026-06-01').map(q => q.id)).toEqual(['today']);
  });
});

describe('redemption quests', () => {
  it('stays locked until required work is completed', () => {
    const quest = {
      id: 'redemption-deen',
      pillar: 'deen',
      title: 'Redemption',
      xp: 50,
      isRedemption: true,
      createdAt: '2026-06-01T00:00:00.000Z',
      dailyCompletionsRequired: 1,
    };
    const state = baseState({
      pillars: {
        ...baseState().pillars,
        deen: { level: 0, xp: 0, streak: 0, activeDebuff: { appliedAt: Date.now(), duration: 100000, multiplier: 0.8 } },
      },
      redemptionQuests: [quest],
    });

    expect(getRedemptionProgress(state, quest).ready).toBe(false);
    const locked = completeRedemptionQuest(state, quest.id);
    expect(locked.pillars.deen.activeDebuff).toBeTruthy();
    expect(locked.systemMessages.at(-1).title).toBe('REDEMPTION LOCKED');
  });

  it('clears debuff and awards XP after required work', () => {
    const quest = {
      id: 'redemption-deen',
      pillar: 'deen',
      title: 'Redemption',
      xp: 50,
      isRedemption: true,
      createdAt: '2026-06-01T00:00:00.000Z',
      dailyCompletionsRequired: 1,
    };
    const state = baseState({
      pillars: {
        ...baseState().pillars,
        deen: { level: 0, xp: 0, streak: 0, activeDebuff: { appliedAt: Date.now(), duration: 100000, multiplier: 0.8 } },
      },
      redemptionQuests: [quest],
      history: [{
        eventId: 'daily-1',
        type: 'daily',
        questId: 'q1',
        title: 'Daily',
        pillar: 'deen',
        xp: 10,
        gold: 1,
        date: '2026-06-01T01:00:00.000Z',
        localDate: '2026-06-01',
        completed: true,
      }],
    });

    const result = completeRedemptionQuest(state, quest.id);
    expect(result.pillars.deen.activeDebuff).toBeNull();
    expect(result.pillars.deen.xp).toBe(50);
    expect(result.history.some(h => h.type === 'redemption')).toBe(true);
  });
});

describe('debuffs and AI commands', () => {
  it('treats ISO debuffs with days as active for backwards compatibility', () => {
    expect(isDebuffActive({
      appliedAt: new Date().toISOString(),
      days: 1,
      multiplier: 0.8,
    })).toBe(true);
  });

  it('audits AI mutations without creating reward history', () => {
    const result = executeAdminCommands(baseState(), [{
      type: 'AWARD_XP',
      data: { pillar: 'body', amount: 9999, reason: 'test' },
    }]);

    expect(result.modified).toBe(true);
    expect(result.state.pillars.body.xp).toBe(60);
    const audit = result.state.history.find(h => h.type === 'aiCommand');
    expect(audit).toBeTruthy();
    expect(audit.completed).toBe(false);
    expect(audit.commandType).toBe('AWARD_XP');
  });
});
