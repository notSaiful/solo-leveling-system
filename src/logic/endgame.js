import { getLocalDateString, toLocalDateString } from '../utils/dateUtils';
import { initializeSeerahChain } from '../data/seerahChains';
import { initializeJobChangeGate, completeGateStep, getActiveJobChangeGate } from '../data/jobChangeGates';
import { initializeMonarchTrials, checkMonarchTrialProgress } from './monarchTrials';
import { initializeKhalifateObjectives } from '../data/missionGates';

// The v3 endgame state machine, lifted out of the old log loop so it can be driven
// from quest completion instead. Chains the idempotent initializers (seerah chain,
// job-change gate, monarch trials, khalifate objectives) and auto-advances the
// active job-change gate from today's XP-earning history.
//
// Every initializer guards on "already initialized"; callers wrap the call in
// try/catch so an endgame throw can never crash the quest-completion pipeline
// (the Monday-crash lesson).
//
// History-based checks (autoAdvanceJobGate, checkMonarchTrialProgress) are
// type-agnostic: they count any completed history entry with xp > 0 for today,
// so they advance identically from quest completions (type 'daily'/'custom') as
// they previously did from log entries (type 'log').
export function runEndgameCycle(state, today = getLocalDateString()) {
  let s = state;
  s = initializeSeerahChain(s);
  s = initializeJobChangeGate(s);
  s = initializeMonarchTrials(s);
  s = checkMonarchTrialProgress(s);
  s = initializeKhalifateObjectives(s);
  s = autoAdvanceJobGate(s, today);
  return s;
}

// Auto-advance the active job-change gate by one step per day when today's
// XP-earning history qualifies for the current step's pillar. One step per day
// (guarded by completedAt date). The manual "Complete Step" button in Legion
// remains as an override fallback.
function autoAdvanceJobGate(state, today) {
  const gate = getActiveJobChangeGate(state);
  if (!gate) return state;
  const idx = gate.steps.findIndex((s) => !s.completed);
  if (idx < 0) return state;
  const alreadyToday = gate.steps.some(
    (s) => s.completedAt && toLocalDateString(s.completedAt) === today
  );
  if (alreadyToday) return state;
  const todayLogs = (state.history || []).filter(
    (h) => h.localDate === today && h.completed && (h.xp || 0) > 0
  );
  const stepPillar = gate.steps[idx].pillar;
  const qualifies = stepPillar === 'all'
    ? todayLogs.length >= 1
    : todayLogs.some((h) => h.pillar === stepPillar);
  return qualifies ? completeGateStep(state, gate.gateId, idx) : state;
}