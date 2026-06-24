import { getLocalDateString } from '../utils/dateUtils';

export function proteinTarget(bodyweightKg) {
  return Math.round((bodyweightKg || 0) * 1.8); // 1.8 g/kg mid-range
}

export function logProtein(state, { date, grams }) {
  const rec = state.recovery || {};
  return {
    ...state,
    recovery: {
      ...rec,
      proteinTarget: rec.proteinTarget ?? proteinTarget(state.strengthLog?.bodyweightKg || 70),
      proteinLog: [...(rec.proteinLog || []), { date: date || getLocalDateString(), grams }],
    },
  };
}

export function logSleep(state, { date, hours, quality }) {
  const rec = state.recovery || {};
  return {
    ...state,
    recovery: {
      ...rec,
      sleepLog: [...(rec.sleepLog || []), { date: date || getLocalDateString(), hours, quality }],
    },
  };
}

export function rollingSleepAvg(state, days = 7) {
  const log = (state.recovery?.sleepLog || []).slice(-days);
  if (!log.length) return 0;
  return log.reduce((sum, e) => sum + (e.hours || 0), 0) / log.length;
}

export function recoveryFlags(state) {
  const reasons = [];
  const sleepAvg = rollingSleepAvg(state, 7);
  const lowSleep = sleepAvg > 0 && sleepAvg < 6.5;
  if (lowSleep) reasons.push('low sleep');
  const lastProtein = (state.recovery?.proteinLog || []).at(-1);
  const lowProtein = lastProtein && (lastProtein.grams || 0) < (state.recovery?.proteinTarget || proteinTarget(70)) * 0.8;
  if (lowProtein) reasons.push('low protein');
  return { underRecovered: reasons.length > 0, lowSleep, lowProtein, reason: reasons };
}