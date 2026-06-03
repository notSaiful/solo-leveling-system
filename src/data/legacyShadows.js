/** ============================================================
 *  MANHOOD FORGE SHADOWS (Legacy Shadows)
 *  ============================================================
 *  Extracted from "fatherhood-adjacent" quests now — mentoring,
 *  teaching, modeling discipline. These do NOT boost your stats.
 *  They boost your future children's starting stats.
 *  ============================================================ */

import { getLocalDateString, toLocalDateString } from '../utils/dateUtils';

export const LEGACY_SHADOW_QUESTS = [
  {
    id: 'legacy-quran-teacher',
    title: 'Quran Teacher',
    description: 'Teach Quran to a younger sibling, cousin, or mentee for 7 consecutive days.',
    requiredDays: 7,
    pillar: 'deen',
    xp: 50,
    shadow: { id: 'shadow-quran', name: 'Shadow of the Teacher', boostType: 'intelligence', boostValue: 2 },
  },
  {
    id: 'legacy-presence',
    title: 'Undivided Presence',
    description: 'No phone during family time for 14 consecutive days. Be fully there.',
    requiredDays: 14,
    pillar: 'deen',
    xp: 50,
    shadow: { id: 'shadow-presence', name: 'Shadow of Presence', boostType: 'mana', boostValue: 2 },
  },
  {
    id: 'legacy-discipline-model',
    title: 'Discipline Model',
    description: 'Have someone witness and document your full morning routine for 21 days.',
    requiredDays: 21,
    pillar: 'body',
    xp: 60,
    shadow: { id: 'shadow-discipline', name: 'Shadow of Discipline', boostType: 'strength', boostValue: 2 },
  },
  {
    id: 'legacy-provider-seed',
    title: 'Provider Seed',
    description: 'Contribute to family expenses for 30 consecutive days. No matter the amount.',
    requiredDays: 30,
    pillar: 'money',
    xp: 60,
    shadow: { id: 'shadow-provider', name: 'Shadow of the Provider', boostType: 'sense', boostValue: 2 },
  },
  {
    id: 'legacy-akhlaq-mirror',
    title: 'Akhlaq Mirror',
    description: 'Practice one prophetic trait publicly for 14 days. Let others see it.',
    requiredDays: 14,
    pillar: 'deen',
    xp: 50,
    shadow: { id: 'shadow-akhlaq', name: 'Shadow of Character', boostType: 'health', boostValue: 2 },
  },
];

/** Get explicit manual progress for a legacy shadow quest (no auto-counting) */
export function getLegacyShadowProgress(state, questId) {
  const progress = state.legacyShadowProgress?.[questId];
  if (!progress) return { currentStreak: 0, lastLogDate: null, canLogToday: true };

  const today = getLocalDateString();
  const canLogToday = progress.lastLogDate !== today;

  // Check if streak is still valid (not broken by a missed day)
  if (progress.lastLogDate) {
    const last = new Date(progress.lastLogDate + 'T12:00:00');
    const now = new Date(today + 'T12:00:00');
    const gap = Math.round((now - last) / (24 * 60 * 60 * 1000));
    if (gap > 1) {
      // Streak broken — reset to 0 but allow logging today
      return { currentStreak: 0, lastLogDate: progress.lastLogDate, canLogToday: true };
    }
  }

  return { currentStreak: progress.currentStreak || 0, lastLogDate: progress.lastLogDate, canLogToday };
}

/** Manually log one day of progress for a legacy shadow quest */
export function logLegacyShadowDay(state, questId) {
  const template = LEGACY_SHADOW_QUESTS.find(q => q.id === questId);
  if (!template) return state;

  const alreadyExtracted = state.legacyShadows?.some(s => s.id === template.shadow.id);
  if (alreadyExtracted) return state;

  const today = getLocalDateString();
  const existing = state.legacyShadowProgress || {};
  const progress = existing[questId] || { currentStreak: 0, lastLogDate: null, logHistory: [] };

  if (progress.lastLogDate === today) return state; // Already logged today

  // Check if streak continues or resets
  let newStreak = 1;
  if (progress.lastLogDate) {
    const last = new Date(progress.lastLogDate + 'T12:00:00');
    const now = new Date(today + 'T12:00:00');
    const gap = Math.round((now - last) / (24 * 60 * 60 * 1000));
    if (gap === 1) {
      newStreak = (progress.currentStreak || 0) + 1;
    }
  }

  return {
    ...state,
    legacyShadowProgress: {
      ...existing,
      [questId]: {
        ...progress,
        currentStreak: newStreak,
        lastLogDate: today,
        logHistory: [...(progress.logHistory || []), today],
      },
    },
  };
}

/** Kept for backward compatibility — no longer used for legacy shadow progress */
export function getConsecutiveDailyCompletions(history, pillar) {
  const completions = (history || [])
    .filter(h => h.pillar === pillar && h.completed && h.type === 'daily')
    .map(h => h.date ? toLocalDateString(h.date) : '')
    .filter(Boolean);
  if (completions.length === 0) return 0;

  const sorted = [...new Set(completions)].sort();
  const today = getLocalDateString();

  let maxConsecutive = 0;
  let current = 0;
  let prevDate = null;

  for (const date of sorted) {
    if (!prevDate) {
      current = 1;
    } else {
      const prev = new Date(prevDate + 'T12:00:00');
      const curr = new Date(date + 'T12:00:00');
      const diffDays = Math.round((curr - prev) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        current++;
      } else {
        current = 1;
      }
    }
    maxConsecutive = Math.max(maxConsecutive, current);
    prevDate = date;
  }

  const lastCompletion = sorted[sorted.length - 1];
  const lastDate = new Date(lastCompletion + 'T12:00:00');
  const todayDate = new Date(today + 'T12:00:00');
  const gap = Math.round((todayDate - lastDate) / (24 * 60 * 60 * 1000));
  if (gap > 1) {
    return 0;
  }

  return maxConsecutive;
}

export function checkLegacyShadowExtraction(state, questId) {
  const template = LEGACY_SHADOW_QUESTS.find(q => q.id === questId);
  if (!template) return state;

  const alreadyExtracted = state.legacyShadows.some(s => s.id === template.shadow.id);
  if (alreadyExtracted) return state;

  const { currentStreak } = getLegacyShadowProgress(state, questId);
  if (currentStreak < template.requiredDays) {
    return {
      ...state,
      systemMessages: [
        ...(state.systemMessages || []),
        {
          type: 'warning',
          title: 'EXTRACTION FAILED',
          subtitle: template.shadow.name,
          message: `Complete ${template.requiredDays} consecutive days of ${template.title} first. Current streak: ${currentStreak} days. Log each day manually in the Legion tab.`,
        },
      ],
    };
  }

  return {
    ...state,
    legacyShadows: [
      ...(state.legacyShadows || []),
      {
        ...template.shadow,
        sourceQuest: questId,
        extractedAt: new Date().toISOString(),
      },
    ],
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'shadow',
        title: 'MANHOOD FORGE SHADOW EXTRACTED',
        subtitle: template.shadow.name,
        message: `This shadow does not boost you. It boosts the starting stats of the children you will one day raise. "Arise."`,
      },
    ],
  };
}

export function calculateChildStartingBoosts(legacyShadows = []) {
  const boosts = { strength: 0, agility: 0, intelligence: 0, sense: 0, health: 0, mana: 0 };
  legacyShadows.forEach(s => {
    if (boosts[s.boostType] !== undefined) {
      boosts[s.boostType] += s.boostValue;
    }
  });
  return boosts;
}

export function getLegacyShadowCount(legacyShadows = []) {
  return legacyShadows.length;
}

export function getLegacyShadowTotalBoost(legacyShadows = []) {
  return legacyShadows.reduce((sum, s) => sum + (s.boostValue || 0), 0);
}
