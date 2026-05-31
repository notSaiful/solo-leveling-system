/** ============================================================
 *  DATE UTILITIES — Timezone-safe date handling
 *  ============================================================
 *  Core principle: All calendar-day logic uses the user's LOCAL
 *  timezone, but computed directly from Date components to avoid
 *  locale-string parsing edge cases (DST, midnight transitions,
 *  locale formatting inconsistencies).
 *  ============================================================ */

/**
 * Returns a YYYY-MM-DD string for the given Date in LOCAL timezone.
 * More reliable than toLocaleDateString('en-CA').
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a Date at midnight LOCAL time.
 */
export function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
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
    days.push(getLocalDateString(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

/**
 * Count calendar days between two local date strings (exclusive of end).
 */
export function getDayDiff(startStr, endStr) {
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);
  const diffMs = end - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Convert an ISO string or Date to a local YYYY-MM-DD string.
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
