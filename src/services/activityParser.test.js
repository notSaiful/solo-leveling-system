import { describe, expect, it } from 'vitest';
import { parseActivities, safeParseActivities, normalizeActivity } from './activityParser';

describe('safeParseActivities', () => {
  it('parses a clean JSON array', () => {
    expect(safeParseActivities('[{"a":1}]')).toEqual([{ a: 1 }]);
  });
  it('parses JSON wrapped in ```json fences', () => {
    expect(safeParseActivities('```json\n[{"a":1}]\n```')).toEqual([{ a: 1 }]);
  });
  it('parses JSON embedded in surrounding prose', () => {
    expect(safeParseActivities('here you go: [{"x":2}] thanks')).toEqual([{ x: 2 }]);
  });
  it('returns null when no array is present', () => {
    expect(safeParseActivities('no json here')).toBeNull();
    expect(safeParseActivities('')).toBeNull();
  });
});

describe('normalizeActivity', () => {
  it('clamps effortScore, coerces quantity, slugifies the key, defaults pillar', () => {
    const a = normalizeActivity({ pillar: 'body', effortScore: 99, quantity: '10', activityKey: 'Push Ups!!' });
    expect(a).toEqual({ activityKey: 'push-ups', name: 'push-ups', pillar: 'body', quantity: 10, unit: null, effortScore: 10, notes: null });
  });
  it('defaults an invalid pillar to deen and effortScore to 1', () => {
    const a = normalizeActivity({ pillar: 'invalid', effortScore: 0 });
    expect(a.pillar).toBe('deen');
    expect(a.effortScore).toBe(1);
  });
  it('returns null for non-object input', () => {
    expect(normalizeActivity(null)).toBeNull();
    expect(normalizeActivity('hi')).toBeNull();
  });
});

describe('parseActivities — crisis and empty paths (no network)', () => {
  it('returns crisis:true for self-harm input without calling the model', async () => {
    const out = await parseActivities('I want to end my life');
    expect(out.crisis).toBe(true);
    expect(out.activities).toEqual([]);
    expect(typeof out.message).toBe('string');
  });

  it('returns an empty activity list for blank input', async () => {
    const out = await parseActivities('   ');
    expect(out.crisis).toBe(false);
    expect(out.activities).toEqual([]);
  });
});
