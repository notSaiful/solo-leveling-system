const DEFAULT_ENDPOINT = '/api/sync-state';

function getSyncSecret() {
  return import.meta.env.VITE_SLS_SYNC_SECRET || '';
}

function getSyncEndpoint() {
  return import.meta.env.VITE_SLS_SYNC_ENDPOINT || DEFAULT_ENDPOINT;
}

export function isCanonicalSyncConfigured() {
  return !!getSyncSecret();
}

async function requestCanonicalStore(method, body) {
  if (!isCanonicalSyncConfigured()) {
    return { success: false, reason: 'not_configured' };
  }

  const response = await fetch(getSyncEndpoint(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-sls-sync-secret': getSyncSecret(),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, reason: 'request_failed', error: data.error || `HTTP ${response.status}` };
  }
  return { success: true, data };
}

export async function loadStateFromCanonicalStore() {
  try {
    const result = await requestCanonicalStore('GET');
    if (!result.success) return null;
    return result.data?.state || null;
  } catch (error) {
    console.warn('Canonical sync load failed:', error);
    return null;
  }
}

export async function syncStateToCanonicalStore(state) {
  try {
    const result = await requestCanonicalStore('PUT', { state });
    if (!result.success) return result;
    return {
      success: true,
      accepted: result.data?.accepted !== false,
      conflictMerged: !!result.data?.conflictMerged,
      state: result.data?.state || state,
    };
  } catch (error) {
    console.warn('Canonical sync save failed:', error);
    return { success: false, reason: 'error', error: error.message };
  }
}
