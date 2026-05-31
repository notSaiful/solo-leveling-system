/** ============================================================
 *  SYSTEM ADMIN COMMANDS — AI-Executed State Mutations
 *  ============================================================
 *  The AI assistant can directly manipulate the game state by
 *  emitting [[CMD]] JSON blocks in its responses. Each command
 *  is validated, executed, and reported back to the user.
 *  ============================================================ */

import { getRankByLevel, xpForNextLevel } from '../data/questCatalog';
import { REWARD_ITEMS } from '../data/rewards';
import { SHADOW_TEMPLATES } from '../data/shadows';
import { getLocalDateString } from '../utils/dateUtils';

// ─── COMMAND DEFINITIONS (for AI prompt + validation) ───

export const ADMIN_COMMANDS = {
  CREATE_QUEST: {
    description: 'Create a new quest and add it to the user\'s daily or custom quests.',
    params: {
      title: 'string (required)',
      description: 'string (optional)',
      pillar: "string (required): 'deen' | 'body' | 'money'",
      xp: 'number (optional, default 20)',
      type: "string (optional): 'daily' | 'custom' (default 'custom')",
    },
  },
  MODIFY_QUEST: {
    description: 'Change properties of an existing quest by uniqueId or title match.',
    params: {
      questId: 'string (required) — uniqueId of the quest',
      title: 'string (optional)',
      description: 'string (optional)',
      xp: 'number (optional)',
    },
  },
  DELETE_QUEST: {
    description: 'Remove a quest from daily or custom quests by uniqueId.',
    params: {
      questId: 'string (required)',
    },
  },
  FORCE_COMPLETE_QUEST: {
    description: 'Mark a quest as completed and award its full XP/gold immediately.',
    params: {
      questId: 'string (required)',
    },
  },
  AWARD_GOLD: {
    description: 'Add gold to the user\'s balance.',
    params: {
      amount: 'number (required, positive)',
      reason: 'string (optional)',
    },
  },
  DEDUCT_GOLD: {
    description: 'Remove gold from the user\'s balance.',
    params: {
      amount: 'number (required, positive)',
      reason: 'string (optional)',
    },
  },
  AWARD_XP: {
    description: 'Add XP to a specific pillar and check for level-up.',
    params: {
      pillar: "string (required): 'deen' | 'body' | 'money'",
      amount: 'number (required, positive)',
      reason: 'string (optional)',
    },
  },
  AWARD_STAT_POINTS: {
    description: 'Add stat points the user can distribute.',
    params: {
      amount: 'number (required, positive)',
      reason: 'string (optional)',
    },
  },
  UNLOCK_SHADOW: {
    description: 'Unlock a shadow by ID and add it to the user\'s collection.',
    params: {
      shadowId: 'string (required) — e.g. "shadow-beru", "shadow-igris"',
    },
  },
  REMOVE_DEBUFF: {
    description: 'Clear all active debuffs from one or all pillars.',
    params: {
      pillar: "string (optional): 'deen' | 'body' | 'money' | 'all' (default 'all')",
    },
  },
  APPLY_DEBUFF: {
    description: 'Apply a debuff to a pillar (e.g., missed streak penalty).',
    params: {
      pillar: "string (required): 'deen' | 'body' | 'money'",
      name: 'string (required)',
      multiplier: 'number (optional, default 0.5) — XP multiplier penalty',
      days: 'number (optional, default 1) — duration in days',
    },
  },
  SET_STREAK: {
    description: 'Set a pillar streak to a specific value.',
    params: {
      pillar: "string (required): 'deen' | 'body' | 'money'",
      value: 'number (required)',
    },
  },
  TRIGGER_MESSAGE: {
    description: 'Send a holographic system message to the user.',
    params: {
      type: "string (required): 'rankUp' | 'levelUp' | 'penalty' | 'reward' | 'custom'",
      title: 'string (required)',
      subtitle: 'string (optional)',
      message: 'string (optional)',
    },
  },
  REWARD_ITEM: {
    description: 'Give the user a store item without deducting gold.',
    params: {
      itemId: 'string (required) — e.g. "reward-coffee", "reward-book"',
    },
  },
  CUSTOM_DUNGEON: {
    description: 'Create a one-time custom dungeon for the user.',
    params: {
      title: 'string (required)',
      description: 'string (optional)',
      pillar: "string (required): 'deen' | 'body' | 'money'",
      xp: 'number (optional, default 100)',
      gold: 'number (optional, default 50)',
      steps: 'string[] (optional) — array of step descriptions',
    },
  },
};

// ─── SERIALIZED DEFINITION FOR AI PROMPT ───

export function getAdminCommandDocs() {
  return Object.entries(ADMIN_COMMANDS)
    .map(([key, cmd]) => `- ${key}: ${cmd.description}\n  Params: ${JSON.stringify(cmd.params)}`)
    .join('\n');
}

// ─── STATE EXECUTORS ───

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function createSystemMessage(type, title, subtitle, message) {
  return { type, title, subtitle: subtitle || '', message: message || '' };
}

function getQuestKey(quest) {
  return quest?.uniqueId || quest?.id || '';
}

function questMatches(q, questId) {
  if (!q || !questId) return false;
  return q.uniqueId === questId || q.id === questId;
}

function applyOverallFromPillars(newState) {
  const overall = Math.floor(
    (newState.pillars.deen.level * 0.5) +
    (newState.pillars.body.level * 0.3) +
    (newState.pillars.money.level * 0.2)
  );
  const rank = getRankByLevel(overall);
  newState.user = {
    ...newState.user,
    overallLevel: overall,
    currentRank: rank.key,
  };
}

function execCreateQuest(state, data) {
  if (!data.title || !data.pillar) return { error: 'Missing title or pillar' };
  const pillar = data.pillar.toLowerCase();
  if (!['deen', 'body', 'money'].includes(pillar)) return { error: `Invalid pillar: ${pillar}` };

  const quest = {
    id: `ai-${Date.now()}`,
    uniqueId: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: data.title,
    description: data.description || 'Created by SYSTEM Assistant.',
    pillar,
    xp: data.xp || 20,
    baseXp: data.xp || 20,
    completed: false,
    tags: ['ai-generated'],
    estimatedMinutes: 0,
  };

  const newState = clone(state);
  if (data.type === 'daily') {
    newState.dailyQuests = [...newState.dailyQuests, quest];
  } else {
    newState.customQuests = [...(newState.customQuests || []), { ...quest, lastCompleted: null }];
  }
  return { state: newState, report: `Created quest "${quest.title}" (${pillar})` };
}

function execModifyQuest(state, data) {
  const newState = clone(state);
  const allQuests = [
    ...(newState.dailyQuests || []),
    ...(newState.customQuests || []),
  ];
  const target = allQuests.find(q => questMatches(q, data.questId));
  if (!target) return { error: `Quest not found: ${data.questId}` };
  const targetKey = getQuestKey(target);

  const update = (q) => {
    if (getQuestKey(q) !== targetKey) return q;
    const updated = { ...q };
    if (data.title) updated.title = data.title;
    if (data.description) updated.description = data.description;
    if (typeof data.xp === 'number') {
      if (!isValidPositiveNumber(data.xp)) return q; // skip invalid XP, preserve original
      updated.xp = data.xp;
      updated.baseXp = data.xp;
    }
    return updated;
  };

  newState.dailyQuests = (newState.dailyQuests || []).map(update);
  newState.customQuests = (newState.customQuests || []).map(update);
  return { state: newState, report: `Modified quest "${target.title}"` };
}

function execDeleteQuest(state, data) {
  const newState = clone(state);
  const before = (newState.dailyQuests || []).length + (newState.customQuests || []).length;
  newState.dailyQuests = (newState.dailyQuests || []).filter(q => !questMatches(q, data.questId));
  newState.customQuests = (newState.customQuests || []).filter(q => !questMatches(q, data.questId));
  const after = newState.dailyQuests.length + newState.customQuests.length;
  if (before === after) return { error: `Quest not found: ${data.questId}` };
  return { state: newState, report: `Deleted quest` };
}

function execForceCompleteQuest(state, data) {
  const newState = clone(state);
  const dailyQuest = (newState.dailyQuests || []).find(q => questMatches(q, data.questId));
  const customQuest = (newState.customQuests || []).find(q => questMatches(q, data.questId));
  const quest = dailyQuest || customQuest;
  if (!quest) return { error: `Quest not found: ${data.questId}` };
  const isCustom = !!customQuest;
  const today = getLocalDateString();
  if (quest.completed || (isCustom && quest.lastCompleted === today)) return { error: 'Quest already completed' };

  const pillar = quest.pillar;
  const xp = quest.xp || quest.baseXp || 10;
  const gold = Math.floor(xp * 0.5);

  newState.pillars = { ...newState.pillars };
  newState.pillars[pillar] = {
    ...newState.pillars[pillar],
    xp: newState.pillars[pillar].xp + xp,
    streak: newState.pillars[pillar].streak + 1,
  };

  // Level-up check
  const pl = newState.pillars[pillar].level;
  const px = newState.pillars[pillar].xp;
  const needed = xpForNextLevel(pl);
  if (px >= needed) {
    newState.pillars[pillar].level = pl + 1;
    newState.pillars[pillar].xp = px - needed;
  }

  const completedAt = new Date().toISOString();
  const questKey = getQuestKey(quest);
  if (isCustom) {
    newState.customQuests = (newState.customQuests || []).map(q =>
      getQuestKey(q) === questKey
        ? { ...q, id: q.id || q.uniqueId, completedAt, lastCompleted: today }
        : q
    );
  } else {
    newState.dailyQuests = (newState.dailyQuests || []).map(q =>
      getQuestKey(q) === questKey ? { ...q, completed: true, completedAt } : q
    );
  }
  newState.gold += gold;
  newState.history = [...(newState.history || []), {
    type: isCustom ? 'custom' : 'daily', questId: questKey, title: quest.title, pillar, xp, gold,
    date: completedAt, completed: true,
  }];

  applyOverallFromPillars(newState);

  return { state: newState, report: `Force-completed "${quest.title}" (+${xp} XP, +${gold} Gold)` };
}

function isValidPositiveNumber(n) {
  return typeof n === 'number' && Number.isFinite(n) && n > 0 && n < 1_000_000_000;
}

function execAwardGold(state, data) {
  if (!isValidPositiveNumber(data.amount)) return { error: 'Invalid amount' };
  const newState = clone(state);
  newState.gold += data.amount;
  return { state: newState, report: `Awarded ${data.amount} Gold` };
}

function execDeductGold(state, data) {
  if (!isValidPositiveNumber(data.amount)) return { error: 'Invalid amount' };
  const newState = clone(state);
  newState.gold = Math.max(0, newState.gold - data.amount);
  return { state: newState, report: `Deducted ${data.amount} Gold` };
}

function execAwardXp(state, data) {
  if (!data.pillar || !['deen', 'body', 'money'].includes(data.pillar)) return { error: 'Invalid pillar' };
  if (!isValidPositiveNumber(data.amount)) return { error: 'Invalid amount' };

  const newState = clone(state);
  const p = data.pillar;
  if (!newState.pillars[p]) return { error: `Pillar ${p} not found` };
  newState.pillars = { ...newState.pillars };
  newState.pillars[p] = {
    ...newState.pillars[p],
    xp: newState.pillars[p].xp + data.amount,
  };

  // Level-up check
  const pl = newState.pillars[p].level;
  const px = newState.pillars[p].xp;
  const needed = xpForNextLevel(pl);
  if (px >= needed) {
    newState.pillars[p].level = pl + 1;
    newState.pillars[p].xp = px - needed;
  }

  applyOverallFromPillars(newState);

  return { state: newState, report: `Awarded ${data.amount} XP to ${p}` };
}

function execAwardStatPoints(state, data) {
  if (!isValidPositiveNumber(data.amount)) return { error: 'Invalid amount' };
  const newState = clone(state);
  newState.statPoints = (newState.statPoints || 0) + data.amount;
  return { state: newState, report: `Awarded ${data.amount} Stat Points` };
}

function execUnlockShadow(state, data) {
  const template = Object.values(SHADOW_TEMPLATES).find(s => s.id === data.shadowId);
  if (!template) return { error: `Unknown shadow: ${data.shadowId}` };

  const newState = clone(state);
  const already = newState.shadows?.find(s => s.id === data.shadowId);
  if (already) return { error: 'Shadow already unlocked' };

  const shadow = {
    ...template,
    extractedAt: new Date().toISOString(),
  };
  newState.shadows = [...(newState.shadows || []), shadow];
  return { state: newState, report: `Unlocked Shadow: ${shadow.name} (${shadow.grade})` };
}

function execRemoveDebuff(state, data) {
  const pillar = data.pillar || 'all';
  const newState = clone(state);
  newState.pillars = { ...newState.pillars };

  if (pillar === 'all') {
    ['deen', 'body', 'money'].forEach(p => {
      newState.pillars[p] = { ...newState.pillars[p], activeDebuff: null };
    });
    return { state: newState, report: 'Cleared all debuffs' };
  }
  if (!['deen', 'body', 'money'].includes(pillar)) return { error: 'Invalid pillar' };
  newState.pillars[pillar] = { ...newState.pillars[pillar], activeDebuff: null };
  return { state: newState, report: `Cleared debuff from ${pillar}` };
}

function execApplyDebuff(state, data) {
  if (!data.pillar || !['deen', 'body', 'money'].includes(data.pillar)) return { error: 'Invalid pillar' };
  const newState = clone(state);
  newState.pillars = { ...newState.pillars };
  newState.pillars[data.pillar] = {
    ...newState.pillars[data.pillar],
    activeDebuff: {
      name: data.name || 'Unknown Penalty',
      multiplier: (typeof data.multiplier === 'number' && Number.isFinite(data.multiplier) && data.multiplier > 0 && data.multiplier <= 1) ? data.multiplier : 0.5,
      days: data.days || 1,
      appliedAt: new Date().toISOString(),
    },
  };
  return { state: newState, report: `Applied debuff "${data.name}" to ${data.pillar}` };
}

function execSetStreak(state, data) {
  if (!data.pillar || !['deen', 'body', 'money'].includes(data.pillar)) return { error: 'Invalid pillar' };
  if (typeof data.value !== 'number' || !Number.isFinite(data.value) || data.value < 0) return { error: 'Invalid value' };
  const newState = clone(state);
  newState.pillars = { ...newState.pillars };
  newState.pillars[data.pillar] = { ...newState.pillars[data.pillar], streak: Math.max(0, data.value) };
  return { state: newState, report: `Set ${data.pillar} streak to ${data.value}` };
}

const VALID_MESSAGE_TYPES = ['rankUp', 'levelUp', 'penalty', 'reward', 'custom'];

function execTriggerMessage(state, data) {
  if (!data.title) return { error: 'Missing title' };
  const newState = clone(state);
  const msgType = VALID_MESSAGE_TYPES.includes(data.type) ? data.type : 'custom';
  newState.systemMessages = [
    ...(newState.systemMessages || []),
    createSystemMessage(msgType, data.title, data.subtitle, data.message),
  ];
  return { state: newState, report: `Triggered message: "${data.title}"` };
}

function execRewardItem(state, data) {
  const item = REWARD_ITEMS.find(i => i.id === data.itemId);
  if (!item) return { error: `Unknown item: ${data.itemId}` };
  const newState = clone(state);
  newState.purchasedRewards = [
    ...(newState.purchasedRewards || []),
    { ...item, purchasedAt: new Date().toISOString() },
  ];
  return { state: newState, report: `Granted item: ${item.name}` };
}

function execCustomDungeon(state, data) {
  if (!data.title || !data.pillar) return { error: 'Missing title or pillar' };
  const p = data.pillar.toLowerCase();
  if (!['deen', 'body', 'money'].includes(p)) return { error: 'Invalid pillar' };

  const newState = clone(state);
  const dungeon = {
    id: `ai-dungeon-${Date.now()}`,
    title: data.title,
    description: data.description || 'A custom challenge created by the SYSTEM.',
    pillar: p,
    xp: data.xp || 100,
    gold: data.gold || 50,
    steps: (data.steps || ['Complete the challenge']).map((text, i) => ({
      id: `step-${i}`,
      text,
      completed: false,
    })),
    completed: false,
    bonusClaimed: false,
    createdAt: new Date().toISOString(),
  };

  // Store in a special aiDungeons array
  newState.aiDungeons = [...(newState.aiDungeons || []), dungeon];
  newState.systemMessages = [
    ...(newState.systemMessages || []),
    createSystemMessage('custom', `DUNGEON GENERATED: ${dungeon.title}`, `${p.toUpperCase()} Pillar`, `Complete it for ${dungeon.xp} XP and ${dungeon.gold} Gold.`),
  ];
  return { state: newState, report: `Created dungeon "${dungeon.title}"` };
}

// ─── COMMAND ROUTER ───

const EXECUTORS = {
  CREATE_QUEST: execCreateQuest,
  MODIFY_QUEST: execModifyQuest,
  DELETE_QUEST: execDeleteQuest,
  FORCE_COMPLETE_QUEST: execForceCompleteQuest,
  AWARD_GOLD: execAwardGold,
  DEDUCT_GOLD: execDeductGold,
  AWARD_XP: execAwardXp,
  AWARD_STAT_POINTS: execAwardStatPoints,
  UNLOCK_SHADOW: execUnlockShadow,
  REMOVE_DEBUFF: execRemoveDebuff,
  APPLY_DEBUFF: execApplyDebuff,
  SET_STREAK: execSetStreak,
  TRIGGER_MESSAGE: execTriggerMessage,
  REWARD_ITEM: execRewardItem,
  CUSTOM_DUNGEON: execCustomDungeon,
};

export function executeAdminCommands(state, commands) {
  const reports = [];
  let currentState = state;
  let modified = false;

  for (const cmd of commands) {
    const executor = EXECUTORS[cmd.type];
    if (!executor) {
      reports.push({ type: 'error', message: `Unknown command: ${cmd.type}` });
      continue;
    }
    const result = executor(currentState, cmd.data || {});
    if (result.error) {
      reports.push({ type: 'error', message: result.error });
    } else {
      currentState = result.state;
      reports.push({ type: 'success', message: result.report });
      modified = true;
    }
  }

  return { state: currentState, modified, reports };
}

// ─── PARSER ───

export function parseAdminCommands(responseText) {
  const commands = [];
  const regex = /\[\[CMD\]\](.*?)\[\[\/CMD\]\]/gs;
  let match;
  while ((match = regex.exec(responseText)) !== null) {
    try {
      const json = match[1].trim();
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        commands.push(...parsed);
      } else {
        commands.push(parsed);
      }
    } catch {
      // Invalid JSON inside markers — skip
    }
  }
  return commands;
}

export function stripCommandBlocks(responseText) {
  return responseText.replace(/\[\[CMD\]\].*?\[\[\/CMD\]\]/gs, '').trim();
}
