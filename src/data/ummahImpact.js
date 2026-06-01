export const IMPACT_CATEGORIES = [
  { id: 'sadaqah', label: 'Sadaqah' },
  { id: 'zakat', label: 'Zakat' },
  { id: 'education', label: 'Education' },
  { id: 'relief', label: 'Relief' },
  { id: 'livelihood', label: 'Livelihood' },
  { id: 'dawah', label: 'Dawah' },
  { id: 'family-support', label: 'Family Support' },
  { id: 'legal-aid', label: 'Legal Aid' },
];

export const IMPACT_CATEGORY_LABELS = IMPACT_CATEGORIES.reduce((acc, category) => {
  acc[category.id] = category.label;
  return acc;
}, {});
