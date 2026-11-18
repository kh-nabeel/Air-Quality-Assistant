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
          <Card
            key={ranked.action.id}
            variant="default"
            padding="md"
            style={{
              border: '2px solid var(--color-bg-dark)',
              boxShadow: 'var(--shadow-sm)',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-lg)', margin: 0, color: 'var(--color-bg-dark)' }}>
                {ranked.action.title[language]}
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Badge variant="cost" costTier={ranked.action.costTier}>
                  {costLabel(ranked.action.costTier)}
                </Badge>
                <Badge variant="evidence" evidence={ranked.action.evidenceStrength}>
                  {t.common[ranked.action.evidenceStrength]}
                </Badge>
              </div>
            </div>

            <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
              {ranked.action.description[language]}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              {/* Personal Exposure Benefit */}
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: '#ECFDF5',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--color-bg-dark)',
                  boxShadow: '1.5px 1.5px 0px var(--color-bg-dark)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#065F46', marginBottom: 'var(--space-1)', textTransform: 'lowercase' }}>
                  <ShieldCheck size={14} />
                  <span>{t.alternatives.personalBenefit}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-xl)', color: '#065F46' }}>
                  {ranked.action.exposureReduction.min}–{ranked.action.exposureReduction.max}%
                </div>
                <span style={{ fontSize: '11px', color: '#047857' }}>exposure reduction</span>
              </div>

              {/* Emissions Benefit */}
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: '#FEF3C7',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--color-bg-dark)',
                  boxShadow: '1.5px 1.5px 0px var(--color-bg-dark)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#92400E', marginBottom: 'var(--space-1)', textTransform: 'lowercase' }}>
                  <Leaf size={14} />
                  <span>{t.alternatives.emissionsBenefit}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-xl)', color: '#92400E' }}>
                  {ranked.action.emissionsReduction
                    ? `${ranked.action.emissionsReduction.min}–${ranked.action.emissionsReduction.max}%`
                    : 'community-wide'}
                </div>
                <span style={{ fontSize: '11px', color: '#B45309' }}>net emissions cut</span>
              </div>
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
