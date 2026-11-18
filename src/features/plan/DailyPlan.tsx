import { useEffect } from 'react';
import type {
  HouseholdProfile,
  HourlyAqiData,
  UserLocation,
} from '@/domain/types';
import { useTranslation } from '@/i18n';
import { buildDailyRoutine } from '@/domain/buildDailyRoutine';
import { computeHouseholdRisk } from '@/domain/computeHouseholdRisk';
import { rankActionsForProfile } from '@/domain/helpers';
import { ACTION_CATALOG } from '@/domain/actionCatalog';
import { useAirQuality } from '@/hooks/useAirQuality';
import { useGemini } from '@/hooks/useGemini';
import { Layout, SectionHeader } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Spinner } from '@/components/Spinner';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';

interface DailyPlanProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

/** Today's time-blocked daily routine based on AQI forecast and profile */
export function DailyPlan({ location, profile }: DailyPlanProps) {
  const { t, language } = useTranslation();
  const { data, hourly, loading: aqiLoading } = useAirQuality(location.latitude, location.longitude);
  const { plan, planLoading, planError, generateDailyPlan, isFallback } = useGemini();

  const risk = data ? computeHouseholdRisk(profile, data) : null;
  const routine = data && risk ? buildDailyRoutine(profile, hourly as unknown as HourlyAqiData[], risk) : null;
  const rankedActions = data ? rankActionsForProfile(ACTION_CATALOG as unknown as import('@/domain/types').Action[], profile, data) : [];

  useEffect(() => {
    if (data && risk && rankedActions.length > 0 && !plan && !planLoading) {
      void generateDailyPlan({ location, aqi: data, risk, actions: rankedActions, language });
    }
    // only on mount / when data first arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.usAqi, risk?.tier]);

  if (aqiLoading || !data || !routine) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <Spinner size="lg" label={t.common.loading} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SectionHeader number="04" title={t.plan.title} subtitle={t.plan.subtitle} />

      {isFallback && (
        <Banner variant="warning" style={{ marginBottom: 'var(--space-4)' }}>
          {t.plan.fallbackNotice}
        </Banner>
      )}

      {planError && (
        <Banner variant="error" style={{ marginBottom: 'var(--space-4)' }}>
          {planError}
        </Banner>
      )}

      {plan && (
        <Card variant="accent" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
          <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            {plan.summary}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            {t.plan.poweredBy}
          </p>
        </Card>
      )}

      {planLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Spinner size="sm" />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Generating personalized plan…</span>
        </div>
      )}

      <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
        {routine.summary}
      </p>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }} aria-live="polite" aria-label="Daily routine time blocks">
        {routine.blocks.map((block) => {
          const startLabel = `${block.startHour.toString().padStart(2, '0')}:00`;
          const endLabel = `${block.endHour.toString().padStart(2, '0')}:00`;
          return (
            <Card key={block.timeOfDay} variant="default" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {startLabel}–{endLabel}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', margin: 0 }}>
                    {block.label}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Badge variant="aqi" aqiCategory={block.isOutdoorSafe ? 'good' : 'unhealthy'}>
                    AQI ~{block.aqiAtTime}
                  </Badge>
                  <Badge>{block.isOutdoorSafe ? '✓ outdoor ok' : '✕ stay indoor'}</Badge>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                {block.description}
              </p>
            </Card>
          );
        })}
      </div>

      {data && risk && (
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <Button
            variant="secondary"
            loading={planLoading}
            onClick={() => void generateDailyPlan({ location, aqi: data, risk, actions: rankedActions, language })}
          >
            {t.plan.regenerate}
          </Button>
        </div>
      )}
    </Layout>
  );
}
