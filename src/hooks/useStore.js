import { useState, useEffect, useCallback } from 'react';
import { loadState, saveState, queueCloudSync } from '../data/store';
import { isCanonicalSyncConfigured } from '../services/canonicalSync';

export function useStore() {
  const [state, setState] = useState(() => loadState());

  useEffect(() => {
    try {
      saveState(state);
    } catch (e) {
      console.warn('useStore save failed:', e);
    }
    if (isCanonicalSyncConfigured() && (state.lastUpdated || 0) > 0) {
      try {
        queueCloudSync(state);
      } catch (e) {
        console.warn('useStore cloud sync failed:', e);
      }
    }
  }, [state]);

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next === prev) return prev;
      if (!next || typeof next !== 'object') return prev;
      const preserveLastUpdated = next.__preserveLastUpdated === true;
      // Deep-merge top-level nested objects to avoid wiping sibling keys
      const merged = { ...prev };
      for (const key of Object.keys(next)) {
        if (key === '__preserveLastUpdated') continue;
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
      return merged;
    });
  }, []);

  return { state, setState: updateState };
}
