import { useSyncExternalStore, useCallback, useEffect } from 'react';
import { currentUserId } from './useAuth';
import { supabase } from '@/lib/supabase';
import { pushNotification } from './use-notifications';

function getStorageKey() {
  return currentUserId ? `career_compass_applied_jobs_v2_${currentUserId}` : 'career_compass_applied_jobs_v2';
}

let memoryState: Record<string, any> | null = null;
let currentKey = getStorageKey();
const listeners = new Set<() => void>();

function getSnapshot() {
  const newKey = getStorageKey();
  if (!memoryState || newKey !== currentKey) {
    currentKey = newKey;
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(currentKey) : null;
      memoryState = item ? JSON.parse(item) : {};
    } catch (error) {
      console.warn('Error reading localStorage', error);
      memoryState = {};
    }
  }
  return memoryState;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  
  const handleStorage = (e: StorageEvent) => {
    if (e.key === getStorageKey()) {
      try {
        memoryState = e.newValue ? JSON.parse(e.newValue) : {};
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

async function toggleJob(job: any) {
  const jobId = job.id || job.slug;
  if (!jobId) return;

  const current = getSnapshot();
  const isApplied = !!current![jobId];
  const next = { ...current };
  
  if (isApplied) {
    delete next[jobId];
    if (currentUserId) {
      supabase.from('user_applied_jobs').delete().match({ user_id: currentUserId, job_id: jobId }).then();
    }
  } else {
    next[jobId] = job;
    if (job?.title && job?.company) {
      pushNotification(`You started an application for ${job.title} at ${job.company}`, 'application');
      
      if (currentUserId) {
        // Sync to cloud applied jobs
        supabase.from('user_applied_jobs').upsert({
          user_id: currentUserId,
          job_id: jobId,
          job_data: job
        }).then();
        
        // Activity trend chart
        supabase.from('application_activity').insert({
          user_id: currentUserId,
          job_title: job.title,
          company_name: job.company,
          status: 'Applied'
        }).then();
      }
    }
  }
  
  memoryState = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(getStorageKey(), JSON.stringify(next));
    } catch (e) {}
  }
  
  listeners.forEach(l => l());
}

export function useAppliedJobs() {
  const appliedJobsMap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  
  // Sync from cloud on mount
  useEffect(() => {
    if (!currentUserId) return;
    
    supabase.from('user_applied_jobs').select('job_id, job_data').eq('user_id', currentUserId).then(({ data }) => {
      if (data && data.length > 0) {
        const current = getSnapshot();
        let changed = false;
        const next = { ...current };
        
        for (const row of data) {
          if (!next[row.job_id]) {
            next[row.job_id] = row.job_data;
            changed = true;
          }
        }
        
        if (changed) {
          memoryState = next;
          try {
            window.localStorage.setItem(getStorageKey(), JSON.stringify(next));
          } catch(e) {}
          listeners.forEach(l => l());
        }
      }
    });
  }, [currentUserId]);

  const toggleAppliedJob = useCallback((job: any) => {
    toggleJob(job);
  }, []);

  const addAppliedJob = useCallback((job: any) => {
    const jobId = job.id || job.slug;
    if (!jobId) return;
    const current = getSnapshot();
    if (!current![jobId]) {
      toggleJob(job);
    }
  }, []);

  const isJobApplied = useCallback((jobId: string) => {
    return !!appliedJobsMap![jobId];
  }, [appliedJobsMap]);

  return {
    appliedJobsMap: appliedJobsMap!,
    appliedJobsList: Object.values(appliedJobsMap!),
    toggleAppliedJob,
    addAppliedJob,
    isJobApplied
  };
}
