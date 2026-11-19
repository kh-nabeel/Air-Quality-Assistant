import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';

describe('Navigation Component', () => {
  it('renders navigation links and header banner', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('triggers language toggle when language button is clicked', async () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    );

    const langBtn = screen.getByRole('button', { name: /switch to/i });
    expect(langBtn).toBeInTheDocument();
    await userEvent.click(langBtn);
  });

  it('calls onForgetMe when reset profile button is clicked', async () => {
    const handleForgetMe = vi.fn();
    render(
      <MemoryRouter>
        <Navigation onForgetMe={handleForgetMe} />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByRole('button');
    // The second button is the onForgetMe button
    const forgetBtn = buttons[1]!;
    expect(forgetBtn).toBeInTheDocument();
    await userEvent.click(forgetBtn);
    expect(handleForgetMe).toHaveBeenCalledTimes(1);
  });
});
