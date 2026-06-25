import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import PowerLog from './PowerLog';

describe('PowerLog', () => {
  it('renders to static markup without throwing', () => {
    const state = {
      strengthLog: { bodyweightKg: null, baselineTested: false, lifts: {} },
      physicalPower: { equipment: null }
    };
    const html = renderToStaticMarkup(<PowerLog state={state} setState={() => {}} />);
    expect(html).toMatch(/Physical Power/i);
  });
  it('shows the baseline/equipment prompt when equipment is null', () => {
    const state = {
      strengthLog: { bodyweightKg: null, baselineTested: false, lifts: {} },
      physicalPower: { equipment: null }
    };
    const html = renderToStaticMarkup(<PowerLog state={state} setState={() => {}} />);
    expect(html).toMatch(/equipment|barbell|bodyweight/i);
  });
  it('after baseline, shows the lift log UI', () => {
    const state = {
      strengthLog: { bodyweightKg: 70, baselineTested: true, lifts: { squat: { trainingMax: 60, history: [], lastTested: '2026-06-24', milestone: null } } },
      physicalPower: { equipment: 'barbell' }
    };
    const html = renderToStaticMarkup(<PowerLog state={state} setState={() => {}} />);
    expect(html).toMatch(/squat/i);
    expect(html).toMatch(/60/); // training max shown
  });
});
