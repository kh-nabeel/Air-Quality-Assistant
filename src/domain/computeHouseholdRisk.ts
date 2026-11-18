import type { AqiData, HouseholdProfile, RiskAssessment, RiskTier } from './types';
import {
  SENSITIVITY_MULTIPLIERS,
  HOME_TYPE_ADJUSTMENTS,
  COOKING_FUEL_ADJUSTMENTS,
} from '@/config/constants';

/** Risk tier thresholds based on composite score */
const RISK_TIER_THRESHOLDS: readonly { readonly maxScore: number; readonly tier: RiskTier }[] = [
  { maxScore: 0.3, tier: 'low' },
  { maxScore: 0.5, tier: 'moderate' },
  { maxScore: 0.7, tier: 'high' },
  { maxScore: 0.85, tier: 'veryHigh' },
  { maxScore: Infinity, tier: 'extreme' },
];

/** Base AQI risk (0–1) normalized from AQI value */
function baseAqiRisk(aqi: number): number {
  // Normalize AQI 0–500 to 0–1, with diminishing sensitivity above 300
  if (aqi <= 50) return aqi / 500;
  if (aqi <= 150) return 0.1 + ((aqi - 50) / 100) * 0.3;
  if (aqi <= 300) return 0.4 + ((aqi - 150) / 150) * 0.35;
  return Math.min(1, 0.75 + ((aqi - 300) / 200) * 0.25);
}

/**
 * Compute household-specific risk assessment based on profile vulnerabilities and current AQI.
 *
 * @param profile - Household profile with sensitivities and living conditions
 * @param aqi - Current air quality data
 * @returns Risk assessment with tier, numeric score, contributing factors, and recommendations
 */
export function computeHouseholdRisk(
  profile: HouseholdProfile,
  aqi: AqiData,
): RiskAssessment {
  const base = baseAqiRisk(aqi.usAqi);
  const factors: string[] = [];
  const recommendations: string[] = [];

  // Accumulate sensitivity multipliers
  let sensitivityBonus = 0;
  for (const sensitivity of profile.sensitivities) {
    const multiplier = SENSITIVITY_MULTIPLIERS[sensitivity] ?? 0;
    sensitivityBonus += multiplier;

    if (sensitivity === 'children') {
      factors.push('Children present — higher vulnerability to PM2.5');
      recommendations.push('Keep children indoors when AQI exceeds 100');
    }
    if (sensitivity === 'elderly') {
      factors.push('Older adults present — increased respiratory risk');
      recommendations.push('Monitor symptoms and avoid outdoor exertion');
    }
    if (sensitivity === 'respiratory') {
      factors.push('Respiratory conditions — elevated risk from air pollution');
      recommendations.push('Keep rescue medication accessible; consult doctor if symptoms worsen');
    }
    if (sensitivity === 'cardiac') {
      factors.push('Cardiac conditions — pollution increases cardiovascular stress');
      recommendations.push('Avoid strenuous activity; watch for chest pain or unusual fatigue');
    }
    if (sensitivity === 'pregnancy') {
      factors.push('Pregnancy — fetal development sensitive to pollution exposure');
      recommendations.push('Prioritize indoor time with air filtration');
    }
  }

  // Home type adjustment
  const homeAdj = HOME_TYPE_ADJUSTMENTS[profile.homeType] ?? 0;
  if (homeAdj > 0) {
    factors.push(`${profile.homeType === 'leaky' ? 'Leaky' : 'Moderate'} home — outdoor pollution infiltrates indoors`);
    recommendations.push('Seal gaps around windows and doors');
  }

  // Cooking fuel adjustment
  const cookingAdj = COOKING_FUEL_ADJUSTMENTS[profile.cookingFuel] ?? 0;
  if (cookingAdj > 0) {
    factors.push(`${profile.cookingFuel} cooking — adds to indoor pollution`);
    if (profile.cookingFuel === 'biomass') {
      recommendations.push('Consider switching to LPG or electric cooking');
    } else {
      recommendations.push('Use exhaust hood while cooking');
    }
  }

  // Compute composite score (capped at 1)
  const rawScore = base + base * sensitivityBonus + homeAdj + cookingAdj;
  const score = Math.min(1, Math.max(0, rawScore));

  // Determine tier
  const tierEntry = RISK_TIER_THRESHOLDS.find((t) => score <= t.maxScore);
  const tier: RiskTier = tierEntry?.tier ?? 'extreme';

  if (factors.length === 0) {
    factors.push('No special risk factors identified');
  }

  return { tier, score, factors, recommendations };
}
