import type { ReactNode, CSSProperties } from 'react';

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

const paddingMap = {
  none: '0',
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
} as const;

const variantMap: Record<string, CSSProperties> = {
  default: {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-light)',
    boxShadow: 'var(--shadow-sm)',
  },
  elevated: {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-light)',
    boxShadow: 'var(--shadow-md)',
  },
  outlined: {
    background: 'transparent',
    border: '2px solid var(--color-border)',
    boxShadow: 'none',
  },
  accent: {
    background: 'var(--color-brand-primary-light)',
    border: '2px solid var(--color-brand-primary)',
    boxShadow: 'none',
  },
};

/** Reusable card component with variant and padding options */
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  style,
  ariaLabel,
  ariaLive,
}: CardProps) {
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
