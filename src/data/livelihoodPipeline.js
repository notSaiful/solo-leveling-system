export const LIVELIHOOD_ACTIONS = [
  { id: 'skill-training', label: 'Skill Training' },
  { id: 'job-referral', label: 'Job Referral' },
  { id: 'business-setup', label: 'Business Setup' },
  { id: 'client-lead', label: 'Client Lead' },
  { id: 'tool-access', label: 'Tool Access' },
  { id: 'portfolio-review', label: 'Portfolio Review' },
  { id: 'mentorship', label: 'Mentorship' },
  { id: 'livelihood-grant', label: 'Livelihood Grant' },
];

export const LIVELIHOOD_ACTION_LABELS = LIVELIHOOD_ACTIONS.reduce((acc, action) => {
  acc[action.id] = action.label;
  return acc;
}, {});

export const LIVELIHOOD_OUTCOMES = [
  { id: 'planned', label: 'Plan Made' },
  { id: 'learning', label: 'Learning' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'earning', label: 'Earning' },
  { id: 'placed', label: 'Placed' },
  { id: 'business-started', label: 'Business Started' },
  { id: 'follow-up-needed', label: 'Follow-up Needed' },
];

export const LIVELIHOOD_OUTCOME_LABELS = LIVELIHOOD_OUTCOMES.reduce((acc, outcome) => {
  acc[outcome.id] = outcome.label;
  return acc;
}, {});

export const LIVELIHOOD_GUARDRAILS = [
  'Livelihood help must be halal, lawful, and dignity-preserving.',
  'Strengthen capability: skills, clients, jobs, tools, business systems, and follow-up.',
  'Do not create dependency where training, ownership, or earning capacity is possible.',
  'Track outcomes honestly: learning, earning, placement, business start, or follow-up needed.',
];
