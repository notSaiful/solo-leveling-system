export const RANKS = {
  E: { name: 'Al-Bahith', title: 'The Seeker', minLevel: 0, maxLevel: 10, color: '#7a7a7a' },
  D: { name: 'Al-Mujahid', title: 'The Striver', minLevel: 11, maxLevel: 25, color: '#4CAF50' },
  C: { name: 'Al-Murabit', title: 'The Disciplined', minLevel: 26, maxLevel: 45, color: '#2E7D32' },
  B: { name: 'Al-Alim', title: 'The Scholar', minLevel: 46, maxLevel: 70, color: '#1976D2' },
  A: { name: 'Al-Hadi', title: 'The Guide', minLevel: 71, maxLevel: 99, color: '#FF9800' },
  S: { name: 'Al-Khalifa', title: 'The Caliph', minLevel: 100, maxLevel: Infinity, color: '#FFD700' },
};

export function getRankByLevel(level) {
  for (const [key, rank] of Object.entries(RANKS)) {
    if (level >= rank.minLevel && level <= rank.maxLevel) return { key, ...rank };
  }
  return { key: 'S', ...RANKS.S };
}
