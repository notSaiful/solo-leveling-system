import { useMemo } from 'react';
import { PRESET_QUESTS } from '../data/presetQuests';

export function useToday(state) {
  const today = new Date().toISOString().split('T')[0];

  const todayQuests = useMemo(() => {
    const custom = state.customQuests.filter(q => !q.completed || q.lastCompleted === today);
    const preset = PRESET_QUESTS.map(q => ({
      ...q,
      isPreset: true,
      completedToday: state.history.some(h => h.date === today && h.questId === q.id && h.completed),
    }));
    return [...preset, ...custom];
  }, [state.customQuests, state.history]);

  const todayStats = useMemo(() => {
    const deen = todayQuests.filter(q => q.pillar === 'deen' && q.completedToday).length;
    const body = todayQuests.filter(q => q.pillar === 'body' && q.completedToday).length;
    const money = todayQuests.filter(q => q.pillar === 'money' && q.completedToday).length;
    return { deen, body, money, total: deen + body + money };
  }, [todayQuests]);

  return { today, todayQuests, todayStats };
}
