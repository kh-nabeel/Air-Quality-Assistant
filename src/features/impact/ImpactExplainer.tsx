import type { HouseholdProfile, UserLocation } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { rankActionsForProfile } from '@/domain/helpers';
import { estimateExposure } from '@/domain/estimateExposure';
import { ACTION_CATALOG } from '@/domain/actionCatalog';
import { useAirQuality } from '@/hooks/useAirQuality';
import { Layout, SectionHeader } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Banner } from '@/components/Banner';
import { Spinner } from '@/components/Spinner';
import { ArrowRight, Users, Shield, TrendingDown } from 'lucide-react';

/** Section number displayed in the header. */
const SECTION_NUMBER = '07';

/** Maximum number of top-ranked actions shown. */
const TOP_ACTION_COUNT = 5;

interface ImpactExplainerProps {
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

  exposureCard: {
    marginBottom: 'var(--space-6)',
    border: '2.5px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-md)',
    background: '#ffffff',
  } satisfies React.CSSProperties,

  exposureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: 'var(--space-4)',
    alignItems: 'center',
    textAlign: 'center',
  } satisfies React.CSSProperties,

  beforePanel: {
    padding: 'var(--space-4)',
    background: '#FEF2F2',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: '2px 2px 0px var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  beforeLabel: {
    fontSize: 'var(--text-xs)',
    fontWeight: 800,
    color: '#991B1B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 'var(--space-1)',
  } satisfies React.CSSProperties,

  beforeValue: {
    fontSize: 'var(--text-4xl)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    color: 'var(--color-error)',
    lineHeight: 1.1,
  } satisfies React.CSSProperties,

  exposureCaption: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-secondary)',
    marginTop: '4px',
  } satisfies React.CSSProperties,

  arrowCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    borderRadius: '50%',
    background: '#FEF08A',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: '2px 2px 0px var(--color-bg-dark)',
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  afterPanel: {
    padding: 'var(--space-4)',
    background: '#ECFDF5',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: '2px 2px 0px var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  afterLabel: {
    fontSize: 'var(--text-xs)',
    fontWeight: 800,
    color: '#065F46',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 'var(--space-1)',
  } satisfies React.CSSProperties,

  afterValue: {
    fontSize: 'var(--text-4xl)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    color: '#059669',
    lineHeight: 1.1,
  } satisfies React.CSSProperties,

  reductionPill: {
    marginTop: 'var(--space-6)',
    padding: 'var(--space-4)',
    background: '#F0FDF4',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: '2px 2px 0px var(--color-bg-dark)',
    textAlign: 'center',
  } satisfies React.CSSProperties,

  reductionLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: 'var(--text-xs)',
    fontWeight: 800,
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } satisfies React.CSSProperties,

  reductionValue: {
    fontSize: 'var(--text-3xl)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    color: '#166534',
    marginTop: 'var(--space-1)',
  } satisfies React.CSSProperties,

  badgeCenter: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 'var(--space-2)',
  } satisfies React.CSSProperties,

  communityCard: {
    marginBottom: 'var(--space-6)',
    border: '2.5px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-md)',
    background: '#FFFBEB',
  } satisfies React.CSSProperties,

  communityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: 'var(--space-2)',
  } satisfies React.CSSProperties,

  communityIconWrapper: {
    display: 'inline-flex',
    padding: '6px',
    borderRadius: '8px',
    background: '#FDE047',
    border: '1.5px solid var(--color-bg-dark)',
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  communityHeading: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-lg)',
    margin: 0,
    textTransform: 'lowercase',
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  communityDescription: {
    margin: '0 0 var(--space-3)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 'var(--leading-relaxed)',
  } satisfies React.CSSProperties,

  communityTotal: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-2xl)',
    color: 'var(--color-brand-primary)',
  } satisfies React.CSSProperties,

  communityNote: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  } satisfies React.CSSProperties,

  whyHeading: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-lg)',
    marginBottom: 'var(--space-4)',
    textTransform: 'lowercase',
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  actionGrid: {
    display: 'grid',
    gap: 'var(--space-3)',
  } satisfies React.CSSProperties,

  actionCard: {
    border: '2px solid var(--color-bg-dark)',
    boxShadow: '1.5px 1.5px 0px var(--color-bg-dark)',
    background: '#ffffff',
  } satisfies React.CSSProperties,

  actionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  } satisfies React.CSSProperties,

  actionIcon: {
    display: 'inline-flex',
    padding: '3px',
    borderRadius: '5px',
    background: 'var(--color-brand-primary-light)',
    color: 'var(--color-brand-primary)',
  } satisfies React.CSSProperties,

  actionTitle: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
    fontSize: 'var(--text-sm)',
    margin: 0,
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  actionBody: {
    margin: 0,
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-secondary)',
    lineHeight: 'var(--leading-relaxed)',
  } satisfies React.CSSProperties,

  rangeNoteBanner: {
    marginTop: 'var(--space-6)',
  } satisfies React.CSSProperties,
} as const;

/** Impact explainer with before/after exposure and community projection. */
export function ImpactExplainer({ location, profile }: ImpactExplainerProps): React.JSX.Element {
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

  const allRanked = rankActionsForProfile(
    ACTION_CATALOG as unknown as import('@/domain/types').Action[],
    profile,
    data,
  );
  const topActions = allRanked.slice(0, TOP_ACTION_COUNT);
  const exposure = estimateExposure(data.usAqi, topActions, profile);

  return (
    <Layout>
      <SectionHeader number={SECTION_NUMBER} title={t.impact.title} subtitle={t.impact.subtitle} />

      {/* Exposure comparison */}
      <Card variant="elevated" padding="lg" style={styles.exposureCard}>
        <div style={styles.exposureGrid}>
          {/* Before */}
          <div style={styles.beforePanel}>
            <div style={styles.beforeLabel}>{t.impact.before}</div>
            <div style={styles.beforeValue}>{Math.round(exposure.currentExposure)}</div>
            <div style={styles.exposureCaption}>AQI Baseline Exposure</div>
          </div>

          {/* Arrow */}
          <div style={styles.arrowCircle}>
            <ArrowRight size={22} strokeWidth={3} />
          </div>

          {/* After */}
          <div style={styles.afterPanel}>
            <div style={styles.afterLabel}>{t.impact.after}</div>
            <div style={styles.afterValue}>
              {Math.round(exposure.reducedExposure.min)}–{Math.round(exposure.reducedExposure.max)}
            </div>
            <div style={styles.exposureCaption}>AQI Exposure ({t.impact.estimate})</div>
          </div>
        </div>

        {/* Aggregate Reduction Pill */}
        <div style={styles.reductionPill}>
          <div style={styles.reductionLabel}>
            <TrendingDown size={14} />
            <span>{t.impact.reduction}</span>
          </div>
          <div style={styles.reductionValue}>
            {exposure.reductionPercent.min}–{exposure.reductionPercent.max}%
          </div>
          <div style={styles.badgeCenter}>
            <Badge variant="evidence" evidence={exposure.confidence}>
              {t.common[exposure.confidence]}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Community impact */}
      <Card variant="accent" padding="md" style={styles.communityCard}>
        <div style={styles.communityHeader}>
          <span style={styles.communityIconWrapper}>
            <Users size={18} />
          </span>
          <h3 style={styles.communityHeading}>{t.impact.communityTitle}</h3>
        </div>
        <p style={styles.communityDescription}>
          {t.impact.communityDesc.replace('{{count}}', String(exposure.communityImpact.households))}
        </p>
        <div style={styles.communityTotal}>
          {Math.round(exposure.communityImpact.totalReduction.min)}–
          {Math.round(exposure.communityImpact.totalReduction.max)} AQI points
        </div>
        <span style={styles.communityNote}>
          aggregate neighborhood exposure reduction across 30 participating homes
        </span>
      </Card>

      {/* Per-action rationale */}
      <h3 style={styles.whyHeading}>{t.impact.whyThis}</h3>
      <div style={styles.actionGrid}>
        {topActions.map((ranked) => (
          <Card key={ranked.action.id} variant="default" padding="sm" style={styles.actionCard}>
            <div style={styles.actionHeader}>
              <span style={styles.actionIcon}>
                <Shield size={13} />
              </span>
              <h4 style={styles.actionTitle}>{ranked.action.title[language]}</h4>
            </div>
            <p style={styles.actionBody}>
              Exposure reduction:{' '}
              <strong>
                {ranked.action.exposureReduction.min}–{ranked.action.exposureReduction.max}%
              </strong>{' '}
              · {ranked.action.evidenceNote}
            </p>
          </Card>
        ))}
      </div>

      <Banner variant="info" style={styles.rangeNoteBanner}>
        {t.impact.rangeNote}
      </Banner>
    </Layout>
  );
}
