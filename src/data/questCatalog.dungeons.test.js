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
});