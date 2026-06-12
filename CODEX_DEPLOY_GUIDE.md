# CODEX DEPLOY GUIDE — Solo Leveling System v4.8

Paste this entire document into Codex with the instruction: **"Apply all the file changes below to my Solo Leveling project."**

---

## NEW FILES (Create these)

### 1. `src/data/missionGates.js` (NEW FILE — 211 lines)

```js
/** ============================================================
 *  KHALIFATE MISSION GATES
 *  Real-world objectives must be completed before level ascension.
 *  Philosophy: The level is a reflection. The mission is the reality.
 *  ============================================================ */

export const MISSION_GATES = [
  {
    level: 100,
    rank: 'S',
    title: "The Monarch's Proof",
    subtitle: 'Before wearing the crown, build the kingdom.',
    requiredCount: 2,
    objectives: [
      { id: 'kg-100-1', label: 'Khalifate Foundation', description: 'Define your mission, write your oath, and begin one real-world project that serves the Ummah.', pillar: 'deen' },
      { id: 'kg-100-2', label: 'First Income Stream', description: 'Launch or validate one halal income stream that uses AI or technology to create value.', pillar: 'money' },
      { id: 'kg-100-3', label: 'Body of the Khalifa', description: 'Establish a consistent outdoor readiness protocol you can maintain for 1 year.', pillar: 'body' },
    ],
  },
  {
    level: 200,
    rank: 'S',
    title: 'The Unbreakable Proof',
    subtitle: 'Discipline without impact is vanity. Prove your habits built something real.',
    requiredCount: 2,
    objectives: [
      { id: 'kg-200-1', label: 'Mission Revenue', description: 'Your AI or technology venture generates its first real revenue. Validation over theory.', pillar: 'money' },
      { id: 'kg-200-2', label: 'Community Anchor', description: 'Build one community practice — study circle, outdoor group, or mentorship — that meets regularly without you.', pillar: 'deen' },
      { id: 'kg-200-3', label: 'Physical Standard', description: 'Achieve an outdoor endurance standard in the top 20% of natural athletes in your age group.', pillar: 'body' },
    ],
  },
  {
    level: 300,
    rank: 'S',
    title: "The Sovereign's Proof",
    subtitle: 'Sovereign means self-ruling. Your systems must run without your daily hand.',
    requiredCount: 2,
    objectives: [
      { id: 'kg-300-1', label: 'Automated Empire', description: 'One income stream operates with less than 2 hours of your time per week.', pillar: 'money' },
      { id: 'kg-300-2', label: 'Institutional Worship', description: 'A group worship or study practice you founded runs for 90 days without your direct leadership.', pillar: 'deen' },
      { id: 'kg-300-3', label: 'Teach Ten', description: 'Train 10 Muslims to B-rank standards in deen, outdoor readiness, or wealth-building.', pillar: 'service' },
    ],
  },
  {
    level: 400,
    rank: 'S',
    title: 'The Architect of Ages Proof',
    subtitle: 'You build for centuries, not quarters.',
    requiredCount: 2,
    objectives: [
      { id: 'kg-400-1', label: 'Generational Structure', description: 'Create a legal trust, waqf, or business structure designed to outlast you.', pillar: 'money' },
      { id: 'kg-400-2', label: 'Published Legacy', description: 'Publish one work — book, course, video series, or documented system — that benefits Muslims for 100+ years.', pillar: 'deen' },
      { id: 'kg-400-3', label: 'Family Covenant', description: 'Write and implement a family covenant of Islamic values and discipline standards.', pillar: 'family' },
    ],
  },
  {
    level: 500,
    rank: 'S',
    title: 'The Half-Millennium Proof',
    subtitle: 'Half a thousand levels. The System has no record of anyone reaching this height without mission completion.',
    requiredCount: 3,
    objectives: [
      { id: 'kg-500-1', label: 'Empire Employment', description: 'Your ventures employ 10+ Muslims with halal livelihoods.', pillar: 'money' },
      { id: 'kg-500-2', label: 'Ummah Fund', description: 'Establish a dedicated fund that distributes to ummah causes automatically every month.', pillar: 'money' },
      { id: 'kg-500-3', label: 'Multi-Year Impact', description: 'Document 3 years of continuous service to the Ummah through your ventures, teaching, or relief.', pillar: 'service' },
      { id: 'kg-500-4', label: 'Lifetime Fitness', description: 'Maintain elite outdoor readiness for 5 consecutive years without a break longer than 7 days.', pillar: 'body' },
    ],
  },
  {
    level: 600,
    rank: 'S',
    title: 'The Ageless Proof',
    subtitle: 'Age is a number. Impact is a principle. Prove your principles.',
    requiredCount: 2,
    objectives: [
      { id: 'kg-600-1', label: 'Student Surpasses Master', description: 'Train someone who exceeds your current capability in your primary field.', pillar: 'service' },
      { id: 'kg-600-2', label: 'Autonomous Wealth', description: '50% of your income is passive or automated. Wealth that does not sleep.', pillar: 'money' },
      { id: 'kg-600-3', label: 'Five-Year Worship', description: 'Maintain perfect worship consistency (all pillars) for 5 years.', pillar: 'deen' },
    ],
  },
  {
    level: 700,
    rank: 'S',
    title: 'The Immovable Proof',
    subtitle: 'The world changes. You do not. Because you are rooted in truth and impact.',
    requiredCount: 2,
    objectives: [
      { id: 'kg-700-1', label: 'Thousand Souls', description: 'Your teaching, content, or institutions have directly benefited 1,000+ Muslims.', pillar: 'service' },
      { id: 'kg-700-2', label: 'Hundred Jobs', description: 'Your economic systems have created 100+ jobs for Muslims.', pillar: 'money' },
      { id: 'kg-700-3', label: 'Decade of Discipline', description: 'Maintain all daily pillar quests for 10 consecutive years.', pillar: 'deen' },
    ],
  },
  {
    level: 800,
    rank: 'S',
    title: 'The Everlasting Proof',
    subtitle: 'Your shadow extends beyond your life. Prove it.',
    requiredCount: 2,
    objectives: [
      { id: 'kg-800-1', label: 'Ten-Year Institution', description: 'One institution you founded has operated for 10+ years.', pillar: 'service' },
      { id: 'kg-800-2', label: 'Crore of Charity', description: 'Your endowment or waqf has distributed 1 crore+ rupees to ummah causes.', pillar: 'money' },
      { id: 'kg-800-3', label: 'Global Reach', description: 'Your work benefits Muslims in 3+ countries.', pillar: 'service' },
    ],
  },
  {
    level: 900,
    rank: 'S',
    title: 'The Apex Proof',
    subtitle: 'Nine hundred levels. The mission must be undeniable.',
    requiredCount: 2,
    objectives: [
      { id: 'kg-900-1', label: 'Ten Thousand Souls', description: 'Direct impact: 10,000+ Muslims have benefited from your work.', pillar: 'service' },
      { id: 'kg-900-2', label: 'Five Hundred Jobs', description: 'Your economic empire employs 500+ Muslims.', pillar: 'money' },
      { id: 'kg-900-3', label: 'Quarter-Century System', description: 'A system you built is designed to operate for 25+ years after you step back.', pillar: 'service' },
    ],
  },
  {
    level: 999,
    rank: 'S',
    title: 'The Infinite Proof',
    subtitle: 'Level 999 is not a number. It is a promise. Prove the promise.',
    requiredCount: 3,
    objectives: [
      { id: 'kg-999-1', label: 'The Mission Complete', description: 'Your primary Khalifate mission — the venture you were called to build — is operational, self-sustaining, and serving the Ummah at scale.', pillar: 'service' },
      { id: 'kg-999-2', label: 'Legacy Without You', description: 'Your institutions, wealth systems, and teaching chains operate without your daily presence for 1+ year.', pillar: 'money' },
      { id: 'kg-999-3', label: 'The Final Sujood', description: 'You have maintained perfect worship, outdoor readiness, and wealth discipline for so long that they are no longer habits. They are identity.', pillar: 'deen' },
      { id: 'kg-999-4', label: 'Beyond the Mission', description: 'You have expanded your mission beyond its original scope — into new markets, new nations, or new generations.', pillar: 'service' },
    ],
  },
];

export function getGateForLevel(level) {
  return MISSION_GATES.find(g => g.level === level) || null;
}

export function getActiveGate(state) {
  const currentLevel = state.user?.overallLevel || 0;
  for (const gate of MISSION_GATES) {
    if (gate.level >= currentLevel && !isGateComplete(state, gate)) {
      return gate;
    }
  }
  return null;
}

export function getNextGateLevel(currentLevel) {
  const gate = MISSION_GATES.find(g => g.level > currentLevel);
  return gate?.level || null;
}

export function isGateComplete(state, gate) {
  if (!gate) return true;
  const completedIds = new Set((state.khalifateObjectives || []).filter(o => o.completed).map(o => o.id));
  const completedCount = gate.objectives.filter(o => completedIds.has(o.id)).length;
  return completedCount >= gate.requiredCount;
}

export function getGateProgress(state, gate) {
  if (!gate) return { completed: 0, required: 0, percent: 100 };
  const completedIds = new Set((state.khalifateObjectives || []).filter(o => o.completed).map(o => o.id));
  const completed = gate.objectives.filter(o => completedIds.has(o.id)).length;
  return { completed, required: gate.requiredCount, percent: Math.min(100, Math.floor((completed / gate.requiredCount) * 100)) };
}

export function getBlockingGate(state, proposedLevel) {
  for (const gate of MISSION_GATES) {
    if (gate.level < (state.user?.overallLevel || 0)) continue;
    if (proposedLevel >= gate.level && !isGateComplete(state, gate)) {
      return gate;
    }
  }
  return null;
}

export function initializeKhalifateObjectives(state) {
  const existing = state.khalifateObjectives || [];
  const existingIds = new Set(existing.map(o => o.id));
  const defaults = [];
  for (const gate of MISSION_GATES) {
    for (const obj of gate.objectives) {
      if (!existingIds.has(obj.id)) {
        defaults.push({ ...obj, completed: false, completedAt: null, evidence: '' });
      }
    }
  }
  if (defaults.length === 0) return state;
  return { ...state, khalifateObjectives: [...existing, ...defaults] };
}

export function completeKhalifateObjective(state, objectiveId, evidence = '') {
  const objectives = (state.khalifateObjectives || []).map(o =>
    o.id === objectiveId ? { ...o, completed: true, completedAt: new Date().toISOString(), evidence } : o
  );
  return { ...state, khalifateObjectives: objectives };
}

export function uncompleteKhalifateObjective(state, objectiveId) {
  const objectives = (state.khalifateObjectives || []).map(o =>
    o.id === objectiveId ? { ...o, completed: false, completedAt: null, evidence: '' } : o
  );
  return { ...state, khalifateObjectives: objectives };
}
```

### 2. `src/logic/extremeMode.js` (NEW FILE — 191 lines)

```js
/** ============================================================
 *  EXTREME MODE — Brutal Consequence for Prolonged Failure
 *  ============================================================ */

import { getRankByLevel, RANK_CONFIG } from '../data/questCatalog';
import { getLocalDateString } from '../utils/dateUtils';

const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S'];

function getRankIndex(rankKey) {
  return RANK_ORDER.indexOf(rankKey);
}

export function getFailureStreak(state, pillar) {
  return (state.failureStreaks || {})[pillar] || 0;
}

export function incrementFailureStreak(state, pillar) {
  const current = getFailureStreak(state, pillar);
  return { ...state, failureStreaks: { ...(state.failureStreaks || {}), [pillar]: current + 1 } };
}

export function resetFailureStreak(state, pillar) {
  const current = getFailureStreak(state, pillar);
  if (current === 0) return state;
  return { ...state, failureStreaks: { ...(state.failureStreaks || {}), [pillar]: 0 } };
}

export function isExtremeMode(state, pillar) {
  return getFailureStreak(state, pillar) >= 3;
}

export function applyExtremePenalty(state, pillar, rankKey) {
  const streak = getFailureStreak(state, pillar);
  if (streak < 3) return { state, xpLossExtra: 0, message: null };

  const idx = getRankIndex(rankKey);
  const tier = idx + 1;
  const extraLossPercent = Math.min(0.30, (streak - 2) * 0.05);
  const extraDurabilityLoss = (streak - 2) * 20;
  const scaledExtraLoss = extraLossPercent * (1 + (tier - 1) * 0.15);
  const scaledDurability = extraDurabilityLoss * (1 + (tier - 1) * 0.10);

  const pillarState = state.pillars[pillar];
  const currentXp = pillarState?.xp || 0;
  const xpLossExtra = Math.max(0, Math.floor(currentXp * scaledExtraLoss));

  const newPillars = { ...state.pillars, [pillar]: { ...pillarState, xp: Math.max(0, currentXp - xpLossExtra) } };
  const newEquipment = { ...state.equipment };
  Object.keys(newEquipment).forEach(slot => {
    const item = newEquipment[slot];
    if (!item) return;
    const newDurability = Math.max(0, (item.durability || 0) - scaledDurability);
    if (newDurability !== item.durability) {
      newEquipment[slot] = { ...item, durability: newDurability };
    }
  });

  const severityLabels = { 3: 'EXTREME WARNING', 4: 'CRITICAL FAILURE', 5: 'SYSTEM JUDGMENT', 6: 'MONARCH EXECUTION' };
  const severity = severityLabels[Math.min(6, streak)] || `DAY ${streak} EXILE`;

  const message = {
    type: 'penalty',
    title: `🔥 ${severity}`,
    subtitle: `${pillar.toUpperCase()} — ${streak} days of silence`,
    message: `• EXTRA XP SEIZED: -${xpLossExtra} XP (${Math.round(scaledExtraLoss * 100)}% extra loss)\n• EQUIPMENT CRACKED: -${scaledDurability} durability across all gear\n• STREAK: ${streak} consecutive days. The System's patience is exhausted.\n\nComplete a quest on this pillar to break the streak and earn redemption rewards.`,
  };

  return { state: { ...state, pillars: newPillars, equipment: newEquipment }, xpLossExtra, message };
}

export function calculateExtremeReward(state, pillar, baseXp, rankKey) {
  const streak = getFailureStreak(state, pillar);
  if (streak < 3) return { multiplier: 1, bonusGold: 0, message: null };

  const idx = getRankIndex(rankKey);
  const tier = idx + 1;
  const baseMultiplier = Math.min(5.0, 2.0 + (streak - 3) * 0.5);
  const rankBonus = (tier - 1) * 0.25;
  const multiplier = baseMultiplier + rankBonus;
  const bonusGold = Math.floor(streak * 50 * (1 + (tier - 1) * 0.3));

  const redemptionLabels = { 3: 'REDEMPTION BEGINNING', 4: 'CRACKED ARMOR RESTORED' };
  const label = redemptionLabels[streak] || `${streak}-DAY EXILE BROKEN`;

  const message = {
    type: 'reward',
    title: `⚡ ${label}`,
    subtitle: `${pillar.toUpperCase()} streak shattered — ${streak} days`,
    message: `• EXTREME XP MULTIPLIER: ${multiplier.toFixed(2)}× (${Math.round((multiplier - 1) * 100)}% bonus)\n• BONUS GOLD: +${bonusGold}\n• Failure streak RESET. You have chosen discipline over decay. The Khalifate rewards the penitent.`,
  };

  return { multiplier, bonusGold, message };
}

export function getExtremeModeSummary(state) {
  const pillars = ['deen', 'body', 'money'];
  const active = [];
  for (const p of pillars) {
    const streak = getFailureStreak(state, p);
    if (streak >= 3) {
      active.push({ pillar: p, streak, severity: streak >= 5 ? 'critical' : streak >= 4 ? 'severe' : 'extreme' });
    }
  }
  return active;
}

export function getExtremePillarLabel(streak) {
  if (streak >= 6) return 'JUDGMENT';
  if (streak >= 5) return 'EXECUTION';
  if (streak >= 4) return 'CRITICAL';
  if (streak >= 3) return 'EXTREME';
  return null;
}
```

---

## MODIFIED FILES

### 3. `src/data/questCatalog.js` — KEY CHANGES

This file is large. Replace these specific functions/sections:

**A. Replace `xpForNextLevel` with this tiered version:**

```js
export function xpForNextLevel(level) {
  if (level <= 99) {
    return Math.floor(100 * Math.pow(1.12, level));
  }
  if (level <= 299) {
    return 100000 + (level - 100) * 2000;
  }
  if (level <= 599) {
    return 500000 + (level - 300) * 5000;
  }
  return 2000000 + (level - 600) * 10000;
}
```

**B. Add these new helpers immediately after `xpForNextLevel`:**

```js
export function getSRankSubTier(level) {
  if (level >= 600) return { key: 'S_III', name: 'Divine', label: 'S-III' };
  if (level >= 300) return { key: 'S_II', name: 'Sovereign', label: 'S-II' };
  if (level >= 100) return { key: 'S_I', name: 'Monarch', label: 'S-I' };
  return null;
}

export function getEffectiveXp(baseXp, rankKey, level = 0) {
  let mult = RANK_CONFIG[rankKey]?.xpMultiplier || 1.0;
  if (rankKey === 'S' && level >= 100) {
    const sub = getSRankSubTier(level);
    if (sub?.key === 'S_II') baseXp = Math.floor(baseXp * 2.5);
    if (sub?.key === 'S_III') baseXp = Math.floor(baseXp * 5.0);
  }
  return Math.floor(baseXp * mult);
}
```

**C. In `getDailyQuestsForRank`, change the poolKey line to:**

```js
const poolKey = rankKey.startsWith('S_') ? 'S' : rankKey;
```

And change the `xp:` line inside `result.push` to:

```js
xp: getEffectiveXp(q.baseXp, rankKey, level),
```

**D. Replace `getWeeklyDungeonForRank` with:**

```js
export function getWeeklyDungeonForRank(rankKey, level = 0) {
  let templateKey = rankKey;
  if (rankKey === 'S') {
    const sub = getSRankSubTier(level);
    templateKey = sub?.key || 'S';
  }
  const templates = WEEKLY_DUNGEON_TEMPLATES[templateKey] || WEEKLY_DUNGEON_TEMPLATES.E;
  const makePillarDungeon = (pillar, template) => ({
    ...template,
    steps: template.steps.map((s, i) => ({ id: `wd-${pillar}-${i}`, text: s, completed: false })),
  });
  return {
    weekId: null,
    deen: makePillarDungeon('deen', templates.deen),
    body: makePillarDungeon('body', templates.body),
    money: makePillarDungeon('money', templates.money),
    ummah: makePillarDungeon('ummah', templates.ummah),
    bonusClaimed: false,
  };
}
```

**E. Add these S-rank sub-tier dungeon templates to `WEEKLY_DUNGEON_TEMPLATES` (after the `S:` entry):**

```js
  S_II: {
    deen: { title: "The Sovereign's Decree", description: 'Complete 20 Juz + Tahajjud + Qiyam for 30 nights + Author a book or course on Islamic governance', xp: 2500, steps: ['20 Juz with tafsir notes', 'Tahajjud + Qiyam x30 nights', 'Author 1 book or course on Islamic governance'] },
    body: { title: "The Sovereign's Expedition", description: 'Boss: Transcontinental endurance. The Khalifate must endure any climate, any terrain.', xp: 2500, steps: ['Multi-day expedition (24+ hours) with overnight camping', 'Terrain: mountain, desert, or jungle crossing 25km+', 'Lead 5+ people through the complete expedition'] },
    money: { title: "The Sovereign's Vault", description: 'Build a waqf or endowment that funds 100+ ummah projects per year. Permanent wealth for the Ummah.', xp: 2500, steps: ['Establish waqf or endowment (registered)', 'Annual distribution: 100+ ummah projects funded', 'Self-sustaining: no personal capital injection needed'] },
    ummah: { title: 'Ummah Empire', description: 'Build an organization that directly benefits 1000+ Muslims annually. The Sovereign builds nations.', xp: 2500, steps: ['Organization serves 1000+ Muslims per year', 'Employ 50+ Muslims with halal livelihoods', 'Create 1 multi-generational institution (10+ year plan)'] },
  },
  S_III: {
    deen: { title: "The Divine Command", description: 'Complete the entire Quran with deep reflection + Lead 1000+ Muslims in knowledge or worship + Establish a permanent Islamic institution', xp: 5000, steps: ['Complete Quran with written reflection (114 surahs)', 'Lead/govern 1000+ Muslims in deen', 'Build permanent Islamic institution (school, waqf, or platform)'] },
    body: { title: "The Divine Crucible", description: 'Boss: The body is a temple. Forge it until it outlasts empires. Extreme endurance across all domains.', xp: 5000, steps: ['Ironman-level endurance test: complete within 24 hours', 'Train 100+ Muslims to A-rank fitness standards', 'Document a complete outdoor system for the Ummah'] },
    money: { title: "The Divine Treasury", description: 'Wealth is an amanah. Build systems that fund the Ummah for 100+ years without your presence.', xp: 5000, steps: ['100-year autonomous wealth system operational', 'Funds 500+ ummah projects per year without your input', 'Mentor 50+ Muslims to financial independence'] },
    ummah: { title: 'Ummah of Ages', description: 'The Ummah is one body. You have healed, strengthened, and funded 10,000+ Muslims. This is the Khalifate at its apex.', xp: 5000, steps: ['Direct impact: 10,000+ Muslims benefited', 'Economic engine: 500+ Muslim jobs created', 'Legacy system: operates for 25+ years after you step back'] },
  },
```

**F. Add S-rank generated quest filler AFTER the `RAW_LEVEL_QUESTS` array definition and BEFORE the `LEVEL_QUESTS` export:**

```js
const EXISTING_S_LEVELS = new Set(RAW_LEVEL_QUESTS.filter(q => q.rank === 'S').map(q => q.level));

function getMissionQuestForLevel(level) {
  const baseXp = Math.floor(500 + (level - 100) * 5);
  const gold = Math.floor(500 + (level - 100) * 5);
  const statPoints = Math.max(3, Math.floor(5 + (level - 100) / 50));
  const archetypes = [
    {
      title: lvl => `The Monarch's Mission ${lvl}`,
      desc: lvl => `Level ${lvl}. The Khalifate is not a number. It is a project. Build it before you level.`,
      q1: { title: 'Worship as Foundation', desc: lvl => `At level ${lvl}, worship is not an extra. It is the foundation. Maintain all daily worship practices with zero misses for 30 days.`, pillar: 'deen' },
      q2: { title: 'Build the Mission', desc: lvl => `At level ${lvl}, take one concrete action to advance your primary Khalifate venture. Ship something real. The level waits for the mission.`, pillar: 'money' },
      q3: { title: 'Strengthen the Vessel', desc: lvl => `At level ${lvl}, your body must carry the mission for decades. Add one new outdoor or endurance standard and hold it for 30 days.`, pillar: 'body' },
    },
    {
      title: lvl => `Sovereign Duty ${lvl}`,
      desc: lvl => `Level ${lvl}. Sovereign means self-ruling. Your systems must serve the Ummah without your daily hand.`,
      q1: { title: 'Systematize Worship', desc: lvl => `At level ${lvl}, build one worship system that runs without willpower: automated reminders, family rhythm, or accountability chain.`, pillar: 'deen' },
      q2: { title: 'Automate Impact', desc: lvl => `At level ${lvl}, automate or delegate one operational task in your venture. Free your hands for higher strategy.`, pillar: 'money' },
      q3: { title: 'Teach One', desc: lvl => `At level ${lvl}, teach one Muslim one skill from your mission. Multiply yourself.`, pillar: 'body' },
    },
    {
      title: lvl => `Divine Proof ${lvl}`,
      desc: lvl => `Level ${lvl}. The Divine does not ask for levels. The Divine asks for impact. Prove yours.`,
      q1: { title: 'Impact Audit', desc: lvl => `At level ${lvl}, audit your real-world impact: how many Muslims benefited from your work this month? Document it.`, pillar: 'deen' },
      q2: { title: 'Revenue Proof', desc: lvl => `At level ${lvl}, your venture must generate revenue or save costs. Numbers do not lie. Show the proof.`, pillar: 'money' },
      q3: { title: 'Endurance Under Load', desc: lvl => `At level ${lvl}, complete one outdoor session while carrying your work load: plan, phone, or material. The Khalifa works in the field.`, pillar: 'body' },
    },
    {
      title: lvl => `The Infinite Gate ${lvl}`,
      desc: lvl => `Level ${lvl}. Another gate. Another mission checkpoint. The infinite path demands infinite proof.`,
      q1: { title: 'Gate of Worship', desc: lvl => `At level ${lvl}, add one layer of worship depth: tafsir study, dhikr count, or Quran memorization. Maintain for 30 days.`, pillar: 'deen' },
      q2: { title: 'Gate of Wealth', desc: lvl => `At level ${lvl}, cross one financial threshold in your venture: new client, new market, or new product. The gate opens with proof.`, pillar: 'money' },
      q3: { title: 'Gate of Strength', desc: lvl => `At level ${lvl}, conquer one new terrain or distance standard you have never attempted. The gate rewards the brave.`, pillar: 'body' },
    },
    {
      title: lvl => `Shadow March ${lvl}`,
      desc: lvl => `Level ${lvl}. Your Shadow Army is your automated systems. March them forward.`,
      q1: { title: 'Shadow Worship', desc: lvl => `At level ${lvl}, make one worship habit so automatic that you do it before conscious thought. 30 days, zero misses.`, pillar: 'deen' },
      q2: { title: 'Shadow Wealth', desc: lvl => `At level ${lvl}, build one revenue or savings system that operates while you sleep. Document the automation.`, pillar: 'money' },
      q3: { title: 'Shadow Strength', desc: lvl => `At level ${lvl}, establish one outdoor routine so consistent that missing it feels stranger than doing it. 30 days.`, pillar: 'body' },
    },
    {
      title: lvl => `The Ummah's Checkpoint ${lvl}`,
      desc: lvl => `Level ${lvl}. The Ummah does not need your level. The Ummah needs your work. Checkpoint: show the work.`,
      q1: { title: 'Serve One', desc: lvl => `At level ${lvl}, serve one Muslim in a way they cannot repay: mentorship, funding, connection, or relief. Document the service.`, pillar: 'deen' },
      q2: { title: 'Ummah Revenue', desc: lvl => `At level ${lvl}, direct 10% of your venture's revenue or your income to an ummah cause. Make it systematic, not spontaneous.`, pillar: 'money' },
      q3: { title: 'Ummah Strength', desc: lvl => `At level ${lvl}, use your outdoor readiness to serve: guide a route, carry a load, or protect someone. Strength exists to serve.`, pillar: 'body' },
    },
    {
      title: lvl => `Crown of Proof ${lvl}`,
      desc: lvl => `Level ${lvl}. The crown is not given. It is earned by mission completion. Prove your right to wear it.`,
      q1: { title: 'Proof of Worship', desc: lvl => `At level ${lvl}, lead one family or community member in a worship practice for 30 days. Leadership begins at home.`, pillar: 'deen' },
      q2: { title: 'Proof of Wealth', desc: lvl => `At level ${lvl}, close one business milestone: sale, partnership, investment, or launch. The crown demands revenue.`, pillar: 'money' },
      q3: { title: 'Proof of Strength', desc: lvl => `At level ${lvl}, achieve one outdoor milestone that scares you slightly. The crown is forged in discomfort.`, pillar: 'body' },
    },
    {
      title: lvl => `The Eternal Checkpoint ${lvl}`,
      desc: lvl => `Level ${lvl}. Eternity is built one checkpoint at a time. Prove this one.`,
      q1: { title: 'Eternal Worship', desc: lvl => `At level ${lvl}, memorize one new verse or hadith and teach it to someone within the week. Knowledge that moves is eternal.`, pillar: 'deen' },
      q2: { title: 'Eternal Wealth', desc: lvl => `At level ${lvl}, build one asset — content, system, or relationship — that will benefit Muslims after your death.`, pillar: 'money' },
      q3: { title: 'Eternal Strength', desc: lvl => `At level ${lvl}, document your complete outdoor protocol so others can replicate it. Strength that is shared is eternal.`, pillar: 'body' },
    },
    {
      title: lvl => `Forge of Mission ${lvl}`,
      desc: lvl => `Level ${lvl}. The forge does not produce levels. It produces results. Show your results.`,
      q1: { title: 'Forge Worship', desc: lvl => `At level ${lvl}, endure one spiritual test without breaking your routine: travel, illness, or conflict. The forge tests the steel.`, pillar: 'deen' },
      q2: { title: 'Forge Wealth', desc: lvl => `At level ${lvl}, survive one business test: delayed payment, lost client, or market shift. Adapt and document the lesson.`, pillar: 'money' },
      q3: { title: 'Forge Strength', desc: lvl => `At level ${lvl}, train in adverse conditions: heat, rain, or fatigue. The forge is hot for a reason.`, pillar: 'body' },
    },
    {
      title: lvl => `The Khalifa's Checkpoint ${lvl}`,
      desc: lvl => `Level ${lvl}. The Khalifa does not chase levels. He chases mission completion. Checkpoint.`,
      q1: { title: "Khalifa's Worship", desc: lvl => `At level ${lvl}, worship with such consistency that others set their schedules by yours. Be the clock of the community.`, pillar: 'deen' },
      q2: { title: "Khalifa's Wealth", desc: lvl => `At level ${lvl}, your venture must employ, serve, or benefit one more Muslim than last month. Growth is responsibility.`, pillar: 'money' },
      q3: { title: "Khalifa's Strength", desc: lvl => `At level ${lvl}, lead one outdoor session for family or community. The Khalifa walks first and checks on everyone behind him.`, pillar: 'body' },
    },
  ];

  const a = archetypes[level % archetypes.length];
  return {
    level,
    rank: 'S',
    title: a.title(level),
    description: a.desc(level),
    quests: [
      { id: `lq-s-${level}-1`, title: a.q1.title, description: a.q1.desc(level), xp: baseXp, pillar: a.q1.pillar },
      { id: `lq-s-${level}-2`, title: a.q2.title, description: a.q2.desc(level), xp: Math.floor(baseXp * 0.85), pillar: a.q2.pillar },
      { id: `lq-s-${level}-3`, title: a.q3.title, description: a.q3.desc(level), xp: Math.floor(baseXp * 0.85), pillar: a.q3.pillar },
    ],
    reward: { gold, statPoints, message: `Level ${level} complete. Mission checkpoint passed. The Khalifate advances.` },
  };
}

const S_RANK_GENERATED_QUESTS = [];
for (let level = 101; level < 999; level++) {
  if (EXISTING_S_LEVELS.has(level)) continue;
  S_RANK_GENERATED_QUESTS.push(getMissionQuestForLevel(level));
}

export const LEVEL_QUESTS = [...RAW_LEVEL_QUESTS, ...S_RANK_GENERATED_QUESTS].map(levelQuest => ({
  ...levelQuest,
  quests: (levelQuest.quests || []).map(quest => {
    if (quest.pillar !== 'body') return quest;
    const override = ADVENTURE_LEVEL_QUEST_OVERRIDES[`${levelQuest.level}:${quest.id}:${quest.title}`];
    return override ? { ...quest, ...override } : quest;
  }),
}));
```

---

### 4. `src/logic/questEngine.js` — KEY CHANGES

**A. Update imports at the top:**

Add these imports:
```js
import { calculateExtremeReward, resetFailureStreak } from './extremeMode';
import {
  initializeKhalifateObjectives,
  getBlockingGate,
  isGateComplete,
  getGateProgress,
} from '../data/missionGates';
```

**B. In `initializeDailyQuests`, update the daily quests line to pass level:**

```js
const baseDailyQuests = getDailyQuestsForRank(rank.key, state.dailyQuests, (state.user?.name || '').trim().toLowerCase(), state.user.overallLevel);
const dailyQuests = addMissionDailyQuests(baseDailyQuests, rank.key, state.history || [], state.user.overallLevel);
```

And add after `initializeMonarchTrials`:
```js
nextState = initializeKhalifateObjectives(nextState);
```

**C. In `initializeWeeklyDungeon`, pass level:**

```js
const dungeon = getWeeklyDungeonForRank(rank.key, state.user.overallLevel);
```

**D. In `completeDailyQuest`, add extreme mode reward logic inside the function (after `const baseXp` and before `// Apply stat modifiers`):**

```js
  // ─── EXTREME MODE REWARD ───
  const extreme = calculateExtremeReward(state, quest.pillar, baseXp, rank.key);
```

And after `let finalXp = Math.floor(traitModifiedXp * debuffMultiplier);`, add:
```js
  // Apply extreme multiplier on top of everything
  if (extreme.multiplier > 1) {
    finalXp = Math.floor(finalXp * extreme.multiplier);
  }
```

And after `let enchantState = checkEnchant(durabilityState, quest.pillar);`, add:
```js
  // ─── RESET FAILURE STREAK ON SUCCESS ───
  const streakResetState = resetFailureStreak(enchantState, quest.pillar);
```

Change the `result` construction to use `streakResetState`:
```js
  const result = {
    ...streakResetState,
    pillars: newPillars,
    dailyQuests: newDailyQuests,
    gold: streakResetState.gold + finalGold + (extreme.bonusGold || 0),
    history: [...streakResetState.history, historyEntry],
  };
```

And attach extreme message:
```js
  // Attach extreme reward message
  if (extreme.message) {
    result.systemMessages = [
      ...(result.systemMessages || []),
      extreme.message,
    ];
  }
```

**E. In `recalculateOverallLevel`, add mission gate enforcement after `let overall = ...`:**

```js
  // ─── MISSION GATE ENFORCEMENT ───
  const blockingGate = getBlockingGate(state, overall);
  let gated = false;
  if (blockingGate && overall > blockingGate.level) {
    overall = blockingGate.level;
    gated = true;
  }
```

And add the gate block message after the rank up check:
```js
  // Mission gate block message
  if (gated && blockingGate) {
    const progress = getGateProgress(state, blockingGate);
    newState.systemMessages = [
      ...newState.systemMessages,
      {
        type: 'penalty',
        title: `🚫 ${blockingGate.title}`,
        subtitle: blockingGate.subtitle,
        message: `LEVEL ASCENSION HALTED.\n\nYour calculated power exceeds your Khalifate. The System will not advance you to level ${overall + 1} until you complete ${progress.required - progress.completed} more mission objective${progress.required - progress.completed === 1 ? '' : 's'}:\n\n${blockingGate.objectives.map(o => `${(state.khalifateObjectives || []).find(ko => ko.id === o.id)?.completed ? '✅' : '⬜'} ${o.label}: ${o.description}`).join('\n')}\n\nThe level is a reflection. The mission is the reality. Complete the mission first.`,
      },
    ];
  }
```

---

### 5. `src/data/store.js` — KEY CHANGES

**A. Update BUILD_VERSION:**

```js
const BUILD_VERSION = '2026-06-04-v4.8-cache-bust-1749069000';
```

**B. In `DEFAULT_STATE`, add these fields (before `buildVersion`):**

```js
  failureStreaks: { deen: 0, body: 0, money: 0 },
  khalifateObjectives: [],
```

**C. In `normalizeStateShape`, add normalization (before `normalized.buildVersion`):**

```js
  normalized.failureStreaks = {
    deen: state.failureStreaks?.deen || 0,
    body: state.failureStreaks?.body || 0,
    money: state.failureStreaks?.money || 0,
  };
  normalized.khalifateObjectives = Array.isArray(state.khalifateObjectives) ? state.khalifateObjectives : [];
```

---

### 6. `src/components/Dashboard.jsx` — KEY CHANGES

**A. Add these imports:**

```js
import { getExtremeModeSummary, getExtremePillarLabel } from '../logic/extremeMode';
import { getActiveGate, getGateProgress, isGateComplete, completeKhalifateObjective, MISSION_GATES } from '../data/missionGates';
```

**B. Add the Khalifate Objectives panel. Insert this JSX block after the Monarch Trials section (around line 484) and before the Equipment Status section:**

```jsx
      {/* Khalifate Mission Objectives */}
      {(() => {
        const activeGate = getActiveGate(state);
        if (!activeGate) return null;
        const progress = getGateProgress(state, activeGate);
        const allObjectives = activeGate.objectives.map(obj => {
          const userObj = (state.khalifateObjectives || []).find(o => o.id === obj.id);
          return { ...obj, completed: userObj?.completed || false, completedAt: userObj?.completedAt || null };
        });
        return (
          <div className="glass-panel p-3 border border-emerald-500/30 bg-emerald-950/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <Crown size={16} /> KHALIFATE OBJECTIVES
              </div>
              <div className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-900/20 text-emerald-300">
                {progress.completed}/{progress.required} complete
              </div>
            </div>
            <div className="text-xs text-emerald-500/70 mb-2">
              {activeGate.subtitle}
            </div>
            <div className="w-full bg-cyan-900/30 rounded-full h-1.5 mb-3">
              <div className="bg-emerald-500 rounded-full h-1.5 transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
            <div className="space-y-2">
              {allObjectives.map(obj => (
                <div key={obj.id} className={`flex items-start gap-2 rounded-lg border p-2 ${obj.completed ? 'border-emerald-700/30 bg-emerald-950/10' : 'border-cyan-800/20 bg-cyan-950/10'}`}>
                  <button
                    onClick={() => {
                      if (obj.completed) return;
                      setState(prev => completeKhalifateObjective(prev, obj.id));
                    }}
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${obj.completed ? 'bg-emerald-500 border-emerald-500' : 'border-cyan-600 hover:border-emerald-400'}`}
                  >
                    {obj.completed && <CheckCircle2 size={12} className="text-black" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${obj.completed ? 'text-emerald-400 line-through opacity-60' : 'text-cyan-300'}`}>{obj.label}</div>
                    <div className="text-[10px] text-cyan-500/60 leading-tight">{obj.description}</div>
                    {obj.completed && obj.completedAt && (
                      <div className="text-[9px] text-emerald-500/50 mt-0.5">Completed {new Date(obj.completedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${obj.pillar === 'deen' ? 'border-cyan-700/30 text-cyan-400' : obj.pillar === 'money' ? 'border-yellow-700/30 text-yellow-400' : obj.pillar === 'body' ? 'border-rose-700/30 text-rose-400' : 'border-purple-700/30 text-purple-400'}`}>
                    {obj.pillar}
                  </span>
                </div>
              ))}
            </div>
            {progress.percent >= 100 && (
              <div className="mt-2 text-xs text-emerald-400 font-semibold text-center">
                🚪 Gate Open. Level ascension unlocked.
              </div>
            )}
          </div>
        );
      })()}
```

**C. Add the Extreme Mode Warning panel. Insert after the Debuffs Warning section:**

```jsx
      {/* Extreme Mode Warning */}
      {(() => {
        const extremePillars = getExtremeModeSummary(state);
        if (extremePillars.length === 0) return null;
        return (
          <div className="glass-panel p-4 border border-orange-500/30 bg-orange-950/10">
            <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2 text-sm tracking-wider">
              <Flame size={18} /> EXTREME MODE
            </div>
            {extremePillars.map(({ pillar, streak, severity }) => (
              <div key={pillar} className={`text-sm flex items-center gap-2 ${severity === 'critical' ? 'text-red-300' : severity === 'severe' ? 'text-orange-300' : 'text-orange-300/70'}`}>
                <AlertTriangle size={14} className={severity === 'critical' ? 'text-red-400' : 'text-orange-400'} />
                {getPillarDisplayKey(pillar)}: {getExtremePillarLabel(streak)} — {streak} days of silence
                <span className="text-[10px] ml-auto border border-orange-700/30 bg-orange-900/20 px-1.5 py-0.5 rounded">
                  Complete to break
                </span>
              </div>
            ))}
          </div>
        );
      })()}
```

---

### 7. `src/data/rewards.js` — KEY CHANGES

**A. Add `getEffectiveStoreRank` and update `RANK_ORDER` at the top:**

```js
export function getEffectiveStoreRank(level = 0) {
  if (level >= 600) return 'S_III';
  if (level >= 300) return 'S_II';
  if (level >= 100) return 'S';
  if (level >= 71)  return 'A';
  if (level >= 46)  return 'B';
  if (level >= 26)  return 'C';
  if (level >= 11)  return 'D';
  return 'E';
}

const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S', 'S_II', 'S_III'];
```

**B. Update all rank-check functions to accept `userLevel = 0` and use effective rank for S players:**

Replace `isItemUnlocked` with:
```js
export function isItemUnlocked(itemRank, userRank, userLevel = 0) {
  const effectiveRank = userRank === 'S' ? getEffectiveStoreRank(userLevel) : userRank;
  const itemIdx = RANK_ORDER.indexOf(itemRank);
  const userIdx = RANK_ORDER.indexOf(effectiveRank);
  if (itemIdx === -1 || userIdx === -1) return false;
  return userIdx >= itemIdx;
}
```

Replace `getStoreItemsForRank` with:
```js
export function getStoreItemsForRank(userRank, userLevel = 0) {
  const effectiveRank = userRank === 'S' ? getEffectiveStoreRank(userLevel) : userRank;
  return REWARD_ITEMS.map(item => ({
    ...item,
    unlocked: isItemUnlocked(item.unlockRank, userRank, userLevel),
  }));
}
```

Replace `getFeaturedItems` with:
```js
export function getFeaturedItems(userRank, userLevel = 0) {
  const effectiveRank = userRank === 'S' ? getEffectiveStoreRank(userLevel) : userRank;
  const userIdx = RANK_ORDER.indexOf(effectiveRank);
  const featuredRanks = RANK_ORDER.slice(Math.max(0, userIdx - 1), userIdx + 1);
  return REWARD_ITEMS
    .filter(item => featuredRanks.includes(item.unlockRank))
    .map(item => ({ ...item, unlocked: isItemUnlocked(item.unlockRank, userRank, userLevel) }));
}
```

Replace `getNextUnlockPreview` with:
```js
export function getNextUnlockPreview(userRank, userLevel = 0) {
  const effectiveRank = userRank === 'S' ? getEffectiveStoreRank(userLevel) : userRank;
  const userIdx = RANK_ORDER.indexOf(effectiveRank);
  const nextRank = RANK_ORDER[userIdx + 1];
  if (!nextRank) return null;
  const nextItems = REWARD_ITEMS.filter(item => item.unlockRank === nextRank);
  if (nextItems.length === 0) return null;
  return { rank: nextRank, items: nextItems };
}
```

**C. Add S-II items (after the S-rank items block, before S-III):**

```js
  // ═══════════════════════════════════════
  // S-II RANK: Sovereign (Empire-scale rewards — 18 items)
  // Unlocked at level 300. Costs 5M – 50M gold.
  // ═══════════════════════════════════════
  {
    id: 'reward-sovereign-estate', name: 'Sovereign Estate', cost: 5000000, category: 'wealth',
    description: 'A fully paid family estate: land, villa, and garden. The Sovereign builds dynasties, not apartments.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-factory', name: 'Ummah Manufacturing Unit', cost: 8000000, category: 'wealth',
    description: 'Fund a small factory or production unit employing 50+ Muslims. Economic jihad in action.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-hajj-parents-luxury', name: 'Luxury Hajj for Parents', cost: 6000000, category: 'travel',
    description: 'First-class Hajj package for both parents with private guide, premium hotel, and medical support.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-gold-5kg', name: '5 Kilogram Gold Bullion', cost: 10000000, category: 'wealth',
    description: "Five kilos of 24-karat gold stored in a Swiss or Dubai vault. The Sovereign's treasury.",
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-ai-datacenter', name: 'AI Compute Cluster', cost: 12000000, category: 'tech',
    description: 'A leased AI datacenter cluster (8x A100/H100 GPUs). Train models that serve the Ummah.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-solar-ummah-grid', name: 'Ummah Solar Micro-Grid', cost: 15000000, category: 'wealth',
    description: 'Fund a village-scale solar micro-grid serving 1,000+ Muslims. Clean power, clean intentions.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-expedition-yacht', name: 'Expedition Yacht', cost: 20000000, category: 'luxury',
    description: 'A 60-foot expedition yacht for family voyages, dawah trips, and coastal exploration.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-school', name: 'Ummah School Campus', cost: 25000000, category: 'charity',
    description: 'Build or fully fund a school campus for 500+ Muslim students. Your name etched above the gate.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-family-office', name: 'Family Office Setup', cost: 18000000, category: 'wealth',
    description: 'Establish a formal family office with investment team, legal counsel, and zakat accountant.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-umrah-100', name: 'Umrah for 100 Muslims', cost: 30000000, category: 'travel',
    description: 'Sponsor Umrah for 100 Muslims who cannot afford it. The Sovereign carries the Ummah to the Haram.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-vawt-park', name: 'VAWT Wind Park', cost: 35000000, category: 'wealth',
    description: 'Install a 1MW vertical-axis wind turbine park. Power a Muslim community with renewable energy.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-sovereign-garage', name: 'Sovereign Vehicle Collection', cost: 22000000, category: 'luxury',
    description: 'A curated collection: electric SUV for family, off-road for adventure, sedan for meetings.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-halal-vc-fund', name: 'Halal VC Fund Seat', cost: 40000000, category: 'wealth',
    description: 'A limited-partner seat in a Shariah-compliant venture capital fund. Invest in Muslim founders.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-hospital-wing', name: 'Ummah Hospital Wing', cost: 45000000, category: 'charity',
    description: 'Fund a hospital wing or clinic serving poor Muslims. Healing is the highest sadaqah.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-generational-mosque', name: 'Generational Mosque', cost: 50000000, category: 'charity',
    description: 'Build a mosque designed to last 200 years: marble, minaret, madrasa, and community hall.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-sovereign-library', name: 'Sovereign Manuscript Library', cost: 28000000, category: 'home',
    description: 'A climate-controlled library housing rare Islamic manuscripts, first-edition tafsir, and your collected works.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-tech-academy', name: 'Ummah Tech Academy', cost: 32000000, category: 'tech',
    description: 'Launch a tuition-free tech academy for Muslims. AI, coding, and entrepreneurship. 1,000 graduates per year.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
  {
    id: 'reward-parents-palace', name: 'Parents Retirement Home', cost: 38000000, category: 'family',
    description: 'A custom-built home for your parents with gardens, prayer room, and full-time care. Jannah is at their feet.',
    unlockRank: 'S_II', rarity: 'mythic',
  },
```

**D. Add S-III items (after S-II block):**

```js
  // ═══════════════════════════════════════
  // S-III RANK: Divine (Legacy-scale rewards — 18 items)
  // Unlocked at level 600. Costs 50M – 500M gold.
  // ═══════════════════════════════════════
  {
    id: 'reward-divine-palace', name: 'Divine Palace', cost: 50000000, category: 'wealth',
    description: 'A palace-grade residence: domes, courtyards, a private masjid, and quarters for guests and students.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-university', name: 'Ummah University Endowment', cost: 80000000, category: 'charity',
    description: 'A $10M endowment for an Islamic university or college. Educate generations until Qiyamah.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-gold-50kg', name: '50 Kilogram Gold Reserve', cost: 100000000, category: 'wealth',
    description: 'Fifty kilos of gold bullion in secure vaults across three continents. The Divine treasury knows no borders.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-city', name: 'Ummah Township', cost: 120000000, category: 'wealth',
    description: 'Develop a Muslim township: homes, masjid, school, clinic, market, and park. A city built on Tawhid.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-private-island', name: 'Private Island Retreat', cost: 150000000, category: 'luxury',
    description: 'A private island for family retreats, leadership gatherings, and uninterrupted worship.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-hajj-1000', name: 'Hajj for 1,000 Muslims', cost: 200000000, category: 'travel',
    description: 'Sponsor Hajj for 1,000 Muslims from poor communities. The Divine carries the Ummah to Arafat.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-bank', name: 'Ummah Microfinance Bank', cost: 250000000, category: 'wealth',
    description: 'Establish a Shariah-compliant microfinance bank serving 100,000+ Muslims. Interest-free dignity.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-renewable-ummah-grid', name: 'Ummah National Grid', cost: 300000000, category: 'wealth',
    description: 'Fund a 100MW renewable energy plant powering an entire Muslim region. Light the Ummah with clean power.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-divine-waqf', name: 'Divine Waqf Empire', cost: 350000000, category: 'charity',
    description: 'A portfolio of waqf properties: farms, schools, clinics, and masjids. Self-sustaining charity forever.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-legacy-aircraft', name: 'Legacy Aircraft', cost: 400000000, category: 'luxury',
    description: 'A private jet for dawah tours, Ummah relief missions, and multi-city leadership. Time is the Divine\'s currency.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-research-institute', name: 'Ummah Research Institute', cost: 450000000, category: 'tech',
    description: 'An AI and renewable energy research institute employing 500+ Muslim scientists. Innovation for the Ummah.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-divine-museum', name: 'Islamic Heritage Museum', cost: 500000000, category: 'charity',
    description: 'A world-class museum preserving Islamic art, science, and history. Open to all humanity, funded by you.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-media-empire', name: 'Ummah Media Empire', cost: 200000000, category: 'tech',
    description: 'A global media platform: TV, streaming, publishing. Tell the Ummah\'s story to billions.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-generational-fleet', name: 'Generational Vehicle Fleet', cost: 180000000, category: 'luxury',
    description: 'A fleet of 20 vehicles for family, security, guests, and operations. Every journey is dignified.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-housing', name: 'Ummah Housing Foundation', cost: 280000000, category: 'charity',
    description: 'Build 1,000 homes for displaced or poor Muslims. A roof is the first act of humanity.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-divine-tech-unicorn', name: 'Ummah Tech Unicorn Fund', cost: 320000000, category: 'wealth',
    description: 'A $50M fund to build Muslim-founded tech unicorns. The Divine invests in the future.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-ummah-space', name: 'Ummah Satellite', cost: 150000000, category: 'tech',
    description: 'Launch a communications satellite serving Muslim remote communities. Reach the unreachable.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
  {
    id: 'reward-final-waqf', name: 'The Infinite Endowment', cost: 500000000, category: 'charity',
    description: 'A $100M perpetual endowment. Its returns fund education, relief, and dawah forever. Your name lives in every graduate, every healed patient, every prayer.',
    unlockRank: 'S_III', rarity: 'mythic',
  },
```

---

### 8. `src/components/RewardStore.jsx` — KEY CHANGES

In the component body, add `userLevel` and pass it to all store functions:

```js
  const userLevel = state.user.overallLevel || 0;
  const allItems = getStoreItemsForRank(userRank, userLevel);
  const featuredItems = getFeaturedItems(userRank, userLevel);
  const nextUnlock = getNextUnlockPreview(userRank, userLevel);
```

---

### 9. `src/logic/missionQuestGenerator.js` — KEY CHANGES

Change the function signature and the `getEffectiveXp` call:

```js
export function addMissionDailyQuests(baseQuests = [], rankKey = 'E', history = [], level = 0) {
```

And inside the return:
```js
      xp: getEffectiveXp(template.baseXp, rankKey, level),
```

---

### 10. `src/data/equipment.js` — KEY CHANGES

**A. Add `levelToGearTier` function:**

```js
export function levelToGearTier(level) {
  if (level <= 25)  return 100;
  if (level <= 70)  return 150;
  if (level <= 99)  return 200;
  if (level <= 299) return 300;
  if (level <= 599) return 450;
  return 600;
}
```

**B. Update `dropEquipment` to use overall level:**

```js
export function dropEquipment(levelOrRank, preferPillar = null) {
  const tier = typeof levelOrRank === 'number' ? levelToGearTier(levelOrRank) : levelToGearTier(0);
  let pool = Object.values(EQUIPMENT_TEMPLATES).filter(e => e.maxDurability === tier);
```

**C. Ensure `updateDurability` creates shallow copies (immutable):**

```js
export function updateDurability(state, missedDaily = false, completedDaily = false) {
  const newEquipment = { ...state.equipment };
  let changed = false;
  Object.keys(newEquipment).forEach(slot => {
    const item = newEquipment[slot];
    if (!item) return;
    let durability = item.durability || 0;
    if (missedDaily) {
      durability = Math.max(0, durability - 10);
    }
    if (completedDaily) {
      durability = Math.min(item.maxDurability || 100, durability + 5);
    }
    if (durability !== item.durability) {
      newEquipment[slot] = { ...item, durability };
      changed = true;
    }
  });
  return changed ? { ...state, equipment: newEquipment } : state;
}
```

**D. Ensure `checkEnchant` creates shallow copies:**

```js
export function checkEnchant(state, pillar) {
  const streak = state.pillars[pillar]?.streak || 0;
  if (streak >= 30 && streak % 30 === 0) {
    const newEquipment = { ...state.equipment };
    let enchantedAny = false;
    Object.keys(newEquipment).forEach(slot => {
      const item = newEquipment[slot];
      if (item && (item.pillar === pillar || item.pillar === 'all') && (item.durability || 0) > 0) {
        const newLevel = Math.min(ENCHANT_CAP, (item.enchantLevel || 0) + 1);
        if (newLevel !== item.enchantLevel) {
          newEquipment[slot] = { ...item, enchantLevel: newLevel };
          enchantedAny = true;
        }
      }
    });
    if (!enchantedAny) return state;
    return {
      ...state,
      equipment: newEquipment,
      systemMessages: [
        ...(state.systemMessages || []),
        {
          type: 'reward',
          title: 'EQUIPMENT ENCHANTED',
          subtitle: `${getPillarDisplayKey(pillar)} Streak ${streak}`,
          message: `Your gear has been blessed by consistency. +5% boost per enchant level (cap: +${ENCHANT_CAP}).`,
        },
      ],
    };
  }
  return state;
}
```

---

### 11. `src/logic/penalties.js` — KEY CHANGES

**A. Add imports at the top:**

```js
import {
  getFailureStreak,
  incrementFailureStreak,
  applyExtremePenalty,
} from './extremeMode';
```

**B. In `checkAndApplyPenalties`, make these changes inside the pillar loop:**

Change declarations at the top of the loop section to:
```js
  let updatedPillars = { ...state.pillars };
  let updatedFailureStreaks = { ...(state.failureStreaks || {}) };
```

After counting `consecutiveMissedAtEnd`, add:
```js
    const prevStreak = getFailureStreak(state, pillar);
    let newStreak = consecutiveMissedAtEnd > 0 ? prevStreak + consecutiveMissedAtEnd : 0;
```

After applying the standard penalty (the `if (missedCount >= 1)` block), add:
```js
    // Update failure streak
    updatedFailureStreaks[pillar] = newStreak;

    // Apply Extreme Mode penalty if failure streak >= 3
    if (newStreak >= 3) {
      const extremeResult = applyExtremePenalty(
        { ...state, pillars: updatedPillars, failureStreaks: updatedFailureStreaks },
        pillar,
        rankKey
      );
      if (extremeResult.message) {
        updatedPillars = extremeResult.state.pillars;
        updatedFailureStreaks = { ...extremeResult.state.failureStreaks };
        penalties.push({
          pillar,
          type: 'extreme',
          days: newStreak,
          xpLoss: extremeResult.xpLossExtra,
          message: extremeResult.message,
        });
      }
    }
```

And update the return object:
```js
  return {
    penalties,
    redemptionQuests,
    updatedPillars,
    updatedFailureStreaks,
    dungeonPenalty,
    lastPenaltyCheckDate: today,
  };
```

---

### 12. `src/components/AIAssistant.jsx` — KEY CHANGES

**A. Fix `clearChat` with `useCallback`:**

Replace the `clearChat` definition with:
```js
  const clearChat = useCallback((e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    localStorage.removeItem('system_chat_history');
    if (!setState) return;
    setState(prev => ({
      ...prev,
      aiChatHistory: [],
      aiChatUpdatedAt: Date.now(),
    }));
  }, [setState]);
```

**B. In `handleQuickAction`, the cost logic is already present. Ensure Forge 3 is free and active features cost Solo Clear:**

The existing code should have this block (verify it exists):
```js
    // Forge 3 is self-challenge — it does NOT cost Solo Clear
    if (setState && action !== 'forge3') {
      setState(prev => ({
        ...prev,
        weeklyStats: {
          ...prev.weeklyStats,
          aiPromptsUsed: (prev.weeklyStats?.aiPromptsUsed || 0) + 1,
        },
      }));
    }
```

And in the header, the Solo Clear warning banner:
```jsx
            {(state.weeklyStats?.aiPromptsUsed || 0) === 0 && (
              <div className="px-3 py-2 bg-green-950/20 border-b border-green-800/30 flex items-center gap-2">
                <Zap size={14} className="text-green-400 shrink-0" />
                <div className="text-[11px] text-green-300/80 leading-snug">
                  <span className="font-semibold text-green-300">Solo Clear bonus active.</span>{' '}
                  Chat & Forge are free. Orders, Audit, Accountability & Commands cost your 2× extraction rate.
                </div>
              </div>
            )}
```

---

## VERIFICATION CHECKLIST AFTER DEPLOY

1. Build passes: `npm run build` with zero errors
2. Check `dist/assets/index-*.js` contains these strings:
   - `The Monarch's Proof`
   - `Before wearing the crown, build the kingdom`
   - `EXTREME XP MULTIPLIER`
   - `discipline over decay`
   - `Ummah Manufacturing Unit`
   - `The Infinite Endowment`
3. Load the app and check:
   - Dashboard shows **KHALIFATE OBJECTIVES** panel (green, crown icon)
   - Store shows S-II items at level 300+, S-III at 600+
   - Extreme Mode warning appears after 3 missed days
   - Custom quests complete correctly
   - AI Assistant Clear button works
4. Bump `BUILD_VERSION` in `src/data/store.js` to force cache invalidation
5. Deploy to Vercel: `npx vercel deploy --prod`

---

**End of deploy guide.**
