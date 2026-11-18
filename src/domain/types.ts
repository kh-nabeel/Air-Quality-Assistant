/** Language codes supported by Saans */
export type Language = 'en' | 'hi';

/* ─── AQI Types ─── */

export type AqiCategory =
  | 'good'
  | 'moderate'
  | 'sensitive'
  | 'unhealthy'
  | 'veryUnhealthy'
  | 'hazardous';

export interface AqiClassification {
  readonly category: AqiCategory;
  readonly label: string;
  readonly description: string;
  readonly cssClass: string;
  readonly iconName: string;
  readonly min: number;
  readonly max: number;
}

export interface AqiData {
  readonly usAqi: number;
  readonly pm25: number;
  readonly pm10: number;
  readonly no2: number;
  readonly o3: number;
  readonly so2: number;
  readonly co: number;
  readonly timestamp: string;
}

export interface HourlyAqiData {
  readonly time: string;
  readonly usAqi: number;
  readonly pm25: number;
  readonly pm10: number;
  readonly no2: number;
  readonly o3: number;
  readonly so2: number;
  readonly co: number;
}

/* ─── Household Profile ─── */

export type SensitivityFlag =
  | 'children'
  | 'elderly'
  | 'respiratory'
  | 'cardiac'
  | 'pregnancy';

export type CommuteMode = 'walk' | 'cycle' | 'publicTransport' | 'car' | 'wfh';
export type HomeType = 'sealed' | 'moderate' | 'leaky';
export type CookingFuel = 'electric' | 'lpg' | 'biomass' | 'mixed';
export type BudgetTier = 'free' | 'low' | 'investment';

export interface HouseholdProfile {
  readonly sensitivities: readonly SensitivityFlag[];
  readonly commuteMode: CommuteMode;
  readonly homeType: HomeType;
  readonly hasPurifier: boolean;
  readonly hasAc: boolean;
  readonly cookingFuel: CookingFuel;
  readonly budgetTier: BudgetTier;
}

/* ─── Risk Assessment ─── */

export type RiskTier = 'low' | 'moderate' | 'high' | 'veryHigh' | 'extreme';

export interface RiskAssessment {
  readonly tier: RiskTier;
  readonly score: number;
  readonly factors: readonly string[];
  readonly recommendations: readonly string[];
}

/* ─── Outdoor Window ─── */

export interface OutdoorWindow {
  readonly startTime: string;
  readonly endTime: string;
  readonly avgAqi: number;
  readonly duration: number;
  readonly category: AqiCategory;
}

/* ─── Daily Routine ─── */

export type TimeOfDay =
  | 'earlyMorning'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'evening'
  | 'night';

export type ActivityType =
  | 'commute'
  | 'exercise'
  | 'schoolRun'
  | 'errands'
  | 'outdoor'
  | 'indoor'
  | 'ventilate';

export interface TimeBlock {
  readonly timeOfDay: TimeOfDay;
  readonly startHour: number;
  readonly endHour: number;
  readonly activity: ActivityType;
  readonly label: string;
  readonly description: string;
  readonly isOutdoorSafe: boolean;
  readonly aqiAtTime: number;
}

export interface DailyRoutine {
  readonly date: string;
  readonly blocks: readonly TimeBlock[];
  readonly summary: string;
  readonly bestWindow: OutdoorWindow | null;
}

/* ─── Actions ─── */

export type ActionCategory =
  | 'indoor'
  | 'transport'
  | 'cooking'
  | 'community'
  | 'exercise'
  | 'ventilation';

export type EffortLevel = 'minimal' | 'moderate' | 'significant';
export type EvidenceStrength = 'strong' | 'moderate' | 'limited';

export interface ApplicabilityRules {
  readonly requiredSensitivities?: readonly SensitivityFlag[];
  readonly homeTypes?: readonly HomeType[];
  readonly cookingFuels?: readonly CookingFuel[];
  readonly commuteModes?: readonly CommuteMode[];
  readonly maxBudgetTier?: BudgetTier;
  readonly minAqi?: number;
}

export interface Action {
  readonly id: string;
  readonly category: ActionCategory;
  readonly title: Record<Language, string>;
  readonly description: Record<Language, string>;
  readonly costTier: BudgetTier;
  readonly effort: EffortLevel;
  readonly applicability: ApplicabilityRules;
  readonly exposureReduction: { readonly min: number; readonly max: number };
  readonly emissionsReduction: { readonly min: number; readonly max: number } | null;
  readonly evidenceNote: string;
  readonly evidenceStrength: EvidenceStrength;
}

export interface RankedAction {
  readonly action: Action;
  readonly score: number;
  readonly relevance: number;
  readonly impact: number;
  readonly feasibility: number;
}

export interface ExposureEstimate {
  readonly currentExposure: number;
  readonly reducedExposure: { readonly min: number; readonly max: number };
  readonly reductionPercent: { readonly min: number; readonly max: number };
  readonly communityImpact: {
    readonly households: number;
    readonly totalReduction: { readonly min: number; readonly max: number };
  };
  readonly confidence: EvidenceStrength;
}

/* ─── Location ─── */

export interface GeoLocation {
  readonly name: string;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly admin1?: string;
}

export interface UserLocation {
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country: string;
}

/* ─── Result type ─── */

export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/* ─── Gemini Plan Response ─── */

export interface PlanResponse {
  readonly summary: string;
  readonly actions: readonly { readonly actionId: string; readonly rationale: string }[];
  readonly impactNarrative: string;
  readonly language: string;
}

/* ─── Chat ─── */

export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: number;
}
