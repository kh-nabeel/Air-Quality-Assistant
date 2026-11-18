import { describe, it, expect } from 'vitest';
import { computeHouseholdRisk } from '../../src/domain/computeHouseholdRisk';
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
  homeType: 'moderate',
  hasPurifier: false,
  hasAc: false,
  cookingFuel: 'lpg',
  budgetTier: 'low',
};

describe('computeHouseholdRisk', () => {
  it('returns low risk for good AQI and no sensitivities', () => {
    const result = computeHouseholdRisk({ ...baseProfile, homeType: 'sealed', cookingFuel: 'electric', sensitivities: [] }, makeAqi(30));
    expect(result.tier).toBe('low');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it('returns higher risk when children are present', () => {
    const noChildren = computeHouseholdRisk(baseProfile, makeAqi(150));
    const withChildren = computeHouseholdRisk({ ...baseProfile, sensitivities: ['children'] }, makeAqi(150));
    expect(withChildren.score).toBeGreaterThan(noChildren.score);
  });

  it('stacks multiple sensitivity multipliers', () => {
    const single = computeHouseholdRisk({ ...baseProfile, sensitivities: ['respiratory'] }, makeAqi(150));
    const multiple = computeHouseholdRisk({ ...baseProfile, sensitivities: ['children', 'elderly', 'respiratory'] }, makeAqi(150));
    expect(multiple.score).toBeGreaterThan(single.score);
  });

  it('leaky home raises risk vs sealed home', () => {
    const sealed = computeHouseholdRisk({ ...baseProfile, homeType: 'sealed' }, makeAqi(150));
    const leaky = computeHouseholdRisk({ ...baseProfile, homeType: 'leaky' }, makeAqi(150));
    expect(leaky.score).toBeGreaterThan(sealed.score);
  });

  it('biomass cooking raises risk vs electric', () => {
    const electric = computeHouseholdRisk({ ...baseProfile, cookingFuel: 'electric' }, makeAqi(150));
    const biomass = computeHouseholdRisk({ ...baseProfile, cookingFuel: 'biomass' }, makeAqi(150));
    expect(biomass.score).toBeGreaterThan(electric.score);
  });

  it('score is always between 0 and 1', () => {
    const extreme = computeHouseholdRisk(
      { ...baseProfile, sensitivities: ['children', 'elderly', 'respiratory', 'cardiac', 'pregnancy'], homeType: 'leaky', cookingFuel: 'biomass' },
      makeAqi(500),
    );
    expect(extreme.score).toBeLessThanOrEqual(1);
    expect(extreme.score).toBeGreaterThanOrEqual(0);
  });

  it('returns at least one factor', () => {
    const result = computeHouseholdRisk(baseProfile, makeAqi(150));
    expect(result.factors.length).toBeGreaterThan(0);
  });

  it('returns extreme tier for maximum conditions', () => {
    const result = computeHouseholdRisk(
      { ...baseProfile, sensitivities: ['children', 'elderly', 'respiratory', 'cardiac', 'pregnancy'], homeType: 'leaky', cookingFuel: 'biomass' },
      makeAqi(400),
    );
    expect(['veryHigh', 'extreme']).toContain(result.tier);
  });

  it('returns recommendations for each sensitivity', () => {
    const result = computeHouseholdRisk({ ...baseProfile, sensitivities: ['children', 'respiratory'] }, makeAqi(200));
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2);
  });

  it('elderly sensitivity adds correct factor and recommendation', () => {
    const result = computeHouseholdRisk({ ...baseProfile, sensitivities: ['elderly'] }, makeAqi(150));
    expect(result.factors.some((f) => f.includes('Older adults'))).toBe(true);
    expect(result.recommendations.some((r) => r.includes('Monitor'))).toBe(true);
  });

  it('cardiac sensitivity adds correct factor and recommendation', () => {
    const result = computeHouseholdRisk({ ...baseProfile, sensitivities: ['cardiac'] }, makeAqi(150));
    expect(result.factors.some((f) => f.includes('Cardiac'))).toBe(true);
    expect(result.recommendations.some((r) => r.includes('strenuous'))).toBe(true);
  });

  it('pregnancy sensitivity adds correct factor and recommendation', () => {
    const result = computeHouseholdRisk({ ...baseProfile, sensitivities: ['pregnancy'] }, makeAqi(150));
    expect(result.factors.some((f) => f.includes('Pregnancy'))).toBe(true);
    expect(result.recommendations.some((r) => r.includes('indoor'))).toBe(true);
  });

  it('moderate home type adds infiltration factor', () => {
    const result = computeHouseholdRisk({ ...baseProfile, homeType: 'moderate' }, makeAqi(150));
    expect(result.factors.some((f) => f.includes('Moderate') || f.includes('infiltrate'))).toBe(true);
  });

  it('biomass cooking adds switching recommendation', () => {
    const result = computeHouseholdRisk({ ...baseProfile, cookingFuel: 'biomass' }, makeAqi(150));
    expect(result.recommendations.some((r) => r.includes('LPG') || r.includes('electric'))).toBe(true);
  });

  it('lpg cooking adds exhaust hood recommendation', () => {
    const result = computeHouseholdRisk({ ...baseProfile, cookingFuel: 'lpg' }, makeAqi(150));
    expect(result.recommendations.some((r) => r.includes('exhaust'))).toBe(true);
  });

  it('no factors for sealed+electric+no-sensitivities shows default factor', () => {
    const result = computeHouseholdRisk(
      { ...baseProfile, homeType: 'sealed', cookingFuel: 'electric', sensitivities: [] },
      makeAqi(30),
    );
    expect(result.factors.some((f) => f.includes('No special'))).toBe(true);
  });
});
