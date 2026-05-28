/** ============================================================
 *  DUNGEONS — Week Tracking Utilities
 *  ============================================================
 *  Note: Dungeon templates live in data/questCatalog.js
 *  under WEEKLY_DUNGEON_TEMPLATES. This file only provides
 *  the current week ID helper.
 *  ============================================================ */

import { startOfWeek, format } from 'date-fns';

export function getCurrentWeekId() {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}
