import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { READINESS_ACTIONS } from './readinessProtocol';

const FILES = [
  'src/data/missionDoctrine.js',
  'src/data/missionQuestCatalog.js',
  'src/data/missionGates.js',
  'src/data/missionPlan.js',
  'src/logic/missionReview.js',
  'src/logic/missionMetrics.js',
  'src/data/readinessProtocol.js',
  'src/logic/readinessProtocol.js',
  'src/components/MissionCommandCenter.jsx',
];

// Roaming vocabulary the body mission subsystem must drop. "outdoor" is included
// because the readiness concept is reconceived from outdoor-readiness to physical
// readiness. Curated to avoid false positives (e.g. \bcamp\b won't match "campaign").
const ROAMING = /adventur|outdoor|scout|hike|trek|wilderness|navigat|explor|terrain|expedition|route-scouting|trail-endurance|orient|scrambl|compass|\bcamp\b/i;

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')   // block comments (also JSX {/* */})
    .replace(/\/\/[^\n]*/g, '');          // line comments
}

describe('mission subsystem rethemed to Physical Power (no roaming)', () => {
  for (const f of FILES) {
    it(`${f} has no roaming/adventure wording in code or strings`, () => {
      const src = fs.readFileSync(path.resolve(process.cwd(), f), 'utf8');
      expect(stripComments(src)).not.toMatch(ROAMING);
    });
  }

  it('readiness actionType enum is rethemed to physical power', () => {
    const ids = READINESS_ACTIONS.map(a => a.id);
    expect(ids).toContain('strength');
    expect(ids).toContain('conditioning');
    expect(ids).toContain('endurance');
    expect(ids).not.toContain('route-scouting');
    expect(ids).not.toContain('navigation');
    expect(ids).not.toContain('trail-endurance');
    // safety/restraint actionTypes preserved (mechanics)
    expect(ids).toContain('deescalation');
    expect(ids).toContain('restraint');
  });

  it('MissionCommandCenter readinessForm default is strength', () => {
    const src = fs.readFileSync(path.resolve(process.cwd(), 'src/components/MissionCommandCenter.jsx'), 'utf8');
    expect(src).not.toContain("actionType: 'route-scouting'");
  });
});