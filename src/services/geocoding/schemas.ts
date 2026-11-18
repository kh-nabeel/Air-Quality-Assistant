import { z } from 'zod';

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

/** Zod schema for Open-Meteo Geocoding API response */
export const geocodingResponseSchema = z.object({
  results: z.array(geocodingResultSchema).optional().default([]),
  generationtime_ms: z.number().optional(),
});

export type GeocodingApiResponse = z.infer<typeof geocodingResponseSchema>;
