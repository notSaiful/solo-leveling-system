import { describe, it, expect } from 'vitest';
import { LEVEL_QUESTS, REDEMPTION_QUEST_TEMPLATES } from './questCatalog';
import { JOB_CHANGE_GATES } from './jobChangeGates';

// Broadened to actually catch the adventure/roaming wording in the source — the
// narrow original missed 'Terrain Penance', 'Adventure discipline', "The Adventurer's Trial".
// 'adventur' covers adventure/adventurer/adventures; 'explor' covers explore/exploring/exploration;
// 'terrain' covers terrain. NOTE: 'training' is SAFE (does not match 'trail').
const ROAMING = /roam|wander|trek|expedition|hike|trail|scout|wilderness|adventur|explor|terrain/i;

describe('body level/story quests rethemed', () => {
  it('no body level-quest title or description contains roaming/adventure wording', () => {
    for (const lq of LEVEL_QUESTS) {
      for (const q of (lq.quests || [])) {
        if (q.pillar !== 'body') continue;
        expect(q.title).not.toMatch(ROAMING);
        expect(q.description).not.toMatch(ROAMING);
      }
    }
  });
  it('job-change gates body steps are retitled to Power', () => {
    const bodySteps = JOB_CHANGE_GATES.flatMap(g => (g.steps || []).filter(s => s.pillar === 'body'));
    expect(bodySteps.length).toBeGreaterThan(0);
    for (const s of bodySteps) {
      expect(s.title).not.toMatch(/adventur/i);
      expect(s.title).toMatch(/power|forge|strength/i);
    }
  });
  it('redemption body sub-quests are rethemed', () => {
    // Templates have NO top-level `pillar` field — the body content lives in their `quests[]` sub-quests.
    const bodyReds = REDEMPTION_QUEST_TEMPLATES.flatMap(t => (t.quests || []).filter(q => q.pillar === 'body'));
    expect(bodyReds.length).toBeGreaterThan(0);
    for (const q of bodyReds) {
      expect(q.title).not.toMatch(ROAMING);
      expect(q.description).not.toMatch(ROAMING);
    }
  });
});