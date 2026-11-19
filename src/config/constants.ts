import type { UserLocation } from '@/domain/types';

/* ─── Gemini Model Configuration ─── */

/** Primary Gemini model for plan generation and chat (fast, reliable, low-latency). */
export const GEMINI_MODEL_PRIMARY = 'gemini-3.5-flash-lite';

/** Fallback model used when the primary Gemini model is unavailable. */
export const GEMINI_MODEL_FALLBACK = 'gemini-3.8-flash';

/** Maximum number of output tokens Gemini may generate per request. */
export const MAX_OUTPUT_TOKENS = 1024;

/** Gemini generation temperature (low value for consistent, deterministic output). */
export const GEMINI_TEMPERATURE = 0.3;

/** Gemini request timeout in milliseconds. */
export const GEMINI_TIMEOUT_MS = 10_000;

/* ─── Cache & Debounce ─── */

/** AQI data cache time-to-live in milliseconds (15 minutes). */
export const AQI_CACHE_TTL_MS = 900_000;

/** Debounce delay for geocoding search input in milliseconds. */
export const GEOCODING_DEBOUNCE_MS = 300;

/* ─── Chat ─── */

/** Maximum number of chat history messages sent as context to Gemini. */
export const MAX_CHAT_HISTORY = 10;

/** Maximum character length allowed for a single user input. */
export const MAX_USER_INPUT_LENGTH = 500;

/* ─── API Endpoints ─── */

/** Open-Meteo Air Quality API base URL. */
export const OPEN_METEO_AQ_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/** Open-Meteo Geocoding API base URL. */
export const OPEN_METEO_GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

/* ─── Exposure & Impact Calculation ─── */

/** Default number of households assumed for community impact calculations. */
export const COMMUNITY_HOUSEHOLDS = 30;

/** Maximum exposure reduction cap (70%). */
export const MAX_EXPOSURE_REDUCTION = 0.7;

/** Minimum outdoor window duration in hours for a window to be considered useful. */
export const MIN_OUTDOOR_WINDOW_HOURS = 2;

/** AQI threshold above which outdoor activity is considered unsafe. */
export const OUTDOOR_UNSAFE_AQI = 150;

/* ─── Action Ranking Weights ─── */

/** Weight applied to the relevance sub-score during action ranking. */
export const RELEVANCE_WEIGHT = 0.3;

/** Weight applied to the impact sub-score during action ranking. */
export const IMPACT_WEIGHT = 0.5;

/** Weight applied to the feasibility sub-score during action ranking. */
export const FEASIBILITY_WEIGHT = 0.2;

/* ─── AQI Classification ─── */

/** AQI category upper-bound breakpoints based on the US EPA scale. */
export const AQI_BREAKPOINTS = {
  /** Maximum AQI value classified as "Good". */
  GOOD_MAX: 50,
  /** Maximum AQI value classified as "Moderate". */
  MODERATE_MAX: 100,
  /** Maximum AQI value classified as "Unhealthy for Sensitive Groups". */
  SENSITIVE_MAX: 150,
  /** Maximum AQI value classified as "Unhealthy". */
  UNHEALTHY_MAX: 200,
  /** Maximum AQI value classified as "Very Unhealthy". */
  VERY_UNHEALTHY_MAX: 300,
} as const;

/* ─── Risk Adjustment Tables ─── */

/** Risk multipliers applied per household sensitivity flag (additive). */
export const SENSITIVITY_MULTIPLIERS: Record<string, number> = {
  children: 0.3,
  elderly: 0.3,
  respiratory: 0.5,
  cardiac: 0.4,
  pregnancy: 0.4,
} as const;

/** Risk adjustments based on how well-sealed the user's home is. */
export const HOME_TYPE_ADJUSTMENTS: Record<string, number> = {
  sealed: 0,
  moderate: 0.1,
  leaky: 0.2,
} as const;

/** Risk adjustments based on cooking fuel type. */
export const COOKING_FUEL_ADJUSTMENTS: Record<string, number> = {
  electric: 0,
  lpg: 0.1,
  mixed: 0.2,
  biomass: 0.3,
} as const;

/* ─── Quick-Pick Locations ─── */

/** Pre-configured smog-prone cities for quick location selection during onboarding. */
export const QUICK_PICK_CITIES: readonly UserLocation[] = [
  { name: 'Delhi', latitude: 28.61, longitude: 77.21, country: 'India' },
  { name: 'Lucknow', latitude: 26.85, longitude: 80.95, country: 'India' },
  { name: 'Kolkata', latitude: 22.57, longitude: 88.36, country: 'India' },
  { name: 'Lahore', latitude: 31.55, longitude: 74.35, country: 'Pakistan' },
  { name: 'Beijing', latitude: 39.9, longitude: 116.4, country: 'China' },
] as const;

/* ─── Local Storage ─── */

/** Keys used for persisting user data in `localStorage`. */
export const STORAGE_KEYS = {
  /** Key for the saved household profile. */
  PROFILE: 'saans_profile',
  /** Key for the saved user location. */
  LOCATION: 'saans_location',
  /** Key for the saved language preference. */
  LANGUAGE: 'saans_language',
} as const;
