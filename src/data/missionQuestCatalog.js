export const MISSION_DAILY_QUEST_TEMPLATES = {
  tauheed: [
    {
      id: 'mission-tauheed-proof',
      title: 'Truth Proof',
      description: 'Study one proof of tawheed, one ayah, one hadith, or one seerah incident. Write the action it demands from you today.',
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
      description: 'Move one rupee, note, sale, saving, budget decision, or investment review toward halal wealth that can carry future Muslim burdens.',
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
      title: 'Readiness With Restraint',
      description: 'Train one lawful protection capacity: outdoor endurance, navigation, first aid, situational awareness, de-escalation, or wilderness discipline.',
      baseXp: 12,
      pillar: 'body',
      estimatedMinutes: 10,
      missionDuty: 'readiness',
      tags: ['readiness', 'endurance', 'navigation', 'first aid', 'de-escalation', 'discipline'],
    },
  ],
  service: [
    {
      id: 'mission-service-one-muslim',
      title: 'Serve One Muslim',
      description: 'Teach, mentor, counsel, relieve, advocate lawfully, or directly help one Muslim become stronger, safer, wiser, or less burdened.',
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
      description: 'Do one act of family leadership: mercy, provision, teaching, worship, apology, protection, or disciplined example.',
      baseXp: 12,
      pillar: 'deen',
      estimatedMinutes: 8,
      missionDuty: 'family',
      tags: ['family', 'leadership', 'mercy', 'home', 'role model'],
    },
  ],
};

export const MISSION_DUTY_ORDER = ['tauheed', 'wealth', 'readiness', 'service', 'family'];
