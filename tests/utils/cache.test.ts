import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryCache, AqiCache } from '@/utils/cache';

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
  });

  it('stores and retrieves cached values within TTL', () => {
    cache.set('key1', 'value1', 5000);
    expect(cache.get('key1')).toBe('value1');
    expect(cache.has('key1')).toBe(true);
  });

  it('returns null and purges expired entries', async () => {
    cache.set('expiring', 'bye', 10);
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(cache.get('expiring')).toBeNull();
    expect(cache.has('expiring')).toBe(false);
  });

  it('clears all cached entries', () => {
    cache.set('a', 1, 5000);
    cache.set('b', 2, 5000);
    cache.clear();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });
});

describe('AqiCache', () => {
  let aqiCache: AqiCache;

  beforeEach(() => {
    aqiCache = new AqiCache();
    aqiCache.clear();
  });

  it('supports read, write, and clear across layers', () => {
    aqiCache.set('delhi', { aqi: 250 }, 10000);
    expect(aqiCache.has('delhi')).toBe(true);
    expect(aqiCache.get('delhi')).toEqual({ aqi: 250 });

    aqiCache.clear();
    expect(aqiCache.get('delhi')).toBeNull();
  });
});
