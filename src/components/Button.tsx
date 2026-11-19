import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

/** Supported button visual variants. */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Supported button size presets. */
type ButtonSize = 'sm' | 'md' | 'lg';

/** Props for the {@link Button} component. */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  readonly icon?: ReactNode;
  readonly children: ReactNode;
}

/** Variant-specific style overrides. */
const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-brand-primary)',
    color: '#ffffff',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
  },
  secondary: {
    background: 'var(--color-brand-secondary)',
    color: '#ffffff',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
  },
  ghost: {
    background: 'var(--color-bg-elevated)',
    color: 'var(--color-text-primary)',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
  },
  danger: {
    background: 'var(--color-error)',
    color: '#ffffff',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
  },
};

/** Size-specific style overrides. */
const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' },
  md: { padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-base)' },
  lg: { padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-lg)' },
};

/** Component-scoped style definitions. */
const styles = {
  spinner: {
    width: '1em',
    height: '1em',
    border: '2px solid currentColor',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block',
  } satisfies React.CSSProperties,

  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
  } satisfies React.CSSProperties,
} as const;

/**
 * Design-system button with pill shape, 44 px min touch target, and variant styling.
 * Supports loading state with spinner and optional leading icon.
 *
 * @param props - Button component props including variant, size, and loading state.
 * @param ref - Forwarded ref to the underlying `<button>` element.
 * @returns The rendered button element.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, icon, children, style, disabled, ...rest },
  ref,
) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 'var(--weight-semibold)' as unknown as number,
    lineHeight: 'var(--leading-tight)',
    borderRadius: 'var(--radius-full)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition:
      'background var(--transition-fast), opacity var(--transition-fast), transform var(--transition-fast)',
    minHeight: '44px',
    minWidth: '44px',
    textDecoration: 'none',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'lowercase' as const,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button ref={ref} style={baseStyle} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span aria-hidden="true" style={styles.spinner} />
      ) : icon ? (
        <span aria-hidden="true" style={styles.iconWrapper}>
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
});
