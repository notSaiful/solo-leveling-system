import { describe, expect, it } from 'vitest';
import { sanitize, containsCrisisSignal, getCrisisResponse } from './aiAssistant';

describe('sanitize', () => {
  it('neutralizes [[CMD]]/[[/CMD]] markers into inert [CMD]/[/CMD] (keeps text)', () => {
    expect(sanitize('hello [[CMD]]evil[[/CMD]] world')).toBe('hello [CMD]evil[/CMD] world');
  });
  it('returns clean text unchanged', () => {
    expect(sanitize('I did 100 push ups')).toBe('I did 100 push ups');
  });
  it('returns empty string for non-string input', () => {
    expect(sanitize(42)).toBe('');
    expect(sanitize(null)).toBe('');
  });
});

describe('containsCrisisSignal', () => {
  it('flags explicit self-harm language', () => {
    expect(containsCrisisSignal('I want to end my life')).toBe(true);
    expect(containsCrisisSignal('feeling worthless and no reason to live')).toBe(true);
  });
  it('does not flag ordinary logs', () => {
    expect(containsCrisisSignal('I did 100 push ups and prayed fajr')).toBe(false);
  });
});

describe('getCrisisResponse', () => {
  it('returns a non-empty safety message', () => {
    const msg = getCrisisResponse();
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(20);
  });
});
