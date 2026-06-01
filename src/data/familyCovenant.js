export const FAMILY_ACTIONS = [
  { id: 'worship', label: 'Lead Worship' },
  { id: 'mercy', label: 'Mercy & Patience' },
  { id: 'provision', label: 'Provision' },
  { id: 'teaching', label: 'Teach Home' },
  { id: 'repair', label: 'Apology / Repair' },
  { id: 'presence', label: 'Focused Presence' },
  { id: 'protection', label: 'Lawful Protection' },
  { id: 'example', label: 'Disciplined Example' },
];

export const FAMILY_ACTION_LABELS = FAMILY_ACTIONS.reduce((acc, action) => {
  acc[action.id] = action.label;
  return acc;
}, {});

export const FAMILY_RELATIONS = [
  { id: 'spouse', label: 'Spouse' },
  { id: 'children', label: 'Children' },
  { id: 'parents', label: 'Parents' },
  { id: 'siblings', label: 'Siblings' },
  { id: 'household', label: 'Household' },
  { id: 'future-family', label: 'Future Family' },
  { id: 'ummah-children', label: 'Ummah Children' },
];

export const FAMILY_RELATION_LABELS = FAMILY_RELATIONS.reduce((acc, relation) => {
  acc[relation.id] = relation.label;
  return acc;
}, {});

export const FAMILY_GUARDRAILS = [
  'Lead the home through mercy, worship, service, and disciplined example.',
  'Never frighten, humiliate, threaten, or harm family in the name of leadership.',
  'Repair quickly: apologize, forgive, and correct behavior without ego.',
  'Provision includes money, time, safety, attention, and teaching.',
];
