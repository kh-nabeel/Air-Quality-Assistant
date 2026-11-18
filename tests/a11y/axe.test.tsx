import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import * as axeCore from 'axe-core';
import App from '../../src/App';

// Stub localStorage so onboarding shows (no stored location)
beforeEach(() => {
  localStorage.clear();
});

describe('Accessibility (axe)', () => {
  it('onboarding screen has no critical axe violations', async () => {
    const { container } = render(<App />);

    const results = await axeCore.run(container);
    // Filter to critical/serious violations only
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(criticalViolations).toHaveLength(0);
  });
});
