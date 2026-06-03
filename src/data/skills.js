/** ============================================================
 *  SKILL SYSTEM — Active Abilities with Cooldowns
 *  ============================================================
 *  Award 1 Skill Point per 5 overall levels.
 *  Skills modify XP, gold, or debuff immunity when active.
 *  ============================================================ */

export const SKILL_TEMPLATES = {
  'takbeer-sprint': {
    id: 'takbeer-sprint',
    name: 'Khilafa Sprint',
    pillar: 'body',
    description: '2x Body XP for 24 hours. The body is an amanah. Train like the Khalifa you are becoming.',
    cooldownHours: 72,
    durationHours: 24,
    effect: { type: 'xpMultiplier', pillar: 'body', multiplier: 2.0 },
  },
  'iron-will': {
    id: 'iron-will',
    name: 'Shield of Tawhid',
    pillar: 'body',
    description: 'Immune to debuffs for 48 hours. Tawhid is your shield against all weakness.',
    cooldownHours: 168,
    durationHours: 48,
    effect: { type: 'debuffImmunity', durationHours: 48 },
  },
  'zakat-blast': {
    id: 'zakat-blast',
    name: 'Ummah Treasury',
    pillar: 'money',
    description: 'One Money quest pays 3x gold. Wealth flows to the one who carries the Ummah.',
    cooldownHours: 168,
    durationHours: 0,
    effect: { type: 'goldMultiplier', pillar: 'money', multiplier: 3.0, uses: 1 },
  },
  'shadow-march': {
    id: 'shadow-march',
    name: 'Divine Reinforcement',
    pillar: 'all',
    description: 'Auto-complete one daily quest per week. Allah sends reinforcements to the steadfast.',
    cooldownHours: 168,
    durationHours: 0,
    effect: { type: 'autoComplete', count: 1 },
  },
};

export function getAvailableSkills(state) {
  return Object.values(SKILL_TEMPLATES).filter(s => {
    const unlocked = state.skills.some(us => us.id === s.id);
    return !unlocked;
  });
}

export function unlockSkill(state, skillId) {
  const template = SKILL_TEMPLATES[skillId];
  if (!template) return state;
  const alreadyUnlocked = state.skills.some(s => s.id === skillId);
  if (alreadyUnlocked) return state;

  const newSkills = [
    ...state.skills,
    {
      id: template.id,
      name: template.name,
      pillar: template.pillar,
      cooldownHours: template.cooldownHours,
      lastUsed: null,
      active: false,
      expiresAt: null,
      usesRemaining: null,
    },
  ];

  return {
    ...state,
    skills: newSkills,
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'skill',
        title: 'SKILL UNLOCKED',
        subtitle: template.name,
        message: template.description,
      },
    ],
  };
}

export function activateSkill(state, skillId) {
  const template = SKILL_TEMPLATES[skillId];
  if (!template) return state;
  const userSkill = state.skills.find(s => s.id === skillId);
  if (!userSkill) return state;

  const now = Date.now();
  const cooldownMs = template.cooldownHours * 3600000;
  if (userSkill.lastUsed && (now - new Date(userSkill.lastUsed).getTime()) < cooldownMs) {
    return state; // On cooldown
  }

  const newSkills = state.skills.map(s =>
    s.id === skillId
      ? {
          ...s,
          lastUsed: new Date().toISOString(),
          active: true,
          expiresAt: template.durationHours ? now + template.durationHours * 3600000 : null,
          usesRemaining: template.effect.uses || null,
        }
      : s
  );

  return {
    ...state,
    skills: newSkills,
  };
}

export function isSkillActive(state, skillId) {
  const userSkill = state.skills.find(s => s.id === skillId);
  if (!userSkill || !userSkill.active) return false;
  if (userSkill.expiresAt && Date.now() > userSkill.expiresAt) return false;
  return true;
}

export function getSkillCooldownRemaining(state, skillId) {
  const userSkill = state.skills.find(s => s.id === skillId);
  if (!userSkill || !userSkill.lastUsed) return 0;
  const template = SKILL_TEMPLATES[skillId];
  if (!template) return 0;
  const cooldownMs = template.cooldownHours * 3600000;
  const elapsed = Date.now() - new Date(userSkill.lastUsed).getTime();
  return Math.max(0, cooldownMs - elapsed);
}

export function applySkillEffects(xp, gold, pillar, state) {
  let result = { xp, gold };
  (state.skills || []).forEach(s => {
    if (!isSkillActive(state, s.id)) return;
    const template = SKILL_TEMPLATES[s.id];
    if (!template) return;
    const effect = template.effect;

    if (effect.type === 'xpMultiplier' && (effect.pillar === pillar || effect.pillar === 'all')) {
      result.xp = Math.floor(result.xp * effect.multiplier);
    }
    if (effect.type === 'goldMultiplier' && (effect.pillar === pillar || effect.pillar === 'all')) {
      const usesLeft = s.usesRemaining ?? effect.uses ?? 1;
      if (usesLeft > 0) {
        result.gold = Math.floor(result.gold * effect.multiplier);
        s.usesRemaining = usesLeft - 1;
        if (s.usesRemaining <= 0) s.active = false;
      }
    }
  });
  return result;
}

export function consumeAutoComplete(state) {
  const skill = state.skills.find(s => s.id === 'shadow-march');
  if (!skill || !isSkillActive(state, 'shadow-march')) return state;
  const usesLeft = skill.usesRemaining ?? 1;
  if (usesLeft <= 0) return state;

  const newSkills = state.skills.map(s =>
    s.id === 'shadow-march'
      ? { ...s, usesRemaining: usesLeft - 1, active: usesLeft - 1 > 0 }
      : s
  );
  return { ...state, skills: newSkills };
}
