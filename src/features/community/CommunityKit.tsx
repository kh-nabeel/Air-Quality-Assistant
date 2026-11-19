import type { HouseholdProfile, UserLocation } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { classifyAqi } from '@/domain/classifyAqi';
import { rankActionsForProfile } from '@/domain/helpers';
import { ACTION_CATALOG } from '@/domain/actionCatalog';
import { useAirQuality } from '@/hooks/useAirQuality';
import { Layout, SectionHeader } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Banner } from '@/components/Banner';
import { Spinner } from '@/components/Spinner';
import { formatDate } from '@/utils/format';
import { Printer, School, Home, Building2, Wind } from 'lucide-react';
import type { ReactNode } from 'react';

/** Section number displayed in the header. */
const SECTION_NUMBER = '09';

/** Number of top-ranked actions shown per audience. */
const ACTIONS_PER_AUDIENCE = 3;

/** Total number of top-ranked actions to rank. */
const TOP_ACTION_COUNT = 6;

interface CommunityKitProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

/** Icons representing each target audience (schools, RWAs, workplaces). */
const AUDIENCE_ICONS: readonly ReactNode[] = [
  <School size={16} key="school" />,
  <Home size={16} key="home" />,
  <Building2 size={16} key="bldg" />,
];

/** Component-scoped style definitions. */
const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--space-16)',
  } satisfies React.CSSProperties,

  toolbar: {
    display: 'flex',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-6)',
    flexWrap: 'wrap',
  } satisfies React.CSSProperties,

  advisoryCard: {
    maxWidth: 'var(--max-width-narrow)',
    margin: '0 auto',
    border: '2.5px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-md)',
    background: '#ffffff',
  } satisfies React.CSSProperties,

  headerCenter: {
    textAlign: 'center',
    marginBottom: 'var(--space-6)',
  } satisfies React.CSSProperties,

  logoRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  } satisfies React.CSSProperties,

  logoIcon: {
    display: 'inline-flex',
    padding: '6px',
    borderRadius: '8px',
    background: 'var(--color-brand-primary)',
    color: '#ffffff',
    border: '1.5px solid var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  appName: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-3xl)',
    color: 'var(--color-bg-dark)',
    margin: 0,
  } satisfies React.CSSProperties,

  dateline: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-secondary)',
    margin: 0,
  } satisfies React.CSSProperties,

  aqiPanel: {
    textAlign: 'center',
    marginBottom: 'var(--space-6)',
    padding: 'var(--space-4)',
    background: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  aqiBadge: {
    fontSize: 'var(--text-base)',
    padding: 'var(--space-2) var(--space-6)',
  } satisfies React.CSSProperties,

  aqiDescription: {
    marginTop: 'var(--space-3)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
    margin: '8px 0 0',
  } satisfies React.CSSProperties,

  audienceSection: {
    marginBottom: 'var(--space-6)',
  } satisfies React.CSSProperties,

  audienceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: 'var(--space-3)',
  } satisfies React.CSSProperties,

  audienceIcon: {
    display: 'inline-flex',
    padding: '4px',
    borderRadius: '6px',
    background: 'var(--color-bg-secondary)',
    border: '1.5px solid var(--color-bg-dark)',
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  audienceHeading: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-base)',
    margin: 0,
    textTransform: 'lowercase',
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  actionList: {
    display: 'grid',
    gap: 'var(--space-2)',
  } satisfies React.CSSProperties,

  actionItem: {
    padding: 'var(--space-2) var(--space-3)',
    background: '#ffffff',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-bg-dark)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--leading-normal)',
  } satisfies React.CSSProperties,

  footer: {
    marginTop: 'var(--space-6)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
  } satisfies React.CSSProperties,

  footerAttribution: {
    marginTop: 'var(--space-2)',
  } satisfies React.CSSProperties,
} as const;

/** Printable community advisory for schools, RWAs, and workplaces. */
export function CommunityKit({ location, profile }: CommunityKitProps): React.JSX.Element {
  const { t, language } = useTranslation();
  const { data, loading } = useAirQuality(location.latitude, location.longitude);

  if (loading || !data) {
    return (
      <Layout>
        <div style={styles.loadingContainer}>
          <Spinner size="lg" label={t.common.loading} />
        </div>
      </Layout>
    );
  }

  const classification = classifyAqi(data.usAqi);
  const allRanked = rankActionsForProfile(
    ACTION_CATALOG as unknown as import('@/domain/types').Action[],
    profile,
    data,
  );
  const topActions = allRanked.slice(0, TOP_ACTION_COUNT);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <SectionHeader
        number={SECTION_NUMBER}
        title={t.community.title}
        subtitle={t.community.subtitle}
      />

      <div style={styles.toolbar}>
        <Button onClick={handlePrint} icon={<Printer size={16} />}>
          {t.community.print}
        </Button>
      </div>

      <Card
        variant="elevated"
        padding="lg"
        ariaLabel="Community advisory"
        style={styles.advisoryCard}
      >
        <div style={styles.headerCenter}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>
              <Wind size={20} />
            </span>
            <h2 style={styles.appName}>{t.app.name}</h2>
          </div>
          <p style={styles.dateline}>
            COMMUNITY ADVISORY · {location.name.toUpperCase()} ·{' '}
            {formatDate(new Date().toISOString())}
          </p>
        </div>

        <div style={styles.aqiPanel}>
          <Badge variant="aqi" aqiCategory={classification.category} style={styles.aqiBadge}>
            AQI {Math.round(data.usAqi)} — {classification.label}
          </Badge>
          <p style={styles.aqiDescription}>{classification.description}</p>
        </div>

        {(['forSchools', 'forRwa', 'forWorkplaces'] as const).map((key, i) => (
          <div key={key} style={styles.audienceSection}>
            <div style={styles.audienceHeader}>
              <span style={styles.audienceIcon}>{AUDIENCE_ICONS[i]}</span>
              <h3 style={styles.audienceHeading}>{t.community[key]}</h3>
            </div>
            <div style={styles.actionList}>
              {topActions.slice(0, ACTIONS_PER_AUDIENCE).map((ranked) => (
                <div key={ranked.action.id} style={styles.actionItem}>
                  <strong>{ranked.action.title[language]}</strong> —{' '}
                  {ranked.action.description[language]}
                </div>
              ))}
            </div>
          </div>
        ))}

        <Banner variant="error">{t.community.emergencyContacts}</Banner>

        <div style={styles.footer}>
          <p>{t.medical.disclaimer}</p>
          <p style={styles.footerAttribution}>
            {t.attribution.openMeteo} · {t.attribution.gemini}
          </p>
        </div>
      </Card>
    </Layout>
  );
}
