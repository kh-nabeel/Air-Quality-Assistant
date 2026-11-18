import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { Button } from './Button';

interface NavigationProps {
  readonly onForgetMe?: () => void;
}

const NAV_ITEMS = [
  { path: '/', labelKey: 'dashboard' as const },
  { path: '/plan', labelKey: 'plan' as const },
  { path: '/indoor', labelKey: 'indoor' as const },
  { path: '/alternatives', labelKey: 'alternatives' as const },
  { path: '/impact', labelKey: 'impact' as const },
  { path: '/chat', labelKey: 'chat' as const },
  { path: '/community', labelKey: 'community' as const },
] as const;

/** Main navigation bar with language toggle and forget-me button */
export function Navigation({ onForgetMe }: NavigationProps) {
  const { t, language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)' as unknown as number,
        background: 'var(--color-bg-primary)',
        borderBottom: '1px solid var(--color-border-light)',
        padding: 'var(--space-3) var(--space-4)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-width-content)',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}
      >
        {/* Logo / App name */}
        <NavLink
          to="/"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-brand-primary)',
            textDecoration: 'none',
            letterSpacing: 'var(--tracking-tight)',
          }}
          aria-label={t.app.name}
        >
          {t.app.name}
        </NavLink>

        {/* Navigation links */}
        <nav
          aria-label="Main navigation"
          style={{
            display: 'flex',
            gap: 'var(--space-1)',
            overflowX: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                background: isActive ? 'var(--color-brand-primary-light)' : 'transparent',
                whiteSpace: 'nowrap',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                transition: 'background var(--transition-fast)',
                textTransform: 'lowercase',
              })}
            >
              {t.nav[item.labelKey]}
            </NavLink>
          ))}
        </nav>

        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          aria-label={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-border)',
            background: 'transparent',
            cursor: 'pointer',
            minHeight: '44px',
            minWidth: '44px',
            color: 'var(--color-text-primary)',
          }}
        >
          {language === 'en' ? 'हिं' : 'EN'}
        </button>

        {/* Forget me button */}
        {onForgetMe && (
          <Button variant="ghost" size="sm" onClick={onForgetMe}>
            {t.onboarding.forgetMe}
          </Button>
        )}
      </div>
    </header>
  );
}
