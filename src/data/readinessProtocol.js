export const READINESS_ACTIONS = [
  { id: 'route-scouting', label: 'Route Scouting' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'trail-endurance', label: 'Trail Endurance' },
  { id: 'mobility', label: 'Mobility / Recovery' },
  { id: 'deescalation', label: 'De-escalation Drill' },
  { id: 'first-aid', label: 'First Aid' },
  { id: 'situational-awareness', label: 'Awareness Drill' },
  { id: 'restraint', label: 'Restraint Practice' },
];

export const READINESS_ACTION_LABELS = READINESS_ACTIONS.reduce((acc, action) => {
  acc[action.id] = action.label;
  return acc;
}, {});

export const READINESS_INTENSITIES = [
  { id: 'low', label: 'Low' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'hard', label: 'Hard' },
  { id: 'max', label: 'Max' },
];

export const READINESS_INTENSITY_LABELS = READINESS_INTENSITIES.reduce((acc, intensity) => {
  acc[intensity.id] = intensity.label;
  return acc;
}, {});

export const READINESS_GUARDRAILS = [
  'Adventure readiness exists to serve, guide, and protect innocent life lawfully.',
  'Restraint is part of readiness: de-escalate, avoid ego, and obey the law.',
  'Route scouting, navigation, first aid, and awareness matter more than ego.',
  'Recovery, sleep, mobility, and hydration are Adventure capacity too.',
];
