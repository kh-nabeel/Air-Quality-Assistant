import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/Spinner';

describe('Spinner Component', () => {
  it('renders spinner with accessible role status', () => {
    render(<Spinner label="Fetching data..." />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-label', 'Fetching data...');
  });
});
