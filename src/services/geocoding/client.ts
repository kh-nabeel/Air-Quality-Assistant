import type { GeoLocation, Result } from '@/domain/types';
import { OPEN_METEO_GEO_BASE } from '@/config/constants';
import { ok, err } from '@/utils/result';
import { geocodingResponseSchema } from './schemas';

/**
 * Search for locations using the Open-Meteo Geocoding API.
 *
 * @param query - City or place name to search
 * @param signal - Optional AbortSignal for cancellation
 * @returns Array of matching locations
 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<Result<GeoLocation[]>> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return ok([]);

  try {
    const url = `${OPEN_METEO_GEO_BASE}?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`;
    const response = await fetch(url, { signal });

    if (!response.ok) {
      return err(new Error(`Geocoding API returned ${response.status}`));
    }

    const json: unknown = await response.json();
    const parsed = geocodingResponseSchema.safeParse(json);

    if (!parsed.success) {
      return err(new Error(`Invalid geocoding response: ${parsed.error.message}`));
    }

    const locations: GeoLocation[] = parsed.data.results.map((r) => ({
      name: r.name,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
      admin1: r.admin1,
    }));

    return ok(locations);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return err(new Error('Request cancelled'));
    }
    return err(error instanceof Error ? error : new Error('Failed to search locations'));
  }
}
