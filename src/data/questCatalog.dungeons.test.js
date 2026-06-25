import { describe, it, expect } from 'vitest';
import { WEEKLY_DUNGEON_TEMPLATES } from './questCatalog';
import { getGateForRank } from './physicsGates';

const ROAMING = /seeker's trail|explorer's gate|pathfinder's trial|trailblazer|expedition|monarch's wilderness|sovereign's expedition|divine crucible/i;

describe('body weekly dungeons = Physics Gates', () => {
  it('no adventure dungeon names remain for body', () => {
    for (const rank of ['E','D','C','B','A','S']) {
      const body = WEEKLY_DUNGEON_TEMPLATES[rank]?.body || WEEKLY_DUNGEON_TEMPLATES.body?.[rank];
      const text = JSON.stringify(body || {});
      expect(text).not.toMatch(ROAMING);
    }
  });
  it('body dungeon for each rank matches the Physics Gate name', () => {
    for (const rank of ['E','D','C','B','A','S']) {
      const body = WEEKLY_DUNGEON_TEMPLATES[rank]?.body || WEEKLY_DUNGEON_TEMPLATES.body?.[rank];
      const gate = getGateForRank(rank);
      expect(JSON.stringify(body)).toContain(gate.name);
    }
  });
  it('S_II and S_III body (final tiers) are rethemed to physical power with valid shape', () => {
    for (const rank of ['S_II', 'S_III']) {
      const body = WEEKLY_DUNGEON_TEMPLATES[rank]?.body || WEEKLY_DUNGEON_TEMPLATES.body?.[rank];
      expect(body, `${rank} body entry must exist`).toBeDefined();
      expect(JSON.stringify(body)).not.toMatch(ROAMING);
      expect(Array.isArray(body.steps)).toBe(true);
      expect(body.steps.length).toBeGreaterThanOrEqual(3);
      expect(body.steps.every(s => typeof s === 'string')).toBe(true);
      expect(typeof body.title).toBe('string');
      expect(typeof body.description).toBe('string');
      expect(typeof body.xp).toBe('number');
    }
    expect(WEEKLY_DUNGEON_TEMPLATES.S_II.body.xp).toBe(2500);
    expect(WEEKLY_DUNGEON_TEMPLATES.S_III.body.xp).toBe(5000);
  });
});
