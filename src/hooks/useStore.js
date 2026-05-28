import { useState, useEffect, useCallback } from 'react';
import { loadState, saveState } from '../data/store';

export function useStore() {
  const [state, setState] = useState(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // If updater returned the same reference, no change happened
      if (next === prev) return prev;
      return { ...prev, ...next };
    });
  }, []);

  return { state, setState: updateState };
}
