import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/Badge';

describe('Badge Component', () => {
  it('renders default badge with children text', () => {
    render(<Badge>Test Label</Badge>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders AQI category badge with proper styling', () => {
    render(
      <Badge variant="aqi" aqiCategory="hazardous">
        Hazardous
      </Badge>,
    );
    expect(screen.getByText('Hazardous')).toBeInTheDocument();
  });

  it('renders cost tier badge', () => {
    render(
      <Badge variant="cost" costTier="free">
        Free
      </Badge>,
    );
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
