import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAirQuality } from '../../src/services/airQuality/client';
import { aqiCache } from '../../src/utils/cache';

const VALID_RESPONSE = {
  latitude: 28.61,
  longitude: 77.21,
  hourly: {
    time: ['2024-01-15T00:00', '2024-01-15T01:00', '2024-01-15T02:00'],
    us_aqi: [100, 110, 120],
    pm2_5: [40, 42, 45],
    pm10: [65, 67, 70],
    nitrogen_dioxide: [25, 28, 30],
    ozone: [50, 52, 55],
    sulphur_dioxide: [5, 6, 8],
    carbon_monoxide: [300, 320, 350],
  },
  current_units: {
    time: 'iso8601',
    us_aqi: '',
    pm2_5: 'μg/m³',
    pm10: 'μg/m³',
  },
  hourly_units: {
    time: 'iso8601',
    us_aqi: '',
    pm2_5: 'μg/m³',
    pm10: 'μg/m³',
  },
};

describe('fetchAirQuality', () => {
  beforeEach(() => {
    // Clear the AQI cache so each test starts fresh
    aqiCache.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    aqiCache.clear();
  });

  it('returns ok:true with parsed data on success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => VALID_RESPONSE,
    } as Response);

    const result = await fetchAirQuality(28.61, 77.21, new AbortController().signal);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.current.usAqi).toBeTypeOf('number');
      expect(result.value.hourly.length).toBe(3);
    }
  });

  it('returns ok:false when fetch throws network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchAirQuality(28.62, 77.22, new AbortController().signal);
    expect(result.ok).toBe(false);
  });

  it('returns ok:false when API returns non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({}),
    } as Response);
    const result = await fetchAirQuality(28.63, 77.23, new AbortController().signal);
    expect(result.ok).toBe(false);
  });

  it('maps API field names to camelCase correctly', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => VALID_RESPONSE,
    } as Response);

    const result = await fetchAirQuality(28.64, 77.24, new AbortController().signal);
    if (result.ok) {
      expect(result.value.current).toHaveProperty('no2');
      expect(result.value.current).toHaveProperty('o3');
      expect(result.value.current).toHaveProperty('so2');
      expect(result.value.current).toHaveProperty('co');
    }
  });
});
