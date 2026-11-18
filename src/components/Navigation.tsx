import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { Button } from './Button';
import { Wind, Languages, RotateCcw } from 'lucide-react';

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
        background: '#FAF9F5',
        borderBottom: '2.5px solid var(--color-bg-dark)',
        boxShadow: '0 3px 0px rgba(24, 24, 27, 0.08)',
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
            color: 'var(--color-bg-dark)',
            textDecoration: 'none',
            letterSpacing: 'var(--tracking-tight)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
          aria-label={t.app.name}
        >
          <span
            style={{
              display: 'inline-flex',
              padding: '6px',
              borderRadius: '10px',
              background: 'var(--color-brand-primary)',
              color: '#ffffff',
              border: '2px solid var(--color-bg-dark)',
              boxShadow: '2px 2px 0px var(--color-bg-dark)',
            }}
          >
            <Wind size={20} strokeWidth={2.5} />
          </span>
          <span>{t.app.name}</span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-brand-secondary)',
              display: 'inline-block',
            }}
          />
        </NavLink>

        {/* Navigation links */}
        <nav
          aria-label="Main navigation"
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            overflowX: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
            padding: '2px',
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
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-bg-dark)' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                background: isActive ? '#FEF08A' : 'transparent',
                border: isActive ? '2px solid var(--color-bg-dark)' : '2px solid transparent',
                boxShadow: isActive ? '2px 2px 0px var(--color-bg-dark)' : 'none',
                whiteSpace: 'nowrap',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all var(--transition-fast)',
                textTransform: 'lowercase',
              })}
            >
              {t.nav[item.labelKey]}
            </NavLink>
          ))}
        </nav>

        {/* Action group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            aria-label={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              border: '2px solid var(--color-bg-dark)',
              background: '#ffffff',
              boxShadow: '2px 2px 0px var(--color-bg-dark)',
              cursor: 'pointer',
              minHeight: '40px',
              minWidth: '44px',
              color: 'var(--color-bg-dark)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
            }}
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
              style={{ minHeight: '40px' }}
            >
              {t.onboarding.forgetMe}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
