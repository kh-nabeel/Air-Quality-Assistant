import type { AqiData, HourlyAqiData, Result } from '@/domain/types';
import { OPEN_METEO_AQ_BASE, AQI_CACHE_TTL_MS } from '@/config/constants';
import { ok, err } from '@/utils/result';
import { aqiCache } from '@/utils/cache';
import { airQualityResponseSchema } from './schemas';

/** Parameters for the hourly air quality query */
const HOURLY_PARAMS = [
  'us_aqi',
  'pm2_5',
  'pm10',
  'nitrogen_dioxide',
  'ozone',
  'sulphur_dioxide',
  'carbon_monoxide',
].join(',');

/** In-flight request deduplication map */
const inflightRequests = new Map<
  string,
  Promise<Result<{ current: AqiData; hourly: HourlyAqiData[] }>>
>();

/**
 * Fetch air quality data from the Open-Meteo Air Quality API.
 * Results are cached for 15 minutes (in-memory + sessionStorage).
 * Concurrent requests for the same coordinates are deduplicated.
 *
 * @param lat - Latitude (rounded to 2 decimal places)
 * @param lng - Longitude (rounded to 2 decimal places)
 * @param signal - Optional AbortSignal for cancellation
 * @returns Current AQI data and 48h hourly forecast
 */
export async function fetchAirQuality(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<Result<{ current: AqiData; hourly: HourlyAqiData[] }>> {
  const cacheKey = `aq_${lat.toFixed(2)}_${lng.toFixed(2)}`;

  // Check cache first
  const cached = aqiCache.get<{ current: AqiData; hourly: HourlyAqiData[] }>(cacheKey);
  if (cached) return ok(cached);

  // Deduplicate concurrent requests
  const existing = inflightRequests.get(cacheKey);
  if (existing) return existing;

  const request = doFetch(lat, lng, cacheKey, signal);
  inflightRequests.set(cacheKey, request);

  try {
    return await request;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}

async function doFetch(
  lat: number,
  lng: number,
  cacheKey: string,
  signal?: AbortSignal,
): Promise<Result<{ current: AqiData; hourly: HourlyAqiData[] }>> {
  try {
    const url = `${OPEN_METEO_AQ_BASE}?latitude=${lat}&longitude=${lng}&hourly=${HOURLY_PARAMS}&forecast_days=2&timezone=auto`;

    const response = await fetch(url, { signal });
    if (!response.ok) {
      return err(new Error(`Air quality API returned ${response.status}`));
    }

    const json: unknown = await response.json();
    const parsed = airQualityResponseSchema.safeParse(json);

    if (!parsed.success) {
      return err(new Error(`Invalid API response: ${parsed.error.message}`));
    }

    const { hourly } = parsed.data;

    // Transform to our types
    const hourlyData: HourlyAqiData[] = hourly.time.map((time, i) => ({
      time,
      usAqi: hourly.us_aqi[i] ?? 0,
      pm25: hourly.pm2_5[i] ?? 0,
      pm10: hourly.pm10[i] ?? 0,
      no2: hourly.nitrogen_dioxide[i] ?? 0,
      o3: hourly.ozone[i] ?? 0,
      so2: hourly.sulphur_dioxide[i] ?? 0,
      co: hourly.carbon_monoxide[i] ?? 0,
    }));

    // Find the current hour's data (closest to now)
    const now = new Date();
    const currentIndex = hourlyData.reduce((closest, entry, i) => {
      const entryTime = new Date(entry.time);
      const closestTime = new Date(hourlyData[closest]?.time ?? '');
      return Math.abs(entryTime.getTime() - now.getTime()) <
        Math.abs(closestTime.getTime() - now.getTime())
        ? i
        : closest;
    }, 0);

    const currentEntry = hourlyData[currentIndex];
    const current: AqiData = {
      usAqi: currentEntry?.usAqi ?? 0,
      pm25: currentEntry?.pm25 ?? 0,
      pm10: currentEntry?.pm10 ?? 0,
      no2: currentEntry?.no2 ?? 0,
      o3: currentEntry?.o3 ?? 0,
      so2: currentEntry?.so2 ?? 0,
      co: currentEntry?.co ?? 0,
      timestamp: currentEntry?.time ?? now.toISOString(),
    };

    const result = { current, hourly: hourlyData };
    aqiCache.set(cacheKey, result, AQI_CACHE_TTL_MS);

    return ok(result);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return err(new Error('Request cancelled'));
    }
    return err(error instanceof Error ? error : new Error('Failed to fetch air quality data'));
  }
}
