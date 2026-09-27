import { useSyncExternalStore, useCallback, useEffect } from 'react';
import type { NormalizedJob } from '@/lib/job-sources/types';
import { currentUserId } from './useAuth';

function getStorageKey() {
  return currentUserId ? `career_compass_tracker_v1_${currentUserId}` : 'career_compass_tracker_v1';
}

export const COLUMNS = ["Saved", "Applied", "Shortlisted", "Interview", "Offer", "Rejected"] as const;
export type TrackerColumn = typeof COLUMNS[number];

type TrackerState = Record<TrackerColumn, NormalizedJob[]>;

let memoryState: TrackerState | null = null;
let currentKey = getStorageKey();
const listeners = new Set<() => void>();

function getInitialState(): TrackerState {
  return COLUMNS.reduce((acc, col) => {
    acc[col] = [];
    return acc;
  }, {} as TrackerState);
}

function getSnapshot() {
  const newKey = getStorageKey();
  if (!memoryState || newKey !== currentKey) {
    currentKey = newKey;
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(currentKey) : null;
      if (item) {
        const parsed = JSON.parse(item);
        memoryState = getInitialState();
        for (const col of COLUMNS) {
          if (parsed[col]) memoryState[col] = parsed[col];
        }
      } else {
        memoryState = getInitialState();
      }
    } catch (error) {
      console.warn('Error reading localStorage', error);
      memoryState = getInitialState();
    }
  }
  return memoryState;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  
  const handleStorage = (e: StorageEvent) => {
    if (e.key === getStorageKey()) {
      try {
        if (e.newValue) {
          const parsed = JSON.parse(e.newValue);
          memoryState = getInitialState();
          for (const col of COLUMNS) {
            if (parsed[col]) memoryState[col] = parsed[col];
          }
        } else {
          memoryState = getInitialState();
        }
        callback();
      } catch (err) {
        // ignore
      }
    }
  };

  const handleAuthChange = () => {
    memoryState = null; // force reload
    callback();
  };
  
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    window.addEventListener('auth-change', handleAuthChange);
  }
  
  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('auth-change', handleAuthChange);
    }
  };
}

function saveState(next: TrackerState) {
  memoryState = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(getStorageKey(), JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  }
  listeners.forEach(l => l());
}

export function useTracker() {
  const board = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  
  const setBoard = useCallback((nextBoard: TrackerState) => {
    saveState(nextBoard);
  }, []);

  const setColumn = useCallback((column: TrackerColumn, jobs: NormalizedJob[]) => {
    const current = getSnapshot();
    saveState({ ...current!, [column]: jobs });
  }, []);
  
  return {
    board: board!,
    setBoard,
    setColumn
  };
}
