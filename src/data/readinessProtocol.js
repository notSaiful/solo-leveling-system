export const READINESS_ACTIONS = [
  { id: 'strength', label: 'Strength Training' },
  { id: 'conditioning', label: 'Conditioning' },
  { id: 'mobility', label: 'Mobility / Recovery' },
  { id: 'combat-sport', label: 'Combat Sport' },
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
  'Train to protect innocent life lawfully, never to intimidate or oppress.',
  'Restraint is part of readiness: de-escalate, avoid ego, and obey the law.',
  'Combat practice belongs in lawful sport, coaching, defense training, or controlled drills.',
  'Recovery, sleep, mobility, and first aid are protection capacity too.',
];
