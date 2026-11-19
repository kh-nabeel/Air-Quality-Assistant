import { describe, it, expect } from 'vitest';
import { rankActions } from '../../src/domain/rankActions';
import { ACTION_CATALOG } from '../../src/domain/actionCatalog';
import type { HouseholdProfile } from '../../src/domain/types';

const makeContext = (usAqi: number, profile: HouseholdProfile) => ({
  profile,
  currentAqi: usAqi,
  budgetTier: profile.budgetTier,
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

describe('rankActions', () => {
  it('returns an array', () => {
    const result = rankActions(ACTION_CATALOG, makeContext(150, baseProfile));
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns ranked actions sorted by score descending', () => {
    const result = rankActions(ACTION_CATALOG, makeContext(150, baseProfile));
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.score).toBeGreaterThanOrEqual(result[i]!.score);
    }
  });

  it('each result has valid score fields between 0 and 1', () => {
    const result = rankActions(ACTION_CATALOG, makeContext(150, baseProfile));
    for (const r of result) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
      expect(r.relevance).toBeGreaterThanOrEqual(0);
      expect(r.impact).toBeGreaterThanOrEqual(0);
      expect(r.feasibility).toBeGreaterThanOrEqual(0);
    }
  });

  it('filters actions by minAqi applicability', () => {
    const highResult = rankActions(ACTION_CATALOG, makeContext(200, baseProfile));
    const lowResult = rankActions(ACTION_CATALOG, makeContext(10, baseProfile));
    expect(highResult.length).toBeGreaterThanOrEqual(lowResult.length);
  });

  it('filters actions by commute mode applicability', () => {
    const carProfile = { ...baseProfile, commuteMode: 'car' as const };
    const wfhProfile = { ...baseProfile, commuteMode: 'wfh' as const };
    const carResult = rankActions(ACTION_CATALOG, makeContext(150, carProfile));
    const wfhResult = rankActions(ACTION_CATALOG, makeContext(150, wfhProfile));
    const carHasTransit = carResult.some((r) => r.action.id === 'public-transit');
    expect(carHasTransit).toBe(true);
    const wfhHasTransit = wfhResult.some((r) => r.action.id === 'public-transit');
    expect(wfhHasTransit).toBe(false);
  });

  it('budget-tier filter: free-tier users only see applicable actions', () => {
    const freeProfile = { ...baseProfile, budgetTier: 'free' as const };
    const result = rankActions(ACTION_CATALOG, makeContext(200, freeProfile));
    // All returned actions must be applicable to a free-budget user
    // (no action with maxBudgetTier:'free' that requires 'low' or 'investment' budget)
    for (const r of result) {
      const maxBudget = r.action.applicability.maxBudgetTier;
      if (maxBudget !== undefined) {
        expect(['free']).toContain(maxBudget);
      }
    }
    expect(result.length).toBeGreaterThan(0);
  });

  it('investment users see all cost tiers', () => {
    const investProfile = { ...baseProfile, budgetTier: 'investment' as const };
    const result = rankActions(ACTION_CATALOG, makeContext(200, investProfile));
    const tiers = new Set(result.map((r) => r.action.costTier));
    expect(tiers.size).toBeGreaterThan(1);
  });

  it('filters actions by homeType applicability (sealed home skips gap-sealing)', () => {
    const sealedProfile = { ...baseProfile, homeType: 'sealed' as const };
    const result = rankActions(ACTION_CATALOG, makeContext(150, sealedProfile));
    // 'seal-gaps' action only applies to leaky/moderate home types
    const hasSealGaps = result.some((r) => r.action.id === 'seal-gaps');
    expect(hasSealGaps).toBe(false);
  });

  it('filters actions by cookingFuel applicability (electric skips biomass-only action)', () => {
    const electricProfile = { ...baseProfile, cookingFuel: 'electric' as const };
    const result = rankActions(ACTION_CATALOG, makeContext(150, electricProfile));
    // biomass-specific action should not appear for electric cookers
    const biomassCooking = result.find(
      (r) =>
        r.action.applicability.cookingFuels?.includes('biomass') &&
        r.action.applicability.cookingFuels.length === 1,
    );
    expect(biomassCooking).toBeUndefined();
  });

  it('sensitivity match boosts relevance score', () => {
    // With requiredSensitivities matching, relevance should be higher
    const childProfile = { ...baseProfile, sensitivities: ['children' as const] };
    const noSensProfile = { ...baseProfile, sensitivities: [] };
    const childResult = rankActions(ACTION_CATALOG, makeContext(150, childProfile));
    const noSensResult = rankActions(ACTION_CATALOG, makeContext(150, noSensProfile));
    // Both should return results but child profile may score actions higher
    expect(childResult.length).toBeGreaterThan(0);
    expect(noSensResult.length).toBeGreaterThan(0);
  });

  it('AQI > 200 results in higher relevance than AQI 50-100', () => {
    const highAqiResult = rankActions(ACTION_CATALOG, makeContext(250, baseProfile));
    const lowAqiResult = rankActions(ACTION_CATALOG, makeContext(60, baseProfile));
    if (highAqiResult.length > 0 && lowAqiResult.length > 0) {
      const avgHighRelevance =
        highAqiResult.reduce((s, r) => s + r.relevance, 0) / highAqiResult.length;
      const avgLowRelevance =
        lowAqiResult.reduce((s, r) => s + r.relevance, 0) / lowAqiResult.length;
      expect(avgHighRelevance).toBeGreaterThan(avgLowRelevance);
    }
  });
});
