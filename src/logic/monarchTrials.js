/** ============================================================
 *  MONARCH ASCENSION TRIALS
 *  ============================================================
 *  After S-rank (level 76+), trials begin.
 *  Final trial: 40 days complete mastery.
 *  Success unlocks Ummah Command mode.
 *  ============================================================ */

export const MONARCH_STAGES = [
  { stage: 1, levelRange: [76, 85], name: 'Financial Capacity', description: 'Can you support the Ummah without strain?' },
  { stage: 2, levelRange: [86, 95], name: 'Adventure Capacity', description: 'Can you serve others without exhaustion?' },
  { stage: 3, levelRange: [96, 99], name: 'Knowledge Capacity', description: 'Can you teach and lead?' },
  { stage: 4, levelRange: [100, 100], name: 'The Final Trial', description: '40 days of complete system mastery. Zero misses.' },
];

export function initializeMonarchTrials(state) {
  if (state.user.overallLevel < 76) return state;
  if (state.monarchTrials.active || state.monarchTrials.completedAt) return state;

  const stageDef = MONARCH_STAGES.find(s =>
    state.user.overallLevel >= s.levelRange[0] && state.user.overallLevel <= s.levelRange[1]
  );
  if (!stageDef) return state;

  return {
    ...state,
    monarchTrials: {
      active: true,
      stage: stageDef.stage,
      startedAt: new Date().toISOString(),
      completedAt: null,
    },
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'rankUp',
        title: 'MONARCH TRIAL BEGINS',
        subtitle: stageDef.name,
        message: `${stageDef.description} The final ascension has begun.`,
      },
    ],
  };
}

export function checkMonarchTrialProgress(state) {
  if (!state.monarchTrials.active) return state;

  const trial = state.monarchTrials;

  // Stages 1-3: auto-complete when level reaches top of range
  if (trial.stage < 4) {
    const stageDef = MONARCH_STAGES.find(s => s.stage === trial.stage);
    if (stageDef && state.user.overallLevel >= stageDef.levelRange[1]) {
      return advanceMonarchStage(state);
    }
    return state;
  }

  // Stage 4: 40 days of complete mastery
  const daysSinceStart = Math.floor(
    (Date.now() - new Date(trial.startedAt).getTime()) / (24 * 60 * 60 * 1000)
  );
  if (daysSinceStart >= 40) {
    const last40Days = getLastNDays(40);
    const allDaysPerfect = last40Days.every(day => {
      const dayCompletions = (state.history || []).filter(h => {
        const hDate = h.localDate || (h.date ? new Date(h.date).toLocaleDateString('en-CA') : '');
        return hDate === day && h.completed;
      });
      return dayCompletions.length >= 3; // All 3 pillars
    });
    if (allDaysPerfect) {
      return completeMonarchAscension(state);
    }
  }
  return state;
}

function advanceMonarchStage(state) {
  const nextStage = state.monarchTrials.stage + 1;
  const stageDef = MONARCH_STAGES.find(s => s.stage === nextStage);
  return {
    ...state,
    monarchTrials: { ...state.monarchTrials, stage: nextStage },
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'rankUp',
        title: `MONARCH STAGE ${nextStage}`,
        subtitle: stageDef?.name || 'The Final Trial',
        message: 'You advance. The trial deepens.',
      },
    ],
  };
}

function completeMonarchAscension(state) {
  return {
    ...state,
    monarchTrials: { ...state.monarchTrials, active: false, completedAt: new Date().toISOString() },
    ummahCommand: { unlocked: true, linkedMembers: [] },
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'rankUp',
        title: 'UMMAH COMMAND UNLOCKED',
        subtitle: 'You are the Shadow Monarch.',
        message: 'Your quests now generate linked quests for family members you invite. The Ummah is your responsibility.',
      },
    ],
  };
}

function getLastNDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-CA'));
  }
  return days;
}

export function isMonarchTrialActive(state) {
  return state.monarchTrials?.active || false;
}

export function isUmmahCommandUnlocked(state) {
  return state.ummahCommand?.unlocked || false;
}
