import { BODYWEIGHT_PROGRESSIONS } from '../data/strengthStandards';
import { getLocalDateString } from '../utils/dateUtils';

// Epley 1RM estimate.
export function estimateOneRepMax(weight, reps) {
  if (!weight || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function recomputeTrainingMax(liftState, { weight, reps }) {
  const oneRepMax = estimateOneRepMax(weight, reps);
  // Training max = 90% of estimated 1RM (5/3/1 convention).
  const trainingMax = Math.round(oneRepMax * 0.9);
  return { ...liftState, trainingMax, lastTested: getLocalDateString() };
}

// Append a session. entry: { lift, date?, sets, reps, weight, rpe? }
export function logLift(state, entry) {
  const log = state.strengthLog || {};
  const liftState = log.lifts?.[entry.lift] || { trainingMax: 0, history: [], lastTested: null };
  const history = [...(liftState.history || []), {
    date: entry.date || getLocalDateString(),
    sets: entry.sets,
    reps: entry.reps,
    weight: entry.weight,
    rpe: entry.rpe ?? null,
  }];
  return {
    ...state,
    strengthLog: {
      ...log,
      lifts: {
        ...(log.lifts || {}),
        [entry.lift]: { ...liftState, history },
      },
    },
  };
}

// Did the last session hit the target reps at acceptable RPE? (Phase 1 simple linear)
export function progressiveOverload(state, lift) {
  const hist = state.strengthLog?.lifts?.[lift]?.history || [];
  if (!hist.length) return false;
  const last = hist[hist.length - 1];
  return last.reps >= 5 && (last.rpe == null || last.rpe <= 8);
}

// Prescribe the next session: 3×5 at 80% of training max (Phase 1 linear core).
export function nextSessionLoad(state, lift) {
  const tm = state.strengthLog?.lifts?.[lift]?.trainingMax || 0;
  return { kg: Math.round(tm * 0.8), sets: 3, reps: 5, pct: 0.8 };
}

// Advance the bodyweight progression ladder when reps meet the next milestone.
// `milestone` = the step currently being worked TOWARD (undefined = working toward
// ladder[0]). When a logged session meets that step's minReps, graduate it and point
// milestone at the next step (or keep the final step once all are graduated).
const FAMILY_BY_LIFT = { pullup: 'pull', row: 'pull', press: 'pushup', bench: 'pushup', squat: 'squat', deadlift: 'hinge' };

function setLiftMilestone(state, lift, liftState, milestone) {
  return {
    ...state,
    strengthLog: {
      ...state.strengthLog,
      lifts: { ...(state.strengthLog?.lifts || {}), [lift]: { ...liftState, milestone } },
    },
  };
}

export function advanceBodyweightProgression(state, lift) {
  if (state.physicalPower?.equipment === 'barbell') return state;
  const family = FAMILY_BY_LIFT[lift];
  const ladder = BODYWEIGHT_PROGRESSIONS[family] || [];
  if (!ladder.length) return state;
  const liftState = state.strengthLog?.lifts?.[lift] || { trainingMax: 0, history: [], lastTested: null };
  const currentIdx = ladder.findIndex(s => s.name === liftState.milestone); // -1 when milestone unset
  const last = (liftState.history || []).at(-1);
  // The step currently being worked toward is one past the last achieved (ladder[0] if none).
  const targetIdx = currentIdx + 1;
  const target = ladder[targetIdx];
  if (!last) {
    // No sessions yet: if no milestone is set, seed it to the first step.
    return liftState.milestone == null && target ? setLiftMilestone(state, lift, liftState, target.name) : state;
  }
  if (target && last.reps >= target.minReps) {
    // Graduated `target` → work toward the next step, or stay at the final step once reached.
    const nextTarget = ladder[targetIdx + 1];
    return setLiftMilestone(state, lift, liftState, nextTarget ? nextTarget.name : target.name);
  }
  // Haven't met the target yet — ensure milestone points at the current target.
  if (liftState.milestone == null && target) return setLiftMilestone(state, lift, liftState, target.name);
  return state;
}