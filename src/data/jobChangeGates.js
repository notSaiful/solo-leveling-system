/** ============================================================
 *  JOB CHANGE GATES
 *  ============================================================
 *  7-day boss gates at rank thresholds.
 *  Lock rank progression until cleared.
 *  Fail = drop one sub-rank tier, retry next week.
 *  Pass = unlock class title + skills.
 *  ============================================================ */

import { unlockSkill } from './skills';
import { RANK_CONFIG } from './questCatalog';

export const JOB_CHANGE_GATES = [
  {
    id: 'gate-d-10',
    rank: 'D',
    levelRequired: 10,
    title: "The Apprentice's Threshold",
    days: 7,
    steps: [
      { day: 1, title: 'Fajr Warrior', description: 'Pray Fajr on time + 30 min seerah study on prophetic leadership', pillar: 'deen', xp: 100 },
      { day: 2, title: 'Adventure Foundation', description: 'Walk 5,000 steps exploring new terrain + 10 minutes barefoot on earth + climb one hill or stairs', pillar: 'body', xp: 100 },
      { day: 3, title: 'AI First Step', description: 'Master one AI tool or study one AI concept for 1 hour', pillar: 'money', xp: 100 },
      { day: 4, title: 'All Prayers Perfect', description: 'All 5 prayers on time + rawatib', pillar: 'deen', xp: 120 },
      { day: 5, title: 'Trail Gauntlet', description: '1-hour nature walk or hike + perfect sleep', pillar: 'body', xp: 120 },
      { day: 6, title: 'AI Discipline', description: 'Study one AI/ML concept + no impulse spending', pillar: 'money', xp: 120 },
      { day: 7, title: "BOSS: The Apprentice's Awakening", description: 'Complete all daily quests + 1-hour deep work on AI-powered business system', pillar: 'all', xp: 200 },
    ],
    reward: { gold: 500, statPoints: 5, title: 'Architect', skills: ['takbeer-sprint'] },
  },
  {
    id: 'gate-c-25',
    rank: 'C',
    levelRequired: 25,
    title: "The Builder's Trial",
    days: 7,
    steps: [
      { day: 1, title: 'Tahajjud Warrior', description: 'Pray Tahajjud + 45 min seerah deep study on statecraft and justice', pillar: 'deen', xp: 150 },
      { day: 2, title: 'Warrior Adventure', description: '45-minute trail hike + weighted pack carry 20 min + balance practice on uneven ground', pillar: 'body', xp: 150 },
      { day: 3, title: 'Ship AI Product', description: 'Ship one AI product/feature or close one AI-related sale (wealth as a tool)', pillar: 'money', xp: 150 },
      { day: 4, title: 'Rawatib Mastery', description: 'All 12 rawatib + Duha + evening adhkar', pillar: 'deen', xp: 180 },
      { day: 5, title: 'Endurance Test', description: '5K trek on trail or uneven ground + hill climb + cold water exposure', pillar: 'body', xp: 180 },
      { day: 6, title: 'Portfolio Review', description: 'Audit all investments for Shariah compliance + review AI business system', pillar: 'money', xp: 180 },
      { day: 7, title: "BOSS: The Builder's Reckoning", description: 'All quests + ship one AI-powered offer + teach someone one AI skill', pillar: 'all', xp: 300 },
    ],
    reward: { gold: 800, statPoints: 8, title: 'Mujahid', skills: ['iron-will'] },
  },
  {
    id: 'gate-b-40',
    rank: 'B',
    levelRequired: 40,
    title: "The Guardian's Crusade",
    days: 7,
    steps: [
      { day: 1, title: 'Guardian\'s Devotion', description: 'Tahajjud + 1 hour seerah + 1 Juz', pillar: 'deen', xp: 200 },
      { day: 2, title: 'Guardian\'s Strength', description: '2-hour trek with elevation gain + rock scramble or boulder + weighted pack carry 30 min', pillar: 'body', xp: 200 },
      { day: 3, title: 'Guardian\'s Treasury', description: 'Launch or scale one AI income stream', pillar: 'money', xp: 200 },
      { day: 4, title: 'Community Lead', description: 'Lead one family or community Islamic practice', pillar: 'deen', xp: 250 },
      { day: 5, title: 'Terrain Readiness', description: 'Navigate 3km by compass and landmarks + creek crossing or water practice', pillar: 'body', xp: 250 },
      { day: 6, title: 'Strategic Wealth', description: '5-year financial independence plan written (AI-wealth driven)', pillar: 'money', xp: 250 },
      { day: 7, title: "BOSS: The Guardian's Oath", description: 'All quests + mentor one person to D-rank (lead a community)', pillar: 'all', xp: 400 },
    ],
    reward: { gold: 1200, statPoints: 10, title: "Qa'id", skills: ['zakat-blast', 'shadow-march'] },
  },
  {
    id: 'gate-a-55',
    rank: 'A',
    levelRequired: 55,
    title: "The Strategist's Campaign",
    days: 7,
    steps: [
      { day: 1, title: 'Strategist\'s Prayer', description: 'Tahajjud 60+ min + 2 Juz + khutbah prep', pillar: 'deen', xp: 300 },
      { day: 2, title: 'Strategist\'s Adventure', description: 'Half-day trek (4+ hours) + multi-terrain navigation + lead someone on outdoor excursion', pillar: 'body', xp: 300 },
      { day: 3, title: 'Strategist\'s Empire', description: 'Major strategic AI business action', pillar: 'money', xp: 300 },
      { day: 4, title: 'Ummah Service', description: '10+ hours volunteering or relief this month', pillar: 'deen', xp: 350 },
      { day: 5, title: 'Elite Expedition', description: 'Summit attempt or major wilderness feat', pillar: 'body', xp: 350 },
      { day: 6, title: 'Generational Wealth', description: 'Generational wealth plan + Ummah fund structure', pillar: 'money', xp: 350 },
      { day: 7, title: "BOSS: The Strategist's War", description: 'All quests + lead a group to B-rank (ummah-scale command)', pillar: 'all', xp: 600 },
    ],
    reward: { gold: 2000, statPoints: 15, title: 'Khalifa', skills: [] },
  },
  {
    id: 'gate-s-70',
    rank: 'S',
    levelRequired: 70,
    title: "The Khalifa's Dominion",
    days: 7,
    steps: [
      { day: 1, title: 'Khalifa\'s Worship', description: 'Tahajjud 90+ min + 3 Juz + tafsir', pillar: 'deen', xp: 500 },
      { day: 2, title: 'Khalifa\'s Apex', description: 'Full-day expedition across multiple terrain types in top 5% outdoor endurance', pillar: 'body', xp: 500 },
      { day: 3, title: 'Khalifa\'s Treasury', description: 'Halal AI empire employing 5+ Muslims', pillar: 'money', xp: 500 },
      { day: 4, title: 'Community Dominion', description: 'Organize 100+ person Ummah event', pillar: 'deen', xp: 600 },
      { day: 5, title: 'Adventure Mastery', description: '1-year elite outdoor endurance without breaks', pillar: 'body', xp: 600 },
      { day: 6, title: 'Wealth Mastery', description: 'Financial independence achieved via AI', pillar: 'money', xp: 600 },
      { day: 7, title: "BOSS: The Khalifa's Ascension", description: 'All quests + 40 days perfect streak prep (no breaks, no excuses)', pillar: 'all', xp: 1000 },
    ],
    reward: { gold: 5000, statPoints: 20, skills: [] },
  },
];

export function getPendingGate(state) {
  const level = state.user.overallLevel;
  const currentRank = state.user.currentRank;
  const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
  const currentRankIndex = rankOrder.indexOf(currentRank);

  // Find next gate that hasn't been completed or failed this week
  const pending = JOB_CHANGE_GATES.find(g => {
    if (level < g.levelRequired) return false;
    const gateRankIndex = rankOrder.indexOf(g.rank);
    if (gateRankIndex <= currentRankIndex) return false; // Already passed this rank

    const existing = state.jobChangeGates.find(jg => jg.gateId === g.id);
    if (!existing) return true; // Never attempted
    if (existing.completed) return false; // Already passed
    // Allow retry if failed
    return true;
  });

  return pending || null;
}

export function isRankLocked(state) {
  const nextGate = getPendingGate(state);
  if (!nextGate) return false;

  // Check if we're at the threshold for this gate's rank
  const nextRankMin = RANK_CONFIG[nextGate.rank]?.minLevel;
  if (!nextRankMin) return false;

  return state.user.overallLevel >= nextRankMin;
}

export function initializeJobChangeGate(state) {
  const pending = getPendingGate(state);
  if (!pending) return state;

  const existing = state.jobChangeGates.find(g => g.gateId === pending.id);
  if (existing && !existing.failed && !existing.completed) return state; // Already active

  const newGate = {
    gateId: pending.id,
    rank: pending.rank,
    levelRequired: pending.levelRequired,
    title: pending.title,
    day: 1,
    totalDays: pending.days,
    steps: pending.steps.map(s => ({ ...s, completed: false, completedAt: null })),
    completed: false,
    completedAt: null,
    failed: false,
    failedAt: null,
    startedAt: new Date().toISOString(),
  };

  return {
    ...state,
    jobChangeGates: [...state.jobChangeGates, newGate],
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'rankUp',
        title: `JOB CHANGE GATE: ${pending.title}`,
        subtitle: `Day 1 / ${pending.days}`,
        message: `A ${pending.days}-day gate blocks your path to ${pending.rank}-Rank. Fail any day and you drop a tier. Pass and new powers awaken.`,
      },
    ],
  };
}

export function completeGateStep(state, gateId, stepIndex) {
  const gate = state.jobChangeGates.find(g => g.gateId === gateId && !g.completed && !g.failed);
  if (!gate) return state;

  const newSteps = [...gate.steps];
  if (newSteps[stepIndex]) {
    newSteps[stepIndex] = { ...newSteps[stepIndex], completed: true, completedAt: new Date().toISOString() };
  }

  const allComplete = newSteps.every(s => s.completed);
  const template = JOB_CHANGE_GATES.find(g => g.id === gateId);

  if (allComplete && template) {
    // Gate passed — unlock rank and skills
    const newTitle = template.reward.title || state.user.jobClass;
    let nextState = {
      ...state,
      jobChangeGates: state.jobChangeGates.map(g =>
        g.gateId === gateId ? { ...g, steps: newSteps, completed: true, completedAt: new Date().toISOString() } : g
      ),
      user: {
        ...state.user,
        currentRank: template.rank,
        jobClass: newTitle,
      },
      gold: state.gold + template.reward.gold,
      skillPoints: state.skillPoints + template.reward.statPoints,
      systemMessages: [
        ...(state.systemMessages || []),
        {
          type: 'rankUp',
          title: `RANK UP! ${template.rank}-Rank`,
          subtitle: newTitle,
          message: `Job Change Gate cleared. New class: ${newTitle}. Skills unlocked.`,
        },
      ],
    };

    // Unlock skills
    if (template.reward.skills) {
      template.reward.skills.forEach(skillId => {
        nextState = unlockSkill(nextState, skillId);
      });
    }

    return nextState;
  }

  // Advance to next day
  const nextDay = Math.min(gate.day + 1, gate.totalDays);
  return {
    ...state,
    jobChangeGates: state.jobChangeGates.map(g =>
      g.gateId === gateId ? { ...g, steps: newSteps, day: nextDay } : g
    ),
  };
}

export function failJobChangeGate(state, gateId) {
  const gate = state.jobChangeGates.find(g => g.gateId === gateId && !g.completed && !g.failed);
  if (!gate) return state;

  // Drop one sub-rank tier
  const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
  const currentRankIndex = rankOrder.indexOf(state.user.currentRank);
  const droppedRank = rankOrder[Math.max(0, currentRankIndex - 1)] || 'E';

  return {
    ...state,
    user: {
      ...state.user,
      currentRank: droppedRank,
    },
    jobChangeGates: state.jobChangeGates.map(g =>
      g.gateId === gateId ? { ...g, failed: true, failedAt: new Date().toISOString() } : g
    ),
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'penalty',
        title: 'JOB CHANGE GATE FAILED',
        subtitle: 'You have been demoted.',
        message: `You failed the ${gate.title}. Rank dropped to ${droppedRank}. Retry when ready. No excuses.`,
      },
    ],
  };
}

export function getActiveJobChangeGate(state) {
  return state.jobChangeGates.find(g => !g.completed && !g.failed) || null;
}
