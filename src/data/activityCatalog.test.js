import { describe, expect, it } from 'vitest';
import { UNIT_XP, CATALOG, lookupActivity, getCatalogEntry, promoteActivity } from './activityCatalog';

describe('lookupActivity', () => {
  it('matches "push up" inside "I did 100 push ups" to the pushups key', () => {
    const hit = lookupActivity('I did 100 push ups today');
    expect(hit).not.toBeNull();
    expect(hit.key).toBe('pushups');
    expect(hit.pillar).toBe('body');
  });

  it('matches "prayed Fajr on time" to the fajr key', () => {
    const hit = lookupActivity('prayed Fajr on time');
    expect(hit.key).toBe('fajr');
    expect(hit.pillar).toBe('deen');
  });

  it('returns null for unrelated text', () => {
    expect(lookupActivity('the weather is nice today xyz')).toBeNull();
  });

  it('prefers the longest synonym match', () => {
    expect(lookupActivity('fajr on time').key).toBe('fajr');
    expect(lookupActivity('fajr').key).toBe('fajr');
  });
});

describe('UNIT_XP / CATALOG', () => {
  it('UNIT_XP is 8 and pushups has a fixed baseXp', () => {
    expect(UNIT_XP).toBe(8);
    expect(CATALOG.pushups.baseXp).toBe(15);
    expect(CATALOG.pushups.pillar).toBe('body');
  });
});

describe('promoteActivity', () => {
  it('stores a fixedXp override for a novel activity key', () => {
    const next = promoteActivity({ catalogOverrides: {} }, 'cold-shower', 25);
    expect(next.catalogOverrides['cold-shower'].fixedXp).toBe(25);
  });

  it('preserves existing overrides', () => {
    const next = promoteActivity({ catalogOverrides: { 'a': { fixedXp: 10 } } }, 'b', 20);
    expect(next.catalogOverrides.a.fixedXp).toBe(10);
    expect(next.catalogOverrides.b.fixedXp).toBe(20);
  });
});
