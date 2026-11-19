import type { ReactNode, CSSProperties, ReactElement } from 'react';

/** Props for the {@link SectionHeader} component. */
interface SectionHeaderProps {
  /** Section number displayed as badge (01, 02, etc.) */
  readonly number: string;
  /** Section title (displayed in lowercase) */
  readonly title: string;
  /** Optional subtitle */
  readonly subtitle?: string;
}

/** Component-scoped style definitions for {@link SectionHeader}. */
const sectionStyles = {
  wrapper: {
    marginBottom: 'var(--space-6)',
  } satisfies CSSProperties,

  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-2)',
  } satisfies CSSProperties,

  badge: {
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
  } satisfies CSSProperties,

  divider: {
    height: '2px',
    width: '32px',
    background: 'var(--color-bg-dark)',
  } satisfies CSSProperties,

  title: {
    margin: 0,
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-3xl)',
    color: 'var(--color-bg-dark)',
    letterSpacing: '-0.03em',
  } satisfies CSSProperties,

  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    marginTop: 'var(--space-2)',
    lineHeight: 'var(--leading-relaxed)',
    maxWidth: '48rem',
  } satisfies CSSProperties,
} as const;

/**
 * TinkerHub-style numbered section header with an optional subtitle.
 *
 * @param props - Section header configuration.
 * @returns The rendered section header element.
 */
export function SectionHeader({ number, title, subtitle }: SectionHeaderProps): ReactElement {
  return (
    <div style={sectionStyles.wrapper}>
      <div style={sectionStyles.row}>
        <span style={sectionStyles.badge}>{number}</span>
        <div style={sectionStyles.divider} />
      </div>
      <h2 className="section-title" style={sectionStyles.title}>
        {title}
      </h2>
      {subtitle && <p style={sectionStyles.subtitle}>{subtitle}</p>}
    </div>
  );
}

/** Props for the {@link Layout} component. */
interface LayoutProps {
  readonly children: ReactNode;
}

/** Component-scoped style definitions for {@link Layout}. */
const layoutStyles = {
  main: {
    maxWidth: 'var(--max-width-content)',
    margin: '0 auto',
    padding: 'var(--space-4)',
    minHeight: '100vh',
  } satisfies CSSProperties,
} as const;

/**
 * Main layout wrapper with constrained width and padding.
 *
 * @param props - Layout component props containing children.
 * @returns The rendered main layout element.
 */
export function Layout({ children }: LayoutProps): ReactElement {
  return (
    <main id="main-content" style={layoutStyles.main}>
      {children}
    </main>
  );
}
