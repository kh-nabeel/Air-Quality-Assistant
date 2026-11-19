import { z } from 'zod';

/**
 * Zod schema for the Open-Meteo Air Quality API response.
 *
 * Validates the top-level latitude/longitude, optional generation metadata,
 * and the `hourly` object containing nullable pollutant concentration arrays.
 */
export const airQualityResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number().optional(),
  utc_offset_seconds: z.number().optional(),
  timezone: z.string().optional(),
  timezone_abbreviation: z.string().optional(),
  hourly: z.object({
    time: z.array(z.string()),
    us_aqi: z.array(z.number().nullable()),
    pm2_5: z.array(z.number().nullable()),
    pm10: z.array(z.number().nullable()),
    nitrogen_dioxide: z.array(z.number().nullable()),
    ozone: z.array(z.number().nullable()),
    sulphur_dioxide: z.array(z.number().nullable()),
    carbon_monoxide: z.array(z.number().nullable()),
  }),
});

/** Inferred TypeScript type for a validated Open-Meteo Air Quality API response. */
export type AirQualityApiResponse = z.infer<typeof airQualityResponseSchema>;
