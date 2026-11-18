import type { CSSProperties } from 'react';

interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  /** Accessible label for the spinner */
  readonly label?: string;
}

const sizeMap = { sm: 16, md: 24, lg: 40 } as const;

/** Animated loading spinner with accessible label */
export function Spinner({ size = 'md', label = 'Loading…' }: SpinnerProps) {
  const px = sizeMap[size];
  const style: CSSProperties = {
    width: px,
    height: px,
    border: '3px solid var(--color-border)',
    borderTopColor: 'var(--color-brand-primary)',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block',
  };

  return (
    <span role="status" aria-label={label}>
      <span style={style} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
