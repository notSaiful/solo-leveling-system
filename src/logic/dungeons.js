/** ============================================================
 *  DUNGEONS — Week Tracking Utilities
 *  ============================================================
 *  Note: Dungeon templates live in data/questCatalog.js
 *  under WEEKLY_DUNGEON_TEMPLATES. This file only provides
 *  the current week ID helper.
 *  ============================================================ */

import { startOfWeek, format } from 'date-fns';
import { SYSTEM_TIME_ZONE } from '../utils/dateUtils';

/**
 * Returns Monday of the current week as a YYYY-MM-DD string
 * in the System timezone (Asia/Kolkata).
 *
 * This ensures the week boundary is consistent regardless of
 * browser/device timezone changes.
 */
export function getCurrentWeekId() {
  // Use the same timezone as the rest of the app
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SYSTEM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const year = Number(byType.year);
  const month = Number(byType.month);
  const day = Number(byType.day);

  // Build a Date representing noon IST today to avoid day boundary issues
  const istToday = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  // Get Monday of this week
  const monday = startOfWeek(istToday, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}
