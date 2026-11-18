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

interface ImpactExplainerProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

/** Impact explainer with before/after exposure and community projection */
export function ImpactExplainer({ location, profile }: ImpactExplainerProps) {
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
  const topActions = allRanked.slice(0, 5);
  const exposure = estimateExposure(data.usAqi, topActions, profile);

  return (
    <Layout>
      <SectionHeader number="07" title={t.impact.title} subtitle={t.impact.subtitle} />

      {/* Exposure comparison */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: 'var(--space-6)', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'lowercase', marginBottom: 'var(--space-2)' }}>
              {t.impact.before}
            </div>
            <div style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-error)' }}>
              {Math.round(exposure.currentExposure)}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>AQI exposure</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-2xl)', color: 'var(--color-brand-primary)' }}>
            →
          </div>

          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'lowercase', marginBottom: 'var(--space-2)' }}>
              {t.impact.after}
            </div>
            <div style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-success)' }}>
              {Math.round(exposure.reducedExposure.min)}–{Math.round(exposure.reducedExposure.max)}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>AQI exposure ({t.impact.estimate})</div>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-brand-primary-light)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-brand-primary)', textTransform: 'lowercase' }}>
            {t.impact.reduction}
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-brand-primary)', marginTop: 'var(--space-1)' }}>
            {exposure.reductionPercent.min}–{exposure.reductionPercent.max}%
          </div>
          <Badge variant="evidence" evidence={exposure.confidence} style={{ marginTop: 'var(--space-2)' }}>
            {t.common[exposure.confidence]}
          </Badge>
        </div>
      </Card>

      {/* Community impact */}
      <Card variant="accent" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)', margin: '0 0 var(--space-2)', textTransform: 'lowercase' }}>
          {t.impact.communityTitle}
        </h3>
        <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          {t.impact.communityDesc.replace('{{count}}', String(exposure.communityImpact.households))}
        </p>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--color-brand-primary)' }}>
          {Math.round(exposure.communityImpact.totalReduction.min)}–{Math.round(exposure.communityImpact.totalReduction.max)}%
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>aggregate neighbourhood reduction estimate</span>
      </Card>

      {/* Per-action rationale */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)', textTransform: 'lowercase' }}>
        {t.impact.whyThis}
      </h3>
      <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
        {topActions.map((ranked) => (
          <Card key={ranked.action.id} variant="outlined" padding="sm">
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', margin: '0 0 var(--space-1)' }}>
              {ranked.action.title[language]}
            </h4>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
              Exposure reduction: {ranked.action.exposureReduction.min}–{ranked.action.exposureReduction.max}% · {ranked.action.evidenceNote}
            </p>
          </Card>
        ))}
      </div>

      <Banner variant="info" style={{ marginTop: 'var(--space-6)' }}>
        {t.impact.rangeNote}
      </Banner>
    </Layout>
  );
}
