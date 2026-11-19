import type { HouseholdProfile, UserLocation } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { rankActionsForProfile } from '@/domain/helpers';
import { ACTION_CATALOG } from '@/domain/actionCatalog';
import { useAirQuality } from '@/hooks/useAirQuality';
import { Layout, SectionHeader } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Spinner } from '@/components/Spinner';
import { Leaf, ShieldCheck } from 'lucide-react';

/** Icon size used for benefit section icons. */
const BENEFIT_ICON_SIZE = 14;

/** Font size for small sub-labels in benefit cards. */
const BENEFIT_SUB_LABEL_FONT_SIZE = '11px';

/** Gap between benefit section icon and label. */
const BENEFIT_ICON_GAP = '6px';

interface AlternativesProps {
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
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-2)',
  } satisfies React.CSSProperties,

  cardTitle: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-lg)',
    margin: 0,
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  badgeRow: {
    display: 'flex',
    gap: 'var(--space-2)',
    flexWrap: 'wrap',
  } satisfies React.CSSProperties,

  description: {
    margin: '0 0 var(--space-4)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 'var(--leading-relaxed)',
  } satisfies React.CSSProperties,

  benefitGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--space-3)',
  } satisfies React.CSSProperties,

  personalBenefitBox: {
    padding: 'var(--space-3) var(--space-4)',
    background: '#ECFDF5',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-bg-dark)',
    boxShadow: '1.5px 1.5px 0px var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  personalBenefitLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: BENEFIT_ICON_GAP,
    fontSize: 'var(--text-xs)',
    fontWeight: 700,
    color: '#065F46',
    marginBottom: 'var(--space-1)',
    textTransform: 'lowercase',
  } satisfies React.CSSProperties,

  personalBenefitValue: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-xl)',
    color: '#065F46',
  } satisfies React.CSSProperties,

  personalBenefitSub: {
    fontSize: BENEFIT_SUB_LABEL_FONT_SIZE,
    color: '#047857',
  } satisfies React.CSSProperties,

  emissionsBenefitBox: {
    padding: 'var(--space-3) var(--space-4)',
    background: '#FEF3C7',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-bg-dark)',
    boxShadow: '1.5px 1.5px 0px var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  emissionsBenefitLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: BENEFIT_ICON_GAP,
    fontSize: 'var(--text-xs)',
    fontWeight: 700,
    color: '#92400E',
    marginBottom: 'var(--space-1)',
    textTransform: 'lowercase',
  } satisfies React.CSSProperties,

  emissionsBenefitValue: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-xl)',
    color: '#92400E',
  } satisfies React.CSSProperties,

  emissionsBenefitSub: {
    fontSize: BENEFIT_SUB_LABEL_FONT_SIZE,
    color: '#B45309',
  } satisfies React.CSSProperties,

  emptyMessage: {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
  } satisfies React.CSSProperties,
} as const;

/** Sustainable alternatives with personal exposure + emissions benefit. */
export function Alternatives({ location, profile }: AlternativesProps): React.JSX.Element {
  const { t, language } = useTranslation();
  const { data, loading } = useAirQuality(location.latitude, location.longitude);

  const costLabel = (tier: import('@/domain/types').BudgetTier): string => {
    if (tier === 'free') return t.common.free;
    if (tier === 'low') return t.common.lowCost;
    return t.common.investment;
  };

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
  const altActions = allRanked.filter(
    (r) =>
      r.action.category === 'transport' ||
      r.action.category === 'cooking' ||
      r.action.category === 'community',
  );

  return (
    <Layout>
      <SectionHeader number="06" title={t.alternatives.title} subtitle={t.alternatives.subtitle} />

      <div style={styles.grid}>
        {altActions.map((ranked) => (
          <Card key={ranked.action.id} variant="default" padding="md" style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>{ranked.action.title[language]}</h3>
              <div style={styles.badgeRow}>
                <Badge variant="cost" costTier={ranked.action.costTier}>
                  {costLabel(ranked.action.costTier)}
                </Badge>
                <Badge variant="evidence" evidence={ranked.action.evidenceStrength}>
                  {t.common[ranked.action.evidenceStrength]}
                </Badge>
              </div>
            </div>

            <p style={styles.description}>{ranked.action.description[language]}</p>

            <div style={styles.benefitGrid}>
              {/* Personal Exposure Benefit */}
              <div style={styles.personalBenefitBox}>
                <div style={styles.personalBenefitLabel}>
                  <ShieldCheck size={BENEFIT_ICON_SIZE} />
                  <span>{t.alternatives.personalBenefit}</span>
                </div>
                <div style={styles.personalBenefitValue}>
                  {ranked.action.exposureReduction.min}–{ranked.action.exposureReduction.max}%
                </div>
                <span style={styles.personalBenefitSub}>exposure reduction</span>
              </div>

              {/* Emissions Benefit */}
              <div style={styles.emissionsBenefitBox}>
                <div style={styles.emissionsBenefitLabel}>
                  <Leaf size={BENEFIT_ICON_SIZE} />
                  <span>{t.alternatives.emissionsBenefit}</span>
                </div>
                <div style={styles.emissionsBenefitValue}>
                  {ranked.action.emissionsReduction
                    ? `${ranked.action.emissionsReduction.min}–${ranked.action.emissionsReduction.max}%`
                    : 'community-wide'}
                </div>
                <span style={styles.emissionsBenefitSub}>net emissions cut</span>
              </div>
            </div>
          </Card>
        ))}
        {altActions.length === 0 && (
          <Card variant="outlined" padding="md">
            <p style={styles.emptyMessage}>
              No alternative suggestions applicable for your current profile.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
