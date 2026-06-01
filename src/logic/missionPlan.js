import { MISSION_PHASES, DAILY_TRUSTS, LAWFUL_JUSTICE_PROTOCOL, WEEKLY_REVIEW_QUESTIONS } from '../data/missionPlan';
import { getLocalDateString } from '../utils/dateUtils';
import { getMissionMetrics } from './missionMetrics';

function phaseIsUnlocked(phase, metrics) {
  return metrics.totalMissionActions >= phase.thresholdActions
    && metrics.missionScore >= phase.thresholdCoverage;
}

export function getCurrentMissionPhase(metrics) {
  return [...MISSION_PHASES].reverse().find(phase => phaseIsUnlocked(phase, metrics)) || MISSION_PHASES[0];
}

export function getNextMissionPhase(currentPhase) {
  const index = MISSION_PHASES.findIndex(phase => phase.id === currentPhase.id);
  return MISSION_PHASES[index + 1] || null;
}

export function getPhaseProgress(metrics, nextPhase) {
  if (!nextPhase) return 100;

  const actionProgress = nextPhase.thresholdActions === 0
    ? 100
    : Math.min(100, Math.round((metrics.totalMissionActions / nextPhase.thresholdActions) * 100));
  const coverageProgress = nextPhase.thresholdCoverage === 0
    ? 100
    : Math.min(100, Math.round((metrics.missionScore / nextPhase.thresholdCoverage) * 100));

  return Math.min(actionProgress, coverageProgress);
}

export function getMissionPlan(history = [], today = getLocalDateString()) {
  const metrics = getMissionMetrics(history, today);
  const currentPhase = getCurrentMissionPhase(metrics);
  const nextPhase = getNextMissionPhase(currentPhase);
  const phaseProgress = getPhaseProgress(metrics, nextPhase);
  const trusts = DAILY_TRUSTS.map((trust) => {
    const duty = metrics.duties.find(item => item.id === trust.dutyId);
    return {
      ...trust,
      completedToday: (duty?.today || 0) > 0,
      total: duty?.total || 0,
    };
  });

  return {
    metrics,
    currentPhase,
    nextPhase,
    phaseProgress,
    trusts,
    weeklyFocus: {
      duty: metrics.weakestDuty,
      command: metrics.todayServiceCommand,
    },
    lawfulJusticeProtocol: LAWFUL_JUSTICE_PROTOCOL,
    weeklyReviewQuestions: WEEKLY_REVIEW_QUESTIONS,
  };
}
