export const TEACHING_FORMATS = [
  { id: 'study-note', label: 'Study Note' },
  { id: 'one-to-one', label: 'One-to-One Teaching' },
  { id: 'family-lesson', label: 'Family Lesson' },
  { id: 'group-lesson', label: 'Group Lesson' },
  { id: 'reminder', label: 'Reminder / Post' },
  { id: 'mentorship', label: 'Mentorship Session' },
  { id: 'lesson-plan', label: 'Lesson Plan' },
];

export const TEACHING_FORMAT_LABELS = TEACHING_FORMATS.reduce((acc, format) => {
  acc[format.id] = format.label;
  return acc;
}, {});

export const TEACHING_TOPICS = [
  { id: 'tauheed', label: 'Tauheed' },
  { id: 'quran', label: 'Quran' },
  { id: 'seerah', label: 'Seerah' },
  { id: 'salah', label: 'Salah' },
  { id: 'akhlaq', label: 'Akhlaq' },
  { id: 'hadith', label: 'Hadith' },
  { id: 'dawah', label: 'Dawah' },
  { id: 'family', label: 'Family Tarbiyah' },
];

export const TEACHING_TOPIC_LABELS = TEACHING_TOPICS.reduce((acc, topic) => {
  acc[topic.id] = topic.label;
  return acc;
}, {});

export const TEACHING_GUARDRAILS = [
  'Teach only what you can source from Quran, authentic Sunnah, reliable scholarship, or clearly marked personal reflection.',
  'Use mercy, humility, and clarity; do not humiliate people while teaching truth.',
  'If unsure, say “I do not know” and ask a qualified person.',
  'Every lesson should produce one action, not only information.',
];
