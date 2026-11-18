import { describe, it, expect } from 'vitest';
import { estimateExposure } from '../../src/domain/estimateExposure';
import type { HouseholdProfile, RankedAction } from '../../src/domain/types';

const baseProfile: HouseholdProfile = {
  sensitivities: [],
  commuteMode: 'car',
  homeType: 'moderate',
  hasPurifier: false,
  hasAc: false,
  cookingFuel: 'lpg',
  budgetTier: 'low',
};

const makeRankedAction = (
  exposureMin: number,
  exposureMax: number,
  evidenceStrength: 'strong' | 'moderate' | 'limited' = 'moderate',
): RankedAction => ({
  action: {
    id: 'test-action',
    category: 'indoor',
    title: { en: 'Test', hi: 'टेस्ट' },
    description: { en: 'Test action', hi: 'परीक्षण क्रिया' },
    costTier: 'free',
    effort: 'minimal',
    applicability: {},
    exposureReduction: { min: exposureMin, max: exposureMax },
    emissionsReduction: null,
    evidenceNote: 'Test',
    evidenceStrength,
  },
  score: 0.8,
  relevance: 0.8,
  impact: 0.8,
  feasibility: 0.8,
});

describe('estimateExposure', () => {
  it('returns valid structure', () => {
    const result = estimateExposure(150, [makeRankedAction(20, 40)], baseProfile);
    expect(result).toHaveProperty('currentExposure');
    expect(result).toHaveProperty('reducedExposure');
    expect(result).toHaveProperty('reductionPercent');
    expect(result).toHaveProperty('communityImpact');
    expect(result).toHaveProperty('confidence');
  });

  it('currentExposure matches input AQI', () => {
    const result = estimateExposure(200, [makeRankedAction(10, 20)], baseProfile);
    expect(result.currentExposure).toBe(200);
  });

  it('reducedExposure is less than currentExposure', () => {
    const result = estimateExposure(200, [makeRankedAction(20, 40)], baseProfile);
    expect(result.reducedExposure.max).toBeLessThan(result.currentExposure);
  });

  it('reductionPercent is between 0 and 70 (70% cap), returned as integer 0-100', () => {
    const result = estimateExposure(
      200,
      [makeRankedAction(50, 70), makeRankedAction(50, 70), makeRankedAction(50, 70)],
      baseProfile,
    );
    // reductionPercent values are integers 0–100 (e.g. 65 means 65%)
    expect(result.reductionPercent.max).toBeLessThanOrEqual(70);
    expect(result.reductionPercent.min).toBeGreaterThanOrEqual(0);
  });

  it('community impact uses 30 households', () => {
    const result = estimateExposure(150, [makeRankedAction(20, 40)], baseProfile);
    expect(result.communityImpact.households).toBe(30);
  });

  it('community total reduction is larger than individual reduction percent', () => {
    const result = estimateExposure(150, [makeRankedAction(20, 40)], baseProfile);
    // communityImpact.totalReduction is in AQI-equivalent units (aqi × households)
    // reductionPercent is 0–100 integers — totalReduction will be larger
    expect(result.communityImpact.totalReduction.max).toBeGreaterThan(result.reductionPercent.max);
  });

  it('returns "strong" confidence when all actions have strong evidence', () => {
    const result = estimateExposure(
      150,
      [makeRankedAction(20, 40, 'strong'), makeRankedAction(10, 20, 'strong')],
      baseProfile,
    );
    expect(result.confidence).toBe('strong');
  });

  it('returns "moderate" confidence with mixed strong/limited evidence (ratio 0.5)', () => {
    // 1 strong + 1 limited = ratio 0.5 → "moderate" (> 0.3 but ≤ 0.6)
    const result = estimateExposure(
      150,
      [makeRankedAction(20, 40, 'strong'), makeRankedAction(10, 20, 'limited')],
      baseProfile,
    );
    expect(result.confidence).toBe('moderate');
  });

  it('returns "limited" confidence when all actions have limited evidence', () => {
    // 0 strong / 2 total = ratio 0 → "limited"
    const result = estimateExposure(
      150,
      [makeRankedAction(20, 40, 'limited'), makeRankedAction(10, 20, 'limited')],
      baseProfile,
    );
    expect(result.confidence).toBe('limited');
  });

  it('handles empty actions array gracefully', () => {
    const result = estimateExposure(150, [], baseProfile);
    expect(result.reductionPercent.min).toBe(0);
    expect(result.reductionPercent.max).toBe(0);
    expect(result.reducedExposure.min).toBe(150);
    expect(result.reducedExposure.max).toBe(150);
  });
});
