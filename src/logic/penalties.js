export function checkStreakBreak(history, pillar, date) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toLocaleDateString('en-CA');
  const hadQuestYesterday = history.some(h => {
    const hDate = h.date ? new Date(h.date).toLocaleDateString('en-CA') : '';
    return hDate.startsWith(yStr) && h.pillar === pillar && h.completed;
  });
  return !hadQuestYesterday;
}

export function getMissedDays(lastActiveDate) {
  const last = new Date(lastActiveDate);
  const today = new Date();
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today - last;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays - 1); // -1 because we don't count today if just opened
}

export function applyPenalty(pillarState, penaltyType) {
  const debuffs = {
    missedDaily: { type: 'missedDaily', multiplier: 0.95, duration: 24 * 60 * 60 * 1000, message: 'You missed a daily quest. XP gain reduced by 5%.' },
    missedThreeDays: { type: 'missedThreeDays', multiplier: 0.80, duration: 3 * 24 * 60 * 60 * 1000, message: 'You missed 3 days in a row. Complete the Redemption Quest to recover.' },
    missedDungeon: { type: 'missedDungeon', multiplier: 0.90, duration: 7 * 24 * 60 * 60 * 1000, message: 'You missed a weekly dungeon. Shadow soldiers weakened.' },
  };
  return { ...pillarState, activeDebuff: { ...debuffs[penaltyType], appliedAt: Date.now() } };
}

export function isDebuffActive(debuff) {
  if (!debuff) return false;
  return (Date.now() - debuff.appliedAt) < debuff.duration;
}

export function getEffectiveXp(baseXp, pillarState) {
  if (!isDebuffActive(pillarState.activeDebuff)) return baseXp;
  return Math.floor(baseXp * pillarState.activeDebuff.multiplier);
}

export function getRedemptionQuest(pillar) {
  return {
    id: `redemption-${pillar}-${Date.now()}`,
    pillar,
    title: `Redemption: ${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Recovery`,
    xp: 50,
    isRedemption: true,
    description: `Complete all daily quests for ${pillar} to clear your debuff.`,
  };
}

export function checkAndApplyPenalties(state) {
  const today = new Date().toLocaleDateString('en-CA');
  const missedDays = getMissedDays(state.lastActiveDate);

  if (missedDays === 0) return { penalties: [], redemptionQuests: [], updatedPillars: state.pillars };

  const penalties = [];
  const redemptionQuests = [];
  const updatedPillars = { ...state.pillars };

  for (const pillar of ['deen', 'body', 'money']) {
    const pillarState = updatedPillars[pillar];

    if (missedDays >= 3) {
      // Severe penalty
      updatedPillars[pillar] = applyPenalty(pillarState, 'missedThreeDays');
      penalties.push({ pillar, type: 'missedThreeDays', days: missedDays });
      redemptionQuests.push(getRedemptionQuest(pillar));
    } else if (missedDays >= 1) {
      // Light penalty
      updatedPillars[pillar] = applyPenalty(pillarState, 'missedDaily');
      penalties.push({ pillar, type: 'missedDaily', days: missedDays });
    }

    // Reset streak on any miss
    updatedPillars[pillar] = { ...updatedPillars[pillar], streak: 0 };
  }

  return { penalties, redemptionQuests, updatedPillars };
}
