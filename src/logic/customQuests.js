import { getLocalDateString, toLocalDateString } from '../utils/dateUtils.js';

export function normalizeCustomQuest(quest) {
  const stableId = quest.id || quest.uniqueId || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = quest.createdAt || new Date().toISOString();
  return {
    ...quest,
    id: stableId,
    uniqueId: quest.uniqueId || stableId,
    createdAt,
    createdLocalDate: quest.createdLocalDate || toLocalDateString(createdAt),
  };
}

export function isCustomQuestExpired(quest, today = getLocalDateString()) {
  const normalized = normalizeCustomQuest(quest);
  return normalized.createdLocalDate < today;
}

export function pruneExpiredCustomQuests(customQuests = [], today = getLocalDateString()) {
  return (customQuests || [])
    .filter((quest) => quest && typeof quest === 'object') // a null/non-object entry would throw in normalizeCustomQuest
    .map(normalizeCustomQuest)
    .filter((quest) => !isCustomQuestExpired(quest, today));
}
