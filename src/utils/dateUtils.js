/** ============================================================
 *  DATE UTILITIES — Timezone-safe date handling
 *  ============================================================
 *  Core principle: All calendar-day logic uses the System timezone
 *  (Asia/Kolkata), so browser/device timezone changes do not create
 *  unfair quest resets or penalties.
 *  ============================================================ */

export const SYSTEM_TIME_ZONE = 'Asia/Kolkata';

/**
 * Returns a YYYY-MM-DD string for the given Date in System timezone.
 */
export function getLocalDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SYSTEM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const year = byType.year;
  const month = byType.month;
  const day = byType.day;
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a stable Date anchor.
 * Noon UTC avoids accidental previous/next day movement while iterating.
 */
export function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/**
 * Get array of YYYY-MM-DD strings between start and end (exclusive of end).
 * Handles timezone transitions safely by working with local calendar days.
 */
export function getDaysBetween(startStr, endStr) {
  const days = [];
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);

  const current = new Date(start);
  while (current < end) {
    days.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days;
}

/**
 * Count calendar days between two System date strings (exclusive of end).
 */
export function getDayDiff(startStr, endStr) {
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);
  const diffMs = end - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Convert an ISO string or Date to a System timezone YYYY-MM-DD string.
 */
export function toLocalDateString(input) {
  const date = typeof input === 'string' ? new Date(input) : input;
  return getLocalDateString(date);
}

/**
 * Check if a history entry's date falls on the given local calendar day.
 */
export function isHistoryOnDate(historyEntry, dateStr) {
  if (!historyEntry?.date) return false;
  return toLocalDateString(historyEntry.date) === dateStr;
}
