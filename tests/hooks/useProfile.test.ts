import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfile } from '@/hooks/useProfile';
import type { HouseholdProfile, UserLocation } from '@/domain/types';

describe('useProfile hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with null profile and location', () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.profile).toBeNull();
    expect(result.current.location).toBeNull();
    expect(result.current.hasProfile).toBe(false);
    expect(result.current.hasLocation).toBe(false);
  });

  it('saves and loads profile and location from localStorage', () => {
    const { result } = renderHook(() => useProfile());

    const mockProfile: HouseholdProfile = {
      vulnerabilities: ['asthma', 'infants'],
      homeType: 'leaky',
      commuteMode: 'two-wheeler',
      cookingFuel: 'lpg',
      budgetTier: 'free',
    };

    const mockLocation: UserLocation = {
      name: 'Delhi, India',
      latitude: 28.6139,
      longitude: 77.209,
    };

    act(() => {
      result.current.setProfile(mockProfile);
      result.current.setLocation(mockLocation);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.location).toEqual(mockLocation);
    expect(result.current.hasProfile).toBe(true);
    expect(result.current.hasLocation).toBe(true);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.location).toBeNull();
    expect(result.current.hasProfile).toBe(false);
    expect(result.current.hasLocation).toBe(false);
  });
});
