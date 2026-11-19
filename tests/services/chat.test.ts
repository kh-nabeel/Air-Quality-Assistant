import { describe, it, expect } from 'vitest';
import { getSuggestedQuestions, sendChatMessage } from '@/services/gemini/chat';
import type { AqiData, RiskAssessment, UserLocation } from '@/domain/types';

describe('Chat Service', () => {
  it('returns localized suggested questions', () => {
    const enQuestions = getSuggestedQuestions('en');
    const hiQuestions = getSuggestedQuestions('hi');

    expect(enQuestions.length).toBeGreaterThan(0);
    expect(hiQuestions.length).toBeGreaterThan(0);
    expect(enQuestions[0]).toContain('safe');
  });

  it('generates a streaming response with contextual grounding', async () => {
    const mockLocation: UserLocation = {
      name: 'Delhi, India',
      latitude: 28.6139,
      longitude: 77.209,
    };

    const mockAqi: AqiData = {
      usAqi: 220,
      pm25: 170,
      pm10: 280,
      category: 'very-unhealthy',
      dominantPollutant: 'pm25',
      timestamp: '2026-11-19T10:00:00Z',
    };

    const mockRisk: RiskAssessment = {
      tier: 'high',
      score: 75,
      factors: ['infants'],
    };

    const stream = sendChatMessage('Should I wear an N95 mask today?', [], {
      location: mockLocation,
      aqi: mockAqi,
      risk: mockRisk,
      actions: [],
      language: 'en',
    });

    let output = '';
    for await (const chunk of stream) {
      output += chunk;
    }

    expect(output.toLowerCase()).toContain('mask');
    expect(output).toContain('220');
  });
});
