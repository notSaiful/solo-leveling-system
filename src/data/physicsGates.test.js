import { describe, it, expect } from 'vitest';
import { PHYSICS_GATES, getGateForRank, gateToDungeonQuests } from './physicsGates';

describe('physicsGates', () => {
  it('defines one gate per rank E→S', () => {
    expect(PHYSICS_GATES.map(g => g.rank)).toEqual(['E','D','C','B','A','S']);
  });
  it('each gate tests all four tracks', () => {
    for (const g of PHYSICS_GATES) {
      const tracks = g.events.map(e => e.track);
      expect(tracks).toContain('strength');
      expect(tracks).toContain('power');
      expect(tracks).toContain('endurance');
      expect(tracks).toContain('resilience');
    }
  });
  it('getGateForRank returns the matching gate', () => {
    expect(getGateForRank('C').name).toBe('Thermodynamics Gate');
    expect(getGateForRank('S').name).toBe("The Monarch's Apex");
  });
  it('gateToDungeonQuests emits body-pillar quests with stable IDs', () => {
    const quests = gateToDungeonQuests(getGateForRank('E'), 'bodyweight');
    expect(quests.length).toBeGreaterThanOrEqual(3);
    expect(quests.every(q => q.pillar === 'body')).toBe(true);
    expect(quests.every(q => q.id && q.baseXp > 0)).toBe(true);
    const ids = quests.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length); // unique
  });
});