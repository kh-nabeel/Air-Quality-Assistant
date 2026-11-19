import { describe, it, expect } from 'vitest';
import { planResponseSchema } from '@/services/gemini/schemas';
import {
  buildContextBlock,
  SYSTEM_INSTRUCTION_CHAT,
  SYSTEM_INSTRUCTION_PLAN,
  PROMPT_VERSION,
} from '@/services/gemini/prompts';
import type { AqiData, RiskAssessment, RankedAction, UserLocation } from '@/domain/types';

describe('Gemini Plan Schema', () => {
  it('validates a compliant plan response', () => {
    const valid = {
      summary: 'Today air quality is very unhealthy.',
      actions: [{ actionId: 'run-purifier', rationale: 'Essential for high PM2.5 levels.' }],
      impactNarrative: 'Estimated combined exposure reduction is 40-60%.',
      language: 'en',
    };

    const result = planResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects a response missing required fields', () => {
    const invalid = {
      summary: 'Missing actions array',
    };

    const result = planResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('Gemini Prompts and Context Builder', () => {
  it('defines valid prompt versions and system instructions', () => {
    expect(PROMPT_VERSION).toBeTruthy();
    expect(SYSTEM_INSTRUCTION_CHAT).toContain('Saans');
    expect(SYSTEM_INSTRUCTION_PLAN).toContain('Saans');
  });

  it('builds a grounded context block with location and AQI data', () => {
    const mockLocation: UserLocation = {
      name: 'Delhi, India',
      latitude: 28.6139,
      longitude: 77.209,
    };

    const mockAqi: AqiData = {
      usAqi: 245,
      pm25: 185.4,
      pm10: 290.1,
      category: 'very-unhealthy',
      dominantPollutant: 'pm25',
      timestamp: '2026-11-19T10:00:00Z',
    };

    const mockRisk: RiskAssessment = {
      tier: 'high',
      score: 75,
      factors: ['infants', 'leaky-home'],
    };

    const mockActions: readonly RankedAction[] = [];

    const block = buildContextBlock({
      location: mockLocation,
      aqi: mockAqi,
      risk: mockRisk,
      actions: mockActions,
      language: 'en',
    });

    expect(block).toContain('Delhi, India');
    expect(block).toContain('245');
    expect(block).toContain('high');
    expect(block).toContain('infants');
  });
});
