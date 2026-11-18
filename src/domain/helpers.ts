import type { Action, AqiData, HouseholdProfile, RankedAction } from '@/domain/types';
import { rankActions } from '@/domain/rankActions';
import { estimateExposure } from '@/domain/estimateExposure';

/**
 * Convenience wrapper — calls `rankActions` using the simpler (catalog, profile, aqi) signature.
 * Features use this instead of constructing the context object manually.
 */
export function rankActionsForProfile(
  catalog: readonly Action[],
  profile: HouseholdProfile,
  aqi: AqiData,
): readonly RankedAction[] {
  return rankActions(catalog, {
    profile,
    currentAqi: aqi.usAqi,
    budgetTier: profile.budgetTier,
  });
}

export { rankActions, estimateExposure };
