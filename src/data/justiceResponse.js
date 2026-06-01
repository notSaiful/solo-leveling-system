export const JUSTICE_ACTION_TYPES = [
  { id: 'evidence', label: 'Verify Evidence', missionDuty: 'service' },
  { id: 'report', label: 'Report Lawfully', missionDuty: 'service' },
  { id: 'relief', label: 'Fund Relief', missionDuty: 'wealth' },
  { id: 'advocacy', label: 'Lawful Advocacy', missionDuty: 'service' },
  { id: 'education', label: 'Educate Truthfully', missionDuty: 'tauheed' },
  { id: 'legal-aid', label: 'Legal Aid', missionDuty: 'service' },
  { id: 'deescalation', label: 'De-escalation Training', missionDuty: 'readiness' },
  { id: 'dua', label: 'Dua & Awareness', missionDuty: 'tauheed' },
];

export const JUSTICE_ACTION_LABELS = JUSTICE_ACTION_TYPES.reduce((acc, action) => {
  acc[action.id] = action.label;
  return acc;
}, {});

export const JUSTICE_ACTION_DUTIES = JUSTICE_ACTION_TYPES.reduce((acc, action) => {
  acc[action.id] = action.missionDuty;
  return acc;
}, {});

export const JUSTICE_GUARDRAILS = [
  'Verify before speaking or sharing.',
  'Use lawful, proportionate, legitimate channels.',
  'No vigilantism, revenge, threats, or unlawful violence.',
  'Turn anger into relief, evidence, advocacy, education, and disciplined preparation.',
];
