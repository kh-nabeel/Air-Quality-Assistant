import { z } from 'zod';

/** Zod schema for a single geocoding result entry from Open-Meteo. */
const geocodingResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string(),
  country_code: z.string().optional(),
  admin1: z.string().optional(),
  admin2: z.string().optional(),
  timezone: z.string().optional(),
  population: z.number().optional(),
});

/**
 * Zod schema for the Open-Meteo Geocoding API response.
 *
 * The `results` array defaults to an empty array when the API returns no matches.
 */
export const geocodingResponseSchema = z.object({
  results: z.array(geocodingResultSchema).optional().default([]),
  generationtime_ms: z.number().optional(),
});

/** Inferred TypeScript type for a validated Open-Meteo Geocoding API response. */
export type GeocodingApiResponse = z.infer<typeof geocodingResponseSchema>;
