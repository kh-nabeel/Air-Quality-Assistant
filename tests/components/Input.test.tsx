import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/Input';

describe('Input Component', () => {
  it('renders input with label and placeholder', () => {
    render(<Input label="City Name" placeholder="Enter city" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('City Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter city')).toBeInTheDocument();
  });

  it('displays error message and sets aria-invalid', () => {
    render(<Input label="Search" error="City not found" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Search');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('City not found');
  });

  it('calls onChange when user types', async () => {
    const handleChange = vi.fn();
    render(<Input label="Search" value="" onChange={handleChange} />);
    const input = screen.getByLabelText('Search');
    await userEvent.type(input, 'Delhi');
    expect(handleChange).toHaveBeenCalled();
  });
});
