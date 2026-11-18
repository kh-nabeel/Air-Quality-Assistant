import { useState, useCallback, useEffect } from 'react';
import type { HouseholdProfile, UserLocation } from '@/domain/types';
import { STORAGE_KEYS } from '@/config/constants';

interface UseProfileReturn {
  readonly profile: HouseholdProfile | null;
  readonly location: UserLocation | null;
  readonly setProfile: (profile: HouseholdProfile) => void;
  readonly setLocation: (location: UserLocation) => void;
  readonly clearAll: () => void;
  readonly hasProfile: boolean;
  readonly hasLocation: boolean;
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full or unavailable
  }
}

/**
 * Hook for managing household profile and location in localStorage.
 * Provides a "forget me" function that clears all stored data.
 */
export function useProfile(): UseProfileReturn {
  const [profile, setProfileState] = useState<HouseholdProfile | null>(() =>
    loadFromStorage<HouseholdProfile>(STORAGE_KEYS.PROFILE),
  );
  const [location, setLocationState] = useState<UserLocation | null>(() =>
    loadFromStorage<UserLocation>(STORAGE_KEYS.LOCATION),
  );

  const setProfile = useCallback((p: HouseholdProfile) => {
    setProfileState(p);
    saveToStorage(STORAGE_KEYS.PROFILE, p);
  }, []);

  const setLocation = useCallback((l: UserLocation) => {
    setLocationState(l);
    saveToStorage(STORAGE_KEYS.LOCATION, l);
  }, []);

  const clearAll = useCallback(() => {
    setProfileState(null);
    setLocationState(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.LOCATION);
      localStorage.removeItem(STORAGE_KEYS.LANGUAGE);
    } catch {
      // ignore
    }
  }, []);

  return {
    profile,
    location,
    setProfile,
    setLocation,
    clearAll,
    hasProfile: profile !== null,
    hasLocation: location !== null,
  };
}

/** Listen for storage changes from other tabs */
export function useStorageSync(onClear: () => void): void {
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PROFILE && e.newValue === null) {
        onClear();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [onClear]);
}
