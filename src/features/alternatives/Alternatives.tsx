import type { HouseholdProfile, UserLocation } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { rankActionsForProfile } from '@/domain/helpers';
import { ACTION_CATALOG } from '@/domain/actionCatalog';
import { useAirQuality } from '@/hooks/useAirQuality';
import { Layout, SectionHeader } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Spinner } from '@/components/Spinner';

interface AlternativesProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

/** Sustainable alternatives with personal exposure + emissions benefit */
export function Alternatives({ location, profile }: AlternativesProps) {
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <Spinner size="lg" label={t.common.loading} />
        </div>
      </Layout>
    );
  }

  const allRanked = rankActionsForProfile(ACTION_CATALOG as unknown as import('@/domain/types').Action[], profile, data);
  const altActions = allRanked.filter(
    (r) => r.action.category === 'transport' || r.action.category === 'cooking' || r.action.category === 'community',
  );

  return (
    <Layout>
      <SectionHeader number="06" title={t.alternatives.title} subtitle={t.alternatives.subtitle} />

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {altActions.map((ranked) => (
          <Card key={ranked.action.id} variant="default" padding="md">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', margin: '0 0 var(--space-2)' }}>
              {ranked.action.title[language]}
            </h3>
            <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
              {ranked.action.description[language]}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-brand-primary-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-brand-primary)', marginBottom: 'var(--space-1)', textTransform: 'lowercase' }}>
                  {t.alternatives.personalBenefit}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                  {ranked.action.exposureReduction.min}–{ranked.action.exposureReduction.max}%
                </div>
              </div>

              <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', textTransform: 'lowercase' }}>
                  {t.alternatives.emissionsBenefit}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                  {ranked.action.emissionsReduction
                    ? `${ranked.action.emissionsReduction.min}–${ranked.action.emissionsReduction.max}%`
                    : '—'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Badge variant="cost" costTier={ranked.action.costTier}>
                {costLabel(ranked.action.costTier)}
              </Badge>
              <Badge variant="evidence" evidence={ranked.action.evidenceStrength}>
                {t.common[ranked.action.evidenceStrength]}
              </Badge>
            </div>
          </Card>
        ))}
        {altActions.length === 0 && (
          <Card variant="outlined" padding="md">
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No alternative suggestions applicable for your current profile.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
