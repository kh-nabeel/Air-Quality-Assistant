import type {
  Action,
  BudgetTier,
  HouseholdProfile,
  RankedAction,
} from './types';
import { RELEVANCE_WEIGHT, IMPACT_WEIGHT, FEASIBILITY_WEIGHT } from '@/config/constants';

/** Budget tier ordering for feasibility scoring */
const BUDGET_ORDER: Record<BudgetTier, number> = {
  free: 0,
  low: 1,
  investment: 2,
};

/** Effort level scoring (inverse: lower effort = higher feasibility) */
const EFFORT_SCORES: Record<string, number> = {
  minimal: 1.0,
  moderate: 0.6,
  significant: 0.3,
};

/**
 * Check if an action is applicable given the household profile and current AQI.
 */
function isApplicable(action: Action, profile: HouseholdProfile, currentAqi: number): boolean {
  const rules = action.applicability;

  if (rules.minAqi !== undefined && currentAqi < rules.minAqi) return false;
  if (rules.maxBudgetTier !== undefined && BUDGET_ORDER[profile.budgetTier] < BUDGET_ORDER[rules.maxBudgetTier]) return false;
  if (rules.homeTypes && !rules.homeTypes.includes(profile.homeType)) return false;
  if (rules.cookingFuels && !rules.cookingFuels.includes(profile.cookingFuel)) return false;
  if (rules.commuteModes && !rules.commuteModes.includes(profile.commuteMode)) return false;

  return true;
}

/**
 * Compute relevance score (0–1) based on how well the action matches the profile.
 */
function computeRelevance(action: Action, profile: HouseholdProfile, currentAqi: number): number {
  let score = 0.5; // base relevance

  // Higher AQI makes all actions more relevant
  if (currentAqi > 200) score += 0.3;
  else if (currentAqi > 100) score += 0.2;
  else if (currentAqi > 50) score += 0.1;

  // Sensitivity matches increase relevance
  if (action.applicability.requiredSensitivities) {
    const matchCount = action.applicability.requiredSensitivities.filter((s) =>
      profile.sensitivities.includes(s),
    ).length;
    score += matchCount * 0.1;
  }

  return Math.min(1, score);
}

/**
 * Compute impact score (0–1) based on exposure reduction potential.
 */
function computeImpact(action: Action, currentAqi: number): number {
  const avgReduction = (action.exposureReduction.min + action.exposureReduction.max) / 2;

  // Impact scales with both the reduction percentage and current AQI severity
  const aqiFactor = Math.min(1, currentAqi / 200);
  return Math.min(1, (avgReduction / 50) * aqiFactor);
}

/**
 * Compute feasibility score (0–1) based on cost and effort.
 */
function computeFeasibility(action: Action, budgetTier: BudgetTier): number {
  const costScore = action.costTier === 'free' ? 1.0 : action.costTier === 'low' ? 0.7 : 0.4;
  const effortScore = EFFORT_SCORES[action.effort] ?? 0.5;

  // Budget alignment bonus
  const budgetBonus = BUDGET_ORDER[budgetTier] >= BUDGET_ORDER[action.costTier] ? 0.1 : 0;

  return Math.min(1, (costScore + effortScore) / 2 + budgetBonus);
}

/**
 * Rank actions by composite score (relevance × impact × feasibility).
 * Filters out inapplicable actions and sorts by score descending.
 *
 * @param actions - Full action catalog
 * @param context - Current profile, AQI, and budget context
 * @returns Sorted array of ranked actions with individual scores
 */
export function rankActions(
  actions: readonly Action[],
  context: {
    readonly profile: HouseholdProfile;
    readonly currentAqi: number;
    readonly budgetTier: BudgetTier;
  },
): readonly RankedAction[] {
  const { profile, currentAqi, budgetTier } = context;

  return actions
    .filter((action) => isApplicable(action, profile, currentAqi))
    .map((action) => {
      const relevance = computeRelevance(action, profile, currentAqi);
      const impact = computeImpact(action, currentAqi);
      const feasibility = computeFeasibility(action, budgetTier);

      const score =
        RELEVANCE_WEIGHT * relevance + IMPACT_WEIGHT * impact + FEASIBILITY_WEIGHT * feasibility;

      return { action, score, relevance, impact, feasibility };
    })
    .sort((a, b) => b.score - a.score);
}
