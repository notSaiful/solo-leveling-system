/** ============================================================
 *  UMMAH BURDEN METER
 *  ============================================================
 *  Tracks financial stewardship toward family, community, and Ummah.
 *  Score = (familySupported * 10) + (zakatPaid * 5) +
 *          (sadaqahJariyah * 3) + (muslimVentures * 20)
 *  ============================================================ */

export function calculateUmmahBurden(ummahBurden) {
  const { familySupported, zakatPaid, sadaqahJariyah, muslimVentures } = ummahBurden || {};
  return (familySupported * 10) + (zakatPaid * 5) + (sadaqahJariyah * 3) + (muslimVentures * 20);
}

export const UMMAH_MILESTONES = [
  { score: 100, label: 'Household Secured', color: '#22d3ee' },
  { score: 500, label: 'Extended Family Supported', color: '#60a5fa' },
  { score: 1000, label: 'Community Impact', color: '#c084fc' },
  { score: 5000, label: 'Ummah Burden Bearer', color: '#fb923c' },
  { score: 10000, label: 'Khalifa-Level Stewardship', color: '#facc15' },
];

export function getCurrentMilestone(score) {
  const passed = UMMAH_MILESTONES.filter(m => score >= m.score);
  return passed[passed.length - 1] || null;
}

export function getNextMilestone(score) {
  return UMMAH_MILESTONES.find(m => score < m.score) || null;
}
