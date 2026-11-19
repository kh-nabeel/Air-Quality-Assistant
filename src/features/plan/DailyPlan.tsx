import { useEffect } from 'react';
import type { HouseholdProfile, HourlyAqiData, UserLocation } from '@/domain/types';
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

/** Section number displayed in the header. */
const SECTION_NUMBER = '04';

/** Zero-padding width for hour labels. */
const HOUR_PAD_LENGTH = 2;

interface DailyPlanProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

/** Component-scoped style definitions. */
const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--space-16)',
  } satisfies React.CSSProperties,

  bannerSpacing: {
    marginBottom: 'var(--space-4)',
  } satisfies React.CSSProperties,

  advisorCard: {
    marginBottom: 'var(--space-6)',
    border: '2.5px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-md)',
    background: '#FEF08A',
  } satisfies React.CSSProperties,

  advisorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  } satisfies React.CSSProperties,

  advisorIconWrapper: {
    display: 'inline-flex',
    padding: '4px',
    borderRadius: '6px',
    background: 'var(--color-bg-dark)',
    color: '#FEF08A',
  } satisfies React.CSSProperties,

  advisorLabel: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-sm)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } satisfies React.CSSProperties,

  advisorSummary: {
    fontSize: 'var(--text-base)',
    lineHeight: 'var(--leading-relaxed)',
    margin: 0,
    fontWeight: 500,
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  advisorPoweredBy: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-secondary)',
    marginTop: 'var(--space-3)',
    margin: '12px 0 0',
  } satisfies React.CSSProperties,

  generatingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-4)',
    padding: 'var(--space-3)',
    background: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  generatingText: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  } satisfies React.CSSProperties,

  routineSummary: {
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-6)',
    lineHeight: 'var(--leading-relaxed)',
  } satisfies React.CSSProperties,

  blockGrid: {
    display: 'grid',
    gap: 'var(--space-4)',
  } satisfies React.CSSProperties,

  blockHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-2)',
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
  } satisfies React.CSSProperties,

  blockTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  } satisfies React.CSSProperties,

  timeLabel: {
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
  } satisfies React.CSSProperties,

  blockTitle: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-base)',
    margin: 0,
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  badgeGroup: {
    display: 'flex',
    gap: 'var(--space-2)',
    alignItems: 'center',
  } satisfies React.CSSProperties,

  blockDescription: {
    margin: 0,
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 'var(--leading-relaxed)',
  } satisfies React.CSSProperties,

  regenerateWrapper: {
    marginTop: 'var(--space-8)',
    textAlign: 'center',
  } satisfies React.CSSProperties,
} as const;

/**
 * Returns inline styles for the outdoor-safety badge.
 * @param isSafe - Whether outdoor activity is safe.
 * @returns Badge-specific CSS properties.
 */
function getSafetyBadgeStyle(isSafe: boolean): React.CSSProperties {
  return {
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
  };
}

/**
 * Returns card styles for a daily routine time block.
 * @param isSafe - Whether outdoor activity is safe during this block.
 * @returns Card-specific CSS properties.
 */
function getBlockCardStyle(isSafe: boolean): React.CSSProperties {
  return {
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
    background: isSafe ? '#F0FDF4' : '#ffffff',
  };
}

/** Today's time-blocked daily routine based on AQI forecast and profile. */
export function DailyPlan({ location, profile }: DailyPlanProps): React.JSX.Element {
  const { t, language } = useTranslation();
  const {
    data,
    hourly,
    loading: aqiLoading,
  } = useAirQuality(location.latitude, location.longitude);
  const { plan, planLoading, planError, generateDailyPlan, isFallback } = useGemini();

  const risk = data ? computeHouseholdRisk(profile, data) : null;
  const routine =
    data && risk ? buildDailyRoutine(profile, hourly as unknown as HourlyAqiData[], risk) : null;
  const rankedActions = data
    ? rankActionsForProfile(
        ACTION_CATALOG as unknown as import('@/domain/types').Action[],
        profile,
        data,
      )
    : [];

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
        <div style={styles.loadingContainer}>
          <Spinner size="lg" label={t.common.loading} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SectionHeader number={SECTION_NUMBER} title={t.plan.title} subtitle={t.plan.subtitle} />

      {isFallback && (
        <Banner variant="warning" style={styles.bannerSpacing}>
          {t.plan.fallbackNotice}
        </Banner>
      )}

      {planError && (
        <Banner variant="error" style={styles.bannerSpacing}>
          {planError}
        </Banner>
      )}

      {plan && (
        <Card variant="accent" padding="md" style={styles.advisorCard}>
          <div style={styles.advisorHeader}>
            <span style={styles.advisorIconWrapper}>
              <Sparkles size={16} />
            </span>
            <span style={styles.advisorLabel}>Personalized Advisor Summary</span>
          </div>
          <p style={styles.advisorSummary}>{plan.summary}</p>
          <p style={styles.advisorPoweredBy}>{t.plan.poweredBy}</p>
        </Card>
      )}

      {planLoading && (
        <div style={styles.generatingContainer}>
          <Spinner size="sm" />
          <span style={styles.generatingText}>Generating personalized plan via Gemini…</span>
        </div>
      )}

      <p style={styles.routineSummary}>{routine.summary}</p>

      <div style={styles.blockGrid} aria-live="polite" aria-label="Daily routine time blocks">
        {routine.blocks.map((block) => {
          const startLabel = `${block.startHour.toString().padStart(HOUR_PAD_LENGTH, '0')}:00`;
          const endLabel = `${block.endHour.toString().padStart(HOUR_PAD_LENGTH, '0')}:00`;
          const isSafe = block.isOutdoorSafe;
          return (
            <Card
              key={block.timeOfDay}
              variant="default"
              padding="md"
              style={getBlockCardStyle(isSafe)}
            >
              <div style={styles.blockHeaderRow}>
                <div style={styles.blockTitleGroup}>
                  <span style={styles.timeLabel}>
                    <Clock size={12} />
                    {startLabel}–{endLabel}
                  </span>
                  <h3 style={styles.blockTitle}>{block.label}</h3>
                </div>
                <div style={styles.badgeGroup}>
                  <Badge variant="aqi" aqiCategory={isSafe ? 'good' : 'unhealthy'}>
                    AQI ~{block.aqiAtTime}
                  </Badge>
                  <span style={getSafetyBadgeStyle(isSafe)}>
                    {isSafe ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                    {isSafe ? 'outdoor ok' : 'stay indoor'}
                  </span>
                </div>
              </div>
              <p style={styles.blockDescription}>{block.description}</p>
            </Card>
          );
        })}
      </div>

      {data && risk && (
        <div style={styles.regenerateWrapper}>
          <Button
            variant="secondary"
            loading={planLoading}
            icon={<RefreshCw size={15} />}
            onClick={() =>
              void generateDailyPlan({
                location,
                aqi: data,
                risk,
                actions: rankedActions,
                language,
              })
            }
          >
            {t.plan.regenerate}
          </Button>
        </div>
      )}
    </Layout>
  );
}
