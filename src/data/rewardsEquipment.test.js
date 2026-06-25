import { describe, it, expect } from 'vitest';
import { REWARD_ITEMS } from './rewards';
import { EQUIPMENT_TEMPLATES } from './equipment';

describe('rewards + equipment rethemed', () => {
  it('no reward uses category "adventure"', () => {
    for (const r of REWARD_ITEMS) {
      expect(r.category).not.toBe('adventure');
    }
  });
  it('physical-power rewards exist', () => {
    expect(REWARD_ITEMS.some(r => r.category === 'physical-power')).toBe(true);
  });
  it('no body equipment item is named wanderer-cloak', () => {
    const bodyItems = Object.values(EQUIPMENT_TEMPLATES).filter(e => e.pillar === 'body');
    for (const e of bodyItems) {
      expect(e.name).not.toMatch(/wanderer/i);
    }
  });
});
