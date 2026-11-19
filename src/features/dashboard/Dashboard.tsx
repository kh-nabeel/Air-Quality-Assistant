import type { CSSProperties, ReactElement } from 'react';
import type { HouseholdProfile, UserLocation } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { computeHouseholdRisk } from '@/domain/computeHouseholdRisk';
import { findBestOutdoorWindow } from '@/domain/findBestOutdoorWindow';
import { useAirQuality } from '@/hooks/useAirQuality';
import { Layout, SectionHeader } from '@/components/Layout';
import { Spinner } from '@/components/Spinner';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { AqiHeroCard } from './AqiHeroCard';
import { PollutantBreakdown } from './PollutantBreakdown';
import { HourlyChart } from './HourlyChart';

/** Props for the {@link Dashboard} component. */
interface DashboardProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

/** Component-scoped style definitions. */
const styles = {
  loadingWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--space-16)',
  } satisfies CSSProperties,

  retryButton: {
    marginTop: 'var(--space-2)',
  } satisfies CSSProperties,

  staleWarning: {
    marginBottom: 'var(--space-4)',
  } satisfies CSSProperties,

  grid: {
    display: 'grid',
    gap: 'var(--space-6)',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
  } satisfies CSSProperties,

  chartWrapper: {
    marginTop: 'var(--space-6)',
  } satisfies CSSProperties,

  footer: {
    marginTop: 'var(--space-8)',
    textAlign: 'center',
  } satisfies CSSProperties,

  attribution: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  } satisfies CSSProperties,

  disclaimer: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    marginTop: 'var(--space-1)',
  } satisfies CSSProperties,
} as const;

/**
 * Main dashboard view with AQI hero, pollutant breakdown, and hourly chart.
 *
 * @param props - Dashboard component props including user location and profile.
 * @returns The rendered dashboard page, or a loading/error state.
 */
export function Dashboard({ location, profile }: DashboardProps): ReactElement | null {
  const { t } = useTranslation();
  const { data, hourly, loading, error, refetch } = useAirQuality(
    location.latitude,
    location.longitude,
  );

  if (loading && !data) {
    return (
      <Layout>
        <div style={styles.loadingWrapper}>
          <Spinner size="lg" label={t.common.loading} />
        </div>
      </Layout>
    );
  }

  if (error && !data) {
    return (
      <Layout>
        <Banner variant="error">
          <p>
            {t.common.error}: {error}
          </p>
          <Button variant="secondary" size="sm" onClick={refetch} style={styles.retryButton}>
            {t.common.retry}
          </Button>
        </Banner>
      </Layout>
    );
  }

  if (!data) return null;

  const risk = computeHouseholdRisk(profile, data);
  const bestWindow = findBestOutdoorWindow(
    hourly as unknown as import('@/domain/types').HourlyAqiData[],
  );

  return (
    <Layout>
      <SectionHeader
        number="01"
        title={t.dashboard.title}
        subtitle={`${location.name}${location.country ? `, ${location.country}` : ''}`}
      />

      {error && (
        <Banner variant="warning" style={styles.staleWarning}>
          {t.common.error}: {error}. Showing cached data.
        </Banner>
      )}

      <div style={styles.grid}>
        <AqiHeroCard aqi={data} risk={risk} />
        <PollutantBreakdown aqi={data} />
      </div>

      <div style={styles.chartWrapper}>
        <HourlyChart hourly={hourly} bestWindow={bestWindow} />
      </div>

      {/* Attribution */}
      <footer style={styles.footer}>
        <p style={styles.attribution}>
          {t.attribution.openMeteo} · {t.attribution.gemini}
        </p>
        <p style={styles.disclaimer}>{t.medical.disclaimer}</p>
      </footer>
    </Layout>
  );
}
