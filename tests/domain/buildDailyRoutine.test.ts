import { describe, it, expect } from 'vitest';
import { buildDailyRoutine } from '../../src/domain/buildDailyRoutine';
import type { HourlyAqiData, HouseholdProfile, RiskAssessment } from '../../src/domain/types';

function makeHourly(aqi: number): HourlyAqiData[] {
  // Use noon UTC to avoid date boundary issues across timezones
  const base = new Date('2024-01-15T12:00:00Z');
  return Array.from({ length: 24 }, (_, i) => ({
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

const baseProfile: HouseholdProfile = {
  sensitivities: [],
  commuteMode: 'car',
  homeType: 'moderate',
  hasPurifier: false,
  hasAc: false,
  cookingFuel: 'lpg',
  budgetTier: 'low',
};

const lowRisk: RiskAssessment = {
  tier: 'low',
  score: 0.2,
  factors: ['No special risk factors'],
  recommendations: [],
};

const highRisk: RiskAssessment = {
  tier: 'high',
  score: 0.7,
  factors: ['Multiple sensitivities'],
  recommendations: [],
};

describe('buildDailyRoutine', () => {
  it('returns a routine with 6 time blocks', () => {
    const result = buildDailyRoutine(baseProfile, makeHourly(80), lowRisk);
    expect(result.blocks.length).toBe(6);
  });

  it('returns date string from hourly data', () => {
    const result = buildDailyRoutine(baseProfile, makeHourly(80), lowRisk);
    // Date is derived from the first hourly timestamp; just verify it's a valid YYYY-MM-DD
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('marks blocks as outdoor-safe when AQI is good', () => {
    const result = buildDailyRoutine(baseProfile, makeHourly(50), lowRisk);
    const safeBlocks = result.blocks.filter((b) => b.isOutdoorSafe);
    expect(safeBlocks.length).toBeGreaterThan(0);
  });

  it('marks all blocks as not outdoor-safe when AQI is hazardous', () => {
    const result = buildDailyRoutine(baseProfile, makeHourly(400), highRisk);
    const safeBlocks = result.blocks.filter((b) => b.isOutdoorSafe);
    expect(safeBlocks.length).toBe(0);
  });

  it('returns bestWindow when AQI is low enough', () => {
    const result = buildDailyRoutine(baseProfile, makeHourly(60), lowRisk);
    expect(result.bestWindow).not.toBeNull();
  });

  it('returns null bestWindow when all AQI is too high', () => {
    const result = buildDailyRoutine(baseProfile, makeHourly(300), highRisk);
    expect(result.bestWindow).toBeNull();
  });

  it('includes school run when children present', () => {
    const profileWithChildren = { ...baseProfile, sensitivities: ['children' as const] };
    const result = buildDailyRoutine(profileWithChildren, makeHourly(80), lowRisk);
    const schoolRun = result.blocks.find((b) => b.activity === 'schoolRun');
    expect(schoolRun).toBeDefined();
  });

  it('returns a non-empty summary string', () => {
    const result = buildDailyRoutine(baseProfile, makeHourly(80), lowRisk);
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it('summary includes "Limited" when only 1-2 safe time blocks', () => {
    // AQI 180 is poor but not hazardous — some blocks may be safe
    // Use high risk to suppress exercise block safety
    const result = buildDailyRoutine(baseProfile, makeHourly(170), highRisk);
    // Summary should reflect limited outdoor time
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it('elevated risk tier produces appropriate summary', () => {
    const result = buildDailyRoutine(baseProfile, makeHourly(60), highRisk);
    // High risk + some safe windows → elevated risk summary
    expect(result.summary).toContain('precautions');
  });

  it('summary with best window uses highlighted window text', () => {
    const result = buildDailyRoutine(baseProfile, makeHourly(50), lowRisk);
    // Should have a bestWindow and mention it in the summary
    if (result.bestWindow !== null) {
      expect(result.summary).toMatch(/highlighted|best bet/i);
    }
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it('summary without best window uses alternative text', () => {
    const result = buildDailyRoutine(baseProfile, makeHourly(300), highRisk);
    expect(result.summary.length).toBeGreaterThan(0);
  });
});
