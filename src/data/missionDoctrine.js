export const MISSION_DOCTRINE = {
  title: 'Khalifa Mission',
  oath: 'Become a servant-leader who worships Allah, follows the Prophet, strengthens his family, builds lawful wealth, and carries real benefit for the Ummah.',
  model: 'Prophet Muhammad, peace and blessings be upon him',
  ultimateQuestion: 'Did today make me more useful to Allah, my family, and the Ummah?',
  pillars: [
    {
      id: 'tauheed',
      label: 'Tauheed & Truth',
      duty: 'Learn, live, and teach tawheed, seerah, Quran, salah, and prophetic character.',
      tags: ['tauheed', 'quran', 'salah', 'seerah', 'sunnah', 'akhlaq', 'dawah', 'knowledge', 'dhikr', 'tahajjud'],
    },
    {
      id: 'wealth',
      label: 'Wealth as Amanah',
      duty: 'Build halal income, invest with discipline, give sadaqah, and prepare to carry financial burdens for Muslims.',
      tags: ['wealth', 'income', 'business', 'investing', 'halal', 'zakat', 'sadaqah', 'frugality', 'fund', 'ummah'],
    },
    {
      id: 'readiness',
      label: 'Protection Readiness',
      duty: 'Build strength, stamina, restraint, and lawful preparedness to protect innocent life without oppression.',
      tags: ['strength', 'fitness', 'warrior', 'combat', 'mobility', 'cardio', 'discipline', 'health', 'body'],
    },
    {
      id: 'service',
      label: 'Ummah Service',
      duty: 'Educate, uplift, mentor, fund relief, advocate lawfully, and improve Muslim livelihoods.',
      tags: ['ummah', 'service', 'relief', 'mentor', 'teach', 'community', 'charity', 'advocacy', 'education'],
    },
    {
      id: 'family',
      label: 'Family Leadership',
      duty: 'Become a disciplined husband, father, role model, and protector through worship, mercy, provision, and example.',
      tags: ['family', 'children', 'father', 'role model', 'legacy', 'home', 'leadership', 'mercy'],
    },
  ],
  forbiddenDeviations: [
    'arrogance',
    'ego',
    'vigilantism',
    'unlawful violence',
    'hatred',
    'sectarian cruelty',
    'fantasy-war thinking',
    'wealth for status',
    'strength without mercy',
    'neglecting worship',
  ],
  guardrails: [
    'Strength exists to protect innocent life lawfully, never to oppress.',
    'Anger at injustice must become disciplined service, lawful advocacy, wealth-building, relief, education, and preparedness.',
    'Leadership means accountability before Allah before authority over people.',
    'Wealth is amanah: halal earning, sober investing, zakat, sadaqah, relief, and independence for the Ummah.',
    'The Prophet is the model: mercy, truth, courage, restraint, patience, worship, and justice.',
  ],
};

export const MISSION_TAGS = MISSION_DOCTRINE.pillars.reduce((acc, pillar) => {
  acc[pillar.id] = pillar.tags;
  return acc;
}, {});

export function getMissionDoctrinePrompt() {
  const pillarLines = MISSION_DOCTRINE.pillars
    .map(pillar => `- ${pillar.label}: ${pillar.duty}`)
    .join('\n');

  const forbiddenLines = MISSION_DOCTRINE.forbiddenDeviations
    .map(item => `- ${item}`)
    .join('\n');

  const guardrailLines = MISSION_DOCTRINE.guardrails
    .map(item => `- ${item}`)
    .join('\n');

  return `KHALIFA MISSION DOCTRINE
Mission: ${MISSION_DOCTRINE.oath}
Model: ${MISSION_DOCTRINE.model}
Question: ${MISSION_DOCTRINE.ultimateQuestion}

Mission duties:
${pillarLines}

Forbidden deviations:
${forbiddenLines}

Guardrails:
${guardrailLines}`;
}
