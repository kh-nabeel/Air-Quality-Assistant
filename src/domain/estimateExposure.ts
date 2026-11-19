import type { ExposureEstimate, HouseholdProfile, RankedAction } from './types';
import { COMMUNITY_HOUSEHOLDS, MAX_EXPOSURE_REDUCTION } from '@/config/constants';

/**
 * Estimate exposure reduction from a set of ranked actions.
 * Uses diminishing-returns model: each additional action provides
 * proportionally less reduction. Capped at MAX_EXPOSURE_REDUCTION (70%).
 *
 * @param currentAqi - Current AQI value as baseline exposure
 * @param actions - Ranked actions the user plans to take
 * @param _profile - Household profile (used for confidence assessment)
 * @returns Exposure estimate with ranges and community impact projection
 */
export function estimateExposure(
  currentAqi: number,
  actions: readonly RankedAction[],
  _profile: HouseholdProfile,
): ExposureEstimate {
  if (actions.length === 0) {
    return {
      currentExposure: currentAqi,
      reducedExposure: { min: currentAqi, max: currentAqi },
      reductionPercent: { min: 0, max: 0 },
      communityImpact: {
        households: COMMUNITY_HOUSEHOLDS,
        totalReduction: { min: 0, max: 0 },
      },
      confidence: 'limited',
    };
  }

  // Compute combined reduction with diminishing returns
  let remainingMin = 1.0;
  let remainingMax = 1.0;
  let strongEvidence = 0;
  let totalActions = 0;

  for (const { action } of actions) {
    const minReduce = action.exposureReduction.min / 100;
    const maxReduce = action.exposureReduction.max / 100;

    // Diminishing returns: each action reduces the remaining exposure
    remainingMin *= 1 - minReduce;
    remainingMax *= 1 - maxReduce;
    totalActions++;

    if (action.evidenceStrength === 'strong') strongEvidence++;
  }

  // Total reduction percentage (capped)
  const totalReductionMin = Math.min(MAX_EXPOSURE_REDUCTION, 1 - remainingMax);
  const totalReductionMax = Math.min(MAX_EXPOSURE_REDUCTION, 1 - remainingMin);

  // Ensure min <= max after cap
  const reductionMin = Math.min(totalReductionMin, totalReductionMax);
  const reductionMax = Math.max(totalReductionMin, totalReductionMax);

  const reducedMin = Math.round(currentAqi * (1 - reductionMax));
  const reducedMax = Math.round(currentAqi * (1 - reductionMin));

  // Confidence based on evidence strength ratio
  const evidenceRatio = totalActions > 0 ? strongEvidence / totalActions : 0;
  const confidence = evidenceRatio > 0.6 ? 'strong' : evidenceRatio > 0.3 ? 'moderate' : 'limited';

  return {
    currentExposure: currentAqi,
    reducedExposure: { min: reducedMin, max: reducedMax },
    reductionPercent: {
      min: Math.round(reductionMin * 100),
      max: Math.round(reductionMax * 100),
    },
    communityImpact: {
      households: COMMUNITY_HOUSEHOLDS,
      totalReduction: {
        min: Math.round(reductionMin * currentAqi * COMMUNITY_HOUSEHOLDS),
        max: Math.round(reductionMax * currentAqi * COMMUNITY_HOUSEHOLDS),
      },
    },
    confidence,
  };
}
