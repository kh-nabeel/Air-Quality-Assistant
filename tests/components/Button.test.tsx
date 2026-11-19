import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../../src/components/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies disabled when loading', () => {
    render(<Button loading>loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies disabled prop', () => {
    render(<Button disabled>disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>click</Button>);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        click
      </Button>,
    );
    screen.getByRole('button').click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('meets minimum 44px touch target height', () => {
    render(<Button>tap</Button>);
    const btn = screen.getByRole('button');
    // style.minHeight is set inline
    expect(btn.style.minHeight).toBe('44px');
  });
});
