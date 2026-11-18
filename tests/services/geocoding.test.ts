import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchLocations } from '../../src/services/geocoding/client';

const VALID_GEO_RESPONSE = {
  results: [
    {
      id: 1,
      name: 'Delhi',
      latitude: 28.65195,
      longitude: 77.23149,
      country_code: 'IN',
      country: 'India',
      admin1: 'Delhi',
    },
    {
      id: 2,
      name: 'New Delhi',
      latitude: 28.63576,
      longitude: 77.22445,
      country_code: 'IN',
      country: 'India',
      admin1: 'Delhi',
    },
  ],
};

describe('searchLocations', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns ok:true with array of locations on success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => VALID_GEO_RESPONSE,
    } as Response);

    const result = await searchLocations('Delhi', new AbortController().signal);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBe(2);
      expect(result.value[0]!.name).toBe('Delhi');
      expect(result.value[0]!.country).toBe('India');
    }
  });

  it('returns empty array when no results', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    const result = await searchLocations('xyz123', new AbortController().signal);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBe(0);
    }
  });

  it('returns ok:false on network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
    const result = await searchLocations('Delhi', new AbortController().signal);
    expect(result.ok).toBe(false);
  });

  it('handles response without results field', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);
    const result = await searchLocations('Delhi', new AbortController().signal);
    // Should return ok with empty array (graceful degradation)
    if (result.ok) {
      expect(Array.isArray(result.value)).toBe(true);
    }
  });
});
