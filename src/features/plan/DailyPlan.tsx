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
import { Clock, ShieldCheck, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

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
        <Card
          variant="accent"
          padding="md"
          style={{
            marginBottom: 'var(--space-6)',
            border: '2.5px solid var(--color-bg-dark)',
            boxShadow: 'var(--shadow-md)',
            background: '#FEF08A',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                padding: '4px',
                borderRadius: '6px',
                background: 'var(--color-bg-dark)',
                color: '#FEF08A',
              }}
            >
              <Sparkles size={16} />
            </span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Personalized Advisor Summary
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', margin: 0, fontWeight: 500, color: 'var(--color-bg-dark)' }}>
            {plan.summary}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)', margin: '12px 0 0' }}>
            {t.plan.poweredBy}
          </p>
        </Card>
      )}

      {planLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-bg-dark)' }}>
          <Spinner size="sm" />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 600 }}>Generating personalized plan via Gemini…</span>
        </div>
      )}

      <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
        {routine.summary}
      </p>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }} aria-live="polite" aria-label="Daily routine time blocks">
        {routine.blocks.map((block) => {
          const startLabel = `${block.startHour.toString().padStart(2, '0')}:00`;
          const endLabel = `${block.endHour.toString().padStart(2, '0')}:00`;
          const isSafe = block.isOutdoorSafe;
          return (
            <Card
              key={block.timeOfDay}
              variant="default"
              padding="md"
              style={{
                border: '2px solid var(--color-bg-dark)',
                boxShadow: 'var(--shadow-sm)',
                background: isSafe ? '#F0FDF4' : '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: 'var(--color-bg-dark)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      background: 'var(--color-bg-secondary)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-bg-dark)',
                    }}
                  >
                    <Clock size={12} />
                    {startLabel}–{endLabel}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-base)', margin: 0, color: 'var(--color-bg-dark)' }}>
                    {block.label}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <Badge variant="aqi" aqiCategory={isSafe ? 'good' : 'unhealthy'}>
                    AQI ~{block.aqiAtTime}
                  </Badge>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: '1.5px solid var(--color-bg-dark)',
                      background: isSafe ? '#DCFCE7' : '#FEE2E2',
                      color: isSafe ? '#166534' : '#991B1B',
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                    }}
                  >
                    {isSafe ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                    {isSafe ? 'outdoor ok' : 'stay indoor'}
                  </span>
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
        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
          <Button
            variant="secondary"
            loading={planLoading}
            icon={<RefreshCw size={15} />}
            onClick={() => void generateDailyPlan({ location, aqi: data, risk, actions: rankedActions, language })}
          >
            {t.plan.regenerate}
          </Button>
        </div>
      )}
    </Layout>
  );
}
