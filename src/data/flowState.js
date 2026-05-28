const FLOW_WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const FLOW_THRESHOLD = 3; // 3 quests in 1 hour to trigger
const FLOW_MULTIPLIER = 1.2; // +20% XP

export function checkFlowState(history) {
  const now = Date.now();
  const recentCompletions = history.filter(h => {
    const hTime = new Date(h.date + 'T' + (h.time || '00:00:00')).getTime();
    return h.completed && (now - hTime) < FLOW_WINDOW_MS;
  });

  if (recentCompletions.length >= FLOW_THRESHOLD) {
    const firstCompletion = Math.min(...recentCompletions.map(h =>
      new Date(h.date + 'T' + (h.time || '00:00:00')).getTime()
    ));
    const expiresAt = firstCompletion + FLOW_WINDOW_MS;

    return {
      active: true,
      multiplier: FLOW_MULTIPLIER,
      expiresAt,
      questsInWindow: recentCompletions.length,
    };
  }

  return { active: false, multiplier: 1, expiresAt: 0, questsInWindow: 0 };
}

export function getFlowStateDisplay(flowState) {
  if (!flowState.active) return null;

  const remaining = Math.max(0, flowState.expiresAt - Date.now());
  const minutes = Math.floor(remaining / 60000);

  return {
    active: true,
    message: `Flow State: +20% XP (${minutes}m remaining)`,
    color: '#4CAF50',
    quests: flowState.questsInWindow,
  };
}
