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

/** Count consecutive days of completed daily quests for a pillar */
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

  // If the streak ends before today, only count up to the last completion day
  const lastCompletion = sorted[sorted.length - 1];
  const lastDate = new Date(lastCompletion + 'T12:00:00');
  const todayDate = new Date(today + 'T12:00:00');
  const gap = Math.round((todayDate - lastDate) / (24 * 60 * 60 * 1000));
  if (gap > 1) {
    // Streak is broken — don't count past days as current progress
    return 0;
  }

  return maxConsecutive;
}

export function checkLegacyShadowExtraction(state, questId) {
  const template = LEGACY_SHADOW_QUESTS.find(q => q.id === questId);
  if (!template) return state;

  const alreadyExtracted = state.legacyShadows.some(s => s.id === template.shadow.id);
  if (alreadyExtracted) return state;

  const consecutiveDays = getConsecutiveDailyCompletions(state.history, template.pillar);
  if (consecutiveDays < template.requiredDays) {
    return {
      ...state,
      systemMessages: [
        ...(state.systemMessages || []),
        {
          type: 'warning',
          title: 'EXTRACTION FAILED',
          subtitle: template.shadow.name,
          message: `Complete ${template.requiredDays} consecutive days of ${template.pillar} quests first. Current streak: ${consecutiveDays} days.`,
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
