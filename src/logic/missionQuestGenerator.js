import { MISSION_DOCTRINE } from '../data/missionDoctrine';
import { MISSION_DAILY_QUEST_TEMPLATES, MISSION_DUTY_ORDER } from '../data/missionQuestCatalog';
import { getEffectiveXp } from '../data/questCatalog';
import { getMissionPlan } from './missionPlan';

function normalize(value) {
  return String(value || '').toLowerCase();
}

function questText(quest) {
  return [
    quest.title,
    quest.description,
    quest.pillar,
    quest.missionDuty,
    ...(quest.tags || []),
  ].map(normalize).join(' ');
}

function questCoversDuty(quest, duty) {
  if (quest.missionDuty === duty.id) return true;
  const text = questText(quest);
  return duty.tags.some(tag => text.includes(tag));
}

function getCoveredMissionDuties(quests = []) {
  return new Set(MISSION_DOCTRINE.pillars
    .filter(duty => quests.some(quest => questCoversDuty(quest, duty)))
    .map(duty => duty.id));
}

function sortMissingDutiesByNeed(missingDuties, history) {
  const plan = getMissionPlan(history || []);
  const totals = new Map(plan.metrics.duties.map(duty => [duty.id, duty.total]));

  return [...missingDuties].sort((a, b) => {
    const totalA = totals.get(a) ?? 0;
    const totalB = totals.get(b) ?? 0;
    return totalA - totalB || MISSION_DUTY_ORDER.indexOf(a) - MISSION_DUTY_ORDER.indexOf(b);
  });
}

export function addMissionDailyQuests(baseQuests = [], rankKey = 'E', history = []) {
  const covered = getCoveredMissionDuties(baseQuests);
  const missingDuties = MISSION_DUTY_ORDER.filter(duty => !covered.has(duty));
  const orderedMissing = sortMissingDutiesByNeed(missingDuties, history);
  const createdAt = Date.now();

  const missionQuests = orderedMissing.map((dutyId, index) => {
    const template = MISSION_DAILY_QUEST_TEMPLATES[dutyId]?.[0];
    if (!template) return null;

    return {
      ...template,
      source: 'mission',
      xp: getEffectiveXp(template.baseXp, rankKey),
      uniqueId: `${template.id}-${createdAt}-${index}-${Math.random().toString(36).slice(2, 9)}`,
      completed: false,
      completedAt: null,
    };
  }).filter(Boolean);

  return [...baseQuests, ...missionQuests];
}
