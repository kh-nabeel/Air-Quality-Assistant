import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Banner } from '@/components/Banner';

describe('Banner Component', () => {
  it('renders children and alert role', () => {
    render(<Banner variant="warning">Air quality is deteriorating</Banner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Air quality is deteriorating')).toBeInTheDocument();
  });

  it('renders dismiss button and calls onDismiss when clicked', async () => {
    const handleDismiss = vi.fn();
    render(
      <Banner variant="info" onDismiss={handleDismiss}>
        Dismissable Notice
      </Banner>,
    );

    const button = screen.getByRole('button', { name: /dismiss/i });
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
