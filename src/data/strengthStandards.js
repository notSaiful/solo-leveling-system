// Validated benchmark tables for the Physical Power system.
// Barbell standards are multiples of bodyweight (Symmetric Strength / exrx style,
// novice→elite). Indian Army fitness values are recruitment-tier baselines
// (1.6 km run, chin-ups, shuttle) used for the E/D gates. All numbers are
// starting calibrations — Phase 2 autoregulation adapts to actuals.

// Rank → bodyweight multiple for the core barbell lifts (squat, deadlift, press, bench, row).
export const STRENGTH_STANDARDS = {
  // multiples of bodyweight
  squat:    { E: 1.0,  D: 1.25, C: 1.5,  B: 1.75, A: 2.0,  S: 2.0 },
  deadlift: { E: 1.25, D: 1.5,  C: 1.75, B: 2.0,  A: 2.5,  S: 2.75 },
  press:    { E: 0.6,  D: 0.75, C: 0.75, B: 0.9,  A: 1.0,  S: 1.25 },
  bench:    { E: 0.8,  D: 1.0,  C: 1.0,  B: 1.25, A: 1.25, S: 1.5 },
  row:      { E: 0.7,  D: 0.9,  C: 1.0,  B: 1.1,  A: 1.25, S: 1.4 },
};

// Indian Army-style fitness baselines (E/D gates). Times in seconds.
export const INDIAN_ARMY_FITNESS = {
  E: { run1_6km_sec: 540, chinups: 3, shuttle_20m_sec: 9 },   // 9:00, 3 chin-ups
  D: { run1_6km_sec: 450, chinups: 6, shuttle_20m_sec: 8 },   // 7:30, 6 chin-ups
};

// Bodyweight progression ladders (when equipment === 'bodyweight' or 'mixed').
// Each step: { name, minReps } — advance when minReps met.
export const BODYWEIGHT_PROGRESSIONS = {
  pushup: [
    { name: 'Push-up', minReps: 20 },
    { name: 'Diamond Push-up', minReps: 15 },
    { name: 'Archer Push-up', minReps: 10 },
    { name: 'One-arm Push-up', minReps: 5 },
  ],
  squat: [
    { name: 'Bodyweight Squat', minReps: 25 },
    { name: 'Split Squat', minReps: 16 },
    { name: 'Pistol Squat', minReps: 8 },
    { name: 'Shrimp Squat', minReps: 5 },
  ],
  pull: [
    { name: 'Incline Row', minReps: 12 },
    { name: 'Pull-up', minReps: 8 },
    { name: 'Weighted Pull-up (+25% BW)', minReps: 5 },
    { name: 'Muscle-up', minReps: 5 },
  ],
  hinge: [
    { name: 'Glute Bridge', minReps: 20 },
    { name: 'Single-leg RDL', minReps: 12 },
    { name: 'Nordic Curl', minReps: 8 },
    { name: 'Heavy Sandbag Hinge', minReps: 8 },
  ],
};

export function getStrengthStandard(lift, rank, bodyweightKg, equipment) {
  const mult = STRENGTH_STANDARDS[lift]?.[rank];
  if (equipment === 'barbell') {
    return { lift, rank, kg: Math.round((mult || 0) * (bodyweightKg || 0)), milestone: null };
  }
  // bodyweight / mixed / kettlebell — return a progression milestone
  const fam = lift === 'squat' ? 'squat'
    : lift === 'deadlift' || lift === 'row' ? 'hinge' // row maps onto pull family below
      : lift === 'press' || lift === 'bench' ? 'pushup'
        : lift === 'pullup' ? 'pull' : 'squat';
  const family = lift === 'row' ? 'pull' : fam;
  const ladder = BODYWEIGHT_PROGRESSIONS[family] || [];
  const idx = { E: 0, D: 1, C: 2, B: 2, A: 3, S: 3 }[rank] ?? 0;
  const step = ladder[Math.min(idx, ladder.length - 1)];
  return { lift, rank, kg: null, milestone: step?.name || null, minReps: step?.minReps || null };
}

export function getBodyweightMilestone(lift, reps) {
  const family = lift === 'pushup' ? 'pushup'
    : lift === 'squat' ? 'squat'
      : lift === 'pull' || lift === 'pullup' ? 'pull' : 'hinge';
  const ladder = BODYWEIGHT_PROGRESSIONS[family] || [];
  for (const step of ladder) {
    if (reps < step.minReps) return step.name;
  }
  return ladder[ladder.length - 1]?.name;
}