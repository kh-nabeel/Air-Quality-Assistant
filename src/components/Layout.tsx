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
      <span className="section-number">{number}</span>
      <h2 className="section-title">{title}</h2>
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-2)',
            lineHeight: 'var(--leading-relaxed)',
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
