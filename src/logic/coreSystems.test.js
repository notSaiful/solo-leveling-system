import { describe, expect, it } from 'vitest';
import { getLocalDateString, getDaysBetween } from '../utils/dateUtils';
import { mergeStatesForSync } from './stateMerge';
import { completeDailyQuest, completeRedemptionQuest, getRedemptionProgress, initializeDailyQuests } from './questEngine';
import { isDebuffActive } from './penalties';
import { executeAdminCommands } from './adminCommands';
import { pruneExpiredCustomQuests } from './customQuests';
import { MISSION_DOCTRINE, getMissionDoctrinePrompt } from '../data/missionDoctrine';
import { getMissionMetrics } from './missionMetrics';
import { getMissionPlan } from './missionPlan';
import { addMissionDailyQuests } from './missionQuestGenerator';
import { addImpactEntryToState, getImpactMetrics } from './ummahImpact';
import { addJusticeResponseToState, containsUnsafeJusticeIntent, getJusticeResponseMetrics } from './justiceResponse';
import { addTeachingEntryToState, getTeachingMetrics } from './teachingPipeline';
import { getForgeMasterSystemPromptForTest } from '../services/aiAssistant';

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
    ummahImpactLedger: [],
    justiceResponseLedger: [],
    teachingPipelineLedger: [],
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

  it('merges Ummah impact ledger entries from different devices', () => {
    const current = baseState({
      ummahImpactLedger: [{ id: 'impact-a', amount: 100, category: 'sadaqah', createdAt: '2026-06-01T01:00:00.000Z' }],
      lastUpdated: 10,
      syncRevision: 2,
    });
    const incoming = baseState({
      ummahImpactLedger: [{ id: 'impact-b', amount: 250, category: 'education', createdAt: '2026-06-01T02:00:00.000Z' }],
      lastUpdated: 9,
      syncRevision: 2,
    });

    const merged = mergeStatesForSync(current, incoming);

    expect(merged.ummahImpactLedger.map(entry => entry.id).sort()).toEqual(['impact-a', 'impact-b']);
  });

  it('merges lawful justice response entries from different devices', () => {
    const current = baseState({
      justiceResponseLedger: [{ id: 'justice-a', actionType: 'evidence', cause: 'A', createdAt: '2026-06-01T01:00:00.000Z' }],
      lastUpdated: 10,
      syncRevision: 2,
    });
    const incoming = baseState({
      justiceResponseLedger: [{ id: 'justice-b', actionType: 'relief', cause: 'B', createdAt: '2026-06-01T02:00:00.000Z' }],
      lastUpdated: 9,
      syncRevision: 2,
    });

    const merged = mergeStatesForSync(current, incoming);

    expect(merged.justiceResponseLedger.map(entry => entry.id).sort()).toEqual(['justice-a', 'justice-b']);
  });

  it('merges teaching pipeline entries from different devices', () => {
    const current = baseState({
      teachingPipelineLedger: [{ id: 'teach-a', title: 'A', topic: 'tauheed', createdAt: '2026-06-01T01:00:00.000Z' }],
      lastUpdated: 10,
      syncRevision: 2,
    });
    const incoming = baseState({
      teachingPipelineLedger: [{ id: 'teach-b', title: 'B', topic: 'seerah', createdAt: '2026-06-01T02:00:00.000Z' }],
      lastUpdated: 9,
      syncRevision: 2,
    });

    const merged = mergeStatesForSync(current, incoming);

    expect(merged.teachingPipelineLedger.map(entry => entry.id).sort()).toEqual(['teach-a', 'teach-b']);
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

describe('mission doctrine and metrics', () => {
  it('defines servant leadership and forbidden deviations', () => {
    const prompt = getMissionDoctrinePrompt();
    expect(MISSION_DOCTRINE.title).toBe('Khalifa Mission');
    expect(prompt).toContain('servant-leader');
    expect(MISSION_DOCTRINE.forbiddenDeviations).toContain('vigilantism');
    expect(MISSION_DOCTRINE.forbiddenDeviations).toContain('unlawful violence');
    expect(MISSION_DOCTRINE.forbiddenDeviations).toContain('arrogance');
  });

  it('derives mission metrics from completed history', () => {
    const metrics = getMissionMetrics([
      {
        type: 'daily',
        title: 'Study seerah and tawheed',
        pillar: 'deen',
        tags: ['seerah', 'tauheed'],
        completed: true,
        localDate: '2026-06-01',
      },
      {
        type: 'custom',
        title: 'Build halal income for sadaqah',
        pillar: 'money',
        tags: ['halal', 'income', 'sadaqah'],
        completed: true,
        localDate: '2026-06-01',
      },
      {
        type: 'custom',
        title: 'Mentor a Muslim student',
        pillar: 'deen',
        tags: ['mentor', 'education'],
        completed: true,
        localDate: '2026-06-01',
      },
    ], '2026-06-01');

    expect(metrics.todayActions).toBe(3);
    expect(metrics.duties.find(d => d.id === 'tauheed').total).toBeGreaterThan(0);
    expect(metrics.duties.find(d => d.id === 'wealth').total).toBeGreaterThan(0);
    expect(metrics.duties.find(d => d.id === 'service').total).toBeGreaterThan(0);
  });

  it('uses stored quest descriptions and tags as mission evidence', () => {
    const metrics = getMissionMetrics([
      {
        type: 'daily',
        title: 'Generic Body Quest',
        description: 'Recovery block after training.',
        pillar: 'body',
        tags: ['sleep', 'nutrition'],
        completed: true,
        localDate: '2026-06-01',
      },
      {
        type: 'custom',
        title: 'Generic Money Quest',
        description: 'Review expenses and set aside sadaqah.',
        pillar: 'money',
        tags: ['budget'],
        completed: true,
        localDate: '2026-06-01',
      },
    ], '2026-06-01');

    expect(metrics.duties.find(d => d.id === 'readiness').total).toBe(1);
    expect(metrics.duties.find(d => d.id === 'wealth').total).toBe(1);
  });

  it('uses explicit mission duty metadata before fuzzy matching', () => {
    const metrics = getMissionMetrics([
      {
        type: 'daily',
        title: 'Plain Task',
        description: 'No matching words here.',
        pillar: 'deen',
        missionDuty: 'family',
        tags: [],
        completed: true,
        localDate: '2026-06-01',
      },
    ], '2026-06-01');

    expect(metrics.duties.find(d => d.id === 'family').total).toBe(1);
  });

  it('adds mission quests for uncovered daily trusts', () => {
    const baseQuests = [
      { id: 'deen', title: 'Study tawheed', description: '', pillar: 'deen', tags: ['tauheed'] },
      { id: 'body', title: 'Train strength', description: '', pillar: 'body', tags: ['strength'] },
      { id: 'money', title: 'Budget review', description: '', pillar: 'money', tags: ['budget'] },
    ];

    const quests = addMissionDailyQuests(baseQuests, 'E', []);
    const missionDuties = quests.filter(q => q.source === 'mission').map(q => q.missionDuty).sort();

    expect(missionDuties).toEqual(['family', 'service']);
    expect(quests.every(q => q.uniqueId || !q.source)).toBe(true);
  });

  it('initializes daily quests with mission coverage', () => {
    const state = baseState({ lastQuestDate: '2026-05-31' });
    const initialized = initializeDailyQuests(state);
    const missionDuties = new Set(initialized.dailyQuests.map(q => q.missionDuty).filter(Boolean));

    expect(initialized.dailyQuests.length).toBeGreaterThan(6);
    expect(missionDuties.has('service')).toBe(true);
    expect(missionDuties.has('family')).toBe(true);
  });

  it('stores quest descriptions and tags in completion history', () => {
    const state = baseState({
      dailyQuests: [
        {
          id: 'recovery-1',
          uniqueId: 'recovery-1-2026-06-01',
          title: 'Recovery Protocol',
          description: 'Sleep and mobility work.',
          pillar: 'body',
          xp: 20,
          baseXp: 20,
          tags: ['sleep', 'mobility'],
          missionDuty: 'readiness',
          completed: false,
        },
      ],
    });

    const next = completeDailyQuest(state, 'recovery-1-2026-06-01');
    const entry = next.history.at(-1);

    expect(entry.description).toBe('Sleep and mobility work.');
    expect(entry.tags).toEqual(['sleep', 'mobility']);
    expect(entry.missionDuty).toBe('readiness');

    const metrics = getMissionMetrics(next.history, entry.localDate);
    expect(metrics.duties.find(d => d.id === 'readiness').today).toBe(1);
  });

  it('injects mission doctrine and guardrails into the Forge-Master prompt', () => {
    const prompt = getForgeMasterSystemPromptForTest(baseState({
      history: [{
        type: 'daily',
        title: 'Study tawheed',
        pillar: 'deen',
        completed: true,
        localDate: '2026-06-01',
        date: '2026-06-01T01:00:00.000Z',
      }],
    }));

    expect(prompt).toContain('KHALIFA MISSION DOCTRINE');
    expect(prompt).toContain('Mission score');
    expect(prompt).toContain('NEVER encourage vigilantism');
    expect(prompt).toContain('unlawful violence');
    expect(prompt).toContain('servant-leadership');
  });

  it('turns mission metrics into a phased operating plan', () => {
    const history = Array.from({ length: 30 }, (_, index) => {
      const pillars = [
        { pillar: 'deen', tags: ['tauheed'] },
        { pillar: 'money', tags: ['budget'] },
        { pillar: 'body', tags: ['sleep'] },
      ];
      const entry = pillars[index % pillars.length];
      return {
        type: 'daily',
        title: `Mission action ${index}`,
        pillar: entry.pillar,
        tags: entry.tags,
        completed: true,
        localDate: index < 3 ? '2026-06-01' : '2026-05-31',
      };
    });

    const plan = getMissionPlan(history, '2026-06-01');

    expect(plan.currentPhase.id).toBe('capacity');
    expect(plan.weeklyFocus.command).toBeTruthy();
    expect(plan.trusts.filter(trust => trust.completedToday)).toHaveLength(3);
    expect(plan.lawfulJusticeProtocol.join(' ')).toContain('lawful');
    expect(plan.lawfulJusticeProtocol.join(' ')).toContain('proportionate');
  });

  it('logs Ummah financial impact as mission evidence', () => {
    const result = addImpactEntryToState(baseState(), {
      amount: 500,
      category: 'education',
      peopleHelped: 2,
      note: 'Books for two students',
    });

    const entry = result.ummahImpactLedger.at(-1);
    const history = result.history.at(-1);
    const impact = getImpactMetrics(result.ummahImpactLedger);
    const metrics = getMissionMetrics(result.history, history.localDate);

    expect(entry.amount).toBe(500);
    expect(entry.category).toBe('education');
    expect(history.type).toBe('ummahImpact');
    expect(history.missionDuty).toBe('wealth');
    expect(impact.totalAmount).toBe(500);
    expect(impact.totalPeopleHelped).toBe(2);
    expect(metrics.duties.find(d => d.id === 'wealth').today).toBe(1);
  });

  it('logs lawful justice response as mission evidence', () => {
    const result = addJusticeResponseToState(baseState(), {
      cause: 'Oppression documentation',
      oppressedGroup: 'Muslim families',
      actionType: 'advocacy',
      channel: 'lawful petition',
      evidenceCount: 3,
      peopleHelped: 5,
      note: 'Verified sources and sent a lawful advocacy brief.',
      guardrailAccepted: true,
    });

    const entry = result.justiceResponseLedger.at(-1);
    const history = result.history.at(-1);
    const justice = getJusticeResponseMetrics(result.justiceResponseLedger);
    const metrics = getMissionMetrics(result.history, history.localDate);

    expect(entry.lawfulOnly).toBe(true);
    expect(entry.actionType).toBe('advocacy');
    expect(history.type).toBe('justiceResponse');
    expect(history.missionDuty).toBe('service');
    expect(justice.totalActions).toBe(1);
    expect(justice.totalEvidence).toBe(3);
    expect(justice.totalPeopleHelped).toBe(5);
    expect(metrics.duties.find(d => d.id === 'service').today).toBe(1);
  });

  it('rejects unsafe justice intent and missing lawful guardrail', () => {
    expect(containsUnsafeJusticeIntent('I plan to attack them tomorrow')).toBe(true);
    expect(() => addJusticeResponseToState(baseState(), {
      actionType: 'advocacy',
      note: 'I plan to attack them tomorrow',
      guardrailAccepted: true,
    })).toThrow(/lawful/i);

    expect(() => addJusticeResponseToState(baseState(), {
      actionType: 'evidence',
      note: 'Verified one report.',
      guardrailAccepted: false,
    })).toThrow(/guardrail/i);
  });

  it('logs source-backed teaching as tauheed mission evidence', () => {
    const result = addTeachingEntryToState(baseState(), {
      title: 'Meaning of La ilaha illa Allah',
      topic: 'tauheed',
      format: 'one-to-one',
      source: 'Quran 47:19 and explanation from reliable teacher',
      audienceCount: 1,
      mentee: 'Younger brother',
      actionStep: 'Repeat the meaning and reject shirk in daily choices.',
      followUp: 'Review tomorrow',
    });

    const entry = result.teachingPipelineLedger.at(-1);
    const history = result.history.at(-1);
    const teaching = getTeachingMetrics(result.teachingPipelineLedger);
    const metrics = getMissionMetrics(result.history, history.localDate);

    expect(entry.sourceBacked).toBe(true);
    expect(entry.topic).toBe('tauheed');
    expect(history.type).toBe('teachingPipeline');
    expect(history.missionDuty).toBe('tauheed');
    expect(teaching.totalLessons).toBe(1);
    expect(teaching.totalAudience).toBe(1);
    expect(teaching.totalMentees).toBe(1);
    expect(metrics.duties.find(d => d.id === 'tauheed').today).toBe(1);
  });

  it('rejects teaching entries without title or source', () => {
    expect(() => addTeachingEntryToState(baseState(), {
      title: '',
      source: 'Quran 112',
    })).toThrow(/title/i);

    expect(() => addTeachingEntryToState(baseState(), {
      title: 'Tauheed reminder',
      source: '',
    })).toThrow(/source/i);
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

  it('preserves quest evidence when the AI force-completes a quest', () => {
    const result = executeAdminCommands(baseState({
      dailyQuests: [{
        id: 'ai-proof',
        uniqueId: 'ai-proof-1',
        title: 'Teach one lesson',
        description: 'Teach a useful deen lesson to someone younger.',
        pillar: 'deen',
        xp: 20,
        tags: ['teaching', 'service'],
        completed: false,
      }],
    }), [{
      type: 'FORCE_COMPLETE_QUEST',
      data: { questId: 'ai-proof-1' },
    }]);

    const completion = result.state.history.find(h => h.questId === 'ai-proof-1' && h.completed);
    expect(completion.description).toContain('deen lesson');
    expect(completion.tags).toEqual(['teaching', 'service']);

    const metrics = getMissionMetrics(result.state.history, completion.localDate);
    expect(metrics.duties.find(d => d.id === 'service').today).toBe(1);
  });
});
