import type { ReactNode, CSSProperties } from 'react';

type BannerVariant = 'info' | 'warning' | 'error' | 'success';

interface BannerProps {
  readonly children: ReactNode;
  readonly variant?: BannerVariant;
  readonly onDismiss?: () => void;
  readonly style?: CSSProperties;
}

const variantColors: Record<BannerVariant, { bg: string; border: string; icon: string }> = {
  info: { bg: '#e3f2fd', border: 'var(--color-info)', icon: 'ℹ' },
  warning: { bg: '#fff3e0', border: 'var(--color-warning)', icon: '⚠' },
  error: { bg: '#ffebee', border: 'var(--color-error)', icon: '✕' },
  success: { bg: '#e8f5e9', border: 'var(--color-success)', icon: '✓' },
};

/** Alert banner for status messages, with optional dismiss button */
export function Banner({ children, variant = 'info', onDismiss, style }: BannerProps) {
  const colors = variantColors[variant];
  const bannerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-3)',
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    background: colors.bg,
    borderLeft: `4px solid ${colors.border}`,
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-primary)',
    ...style,
  };

  return (
    <div role="alert" style={bannerStyle}>
      <span aria-hidden="true" style={{ fontSize: 'var(--text-lg)', flexShrink: 0 }}>{colors.icon}</span>
      <div style={{ flex: 1 }}>{children}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-muted)',
            padding: 'var(--space-1)',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
