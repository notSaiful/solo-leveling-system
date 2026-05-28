import { useState, useEffect, useRef } from 'react';
import { getRankByLevel } from '../data/questCatalog';

export function useLevelUp(state) {
  const [notification, setNotification] = useState(null);
  const prevLevel = useRef(state.user.overallLevel);
  const prevRank = useRef(state.user.currentRank);
  const prevMsgKey = useRef('');

  useEffect(() => {
    const currentRank = getRankByLevel(state.user.overallLevel);

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

    // Check for new system messages using a content hash instead of length
    const lastMsg = state.systemMessages[state.systemMessages.length - 1];
    const msgKey = lastMsg ? `${lastMsg.type}:${lastMsg.title}:${lastMsg.subtitle}` : '';
    if (msgKey && msgKey !== prevMsgKey.current) {
      prevMsgKey.current = msgKey;
      if (lastMsg.type === 'penalty' || lastMsg.type === 'reward') {
        setNotification({
          type: lastMsg.type,
          title: lastMsg.title,
          subtitle: lastMsg.subtitle,
          message: lastMsg.message,
        });
      }
    }

    prevLevel.current = state.user.overallLevel;
    prevRank.current = currentRank.key;
  }, [state.user.overallLevel, state.systemMessages]);

  const dismiss = () => setNotification(null);

  return { notification, dismiss };
}
