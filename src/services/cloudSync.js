/** ============================================================
 *  CLOUD SYNC — Single Source Cloud Persistence
 *  ============================================================
 *  One sync path only:
 *  1. localStorage = instant offline cache
 *  2. /api/sync-state = canonical cross-device snapshot
 *  3. Newer lastUpdated wins
 *  ============================================================ */

import { isCanonicalSyncConfigured, loadStateFromCanonicalStore, syncStateToCanonicalStore } from './canonicalSync';

const SYNC_DEBOUNCE_MS = 3000;
let syncTimeout = null;

function normalizeCloudState(state) {
  if (!state || typeof state !== 'object') return null;
  return {
    ...state,
    version: state.version || 2,
  };
}

export async function loadStateFromCloud() {
  return normalizeCloudState(await loadStateFromCanonicalStore());
}

export async function syncStateToCloud(state) {
  if (!isCanonicalSyncConfigured()) return { success: false, reason: 'not_configured' };
  const result = await syncStateToCanonicalStore(state);
  if (!result.success) return result;
  return {
    success: true,
    storage: 'canonical_api',
    accepted: result.accepted,
    state: normalizeCloudState(result.state),
  };
}

export function clearQueuedCloudSync() {
  if (!syncTimeout) return;
  clearTimeout(syncTimeout);
  syncTimeout = null;
}

export function queueCloudSync(state) {
  if (!isCanonicalSyncConfigured()) return;

  clearQueuedCloudSync();
  syncTimeout = setTimeout(() => {
    syncTimeout = null;
    syncStateToCloud(state).catch(err => {
      console.warn('Cloud sync failed:', err);
    });
  }, SYNC_DEBOUNCE_MS);
}
