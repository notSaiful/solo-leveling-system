import { useState, useEffect, useCallback, useRef } from 'react';
import { loadState, saveState, queueCloudSync, upgradeStateForCurrentBuild, STORAGE_KEY } from '../data/store';
import { isCanonicalSyncConfigured } from '../services/canonicalSync';
import { clearQueuedCloudSync, loadStateFromCloud, syncStateToCloud } from '../services/cloudSync';
import { mergeStatesForSync } from '../logic/stateMerge';

const CLOUD_REFRESH_INTERVAL_MS = 45000;

function isRemoteNewer(remote, local) {
  if (!remote || typeof remote !== 'object') return false;
  const remoteRevision = remote.syncRevision || 0;
  const localRevision = local?.syncRevision || 0;
  if (remoteRevision !== localRevision) return remoteRevision > localRevision;
  return (remote.lastUpdated || 0) > (local?.lastUpdated || 0);
}

function hasMeaningfulDifference(remote, local) {
  if (!remote || !local) return true;
  try {
    return JSON.stringify(remote) !== JSON.stringify(local);
  } catch {
    return true;
  }
}

export function useStore() {
  const [state, setState] = useState(() => loadState());
  const latestStateRef = useRef(state);
  const skipNextCloudSyncRef = useRef(false);
  const localDirtyRef = useRef(false);
  const cloudRefreshInFlightRef = useRef(false);

  latestStateRef.current = state;

  const applyCanonicalState = useCallback((canonical, { markSynced = true, force = false } = {}) => {
    if (!canonical || typeof canonical !== 'object') return false;
    const upgraded = upgradeStateForCurrentBuild(canonical);
    const local = latestStateRef.current;
    if (!force && !isRemoteNewer(upgraded, local)) return false;

    if (markSynced) localDirtyRef.current = false;
    skipNextCloudSyncRef.current = markSynced;
    setState(prev => ({
      ...prev,
      ...upgraded,
      lastUpdated: upgraded.lastUpdated || prev.lastUpdated || 0,
      syncRevision: upgraded.syncRevision ?? prev.syncRevision ?? 0,
    }));
    return true;
  }, []);

  const refreshFromCloud = useCallback(async ({ forceMergeLocal = false } = {}) => {
    if (!isCanonicalSyncConfigured() || cloudRefreshInFlightRef.current) return;

    cloudRefreshInFlightRef.current = true;
    const localAtStart = latestStateRef.current;
    const shouldPushLocal = forceMergeLocal || localDirtyRef.current;

    try {
      const result = shouldPushLocal
        ? await syncStateToCloud(localAtStart)
        : { success: true, state: await loadStateFromCloud() };

      if (!result?.success || !result.state) return;

      const localChangedDuringRefresh =
        (latestStateRef.current?.syncRevision || 0) > (localAtStart?.syncRevision || 0) ||
        (latestStateRef.current?.lastUpdated || 0) > (localAtStart?.lastUpdated || 0);
      if (localChangedDuringRefresh) return;

      applyCanonicalState(result.state, {
        markSynced: true,
        force: shouldPushLocal || result.conflictMerged,
      });
    } catch (error) {
      console.warn('Cloud refresh failed:', error);
    } finally {
      cloudRefreshInFlightRef.current = false;
    }
  }, [applyCanonicalState]);

  useEffect(() => {
    try {
      saveState(state);
    } catch (e) {
      console.warn('useStore save failed:', e);
    }
    if (skipNextCloudSyncRef.current) {
      skipNextCloudSyncRef.current = false;
      return;
    }
    if (isCanonicalSyncConfigured() && (state.lastUpdated || 0) > 0) {
      try {
        queueCloudSync(state, (result, syncedState) => {
          const canonical = result.state;
          if (!canonical || typeof canonical !== 'object') return;

          const localChangedAfterSyncStarted =
            (latestStateRef.current?.lastUpdated || 0) > (syncedState?.lastUpdated || 0) ||
            (latestStateRef.current?.syncRevision || 0) > (syncedState?.syncRevision || 0);
          if (localChangedAfterSyncStarted) return;

          localDirtyRef.current = false;

          const canonicalRevision = canonical.syncRevision || 0;
          const localRevision = latestStateRef.current?.syncRevision || 0;
          if (canonicalRevision <= localRevision && !result.conflictMerged) return;

          applyCanonicalState(canonical, { markSynced: true, force: result.conflictMerged });
        });
      } catch (e) {
        console.warn('useStore cloud sync failed:', e);
      }
    }
  }, [state, applyCanonicalState]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;

      try {
        const incoming = upgradeStateForCurrentBuild(JSON.parse(event.newValue));
        const local = latestStateRef.current;
        const remoteNewer = isRemoteNewer(incoming, local);
        const differentState = hasMeaningfulDifference(incoming, local);
        const shouldMergeConflict = localDirtyRef.current && differentState;
        if (!remoteNewer && !shouldMergeConflict) return;

        const nextState = shouldMergeConflict
          ? mergeStatesForSync(local, incoming)
          : incoming;

        skipNextCloudSyncRef.current = !shouldMergeConflict;
        localDirtyRef.current = shouldMergeConflict;
        setState(prev => ({
          ...prev,
          ...nextState,
          lastUpdated: nextState.lastUpdated || prev.lastUpdated || 0,
          syncRevision: nextState.syncRevision ?? prev.syncRevision ?? 0,
        }));
      } catch (error) {
        console.warn('Failed to reconcile local browser state:', error);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (!isCanonicalSyncConfigured()) return;

    const refreshVisibleState = () => {
      if (document.visibilityState !== 'hidden') refreshFromCloud();
    };
    const flushBeforeBackground = () => {
      if (!localDirtyRef.current) return;
      clearQueuedCloudSync();
      refreshFromCloud({ forceMergeLocal: true });
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushBeforeBackground();
      } else {
        refreshFromCloud();
      }
    };

    const intervalId = window.setInterval(refreshVisibleState, CLOUD_REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refreshVisibleState);
    window.addEventListener('online', refreshVisibleState);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', flushBeforeBackground);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshVisibleState);
      window.removeEventListener('online', refreshVisibleState);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', flushBeforeBackground);
    };
  }, [refreshFromCloud]);

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next === prev) return prev;
      if (!next || typeof next !== 'object') return prev;
      const preserveLastUpdated = next.__preserveLastUpdated === true;
      const skipCloudSync = next.__skipCloudSync === true;
      if (skipCloudSync) skipNextCloudSyncRef.current = true;
      // Deep-merge top-level nested objects to avoid wiping sibling keys
      const merged = { ...prev };
      for (const key of Object.keys(next)) {
        if (key === '__preserveLastUpdated' || key === '__skipCloudSync') continue;
        if (
          next[key] !== null &&
          typeof next[key] === 'object' &&
          !Array.isArray(next[key]) &&
          typeof prev[key] === 'object' &&
          !Array.isArray(prev[key])
        ) {
          merged[key] = { ...prev[key], ...next[key] };
        } else {
          merged[key] = next[key];
        }
      }
      merged.lastUpdated = preserveLastUpdated ? (next.lastUpdated || prev.lastUpdated || 0) : Date.now();
      merged.syncRevision = preserveLastUpdated
        ? (next.syncRevision ?? prev.syncRevision ?? 0)
        : ((prev.syncRevision || 0) + 1);
      if (!preserveLastUpdated && !skipCloudSync) localDirtyRef.current = true;
      return merged;
    });
  }, []);

  return { state, setState: updateState };
}
