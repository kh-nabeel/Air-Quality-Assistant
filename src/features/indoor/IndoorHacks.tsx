import type { HouseholdProfile, UserLocation } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { rankActionsForProfile } from '@/domain/helpers';
import { ACTION_CATALOG } from '@/domain/actionCatalog';
import { useAirQuality } from '@/hooks/useAirQuality';
import { Layout, SectionHeader } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Spinner } from '@/components/Spinner';
import { Shield } from 'lucide-react';

/** Size in pixels for the shield icon. */
const SHIELD_ICON_SIZE = 16;

interface IndoorHacksProps {
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

  grid: {
    display: 'grid',
    gap: 'var(--space-4)',
  } satisfies React.CSSProperties,

  card: {
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
    background: '#ffffff',
  } satisfies React.CSSProperties,

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
  } satisfies React.CSSProperties,

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  } satisfies React.CSSProperties,

  rankBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'var(--color-bg-dark)',
    color: '#ffffff',
    fontFamily: 'var(--font-mono)',
    fontWeight: 800,
    fontSize: 'var(--text-xs)',
    border: '1.5px solid var(--color-bg-dark)',
    boxShadow: '1.5px 1.5px 0px rgba(0,0,0,0.6)',
  } satisfies React.CSSProperties,

  cardTitle: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-base)',
    margin: 0,
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  badgeRow: {
    display: 'flex',
    gap: 'var(--space-2)',
    flexWrap: 'wrap',
  } satisfies React.CSSProperties,

  description: {
    margin: 'var(--space-3) 0 0',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 'var(--leading-relaxed)',
  } satisfies React.CSSProperties,

  exposureBox: {
    marginTop: 'var(--space-4)',
    padding: 'var(--space-3) var(--space-4)',
    background: '#ECFDF5',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-bg-dark)',
    boxShadow: '1.5px 1.5px 0px var(--color-bg-dark)',
    fontSize: 'var(--text-sm)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-3)',
  } satisfies React.CSSProperties,

  exposureIconWrap: {
    display: 'inline-flex',
    padding: '4px',
    borderRadius: '6px',
    background: '#A7F3D0',
    color: '#065F46',
    border: '1px solid var(--color-bg-dark)',
    flexShrink: 0,
    marginTop: '2px',
  } satisfies React.CSSProperties,

  exposureLabel: {
    fontWeight: 700,
    color: '#065F46',
  } satisfies React.CSSProperties,

  exposureValue: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 800,
    color: '#065F46',
  } satisfies React.CSSProperties,

  evidenceNote: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-secondary)',
    margin: '4px 0 0',
    lineHeight: 'var(--leading-normal)',
  } satisfies React.CSSProperties,

  emptyMessage: {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
  } satisfies React.CSSProperties,
} as const;

/** Indoor air quality hacks ranked by impact for the household. */
export function IndoorHacks({ location, profile }: IndoorHacksProps): React.JSX.Element {
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
  const indoorActions = allRanked.filter(
    (r) => r.action.category === 'indoor' || r.action.category === 'ventilation',
  );

  const costLabel = (tier: string): string => {
    if (tier === 'free') return t.common.free;
    if (tier === 'low') return t.common.lowCost;
    return t.common.investment;
  };

  return (
    <Layout>
      <SectionHeader number="05" title={t.indoor.title} subtitle={t.indoor.subtitle} />

      <div style={styles.grid}>
        {indoorActions.map((ranked, idx) => (
          <Card key={ranked.action.id} variant="default" padding="md" style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.titleRow}>
                <span style={styles.rankBadge}>{(idx + 1).toString().padStart(2, '0')}</span>
                <h3 style={styles.cardTitle}>{ranked.action.title[language]}</h3>
              </div>
              <div style={styles.badgeRow}>
                <Badge variant="cost" costTier={ranked.action.costTier}>
                  {t.indoor.cost}: {costLabel(ranked.action.costTier)}
                </Badge>
                <Badge variant="effort" effort={ranked.action.effort}>
                  {t.indoor.effort}: {t.common[ranked.action.effort]}
                </Badge>
                <Badge variant="evidence" evidence={ranked.action.evidenceStrength}>
                  {t.common[ranked.action.evidenceStrength]}
                </Badge>
              </div>
            </div>

            <p style={styles.description}>{ranked.action.description[language]}</p>

            <div style={styles.exposureBox}>
              <span style={styles.exposureIconWrap}>
                <Shield size={SHIELD_ICON_SIZE} />
              </span>
              <div>
                <span style={styles.exposureLabel}>{t.indoor.exposureReduction}:</span>{' '}
                <span style={styles.exposureValue}>
                  {ranked.action.exposureReduction.min}–{ranked.action.exposureReduction.max}%
                </span>
                <p style={styles.evidenceNote}>{ranked.action.evidenceNote}</p>
              </div>
            </div>
          </Card>
        ))}
        {indoorActions.length === 0 && (
          <Card variant="outlined" padding="md">
            <p style={styles.emptyMessage}>
              No indoor hacks applicable for your current profile and AQI.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
