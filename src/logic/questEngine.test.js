import { describe, it, expect } from 'vitest';
import { normalizeCustomQuestPillar } from './questEngine';

describe('normalizeCustomQuestPillar', () => {
  it('collapses body aliases to "body"', () => {
    expect(normalizeCustomQuestPillar('body')).toBe('body');
    expect(normalizeCustomQuestPillar('adventure')).toBe('body');
    expect(normalizeCustomQuestPillar('readiness')).toBe('body');
    expect(normalizeCustomQuestPillar('power')).toBe('body');
    expect(normalizeCustomQuestPillar('physical')).toBe('body');
    expect(normalizeCustomQuestPillar('fitness')).toBe('body');
  });
  it('leaves other pillars untouched', () => {
    expect(normalizeCustomQuestPillar('deen')).toBe('deen');
    expect(normalizeCustomQuestPillar('money')).toBe('money');
  });
});