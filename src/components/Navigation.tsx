import type { CSSProperties, ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { Button } from './Button';
import { Wind, Languages, RotateCcw } from 'lucide-react';

/** Props for the {@link Navigation} component. */
interface NavigationProps {
  readonly onForgetMe?: () => void;
}

/** Navigation item configuration for the main nav bar. */
const NAV_ITEMS = [
  { path: '/', labelKey: 'dashboard' as const },
  { path: '/plan', labelKey: 'plan' as const },
  { path: '/indoor', labelKey: 'indoor' as const },
  { path: '/alternatives', labelKey: 'alternatives' as const },
  { path: '/impact', labelKey: 'impact' as const },
  { path: '/chat', labelKey: 'chat' as const },
  { path: '/community', labelKey: 'community' as const },
] as const;

/** Minimum touch target height per WCAG guidelines (in px). */
const MIN_TOUCH_TARGET = '40px';

/** Component-scoped style definitions. */
const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 'var(--z-sticky)' as unknown as number,
    background: '#FAF9F5',
    borderBottom: '2.5px solid var(--color-bg-dark)',
    boxShadow: '0 3px 0px rgba(24, 24, 27, 0.08)',
    padding: 'var(--space-3) var(--space-4)',
  } satisfies CSSProperties,

  headerInner: {
    maxWidth: 'var(--max-width-content)',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    flexWrap: 'wrap',
  } satisfies CSSProperties,

  logoLink: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-2xl)',
    color: 'var(--color-bg-dark)',
    textDecoration: 'none',
    letterSpacing: 'var(--tracking-tight)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  } satisfies CSSProperties,

  logoIcon: {
    display: 'inline-flex',
    padding: '6px',
    borderRadius: '10px',
    background: 'var(--color-brand-primary)',
    color: '#ffffff',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: '2px 2px 0px var(--color-bg-dark)',
  } satisfies CSSProperties,

  logoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--color-brand-secondary)',
    display: 'inline-block',
  } satisfies CSSProperties,

  nav: {
    display: 'flex',
    gap: 'var(--space-2)',
    overflowX: 'auto',
    flex: 1,
    WebkitOverflowScrolling: 'touch',
    padding: '2px',
  } satisfies CSSProperties,

  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  } satisfies CSSProperties,

  languageToggle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-sm)',
    fontWeight: 700,
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-full)',
    border: '2px solid var(--color-bg-dark)',
    background: '#ffffff',
    boxShadow: '2px 2px 0px var(--color-bg-dark)',
    cursor: 'pointer',
    minHeight: MIN_TOUCH_TARGET,
    minWidth: '44px',
    color: 'var(--color-bg-dark)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  } satisfies CSSProperties,

  forgetMeButton: {
    minHeight: MIN_TOUCH_TARGET,
  } satisfies CSSProperties,
} as const;

/**
 * Returns the inline style object for a navigation link, varying by active state.
 *
 * @param isActive - Whether the link matches the current route.
 * @returns CSS properties for the navigation link.
 */
function navLinkStyle({ isActive }: { readonly isActive: boolean }): React.CSSProperties {
  return {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-sm)',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--color-bg-dark)' : 'var(--color-text-secondary)',
    textDecoration: 'none',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-full)',
    background: isActive ? '#FEF08A' : 'transparent',
    border: isActive ? '2px solid var(--color-bg-dark)' : '2px solid transparent',
    boxShadow: isActive ? '2px 2px 0px var(--color-bg-dark)' : 'none',
    whiteSpace: 'nowrap',
    minHeight: MIN_TOUCH_TARGET,
    display: 'flex',
    alignItems: 'center',
    transition: 'all var(--transition-fast)',
    textTransform: 'lowercase',
  };
}

/**
 * Main navigation bar with language toggle and forget-me button.
 *
 * @param props - Navigation component props.
 * @returns The rendered navigation header element.
 */
export function Navigation({ onForgetMe }: NavigationProps): ReactElement {
  const { t, language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header role="banner" style={styles.header}>
      <div style={styles.headerInner}>
        {/* Logo / App name */}
        <NavLink to="/" style={styles.logoLink} aria-label={t.app.name}>
          <span style={styles.logoIcon}>
            <Wind size={20} strokeWidth={2.5} />
          </span>
          <span>{t.app.name}</span>
          <span style={styles.logoDot} />
        </NavLink>

        {/* Navigation links */}
        <nav aria-label="Main navigation" style={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} style={navLinkStyle}>
              {t.nav[item.labelKey]}
            </NavLink>
          ))}
        </nav>

        {/* Action group */}
        <div style={styles.actionGroup}>
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            aria-label={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}
            style={styles.languageToggle}
          >
            <Languages size={15} />
            <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Reset profile button */}
          {onForgetMe && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onForgetMe}
              icon={<RotateCcw size={14} />}
              style={styles.forgetMeButton}
            >
              {t.onboarding.forgetMe}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
