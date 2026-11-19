import type { ReactElement } from 'react';

/**
 * Skip link for keyboard users to jump directly to main content.
 *
 * @returns The rendered skip-to-content anchor element.
 */
export function SkipLink(): ReactElement {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}
