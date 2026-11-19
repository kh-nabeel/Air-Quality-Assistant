/** Language codes supported by Saans. */
export type Language = 'en' | 'hi';

/* ─── AQI Types ─── */

/** Categorical label for an Air Quality Index reading based on US EPA breakpoints. */
export type AqiCategory =
  'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'veryUnhealthy' | 'hazardous';

/** Full classification metadata for a given AQI category, including UI hints. */
export interface AqiClassification {
  /** The semantic AQI category. */
  readonly category: AqiCategory;
  /** Human-readable label (e.g. "Good", "Unhealthy"). */
  readonly label: string;
  /** User-facing description of health implications. */
  readonly description: string;
  /** CSS class name used for category-specific styling. */
  readonly cssClass: string;
  /** Icon identifier rendered alongside the category. */
  readonly iconName: string;
  /** Lower AQI bound (inclusive) for this category. */
  readonly min: number;
  /** Upper AQI bound (inclusive) for this category. */
  readonly max: number;
}

/** Current air-quality data snapshot including US AQI and individual pollutant concentrations. */
export interface AqiData {
  /** Overall US Air Quality Index value. */
  readonly usAqi: number;
  /** PM2.5 concentration (µg/m³). */
  readonly pm25: number;
  /** PM10 concentration (µg/m³). */
  readonly pm10: number;
  /** Nitrogen dioxide concentration (µg/m³). */
  readonly no2: number;
  /** Ozone concentration (µg/m³). */
  readonly o3: number;
  /** Sulphur dioxide concentration (µg/m³). */
  readonly so2: number;
  /** Carbon monoxide concentration (µg/m³). */
  readonly co: number;
  /** ISO-8601 timestamp of the data reading. */
  readonly timestamp: string;
}

/** Single-hour air-quality observation used in hourly forecast arrays. */
export interface HourlyAqiData {
  /** ISO-8601 timestamp for this hour. */
  readonly time: string;
  /** US AQI value for this hour. */
  readonly usAqi: number;
  /** PM2.5 concentration (µg/m³). */
  readonly pm25: number;
  /** PM10 concentration (µg/m³). */
  readonly pm10: number;
  /** Nitrogen dioxide concentration (µg/m³). */
  readonly no2: number;
  /** Ozone concentration (µg/m³). */
  readonly o3: number;
  /** Sulphur dioxide concentration (µg/m³). */
  readonly so2: number;
  /** Carbon monoxide concentration (µg/m³). */
  readonly co: number;
}

/* ─── Household Profile ─── */

/** Health-sensitivity flag identifying a vulnerable group within a household. */
export type SensitivityFlag = 'children' | 'elderly' | 'respiratory' | 'cardiac' | 'pregnancy';

/** Primary commute mode used by the household. */
export type CommuteMode = 'walk' | 'cycle' | 'publicTransport' | 'car' | 'wfh';

/** How well-sealed the user's home is against outdoor air infiltration. */
export type HomeType = 'sealed' | 'moderate' | 'leaky';

/** Type of cooking fuel used in the household. */
export type CookingFuel = 'electric' | 'lpg' | 'biomass' | 'mixed';

/** Budget tier indicating how much the user is willing to spend on air-quality improvements. */
export type BudgetTier = 'free' | 'low' | 'investment';

/** User's household profile describing living conditions, sensitivities, and preferences. */
export interface HouseholdProfile {
  /** Health-sensitivity flags for household members. */
  readonly sensitivities: readonly SensitivityFlag[];
  /** Primary mode of commuting. */
  readonly commuteMode: CommuteMode;
  /** Home air-sealing quality. */
  readonly homeType: HomeType;
  /** Whether the household owns an air purifier. */
  readonly hasPurifier: boolean;
  /** Whether the household has air conditioning. */
  readonly hasAc: boolean;
  /** Cooking fuel type in use. */
  readonly cookingFuel: CookingFuel;
  /** Spending willingness for air-quality improvements. */
  readonly budgetTier: BudgetTier;
}

/* ─── Risk Assessment ─── */

/** Qualitative risk tier assigned to a household based on AQI and profile factors. */
export type RiskTier = 'low' | 'moderate' | 'high' | 'veryHigh' | 'extreme';

/** Computed risk assessment for a household given current air-quality conditions. */
export interface RiskAssessment {
  /** Overall risk tier. */
  readonly tier: RiskTier;
  /** Numeric risk score (0–1 scale). */
  readonly score: number;
  /** Contributing risk factors. */
  readonly factors: readonly string[];
  /** Actionable recommendations to reduce risk. */
  readonly recommendations: readonly string[];
}

/* ─── Outdoor Window ─── */

/** A contiguous time window during which outdoor air quality is relatively safe. */
export interface OutdoorWindow {
  /** ISO-8601 start time of the window. */
  readonly startTime: string;
  /** ISO-8601 end time of the window. */
  readonly endTime: string;
  /** Average AQI during this window. */
  readonly avgAqi: number;
  /** Duration of the window in hours. */
  readonly duration: number;
  /** AQI category that characterises the window. */
  readonly category: AqiCategory;
}

/* ─── Daily Routine ─── */

/** Named segment of the day used to partition time blocks. */
export type TimeOfDay = 'earlyMorning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

/** Type of activity recommended during a time block. */
export type ActivityType =
  'commute' | 'exercise' | 'schoolRun' | 'errands' | 'outdoor' | 'indoor' | 'ventilate';

/** A single time block in a daily routine, with activity and air-quality context. */
export interface TimeBlock {
  /** Which part of the day this block falls in. */
  readonly timeOfDay: TimeOfDay;
  /** Start hour (0–23). */
  readonly startHour: number;
  /** End hour (0–23). */
  readonly endHour: number;
  /** Recommended activity for this block. */
  readonly activity: ActivityType;
  /** Short human-readable label. */
  readonly label: string;
  /** Longer description of the recommendation. */
  readonly description: string;
  /** Whether outdoor activity is considered safe during this block. */
  readonly isOutdoorSafe: boolean;
  /** Forecasted AQI at the midpoint of this block. */
  readonly aqiAtTime: number;
}

/** A full daily routine plan containing time blocks and an optional best outdoor window. */
export interface DailyRoutine {
  /** ISO-8601 date string this routine applies to. */
  readonly date: string;
  /** Ordered list of time blocks making up the day. */
  readonly blocks: readonly TimeBlock[];
  /** Natural-language summary of the day's plan. */
  readonly summary: string;
  /** Best continuous window for outdoor activities, or `null` if none is safe. */
  readonly bestWindow: OutdoorWindow | null;
}

/* ─── Actions ─── */

/** High-level category grouping for a recommended action. */
export type ActionCategory =
  'indoor' | 'transport' | 'cooking' | 'community' | 'exercise' | 'ventilation';

/** Qualitative effort required to implement an action. */
export type EffortLevel = 'minimal' | 'moderate' | 'significant';

/** Strength of published evidence supporting an action's effectiveness. */
export type EvidenceStrength = 'strong' | 'moderate' | 'limited';

/** Rules determining whether an action applies to a given household profile. */
export interface ApplicabilityRules {
  /** Action only applies if household has at least one of these sensitivities. */
  readonly requiredSensitivities?: readonly SensitivityFlag[];
  /** Action only applies to these home types. */
  readonly homeTypes?: readonly HomeType[];
  /** Action only applies when using one of these cooking fuels. */
  readonly cookingFuels?: readonly CookingFuel[];
  /** Action only applies to these commute modes. */
  readonly commuteModes?: readonly CommuteMode[];
  /** Maximum budget tier at which the action is feasible. */
  readonly maxBudgetTier?: BudgetTier;
  /** Minimum AQI at which the action becomes relevant. */
  readonly minAqi?: number;
}

/** A single recommended action from the action catalog. */
export interface Action {
  /** Unique identifier for the action. */
  readonly id: string;
  /** Category this action belongs to. */
  readonly category: ActionCategory;
  /** Localised action title keyed by language. */
  readonly title: Record<Language, string>;
  /** Localised action description keyed by language. */
  readonly description: Record<Language, string>;
  /** Budget tier required for this action. */
  readonly costTier: BudgetTier;
  /** Effort level required to implement this action. */
  readonly effort: EffortLevel;
  /** Profile-matching rules for relevance scoring. */
  readonly applicability: ApplicabilityRules;
  /** Estimated percentage range of personal exposure reduction. */
  readonly exposureReduction: { readonly min: number; readonly max: number };
  /** Estimated percentage range of emissions reduction, or `null` if not applicable. */
  readonly emissionsReduction: { readonly min: number; readonly max: number } | null;
  /** Note describing the evidence backing this action. */
  readonly evidenceNote: string;
  /** Strength of the supporting evidence. */
  readonly evidenceStrength: EvidenceStrength;
}

/** An action ranked by composite score with individual scoring components. */
export interface RankedAction {
  /** The underlying action being ranked. */
  readonly action: Action;
  /** Composite ranking score (higher is better). */
  readonly score: number;
  /** Relevance sub-score based on household profile match. */
  readonly relevance: number;
  /** Impact sub-score based on exposure/emissions reduction potential. */
  readonly impact: number;
  /** Feasibility sub-score based on cost and effort. */
  readonly feasibility: number;
}

/** Estimated exposure reduction for the household and broader community. */
export interface ExposureEstimate {
  /** Current estimated PM2.5 exposure (µg/m³). */
  readonly currentExposure: number;
  /** Reduced exposure range after applying actions. */
  readonly reducedExposure: { readonly min: number; readonly max: number };
  /** Percentage reduction range. */
  readonly reductionPercent: { readonly min: number; readonly max: number };
  /** Projected community-wide impact if multiple households adopt the actions. */
  readonly communityImpact: {
    /** Number of households assumed in the calculation. */
    readonly households: number;
    /** Total reduction range across all households. */
    readonly totalReduction: { readonly min: number; readonly max: number };
  };
  /** Confidence level of the estimate. */
  readonly confidence: EvidenceStrength;
}

/* ─── Location ─── */

/** Geographic location result returned from the geocoding API. */
export interface GeoLocation {
  /** Display name of the location. */
  readonly name: string;
  /** Country name. */
  readonly country: string;
  /** Latitude in decimal degrees. */
  readonly latitude: number;
  /** Longitude in decimal degrees. */
  readonly longitude: number;
  /** First-level administrative division (e.g. state/province), if available. */
  readonly admin1?: string;
}

/** User's selected location for air-quality lookups. */
export interface UserLocation {
  /** Display name of the location. */
  readonly name: string;
  /** Latitude in decimal degrees. */
  readonly latitude: number;
  /** Longitude in decimal degrees. */
  readonly longitude: number;
  /** Country name. */
  readonly country: string;
}

/* ─── Result type ─── */

/**
 * Discriminated-union result type for operations that may fail.
 *
 * @typeParam T - The success value type.
 * @typeParam E - The error type (defaults to `Error`).
 */
export type Result<T, E = Error> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

/* ─── Gemini Plan Response ─── */

/** Structured response from Gemini when generating a personalised daily plan. */
export interface PlanResponse {
  /** Natural-language summary of the plan. */
  readonly summary: string;
  /** Ordered list of recommended action IDs with per-action rationale. */
  readonly actions: readonly { readonly actionId: string; readonly rationale: string }[];
  /** Narrative describing the cumulative impact of adopting the plan. */
  readonly impactNarrative: string;
  /** Language code the response was generated in. */
  readonly language: string;
}

/* ─── Chat ─── */

/** A single message in the conversational chat between user and Saans assistant. */
export interface ChatMessage {
  /** Unique message identifier. */
  readonly id: string;
  /** Whether the message was sent by the user or the AI assistant. */
  readonly role: 'user' | 'assistant';
  /** Textual content of the message. */
  readonly content: string;
  /** Unix-epoch timestamp (milliseconds) when the message was created. */
  readonly timestamp: number;
}
