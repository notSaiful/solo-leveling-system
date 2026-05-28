import { useState, useEffect, useRef } from 'react';
import { getRankByLevel } from '../data/ranks';

export function useLevelUp(state) {
  const [notification, setNotification] = useState(null);
  const prevLevel = useRef(state.user.overallLevel);
  const prevRank = useRef(state.user.currentRank);
  const prevMsgCount = useRef(state.systemMessages.length);

  useEffect(() => {
    const currentRank = getRankByLevel(state.user.overallLevel);

    // Check for level/rank up
    if (state.user.overallLevel > prevLevel.current) {
      if (currentRank.key !== prevRank.current) {
        setNotification({
          type: 'rankUp',
          title: `RANK UP! ${currentRank.key}-Rank`,
          subtitle: `${currentRank.name} — ${currentRank.title}`,
          message: 'Your power has awakened. New quests and shadows are now available.',
        });
      } else {
        setNotification({
          type: 'levelUp',
          title: `LEVEL UP! ${state.user.overallLevel}`,
          subtitle: 'Your strength grows...',
          message: 'Keep grinding. The next rank is within reach.',
        });
      }
    }

    // Check for new penalty messages
    if (state.systemMessages.length > prevMsgCount.current) {
      const newMessages = state.systemMessages.slice(prevMsgCount.current);
      const penaltyMsg = newMessages.find(m => m.type === 'penalty');
      if (penaltyMsg) {
        setNotification({
          type: 'penalty',
          title: penaltyMsg.title,
          subtitle: penaltyMsg.subtitle,
          message: penaltyMsg.message,
        });
      }
    }

    prevLevel.current = state.user.overallLevel;
    prevRank.current = currentRank.key;
    prevMsgCount.current = state.systemMessages.length;
  }, [state.user.overallLevel, state.systemMessages.length]);

  const dismiss = () => setNotification(null);

  return { notification, dismiss };
}
