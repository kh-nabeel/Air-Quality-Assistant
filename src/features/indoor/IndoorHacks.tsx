import type { HouseholdProfile, UserLocation } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { rankActionsForProfile } from '@/domain/helpers';
import { ACTION_CATALOG } from '@/domain/actionCatalog';
import { useAirQuality } from '@/hooks/useAirQuality';
import { Layout, SectionHeader } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Spinner } from '@/components/Spinner';

interface IndoorHacksProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

/** Indoor air quality hacks ranked by impact for the household */
export function IndoorHacks({ location, profile }: IndoorHacksProps) {
  const { t, language } = useTranslation();
  const { data, loading } = useAirQuality(location.latitude, location.longitude);

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
  const indoorActions = allRanked.filter((r) => r.action.category === 'indoor' || r.action.category === 'ventilation');

  const costLabel = (tier: string): string => {
    if (tier === 'free') return t.common.free;
    if (tier === 'low') return t.common.lowCost;
    return t.common.investment;
  };

  return (
    <Layout>
      <SectionHeader number="05" title={t.indoor.title} subtitle={t.indoor.subtitle} />

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {indoorActions.map((ranked, idx) => (
          <Card key={ranked.action.id} variant="default" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', margin: 0 }}>
                <span style={{ color: 'var(--color-text-muted)', marginRight: 'var(--space-2)' }}>#{idx + 1}</span>
                {ranked.action.title[language]}
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
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
            <p style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
              {ranked.action.description[language]}
            </p>
            <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
              <strong>{t.indoor.exposureReduction}:</strong> {ranked.action.exposureReduction.min}–{ranked.action.exposureReduction.max}%
              <br />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {ranked.action.evidenceNote}
              </span>
            </div>
          </Card>
        ))}
        {indoorActions.length === 0 && (
          <Card variant="outlined" padding="md">
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No indoor hacks applicable for your current profile and AQI.</p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
