import type { ReactNode, CSSProperties, ReactElement } from 'react';

/** Props for the {@link Card} component. */
interface CardProps {
  readonly children: ReactNode;
  readonly variant?: 'default' | 'elevated' | 'outlined' | 'accent';
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
  readonly className?: string;
  readonly style?: CSSProperties;
  /** Accessible label for the card region */
  readonly ariaLabel?: string;
  /** aria-live region for dynamic content updates */
  readonly ariaLive?: 'polite' | 'assertive' | 'off';
}

/** Padding size to CSS value mapping. */
const paddingMap = {
  none: '0',
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
} as const;

/** Variant-specific style overrides. */
const variantMap: Record<string, CSSProperties> = {
  default: {
    background: 'var(--color-bg-elevated)',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
  },
  elevated: {
    background: 'var(--color-bg-elevated)',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-md)',
  },
  outlined: {
    background: 'var(--color-bg-secondary)',
    border: '2px dashed var(--color-bg-dark)',
    boxShadow: 'none',
  },
  accent: {
    background: 'var(--color-brand-primary-light)',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-md)',
  },
};

/**
 * Reusable card component with variant and padding options.
 *
 * @param props - Card component props.
 * @returns The rendered card element.
 */
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  style,
  ariaLabel,
  ariaLive,
}: CardProps): ReactElement {
  const cardStyle: CSSProperties = {
    borderRadius: 'var(--radius-xl)',
    padding: paddingMap[padding],
    transition: 'box-shadow var(--transition-normal)',
    ...variantMap[variant],
    ...style,
  };

  return (
    <div
      className={className}
      style={cardStyle}
      role={ariaLabel ? 'region' : undefined}
      aria-label={ariaLabel}
      aria-live={ariaLive}
    >
      {children}
    </div>
  );
}
