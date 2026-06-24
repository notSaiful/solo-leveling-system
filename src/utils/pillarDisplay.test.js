import { describe, it, expect } from 'vitest';
import { PILLAR_LABELS } from './pillarDisplay';

describe('pillarDisplay', () => {
  it('labels the body pillar as Physical Power', () => {
    expect(PILLAR_LABELS.body).toBe('Physical Power');
    expect(PILLAR_LABELS.deen).toBe('Deen');
    expect(PILLAR_LABELS.money).toBe('Money');
  });
});