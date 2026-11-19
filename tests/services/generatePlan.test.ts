import { describe, it, expect } from 'vitest';
import { generatePlan } from '@/services/gemini/generatePlan';
import type { AqiData, RiskAssessment, UserLocation } from '@/domain/types';

describe('generatePlan service', () => {
  it('returns a valid daily plan using deterministic fallback when offline', async () => {
    const mockLocation: UserLocation = {
      name: 'Delhi',
      latitude: 28.6,
      longitude: 77.2,
    };

    const mockAqi: AqiData = {
      usAqi: 230,
      pm25: 180,
      pm10: 290,
      category: 'very-unhealthy',
      dominantPollutant: 'pm25',
      timestamp: '2026-11-19T10:00:00Z',
    };

    const mockRisk: RiskAssessment = {
      tier: 'high',
      score: 80,
      factors: ['infants', 'leaky-home'],
    };

    const result = await generatePlan({
      location: mockLocation,
      aqi: mockAqi,
      risk: mockRisk,
      actions: [],
      language: 'en',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.summary).toBeTruthy();
      expect(result.value.impactNarrative).toBeTruthy();
    }
  });
});
