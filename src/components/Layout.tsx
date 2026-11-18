import type { ReactNode } from 'react';

interface SectionHeaderProps {
  /** Section number displayed as badge (01, 02, etc.) */
  readonly number: string;
  /** Section title (displayed in lowercase) */
  readonly title: string;
  /** Optional subtitle */
  readonly subtitle?: string;
}

/** TinkerHub-style numbered section header */
export function SectionHeader({ number, title, subtitle }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--color-bg-dark)',
            color: '#ffffff',
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            fontWeight: 800,
            letterSpacing: '0.05em',
            border: '1.5px solid var(--color-bg-dark)',
            boxShadow: '1.5px 1.5px 0px rgba(0,0,0,0.6)',
          }}
        >
          {number}
        </span>
        <div style={{ height: '2px', width: '32px', background: 'var(--color-bg-dark)' }} />
      </div>
      <h2
        className="section-title"
        style={{
          margin: 0,
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-bg-dark)',
          letterSpacing: '-0.03em',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-2)',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: '48rem',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface LayoutProps {
  readonly children: ReactNode;
}

/** Main layout wrapper with constrained width and padding */
export function Layout({ children }: LayoutProps) {
  return (
    <main
      id="main-content"
      style={{
        maxWidth: 'var(--max-width-content)',
        margin: '0 auto',
        padding: 'var(--space-4)',
        minHeight: '100vh',
      }}
    >
      {children}
    </main>
  );
}
