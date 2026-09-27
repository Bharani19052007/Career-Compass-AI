import { useSyncExternalStore, useCallback } from 'react';
import { currentUserId } from './useAuth';

function getStorageKey() {
  return currentUserId ? `career_compass_notifications_v1_${currentUserId}` : 'career_compass_notifications_v1';
}

export type NotificationType = 'job' | 'interview' | 'application' | 'system' | 'resume';

export interface AppNotification {
  id: string;
  title: string;
  type: NotificationType;
  timestamp: number;
}

let memoryState: AppNotification[] | null = null;
let currentKey = getStorageKey();
const listeners = new Set<() => void>();

function getSnapshot() {
  const newKey = getStorageKey();
  if (!memoryState || newKey !== currentKey) {
    currentKey = newKey;
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(currentKey) : null;
      memoryState = item ? JSON.parse(item) : [
        {
          id: 'welcome-1',
          title: 'Welcome to CareerPilot! Your AI career journey starts here.',
          type: 'system',
          timestamp: Date.now()
        }
      ];
    } catch (error) {
      memoryState = [];
    }
  }
  return memoryState;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  
  const handleStorage = (e: StorageEvent) => {
    if (e.key === getStorageKey()) {
      try {
        memoryState = e.newValue ? JSON.parse(e.newValue) : [];
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

export function pushNotification(title: string, type: NotificationType = 'system') {
  const current = getSnapshot();
  const next = [
    {
      id: Math.random().toString(36).substring(2, 9),
      title,
      type,
      timestamp: Date.now()
    },
    ...current!
  ].slice(0, 50); // Keep only the latest 50 notifications
  
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

export function clearNotifications() {
  memoryState = [];
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getStorageKey(), '[]');
  }
  listeners.forEach(l => l());
}

export function useNotifications() {
  const notifications = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  
  const addNotification = useCallback((title: string, type: NotificationType = 'system') => {
    pushNotification(title, type);
  }, []);

  return {
    notifications: notifications!,
    addNotification,
    clearAll: clearNotifications
  };
}
