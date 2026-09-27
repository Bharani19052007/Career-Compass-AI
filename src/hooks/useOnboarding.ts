import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface OnboardingPreferences {
  hasCompletedOnboarding: boolean;
  areaOfInterest: string;
  preferredJob: string;
  preferredLocation: string;
  resumeUploaded: boolean;
}

const defaultPreferences: OnboardingPreferences = {
  hasCompletedOnboarding: false,
  areaOfInterest: '',
  preferredJob: '',
  preferredLocation: '',
  resumeUploaded: false,
};

const BASE_STORAGE_KEY = 'career_compass_onboarding_prefs';

export function useOnboarding() {
  const { user } = useAuth();
  const STORAGE_KEY = user ? `${BASE_STORAGE_KEY}_${user.id}` : BASE_STORAGE_KEY;

  const [preferences, setPreferences] = useState<OnboardingPreferences>(() => {
    if (typeof window === 'undefined') return defaultPreferences;
    // Initial read is not strictly user-bound if user hasn't loaded, 
    // but useEffect will sync it once user is available
    return defaultPreferences;
  });

  // Load preferences when user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch {
          setPreferences(defaultPreferences);
        }
      } else {
        setPreferences(defaultPreferences);
      }
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }
  }, [preferences, STORAGE_KEY]);

  const updatePreferences = (updates: Partial<OnboardingPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const completeOnboarding = () => {
    setPreferences(prev => ({ ...prev, hasCompletedOnboarding: true }));
  };

  return {
    preferences,
    updatePreferences,
    completeOnboarding
  };
}
