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
      { id: 'kg-100-3', label: 'Body of the Khalifa', description: 'Establish a consistent physical training protocol you can maintain for 1 year.', pillar: 'body' },
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
      { id: 'kg-200-2', label: 'Community Anchor', description: 'Build one community practice — study circle, training group, or mentorship — that meets regularly without you.', pillar: 'deen' },
      { id: 'kg-200-3', label: 'Physical Standard', description: 'Achieve an endurance standard in the top 20% of natural athletes in your age group.', pillar: 'body' },
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
      { id: 'kg-300-3', label: 'Teach Ten', description: 'Train 10 Muslims to B-rank standards in deen, physical readiness, or wealth-building.', pillar: 'service' },
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
      { id: 'kg-500-4', label: 'Lifetime Fitness', description: 'Maintain elite physical readiness for 5 consecutive years without a break longer than 7 days.', pillar: 'body' },
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
      { id: 'kg-999-3', label: 'The Final Sujood', description: 'You have maintained perfect worship, physical readiness, and wealth discipline for so long that they are no longer habits. They are identity.', pillar: 'deen' },
      { id: 'kg-999-4', label: 'Beyond the Mission', description: 'You have expanded your mission beyond its original scope — into new markets, new nations, or new generations.', pillar: 'service' },
    ],
  },
];

export function getGateForLevel(level) {
  return MISSION_GATES.find(g => g.level === level) || null;
}

export function getActiveGate(state) {
  const currentLevel = state.user?.overallLevel || 0;
  // Only show gates the user has actually reached (level <= current)
  // and has not yet completed. Gates ahead of the user stay hidden.
  for (const gate of MISSION_GATES) {
    if (gate.level <= currentLevel && !isGateComplete(state, gate)) {
      return gate;
    }
  }
  return null;
}

/**
 * Returns the next upcoming gate for preview (only within 15 levels).
 * E.g. at level 90, previews level 100 gate. At level 4, returns null.
 */
export function getNextGatePreview(state) {
  const currentLevel = state.user?.overallLevel || 0;
  const PREVIEW_WINDOW = 15;
  for (const gate of MISSION_GATES) {
    if (gate.level > currentLevel && gate.level <= currentLevel + PREVIEW_WINDOW && !isGateComplete(state, gate)) {
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
    // Only skip gates STRICTLY below current level. If user is already AT the gate
    // level but hasn't completed it, they must finish it before advancing further.
    if (gate.level < (state.user?.overallLevel || 0)) continue;
    if (proposedLevel >= gate.level && !isGateComplete(state, gate)) {
      return gate;
    }
  }
  return null;
}

/** Initialize default objectives into state if missing */
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
  return {
    ...state,
    khalifateObjectives: [...existing, ...defaults],
  };
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
