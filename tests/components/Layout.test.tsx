import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout, SectionHeader } from '@/components/Layout';

describe('Layout and SectionHeader', () => {
  it('renders Layout with main landmark', () => {
    render(
      <Layout>
        <div>Content inside layout</div>
      </Layout>,
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Content inside layout')).toBeInTheDocument();
  });

  it('renders SectionHeader with number badge and title', () => {
    render(<SectionHeader number="01" title="air quality" subtitle="Check current readings" />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'air quality' })).toBeInTheDocument();
    expect(screen.getByText('Check current readings')).toBeInTheDocument();
  });
});
