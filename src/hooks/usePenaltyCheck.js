import { useEffect, useRef } from 'react';
import { checkAndApplyPenalties } from '../logic/penalties';
import { getLocalDateString } from '../utils/dateUtils';
import { getPillarDisplayKey } from '../utils/pillarDisplay';
import { updateDurability } from '../data/equipment';

export function usePenaltyCheck(state, setState, enabled = true) {
  const hasChecked = useRef(false);
  const stateRef = useRef(state);

  // Keep ref in sync with latest state so interval/visibility handlers see fresh data
  stateRef.current = state;

  useEffect(() => {
    if (!enabled) return;

    const runPenaltyCheck = () => {
      const currentState = stateRef.current;
      const today = getLocalDateString();

      // Skip if we already checked today
      if (currentState.lastPenaltyCheckDate === today && hasChecked.current) {
        return;
      }

      const result = checkAndApplyPenalties(currentState);

      // Always update lastPenaltyCheckDate so we don't re-check
      if (result.lastPenaltyCheckDate) {
        hasChecked.current = true;
      }

      // Build brutal, specific system messages for penalties
      const messages = [];
      if (result.penalties.length > 0) {
        for (const p of result.penalties) {
          const isSevere = p.type === 'missedThreeDays';
          const isDungeon = p.type === 'missedDungeon';
          const isExtreme = p.type === 'extreme';
          const pillarName = getPillarDisplayKey(p.pillar);
          const scaled = p.scaled || {};

          if (isExtreme && p.message) {
            messages.push(p.message);
            continue;
          }

          let title = isSevere
            ? '🔥 SEVERE PENALTY EXECUTED'
            : isDungeon
            ? '⚔️ DUNGEON PENALTY EXECUTED'
            : '⚡ PENALTY EXECUTED';

          let subtitle = isDungeon
            ? `${pillarName} — Weekly dungeon abandoned`
            : `${pillarName} — ${p.days} day${p.days > 1 ? 's' : ''} of silence`;

          // Build the actual impact message with real numbers
          const xpLossPercent = scaled.xpLossPercent
            ? Math.round(scaled.xpLossPercent * 100)
            : (isSevere ? 20 : isDungeon ? 10 : 5);
          const multiplierLoss = scaled.multiplier
            ? Math.round((1 - scaled.multiplier) * 100)
            : (isSevere ? 20 : isDungeon ? 10 : 5);
          const durationHours = scaled.duration
            ? Math.round(scaled.duration / (60 * 60 * 1000))
            : (isSevere ? 72 : isDungeon ? 168 : 24);

          let impactLines = [];
          if (p.xpLoss > 0) {
            impactLines.push(`• XP SEIZED: -${p.xpLoss} XP (${xpLossPercent}% of your ${p.xpBefore} XP)`);
          }
          if (p.levelDropped) {
            impactLines.push(`• LEVEL DROPPED: ${p.oldLevel} → ${p.newLevel}. The System does not keep the unworthy.`);
          }
          impactLines.push(`• STREAK SHATTERED: Reset to 0. Your consistency was a lie.`);
          if (!isDungeon) {
            impactLines.push(`• FUTURE XP GAIN: Reduced by ${multiplierLoss}% for ${durationHours} hours.`);
          } else {
            impactLines.push(`• FUTURE XP GAIN: Reduced by ${multiplierLoss}% for ${durationHours} hours. Shadow soldiers demand blood.`);
          }
          if (p.rankKey && p.rankKey !== 'E') {
            impactLines.push(`• RANK MULTIPLIER: ${p.rankKey}-Rank penalty scaling active.`);
          }

          let closing = isSevere
            ? `Complete the Redemption Quest to recover. Until then, you are weaker than when you started.`
            : isDungeon
            ? `The dungeon does not wait. It devours those who abandon it.`
            : `The System takes what you failed to earn. Get back to work.`;

          const message = `${impactLines.join('\n')}\n\n${closing}`;

          messages.push({ type: 'penalty', title, subtitle, message });
        }
      }

      // Clean completed redemption quests
      const cleanedRedemptionQuests = currentState.redemptionQuests.filter(rq => !rq.completed);

      // Strip transient _penaltyMeta from pillars before saving
      const cleanPillars = {};
      for (const p of ['deen', 'body', 'money']) {
        const pillar = result.updatedPillars[p];
        if (pillar) {
          const { _penaltyMeta, ...rest } = pillar;
          cleanPillars[p] = rest;
        } else {
          cleanPillars[p] = pillar;
        }
      }

      const hasMissedDaily = result.penalties.some(p => p.type === 'missedDaily' || p.type === 'missedThreeDays');

      if (result.penalties.length > 0 || result.dungeonPenalty || cleanedRedemptionQuests.length !== currentState.redemptionQuests.length) {
        setState(prev => {
          const durState = hasMissedDaily ? updateDurability(prev, true, false) : prev;
          return {
            ...durState,
            pillars: cleanPillars,
            failureStreaks: result.updatedFailureStreaks || durState.failureStreaks,
            redemptionQuests: [...cleanedRedemptionQuests, ...result.redemptionQuests],
            systemMessages: [...durState.systemMessages, ...messages.map(m => ({ ...m, date: today }))],
            lastPenaltyCheckDate: result.lastPenaltyCheckDate || today,
          };
        });
      } else {
        setState(prev => {
          const durState = hasMissedDaily ? updateDurability(prev, true, false) : prev;
          return {
            ...durState,
            failureStreaks: result.updatedFailureStreaks || durState.failureStreaks,
            lastPenaltyCheckDate: result.lastPenaltyCheckDate || today,
          };
        });
      }
    };

    // Run immediately on mount
    runPenaltyCheck();

    // Periodic check every 60 seconds to catch midnight crossing
    const interval = setInterval(() => {
      const today = getLocalDateString();
      if (stateRef.current.lastPenaltyCheckDate !== today) {
        runPenaltyCheck();
      }
    }, 60000);

    // Also check when app becomes visible again (user returns from background)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const today = getLocalDateString();
        if (stateRef.current.lastPenaltyCheckDate !== today) {
          runPenaltyCheck();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
