export const MISSION_DAILY_QUEST_TEMPLATES = {
  tauheed: [
    {
      id: 'mission-tauheed-proof',
      title: 'Truth Proof',
      description: 'Study one proof of tawheed and write the exact action it demands from you today.',
      steps: [
        'Pick one source: one ayah, one hadith, one seerah incident, or one scholarly proof of tawheed.',
        'Read it carefully and write one sentence summarizing the proof.',
        'Write one specific action you will do today because of what you learned.',
      ],
      baseXp: 12,
      pillar: 'deen',
      estimatedMinutes: 8,
      missionDuty: 'tauheed',
      tags: ['tauheed', 'quran', 'hadith', 'seerah', 'knowledge'],
    },
  ],
  wealth: [
    {
      id: 'mission-wealth-amanah',
      title: 'Amanah Ledger',
      description: 'Move one rupee, note, sale, saving, budget decision, or investment review toward halal wealth.',
      steps: [
        'Pick one exact action: transfer 100 rupees to savings, list one item for sale, review one investment, cut one expense, or give 10 rupees sadaqah.',
        'Complete the action in your app, bank, notebook, or marketplace.',
        'Write one sentence logging what you did and why it moves your wealth forward.',
      ],
      baseXp: 12,
      pillar: 'money',
      estimatedMinutes: 8,
      missionDuty: 'wealth',
      tags: ['wealth', 'halal', 'budget', 'saving', 'sadaqah', 'ummah'],
    },
  ],
  readiness: [
    {
      id: 'mission-readiness-restraint',
      title: 'Adventure With Restraint',
      description: 'Complete one outdoor readiness action and log one restraint or safety lesson.',
      steps: [
        'Pick one action: scout a 1km route, walk 2,000 steps outside, do 10 push-ups, stretch for 5 minutes, or check your emergency kit.',
        'Complete the action.',
        'Log one sentence: what you did, what you noticed, and one safety or restraint rule you followed.',
      ],
      baseXp: 12,
      pillar: 'body',
      estimatedMinutes: 10,
      missionDuty: 'readiness',
      tags: ['readiness', 'adventure', 'route', 'endurance', 'navigation', 'first aid', 'de-escalation', 'discipline'],
    },
  ],
  service: [
    {
      id: 'mission-service-one-muslim',
      title: 'Serve One Muslim',
      description: 'Help one Muslim become stronger, safer, wiser, or less burdened today.',
      steps: [
        'Pick one Muslim: family member, friend, coworker, or online contact.',
        'Pick one action: answer one question, share one useful link, make one introduction, give one sincere compliment, or relieve one small burden.',
        'Do it now. Write one sentence: who, what, and how it helped.',
      ],
      baseXp: 12,
      pillar: 'deen',
      estimatedMinutes: 10,
      missionDuty: 'service',
      tags: ['service', 'ummah', 'teaching', 'mentorship', 'relief', 'advocacy'],
    },
  ],
  family: [
    {
      id: 'mission-family-lead-home',
      title: 'Lead The Home',
      description: 'Do one exact act of family leadership today. No ambiguity.',
      steps: [
        'Pick one action: ask your parent/spouse/sibling "What do you need today?", buy groceries for the house, lead one prayer together, apologize for one recent slip, teach one hadith to a younger sibling, or fix one broken thing at home.',
        'Do it now. Do not delay.',
        'Write one sentence: what you did, who it was for, and what changed.',
      ],
      baseXp: 12,
      pillar: 'deen',
      estimatedMinutes: 8,
      missionDuty: 'family',
      tags: ['family', 'leadership', 'mercy', 'home', 'role model'],
    },
  ],
};

export const MISSION_DUTY_ORDER = ['tauheed', 'wealth', 'readiness', 'service', 'family'];
