import type {
  DailyRoutine,
  HourlyAqiData,
  HouseholdProfile,
  RiskAssessment,
  TimeBlock,
  TimeOfDay,
} from './types';
import { findBestOutdoorWindow } from './findBestOutdoorWindow';
import { classifyAqi } from './classifyAqi';
import { OUTDOOR_UNSAFE_AQI } from '@/config/constants';

/** Time-of-day definitions with start/end hours */
const TIME_SLOTS: readonly {
  readonly timeOfDay: TimeOfDay;
  readonly start: number;
  readonly end: number;
}[] = [
  { timeOfDay: 'earlyMorning', start: 5, end: 7 },
  { timeOfDay: 'morning', start: 7, end: 10 },
  { timeOfDay: 'midday', start: 10, end: 13 },
  { timeOfDay: 'afternoon', start: 13, end: 16 },
  { timeOfDay: 'evening', start: 16, end: 19 },
  { timeOfDay: 'night', start: 19, end: 22 },
];

/** Get the average AQI for a time range from hourly data */
function getAvgAqiForRange(
  hourly: readonly HourlyAqiData[],
  startHour: number,
  endHour: number,
): number {
  const relevant = hourly.filter((h) => {
    const hour = new Date(h.time).getHours();
    return hour >= startHour && hour < endHour;
  });
  if (relevant.length === 0) return 0;
  return relevant.reduce((sum, h) => sum + h.usAqi, 0) / relevant.length;
}

/**
 * Build a time-blocked daily routine optimized for air quality.
 * Places outdoor activities during the safest windows and suggests
 * indoor alternatives when AQI is high.
 *
 * @param profile - Household profile for personalizing activities
 * @param hourly - Hourly AQI forecast data
 * @param risk - Computed risk assessment
 * @returns Daily routine with time blocks, summary, and best window
 */
export function buildDailyRoutine(
  profile: HouseholdProfile,
  hourly: readonly HourlyAqiData[],
  risk: RiskAssessment,
): DailyRoutine {
  const bestWindow = findBestOutdoorWindow(hourly);
  const blocks: TimeBlock[] = [];
  const today = hourly[0]?.time.split('T')[0] ?? new Date().toISOString().split('T')[0];

  for (const slot of TIME_SLOTS) {
    const avgAqi = getAvgAqiForRange(hourly, slot.start, slot.end);
    const isSafe = avgAqi <= OUTDOOR_UNSAFE_AQI;
    const category = classifyAqi(avgAqi);

    const block = buildBlock(slot, profile, isSafe, avgAqi, risk, category.label);
    blocks.push(block);
  }

  const safeCount = blocks.filter((b) => b.isOutdoorSafe).length;
  const summary = buildSummary(safeCount, risk.tier, bestWindow !== null);

  return {
    date: today ?? '',
    blocks,
    summary,
    bestWindow,
  };
}

function buildBlock(
  slot: (typeof TIME_SLOTS)[number],
  profile: HouseholdProfile,
  isSafe: boolean,
  avgAqi: number,
  risk: RiskAssessment,
  _aqiLabel: string,
): TimeBlock {
  const hasChildren = profile.sensitivities.includes('children');
  const isHighRisk = risk.tier === 'high' || risk.tier === 'veryHigh' || risk.tier === 'extreme';

  // Determine activity based on time, safety, and profile
  if (slot.timeOfDay === 'morning' && hasChildren && isSafe) {
    return {
      timeOfDay: slot.timeOfDay,
      startHour: slot.start,
      endHour: slot.end,
      activity: 'schoolRun',
      label: 'School run',
      description: isSafe
        ? 'Air quality is acceptable for the school commute'
        : 'Consider driving or indoor drop-off — air quality is poor',
      isOutdoorSafe: isSafe,
      aqiAtTime: Math.round(avgAqi),
    };
  }

  if (slot.timeOfDay === 'earlyMorning' && isSafe && !isHighRisk) {
    return {
      timeOfDay: slot.timeOfDay,
      startHour: slot.start,
      endHour: slot.end,
      activity: 'exercise',
      label: 'Morning exercise',
      description: 'Best time for outdoor activity — air is relatively clean',
      isOutdoorSafe: true,
      aqiAtTime: Math.round(avgAqi),
    };
  }

  if (slot.timeOfDay === 'morning' && profile.commuteMode !== 'wfh') {
    return {
      timeOfDay: slot.timeOfDay,
      startHour: slot.start,
      endHour: slot.end,
      activity: 'commute',
      label: 'Commute',
      description: isSafe
        ? `${formatCommute(profile.commuteMode)} is fine today`
        : `Consider switching to a less exposed commute option — AQI is elevated`,
      isOutdoorSafe: isSafe,
      aqiAtTime: Math.round(avgAqi),
    };
  }

  if ((slot.timeOfDay === 'midday' || slot.timeOfDay === 'afternoon') && isSafe) {
    return {
      timeOfDay: slot.timeOfDay,
      startHour: slot.start,
      endHour: slot.end,
      activity: 'errands',
      label: 'Errands & outdoor tasks',
      description: 'Reasonable window for outdoor errands',
      isOutdoorSafe: true,
      aqiAtTime: Math.round(avgAqi),
    };
  }

  if (slot.timeOfDay === 'evening') {
    return {
      timeOfDay: slot.timeOfDay,
      startHour: slot.start,
      endHour: slot.end,
      activity: isSafe ? 'ventilate' : 'indoor',
      label: isSafe ? 'Ventilate your home' : 'Stay indoors',
      description: isSafe
        ? 'Open windows briefly to flush indoor air — AQI is acceptable'
        : 'Keep windows closed. Run purifier if available.',
      isOutdoorSafe: isSafe,
      aqiAtTime: Math.round(avgAqi),
    };
  }

  // Default: indoor activity
  return {
    timeOfDay: slot.timeOfDay,
    startHour: slot.start,
    endHour: slot.end,
    activity: 'indoor',
    label: isSafe ? 'Flexible time' : 'Stay indoors',
    description: isSafe
      ? 'Air quality allows some outdoor time if needed'
      : 'Air quality is poor — minimize outdoor exposure',
    isOutdoorSafe: isSafe,
    aqiAtTime: Math.round(avgAqi),
  };
}

function formatCommute(mode: HouseholdProfile['commuteMode']): string {
  const labels: Record<typeof mode, string> = {
    walk: 'Walking',
    cycle: 'Cycling',
    publicTransport: 'Public transport',
    car: 'Driving',
    wfh: 'Working from home',
  };
  return labels[mode];
}

function buildSummary(safeHours: number, riskTier: string, hasBestWindow: boolean): string {
  if (safeHours === 0) {
    return 'Air quality is poor throughout the day. Stay indoors as much as possible and use air filtration.';
  }
  if (safeHours <= 2) {
    return `Limited safe outdoor time today. ${hasBestWindow ? 'Use the highlighted window for essential outdoor activities.' : 'Plan errands carefully.'}`;
  }
  if (riskTier === 'high' || riskTier === 'veryHigh') {
    return `Some outdoor windows exist, but your household risk is elevated. Take extra precautions and limit exposure time.`;
  }
  return `Decent air quality expected during parts of the day. ${hasBestWindow ? 'The highlighted window is your best bet for outdoor time.' : 'Check hourly readings before heading out.'}`;
}
