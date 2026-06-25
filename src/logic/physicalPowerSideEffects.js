import { logLift, advanceBodyweightProgression } from './strengthLog';
import { logProtein, logSleep } from './recovery';

const LIFT_BY_TAG = {
  squat: 'squat',
  deadlift: 'deadlift',
  hinge: 'deadlift',
  press: 'press',
  bench: 'bench',
  push: 'press',
  pull: 'pullup',
  row: 'row',
  pullup: 'pullup'
};

export function applyPhysicalPowerSideEffects(state, quest) {
  if (!quest || quest.pillar !== 'body') return state;
  const tags = quest.tags || [];
  const track = quest.track || '';

  if (track === 'strength' || tags.includes('strength')) {
    const liftKey = tags.map(t => LIFT_BY_TAG[t]).find(Boolean) || 'squat';
    const p = quest.prescribed || {};
    const logged = logLift(state, {
      lift: liftKey,
      sets: p.sets || 3,
      reps: p.reps || 5,
      weight: p.weight || 0,
      rpe: p.rpe ?? null
    });
    return advanceBodyweightProgression(logged, liftKey);
  }
  if (tags.includes('nutrition')) {
    const targetGrams = state.recovery?.proteinTarget || 126;
    return logProtein(state, { grams: targetGrams });
  }
  if (tags.includes('sleep')) {
    return logSleep(state, { hours: 7.5, quality: 85 });
  }
  return state;
}
