import { TEACHING_FORMAT_LABELS, TEACHING_TOPIC_LABELS } from '../data/teachingPipeline';
import { getLocalDateString } from '../utils/dateUtils';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value, max = 220) {
  return String(value || '').trim().slice(0, max);
}

function normalizeCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0) return 0;
  return Math.floor(count);
}

export function createTeachingEntry(input = {}) {
  const topic = TEACHING_TOPIC_LABELS[input.topic] ? input.topic : 'tauheed';
  const format = TEACHING_FORMAT_LABELS[input.format] ? input.format : 'study-note';
  const title = normalizeText(input.title, 100);
  const source = normalizeText(input.source, 180);

  if (!title) throw new Error('Teaching entry needs a clear lesson title.');
  if (!source) throw new Error('Teaching entry needs a source or reference.');

  const now = new Date().toISOString();
  return {
    id: createId('teaching'),
    topic,
    topicLabel: TEACHING_TOPIC_LABELS[topic],
    format,
    formatLabel: TEACHING_FORMAT_LABELS[format],
    title,
    source,
    audienceCount: normalizeCount(input.audienceCount),
    mentee: normalizeText(input.mentee, 80),
    actionStep: normalizeText(input.actionStep, 180),
    followUp: normalizeText(input.followUp, 180),
    note: normalizeText(input.note, 260),
    sourceBacked: true,
    createdAt: now,
    localDate: getLocalDateString(new Date(now)),
  };
}

export function createTeachingHistoryEntry(entry) {
  return {
    eventId: createId('teaching-history'),
    type: 'teachingPipeline',
    questId: entry.id,
    title: `Teaching: ${entry.title}`,
    description: entry.actionStep || entry.note || `${entry.formatLabel} on ${entry.topicLabel}.`,
    pillar: 'deen',
    tags: ['tauheed', 'teaching', 'education', 'dawah', 'knowledge', entry.topic, entry.format],
    missionDuty: 'tauheed',
    source: 'teaching-pipeline',
    xp: 0,
    gold: 0,
    topic: entry.topic,
    format: entry.format,
    audienceCount: entry.audienceCount,
    mentee: entry.mentee,
    sourceReference: entry.source,
    sourceBacked: true,
    date: entry.createdAt,
    localDate: entry.localDate,
    completed: true,
  };
}

export function addTeachingEntryToState(state, input) {
  const entry = createTeachingEntry(input);
  return {
    ...state,
    teachingPipelineLedger: [...(state.teachingPipelineLedger || []), entry],
    history: [...(state.history || []), createTeachingHistoryEntry(entry)],
  };
}

export function getTeachingMetrics(entries = []) {
  const totalAudience = entries.reduce((sum, entry) => sum + (Number(entry.audienceCount) || 0), 0);
  const mentees = new Set(entries.map(entry => normalizeText(entry.mentee, 80)).filter(Boolean));
  const sourceBacked = entries.filter(entry => entry.sourceBacked && entry.source).length;
  const byTopic = entries.reduce((acc, entry) => {
    const key = entry.topic || 'tauheed';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    totalLessons: entries.length,
    totalAudience,
    totalMentees: mentees.size,
    sourceBacked,
    byTopic,
    latestEntry: [...entries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null,
  };
}
