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

interface DashboardProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

/** Main dashboard view with AQI hero, pollutant breakdown, and hourly chart */
export function Dashboard({ location, profile }: DashboardProps) {
  const { t } = useTranslation();
  const { data, hourly, loading, error, refetch } = useAirQuality(location.latitude, location.longitude);

  if (loading && !data) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <Spinner size="lg" label={t.common.loading} />
        </div>
      </Layout>
    );
  }

  if (error && !data) {
    return (
      <Layout>
        <Banner variant="error">
          <p>{t.common.error}: {error}</p>
          <Button variant="secondary" size="sm" onClick={refetch} style={{ marginTop: 'var(--space-2)' }}>
            {t.common.retry}
          </Button>
        </Banner>
      </Layout>
    );
  }

  if (!data) return null;

  const risk = computeHouseholdRisk(profile, data);
  const bestWindow = findBestOutdoorWindow(hourly as unknown as import('@/domain/types').HourlyAqiData[]);

  return (
    <Layout>
      <SectionHeader
        number="01"
        title={t.dashboard.title}
        subtitle={`${location.name}${location.country ? `, ${location.country}` : ''}`}
      />

      {error && (
        <Banner variant="warning" style={{ marginBottom: 'var(--space-4)' }}>
          {t.common.error}: {error}. Showing cached data.
        </Banner>
      )}

      <div
        style={{
          display: 'grid',
          gap: 'var(--space-6)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
        }}
      >
        <AqiHeroCard aqi={data} risk={risk} />
        <PollutantBreakdown aqi={data} />
      </div>

      <div style={{ marginTop: 'var(--space-6)' }}>
        <HourlyChart hourly={hourly} bestWindow={bestWindow} />
      </div>

      {/* Attribution */}
      <footer style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {t.attribution.openMeteo} · {t.attribution.gemini}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
          {t.medical.disclaimer}
        </p>
      </footer>
    </Layout>
  );
}
