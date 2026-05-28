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
      return { ...prev, ...next };
    });
  }, []);

  return { state, setState: updateState };
}
