import { describe, it, expect } from 'vitest';
import { DAILY_QUEST_POOLS } from './questCatalog';

const ROAMING = /roam|wander|trek|expedition|hike|trail|scout|wilderness|explore a new street|step expedition/i;

describe('DAILY_QUEST_POOLS.body (Physical Power)', () => {
  it('every body quest has pillar "body" and positive baseXp', () => {
    for (const rank of ['E','D','C','B','A','S']) {
      for (const q of DAILY_QUEST_POOLS.body[rank]) {
        expect(q.pillar).toBe('body');
        expect(q.baseXp).toBeGreaterThan(0);
        expect(q.id).toBeTruthy();
      }
    }
  });
  it('no roaming/adventure titles remain', () => {
    for (const rank of ['E','D','C','B','A','S']) {
      for (const q of DAILY_QUEST_POOLS.body[rank]) {
        expect(q.title).not.toMatch(ROAMING);
        expect(q.description).not.toMatch(ROAMING);
      }
    }
  });
  it('each rank pool covers all four tracks', () => {
    const trackOf = q => {
      const t = (q.tags || []).join(' ');
      if (/strength|push|pull|squat|lift/.test(t)) return 'strength';
      if (/power|jump|sprint|plyo/.test(t)) return 'power';
      if (/endurance|run|ruck|interval|shuttle/.test(t)) return 'endurance';
      if (/resilience|mobility|core|grip|nutrition|sleep|carry|plank/.test(t)) return 'resilience';
      return null;
    };
    for (const rank of ['E','D','C','B','A','S']) {
      const tracks = new Set(DAILY_QUEST_POOLS.body[rank].map(trackOf).filter(Boolean));
      expect(tracks.has('strength')).toBe(true);
      expect(tracks.has('power')).toBe(true);
      expect(tracks.has('endurance')).toBe(true);
      expect(tracks.has('resilience')).toBe(true);
    }
  });
  it('IDs are unique across all ranks', () => {
    const ids = ['E','D','C','B','A','S'].flatMap(r => DAILY_QUEST_POOLS.body[r].map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});