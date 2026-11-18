import type { ReactNode, CSSProperties } from 'react';
import { Info, AlertTriangle, XCircle, CheckCircle2, X } from 'lucide-react';

type BannerVariant = 'info' | 'warning' | 'error' | 'success';

interface BannerProps {
  readonly children: ReactNode;
  readonly variant?: BannerVariant;
  readonly onDismiss?: () => void;
  readonly style?: CSSProperties;
}

const variantConfig: Record<BannerVariant, { bg: string; border: string; icon: ReactNode }> = {
  info: { bg: '#EFF6FF', border: '#2563EB', icon: <Info size={18} color="#2563EB" /> },
  warning: { bg: '#FFFBEB', border: '#D97706', icon: <AlertTriangle size={18} color="#D97706" /> },
  error: { bg: '#FEF2F2', border: '#DC2626', icon: <XCircle size={18} color="#DC2626" /> },
  success: { bg: '#ECFDF5', border: '#059669', icon: <CheckCircle2 size={18} color="#059669" /> },
};

/** Alert banner for status messages, with optional dismiss button */
export function Banner({ children, variant = 'info', onDismiss, style }: BannerProps) {
  const config = variantConfig[variant];
  const bannerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    background: config.bg,
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-primary)',
    ...style,
  };

  return (
    <div role="alert" style={bannerStyle}>
      <span aria-hidden="true" style={{ display: 'inline-flex', flexShrink: 0 }}>
        {config.icon}
      </span>
      <div style={{ flex: 1, lineHeight: 'var(--leading-relaxed)' }}>{children}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            padding: 'var(--space-1)',
            minWidth: '36px',
            minHeight: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
