import { describe, it, expect } from 'vitest';
import { findBestOutdoorWindow } from '../../src/domain/findBestOutdoorWindow';
import type { HourlyAqiData } from '../../src/domain/types';

function makeHourly(aqiValues: number[]): HourlyAqiData[] {
  const base = new Date('2024-01-15T00:00:00');
  return aqiValues.map((aqi, i) => ({
    time: new Date(base.getTime() + i * 3600_000).toISOString().replace('.000Z', ''),
    usAqi: aqi,
    pm25: aqi / 2,
    pm10: aqi * 0.8,
    no2: 20,
    o3: 30,
    so2: 5,
    co: 200,
  }));
}

describe('findBestOutdoorWindow', () => {
  it('returns null for empty data', () => {
    expect(findBestOutdoorWindow([])).toBeNull();
  });

  it('returns null when all hours exceed unsafe threshold (150)', () => {
    const data = makeHourly(Array(24).fill(200));
    expect(findBestOutdoorWindow(data)).toBeNull();
  });

  it('returns null when fewer than 2 safe consecutive hours', () => {
    // Only 1 safe hour in isolation
    const aqis = [200, 200, 100, 200, 200, 200];
    const data = makeHourly(aqis);
    expect(findBestOutdoorWindow(data)).toBeNull();
  });

  it('finds window with 2 consecutive safe hours', () => {
    const aqis = [200, 80, 90, 200, 200];
    const data = makeHourly(aqis);
    const result = findBestOutdoorWindow(data);
    expect(result).not.toBeNull();
    expect(result!.duration).toBeGreaterThanOrEqual(2);
    expect(result!.avgAqi).toBeLessThanOrEqual(150);
  });

  it('prefers the window with lowest average AQI', () => {
    const aqis = [50, 60, 200, 100, 110, 200, 30, 35];
    const data = makeHourly(aqis);
    const result = findBestOutdoorWindow(data);
    expect(result).not.toBeNull();
    // Window [30,35] has lower average than [50,60]
    expect(result!.avgAqi).toBeLessThanOrEqual(50);
  });

  it('returns valid category for the best window', () => {
    const data = makeHourly([70, 80, 90, 200]);
    const result = findBestOutdoorWindow(data);
    expect(result?.category).toBe('moderate');
  });

  it('returns duration of the window', () => {
    const aqis = [50, 60, 70, 80, 200];
    const data = makeHourly(aqis);
    const result = findBestOutdoorWindow(data);
    expect(result?.duration).toBeGreaterThanOrEqual(2);
  });
});
