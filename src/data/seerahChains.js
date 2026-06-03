/** ============================================================
 *  SEERAH CHARACTER QUEST CHAINS
 *  ============================================================
 *  21-day chains embodying prophetic traits for the Khalifa.
 *  Failure on any day resets the chain.
 *  Completion awards permanent Nabawi Trait.
 *  ============================================================ */

export const SEERAH_CHAINS = [
  {
    id: 'al-adl',
    name: 'Al-Adl',
    traitName: 'Adl',
    levelRange: [5, 15],
    totalDays: 21,
    dailyQuests: [
      { title: 'Stand for Justice', description: 'Speak up against one injustice you witness today, even if against yourself. The Prophet ﷺ said: "Oppression will be darkness on the Day of Resurrection." The Khalifa does not stay silent.', pillar: 'deen', xp: 20 },
      { title: 'Fair Judgment', description: 'Review one decision you made today and ensure it was fair to all parties. Do not favor yourself. Justice begins in the small choices.', pillar: 'deen', xp: 20 },
      { title: 'Protect the Weak', description: 'Identify one person weaker than you and do one act to protect or elevate them. Strength without justice is tyranny.', pillar: 'deen', xp: 20 },
    ],
    reward: {
      nabawiTrait: 'Adl',
      allXpBonus: 0.05,
      penaltyImmunity: 'missedDaily',
    },
  },
  {
    id: 'as-siddiq',
    name: 'As-Siddiq',
    traitName: 'Siddiq',
    levelRange: [15, 25],
    totalDays: 21,
    dailyQuests: [
      { title: 'Absolute Truth', description: 'No white lies, exaggerations, or excuses today. In speech and text. The Khalifa\'s word is his bond — he speaks only what is true.', pillar: 'deen', xp: 30 },
      { title: 'Contract Integrity', description: 'Honor every promise and deadline. No delays without communication. Your word is the foundation of every contract and every alliance.', pillar: 'money', xp: 30 },
      { title: 'Investment Honesty', description: 'Review one financial or AI project decision for dishonesty or shortcuts. Purify your wealth — barakah follows truth.', pillar: 'money', xp: 30 },
    ],
    reward: {
      nabawiTrait: 'Siddiq',
      moneyXpBonus: 0.10,
      penaltyImmunity: 'missedDaily',
    },
  },
  {
    id: 'as-sabir',
    name: 'As-Sabir',
    traitName: 'Sabir',
    levelRange: [30, 40],
    totalDays: 21,
    dailyQuests: [
      { title: 'Patience in Delay', description: 'Accept one delay or cancellation without complaint. Plan B execution. The Khalifa does not break under pressure.', pillar: 'deen', xp: 40 },
      { title: 'Market Loss Grace', description: 'If any investment or AI project declined, do not panic. Hold with tawakkul, audit honestly, and strategize for the next move.', pillar: 'money', xp: 40 },
      { title: 'Physical Pain Endurance', description: 'Complete workout despite discomfort. No excuses. The warrior endures — your future family will inherit that discipline.', pillar: 'body', xp: 40 },
    ],
    reward: {
      nabawiTrait: 'Sabir',
      allXpBonusDuringDebuff: 0.15,
      debuffDurationReduction: 0.50,
    },
  },
  {
    id: 'al-amin',
    name: 'Al-Amin',
    traitName: 'Amin',
    levelRange: [50, 60],
    totalDays: 21,
    dailyQuests: [
      { title: 'Trustworthiness Test', description: "Handle someone else's money, data, or AI system with absolute care. The Ummah trusts the Khalifa with their affairs.", pillar: 'money', xp: 50 },
      { title: 'Secret Keeper', description: 'Someone confides in you. Protect it with your life. The Khalifa is a fortress for his people — secrets stay sealed.', pillar: 'deen', xp: 50 },
      { title: 'Consistent Presence', description: 'Show up exactly when and where you promised. Reliability is the currency of leadership and the trust the Ummah places in you.', pillar: 'body', xp: 50 },
    ],
    reward: {
      nabawiTrait: 'Amin',
      allXpBonus: 0.10,
    },
  },
  {
    id: 'ar-rasul',
    name: 'Ar-Rasul',
    traitName: 'Rasul',
    levelRange: [70, 80],
    totalDays: 21,
    dailyQuests: [
      { title: 'Prophetic Leadership', description: 'Lead one family or community action today. Do not command what you do not do yourself. Mercy in command, strength in execution.', pillar: 'deen', xp: 60 },
      { title: 'Mercy in Strength', description: 'Forgive someone who wronged you. No conditions. The strong forgive; the weak seek revenge. The Ummah follows the merciful.', pillar: 'deen', xp: 60 },
      { title: 'Strategic Sacrifice', description: "Give up one personal comfort for someone else's need. The Khalifa eats last. Wealth is a trust — spend it on the Ummah first.", pillar: 'money', xp: 60 },
    ],
    reward: {
      nabawiTrait: 'Rasul',
      allXpBonus: 0.15,
    },
  },
  {
    id: 'al-mujahid',
    name: 'Al-Mujahid',
    traitName: 'Mujahid',
    levelRange: [85, 95],
    totalDays: 21,
    dailyQuests: [
      { title: 'Courage Under Fire', description: 'Do one thing that scares you today for the sake of the Ummah. Speak truth to power. Stand when others sit.', pillar: 'deen', xp: 70 },
      { title: 'Protect the Innocent', description: 'Identify one person or group being wronged and take one protective action. The warrior-Khalifa is the shield of the Ummah — strength exists to defend.', pillar: 'body', xp: 70 },
      { title: 'Strength for Justice', description: 'Use your AI skills, wealth, or influence to combat one injustice today. Wealth is worthless if it does not defend the oppressed.', pillar: 'money', xp: 70 },
    ],
    reward: {
      nabawiTrait: 'Mujahid',
      allXpBonus: 0.20,
      debuffDurationReduction: 0.25,
    },
  },
];

export function getAvailableSeerahChain(state) {
  const level = state.user.overallLevel;
  const chains = state.seerahChains || [];
  const active = chains.find(c => !c.completed && !c.failed);
  if (active) return null;

  const template = SEERAH_CHAINS.find(c =>
    level >= c.levelRange[0] &&
    level <= c.levelRange[1] &&
    !chains.some(sc => sc.chainId === c.id)
  );
  return template || null;
}

export function initializeSeerahChain(state) {
  const template = getAvailableSeerahChain(state);
  if (!template) return state;

  return {
    ...state,
    seerahChains: [
      ...state.seerahChains,
      {
        chainId: template.id,
        traitName: template.traitName,
        day: 1,
        totalDays: template.totalDays,
        completed: false,
        failed: false,
        startedAt: new Date().toISOString(),
      },
    ],
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'levelUp',
        title: `SEERAH CHAIN: ${template.name}`,
        subtitle: `Day 1 / ${template.totalDays}`,
        message: `Embody ${template.name} for ${template.totalDays} days. Failure resets the chain. No compromises.`,
      },
    ],
  };
}

export function advanceSeerahChain(state, chainId) {
  const chain = state.seerahChains.find(c => c.chainId === chainId && !c.completed && !c.failed);
  if (!chain) return state;

  const nextDay = chain.day + 1;
  const template = SEERAH_CHAINS.find(c => c.id === chainId);

  if (nextDay > chain.totalDays) {
    // Complete — award trait
    return {
      ...state,
      seerahChains: state.seerahChains.map(c =>
        c.chainId === chainId ? { ...c, completed: true, completedAt: new Date().toISOString() } : c
      ),
      nabawiTraits: [...(state.nabawiTraits || []), template.reward],
      systemMessages: [
        ...(state.systemMessages || []),
        {
          type: 'trait',
          title: `NABAWI TRAIT: ${template.reward.nabawiTrait}`,
          subtitle: 'Permanent. Irrevocable.',
          message: `You have embodied ${template.name}. The trait is now part of your soul.`,
        },
      ],
    };
  }

  return {
    ...state,
    seerahChains: state.seerahChains.map(c =>
      c.chainId === chainId ? { ...c, day: nextDay } : c
    ),
  };
}

export function failSeerahChain(state, chainId) {
  const chain = state.seerahChains.find(c => c.chainId === chainId && !c.completed && !c.failed);
  if (!chain) return state;

  return {
    ...state,
    seerahChains: state.seerahChains.map(c =>
      c.chainId === chainId ? { ...c, failed: true, failedAt: new Date().toISOString() } : c
    ),
    systemMessages: [
      ...(state.systemMessages || []),
      {
        type: 'penalty',
        title: 'SEERAH CHAIN BROKEN',
        subtitle: 'The chain resets.',
        message: 'You failed one day of the prophetic character quest. Start again when ready. Steel is forged in repetition.',
      },
    ],
  };
}

export function getActiveSeerahChain(state) {
  return (state.seerahChains || []).find(c => !c.completed && !c.failed) || null;
}

export function wasSeerahChainAdvancedOnDate(state, chainId, date) {
  // Check history for any seerah quest completion on the given date for this chain
  return (state.history || []).some(h => {
    const hDate = h.date ? new Date(h.date).toLocaleDateString('en-CA') : '';
    return hDate === date && h.source === 'seerah' && h.chainId === chainId && h.completed;
  });
}

export function injectSeerahDailyQuests(state) {
  const activeChain = getActiveSeerahChain(state);
  if (!activeChain) return state;

  const template = SEERAH_CHAINS.find(c => c.id === activeChain.chainId);
  if (!template) return state;

  // Remove old seerah quests first to avoid duplicates
  const filteredDailyQuests = state.dailyQuests.filter(q => q.source !== 'seerah');

  const seerahQuests = template.dailyQuests.map((q, i) => ({
    ...q,
    id: `seerah-${template.id}-${i}`,
    uniqueId: `seerah-${template.id}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    completed: false,
    completedAt: null,
    source: 'seerah',
    chainId: template.id,
  }));

  return {
    ...state,
    dailyQuests: [...filteredDailyQuests, ...seerahQuests],
  };
}

export function applyNabawiTraits(xp, pillar, state) {
  let multiplier = 1.0;
  (state.nabawiTraits || []).forEach(trait => {
    if (trait.allXpBonus) multiplier += trait.allXpBonus;
    if (trait.moneyXpBonus && pillar === 'money') multiplier += trait.moneyXpBonus;
    if (trait.allXpBonusDuringDebuff) {
      const pillarState = state.pillars[pillar];
      if (pillarState?.activeDebuff && isDebuffActive(pillarState.activeDebuff)) {
        multiplier += trait.allXpBonusDuringDebuff;
      }
    }
  });
  return Math.floor(xp * multiplier);
}

function isDebuffActive(debuff) {
  if (!debuff) return false;
  return (Date.now() - (debuff.appliedAt || 0)) < (debuff.duration || 0);
}

export function hasPenaltyImmunity(state, penaltyType) {
  return (state.nabawiTraits || []).some(t => t.penaltyImmunity === penaltyType);
}

export function getDebuffDurationReduction(state) {
  return (state.nabawiTraits || []).reduce((sum, t) => sum + (t.debuffDurationReduction || 0), 0);
}
