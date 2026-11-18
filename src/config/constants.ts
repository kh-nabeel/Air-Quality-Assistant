import type { UserLocation } from '@/domain/types';

/** Primary Gemini model for plan generation and chat */
export const GEMINI_MODEL_PRIMARY = 'gemini-2.5-flash';

/** Fallback model when primary is unavailable */
export const GEMINI_MODEL_FALLBACK = 'gemini-2.5-flash-lite';

/** AQI data cache time-to-live in milliseconds (15 minutes) */
export const AQI_CACHE_TTL_MS = 900_000;

/** Debounce delay for geocoding search input in milliseconds */
export const GEOCODING_DEBOUNCE_MS = 300;

/** Maximum chat history messages to send as context */
export const MAX_CHAT_HISTORY = 10;

/** Maximum user input character length */
export const MAX_USER_INPUT_LENGTH = 500;

/** Maximum Gemini output tokens */
export const MAX_OUTPUT_TOKENS = 1024;

/** Gemini generation temperature (low for consistency) */
export const GEMINI_TEMPERATURE = 0.3;

/** Gemini request timeout in milliseconds */
export const GEMINI_TIMEOUT_MS = 10_000;

/** Open-Meteo Air Quality API base URL */
export const OPEN_METEO_AQ_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/** Open-Meteo Geocoding API base URL */
export const OPEN_METEO_GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

/** Default household count for community impact calculation */
export const COMMUNITY_HOUSEHOLDS = 30;

/** Maximum exposure reduction cap (70%) */
export const MAX_EXPOSURE_REDUCTION = 0.7;

/** Minimum outdoor window duration in hours */
export const MIN_OUTDOOR_WINDOW_HOURS = 2;

/** AQI threshold above which outdoor activity is unsafe */
export const OUTDOOR_UNSAFE_AQI = 150;

/** Scoring weights for action ranking */
export const RELEVANCE_WEIGHT = 0.3;
export const IMPACT_WEIGHT = 0.5;
export const FEASIBILITY_WEIGHT = 0.2;

/** AQI category breakpoints (US EPA) */
export const AQI_BREAKPOINTS = {
  GOOD_MAX: 50,
  MODERATE_MAX: 100,
  SENSITIVE_MAX: 150,
  UNHEALTHY_MAX: 200,
  VERY_UNHEALTHY_MAX: 300,
} as const;

/** Sensitivity risk multipliers */
export const SENSITIVITY_MULTIPLIERS: Record<string, number> = {
  children: 0.3,
  elderly: 0.3,
  respiratory: 0.5,
  cardiac: 0.4,
  pregnancy: 0.4,
} as const;

/** Home type risk adjustments */
export const HOME_TYPE_ADJUSTMENTS: Record<string, number> = {
  sealed: 0,
  moderate: 0.1,
  leaky: 0.2,
} as const;

/** Cooking fuel risk adjustments */
export const COOKING_FUEL_ADJUSTMENTS: Record<string, number> = {
  electric: 0,
  lpg: 0.1,
  mixed: 0.2,
  biomass: 0.3,
} as const;

/** Quick-pick smog-prone cities */
export const QUICK_PICK_CITIES: readonly UserLocation[] = [
  { name: 'Delhi', latitude: 28.61, longitude: 77.21, country: 'India' },
  { name: 'Lucknow', latitude: 26.85, longitude: 80.95, country: 'India' },
  { name: 'Kolkata', latitude: 22.57, longitude: 88.36, country: 'India' },
  { name: 'Lahore', latitude: 31.55, longitude: 74.35, country: 'Pakistan' },
  { name: 'Beijing', latitude: 39.9, longitude: 116.4, country: 'China' },
] as const;

/** localStorage keys */
export const STORAGE_KEYS = {
  PROFILE: 'saans_profile',
  LOCATION: 'saans_location',
  LANGUAGE: 'saans_language',
} as const;
