import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AqiHeroCard } from '../../src/features/dashboard/AqiHeroCard';
import type { AqiData, RiskAssessment } from '../../src/domain/types';

const makeAqi = (usAqi: number): AqiData => ({
  usAqi,
  pm25: 50,
  pm10: 70,
  no2: 30,
  o3: 40,
  so2: 10,
  co: 500,
  timestamp: new Date().toISOString(),
});

const lowRisk: RiskAssessment = {
  tier: 'low',
  score: 0.2,
  factors: ['No special risk factors identified'],
  recommendations: [],
};

describe('AqiHeroCard', () => {
  it('renders AQI value', () => {
    render(<AqiHeroCard aqi={makeAqi(125)} risk={lowRisk} />);
    expect(screen.getByText('125')).toBeInTheDocument();
  });

  it('renders category label for unhealthy AQI', () => {
    render(<AqiHeroCard aqi={makeAqi(175)} risk={lowRisk} />);
    expect(screen.getByText(/unhealthy/i)).toBeInTheDocument();
  });

  it('renders category label for good AQI', () => {
    render(<AqiHeroCard aqi={makeAqi(25)} risk={lowRisk} />);
    expect(screen.getByText(/good/i)).toBeInTheDocument();
  });

  it('shows risk level', () => {
    render(<AqiHeroCard aqi={makeAqi(125)} risk={lowRisk} />);
    expect(screen.getByText(/household risk level/i)).toBeInTheDocument();
  });

  it('renders with accessible region label', () => {
    render(<AqiHeroCard aqi={makeAqi(125)} risk={lowRisk} />);
    expect(screen.getByRole('region', { name: /current air quality/i })).toBeInTheDocument();
  });
});
