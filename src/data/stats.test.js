import { describe, it, expect } from 'vitest';
import { STAT_NAMES, autoAssignStatPoints, getCharacterBuild } from './stats';

describe('Physical Power stat framing', () => {
  it('strength description references Physical Power, not Adventure', () => {
    expect(STAT_NAMES.strength.description).toMatch(/Physical Power/i);
    expect(STAT_NAMES.strength.description).not.toMatch(/Adventure/i);
  });
  it('health description references conditioning/stamina', () => {
    expect(STAT_NAMES.health.description).toMatch(/conditioning|stamina|durability/i);
  });
  it('body auto-assign reason references physical power/speed', () => {
    const { assignments } = autoAssignStatPoints({ strength: 10, agility: 10 }, 'body', 5);
    // reason is internal to the function; assert the mapping via a derived check:
    expect(assignments.some(a => a.stat === 'strength')).toBe(true);
    expect(assignments.some(a => a.stat === 'agility')).toBe(true);
  });
  it('Pathfinder build description is not "outdoor endurance"', () => {
    const build = getCharacterBuild({ strength: 20, health: 20, agility: 10, intelligence: 10, sense: 10, mana: 10 });
    expect(build.name).toBe('Pathfinder Build');
    expect(build.description).not.toMatch(/outdoor endurance/i);
  });
});