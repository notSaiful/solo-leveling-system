import { MISSION_DOCTRINE } from '../data/missionDoctrine';
import { getLocalDateString, toLocalDateString } from '../utils/dateUtils';

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function entryText(entry) {
  return [
    entry.title,
    entry.description,
    entry.reason,
    entry.pillar,
    entry.missionDuty,
    ...(entry.tags || []),
  ].map(normalizeText).join(' ');
}

function matchesMissionPillar(entry, missionPillar) {
  if (entry.missionDuty === missionPillar.id) return true;
  const text = entryText(entry);
  return missionPillar.tags.some(tag => text.includes(tag));
}

function completedEntries(history = []) {
  return history.filter(entry => entry?.completed && entry.type !== 'aiCommand');
}

export function getMissionMetrics(history = [], today = getLocalDateString()) {
  const completed = completedEntries(history);
  const todayEntries = completed.filter(entry => {
    const entryDate = entry.localDate || (entry.date ? toLocalDateString(entry.date) : '');
    return entryDate === today;
  });

  const duties = MISSION_DOCTRINE.pillars.map((pillar) => {
    const total = completed.filter(entry => matchesMissionPillar(entry, pillar)).length;
    const todayCount = todayEntries.filter(entry => matchesMissionPillar(entry, pillar)).length;
    return {
      id: pillar.id,
      label: pillar.label,
      duty: pillar.duty,
      total,
      today: todayCount,
    };
  });

  const weakestDuty = [...duties].sort((a, b) => a.total - b.total || a.today - b.today)[0] || duties[0];
  const strongestDuty = [...duties].sort((a, b) => b.total - a.total || b.today - a.today)[0] || duties[0];
  const todayActions = todayEntries.length;
  const totalMissionActions = duties.reduce((sum, duty) => sum + duty.total, 0);
  const missionScore = duties.length === 0
    ? 0
    : Math.round((duties.filter(duty => duty.total > 0).length / duties.length) * 100);

  return {
    duties,
    weakestDuty,
    strongestDuty,
    todayActions,
    totalMissionActions,
    missionScore,
    todayServiceCommand: getTodayServiceCommand(weakestDuty),
  };
}

export function getTodayServiceCommand(weakestDuty) {
  const commands = {
    tauheed: 'Study one proof of tawheed or one seerah incident, then write the action it demands from you today.',
    wealth: 'Do one halal wealth action today: ship, sell, invest, save, give, or build an income asset.',
    readiness: 'Train your body with strength and restraint. Build protection capacity without ego.',
    service: 'Serve one Muslim today through teaching, relief, mentorship, advocacy, or direct help.',
    family: 'Lead your home today through worship, mercy, provision, teaching, or disciplined example.',
  };
  return commands[weakestDuty?.id] || 'Do one action today that makes you more useful to Allah, your family, and the Ummah.';
}

export function formatMissionMetricsForPrompt(metrics) {
  return [
    `Mission score: ${metrics.missionScore}%`,
    `Today's mission actions: ${metrics.todayActions}`,
    `Weakest duty: ${metrics.weakestDuty?.label || 'Unknown'}`,
    `Strongest duty: ${metrics.strongestDuty?.label || 'Unknown'}`,
    `Service command: ${metrics.todayServiceCommand}`,
  ].join('\n');
}
