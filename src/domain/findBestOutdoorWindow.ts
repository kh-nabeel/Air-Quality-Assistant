import type { HourlyAqiData, OutdoorWindow } from './types';
import { classifyAqi } from './classifyAqi';
import { MIN_OUTDOOR_WINDOW_HOURS, OUTDOOR_UNSAFE_AQI } from '@/config/constants';

/**
 * Find the best consecutive outdoor window (lowest average AQI) in the forecast.
 * Window must be at least MIN_OUTDOOR_WINDOW_HOURS (2) hours long.
 * Returns null if all hours have AQI above OUTDOOR_UNSAFE_AQI (150).
 *
 * @param hourlyData - Array of hourly AQI readings (must be sorted by time)
 * @returns Best outdoor window, or null if no safe window exists
 */
export function findBestOutdoorWindow(
  hourlyData: readonly HourlyAqiData[],
): OutdoorWindow | null {
  if (hourlyData.length < MIN_OUTDOOR_WINDOW_HOURS) return null;

  // Check if any hours are below the unsafe threshold
  const hasSafeHours = hourlyData.some((h) => h.usAqi <= OUTDOOR_UNSAFE_AQI);
  if (!hasSafeHours) return null;

  let bestWindow: OutdoorWindow | null = null;
  let bestAvgAqi = Infinity;

  // Sliding window of MIN_OUTDOOR_WINDOW_HOURS
  for (
    let windowSize = MIN_OUTDOOR_WINDOW_HOURS;
    windowSize <= Math.min(hourlyData.length, 6);
    windowSize++
  ) {
    for (let i = 0; i <= hourlyData.length - windowSize; i++) {
      const windowSlice = hourlyData.slice(i, i + windowSize);
      const avgAqi = windowSlice.reduce((sum, h) => sum + h.usAqi, 0) / windowSize;

      // Only consider windows where all hours are below unsafe threshold
      const allSafe = windowSlice.every((h) => h.usAqi <= OUTDOOR_UNSAFE_AQI);
      if (!allSafe) continue;

      if (avgAqi < bestAvgAqi) {
        bestAvgAqi = avgAqi;
        const startEntry = windowSlice[0]!;
        const endEntry = windowSlice[windowSlice.length - 1]!;
        bestWindow = {
          startTime: startEntry.time,
          endTime: endEntry.time,
          avgAqi: Math.round(avgAqi),
          duration: windowSize,
          category: classifyAqi(avgAqi).category,
        };
      }
    }
  }

  return bestWindow;
}
