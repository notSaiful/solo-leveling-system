import { useEffect, useRef } from 'react';
import { checkAndApplyPenalties } from '../logic/penalties';

export function usePenaltyCheck(state, setState) {
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const today = new Date().toLocaleDateString('en-CA');
    if (state.lastActiveDate === today) return;

    const { penalties, redemptionQuests, updatedPillars } = checkAndApplyPenalties(state);

    if (penalties.length > 0) {
      const messages = penalties.map(p => ({
        type: 'penalty',
        title: p.type === 'missedThreeDays' ? '⚠️ SEVERE PENALTY' : '⚠️ PENALTY APPLIED',
        subtitle: `${p.pillar.toUpperCase()} — ${p.days} day${p.days > 1 ? 's' : ''} missed`,
        message: p.type === 'missedThreeDays'
          ? 'Your shadows grow restless. Complete the Redemption Quest to recover full power.'
          : 'XP gain reduced. Complete daily quests to restore your power.',
      }));

      setState(prev => ({
        ...prev,
        pillars: updatedPillars,
        redemptionQuests: [...prev.redemptionQuests, ...redemptionQuests],
        systemMessages: [...prev.systemMessages, ...messages.map(m => ({ ...m, date: today }))],
        lastActiveDate: today,
      }));
    } else {
      setState(prev => ({ ...prev, lastActiveDate: today }));
    }
  }, []);
}
