import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/Card';

describe('Card Component', () => {
  it('renders children content', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders with region role when ariaLabel is provided', () => {
    render(<Card ariaLabel="Key metrics">Stats</Card>);
    expect(screen.getByRole('region', { name: 'Key metrics' })).toBeInTheDocument();
  });

  it('sets aria-live attribute when specified', () => {
    render(<Card ariaLive="polite">Live Info</Card>);
    const cardEl = screen.getByText('Live Info');
    expect(cardEl).toHaveAttribute('aria-live', 'polite');
  });
});
