import { describe, it, expect } from 'vitest';
import { rankActionsForProfile, estimateExposure } from '../../src/domain/helpers';
import { ACTION_CATALOG } from '../../src/domain/actionCatalog';
import type { AqiData, HouseholdProfile } from '../../src/domain/types';

const makeAqi = (usAqi: number): AqiData => ({
  usAqi,
  pm25: 50,
  pm10: 70,
  no2: 30,
  o3: 40,
  so2: 10,
  co: 500,
  timestamp: new Date().toISOString(),
});

const baseProfile: HouseholdProfile = {
  sensitivities: [],
  commuteMode: 'car',
  homeType: 'leaky',
  hasPurifier: false,
  hasAc: false,
  cookingFuel: 'lpg',
  budgetTier: 'low',
};

describe('domain helpers', () => {
  it('rankActionsForProfile returns a sorted ranked array', () => {
    const result = rankActionsForProfile(ACTION_CATALOG, baseProfile, makeAqi(150));
    expect(Array.isArray(result)).toBe(true);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.score).toBeGreaterThanOrEqual(result[i]!.score);
    }
  });

  it('rankActionsForProfile passes through to rankActions correctly', () => {
    const result = rankActionsForProfile(ACTION_CATALOG, baseProfile, makeAqi(200));
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('action');
    expect(result[0]).toHaveProperty('score');
  });

  it('estimateExposure re-export works', () => {
    const aqi = 150;
    const result = estimateExposure(aqi, [], baseProfile);
    expect(result.currentExposure).toBe(aqi);
  });
});
