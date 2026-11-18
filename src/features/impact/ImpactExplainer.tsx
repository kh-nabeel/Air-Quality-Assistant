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
      <Card
        variant="elevated"
        padding="lg"
        style={{
          marginBottom: 'var(--space-6)',
          border: '2.5px solid var(--color-bg-dark)',
          boxShadow: 'var(--shadow-md)',
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 'var(--space-4)', alignItems: 'center', textAlign: 'center' }}>
          {/* Before */}
          <div
            style={{
              padding: 'var(--space-4)',
              background: '#FEF2F2',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--color-bg-dark)',
              boxShadow: '2px 2px 0px var(--color-bg-dark)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
              {t.impact.before}
            </div>
            <div style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-error)', lineHeight: 1.1 }}>
              {Math.round(exposure.currentExposure)}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>AQI Baseline Exposure</div>
          </div>

          {/* Arrow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              borderRadius: '50%',
              background: '#FEF08A',
              border: '2px solid var(--color-bg-dark)',
              boxShadow: '2px 2px 0px var(--color-bg-dark)',
              color: 'var(--color-bg-dark)',
            }}
          >
            <ArrowRight size={22} strokeWidth={3} />
          </div>

          {/* After */}
          <div
            style={{
              padding: 'var(--space-4)',
              background: '#ECFDF5',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--color-bg-dark)',
              boxShadow: '2px 2px 0px var(--color-bg-dark)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
              {t.impact.after}
            </div>
            <div style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>
              {Math.round(exposure.reducedExposure.min)}–{Math.round(exposure.reducedExposure.max)}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>AQI Exposure ({t.impact.estimate})</div>
          </div>
        </div>

        {/* Aggregate Reduction Pill */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: '#F0FDF4',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--color-bg-dark)',
            boxShadow: '2px 2px 0px var(--color-bg-dark)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <TrendingDown size={14} />
            <span>{t.impact.reduction}</span>
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#166534', marginTop: 'var(--space-1)' }}>
            {exposure.reductionPercent.min}–{exposure.reductionPercent.max}%
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
            <Badge variant="evidence" evidence={exposure.confidence}>
              {t.common[exposure.confidence]}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Community impact */}
      <Card
        variant="accent"
        padding="md"
        style={{
          marginBottom: 'var(--space-6)',
          border: '2.5px solid var(--color-bg-dark)',
          boxShadow: 'var(--shadow-md)',
          background: '#FFFBEB',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
          <span
            style={{
              display: 'inline-flex',
              padding: '6px',
              borderRadius: '8px',
              background: '#FDE047',
              border: '1.5px solid var(--color-bg-dark)',
              color: 'var(--color-bg-dark)',
            }}
          >
            <Users size={18} />
          </span>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-lg)', margin: 0, textTransform: 'lowercase', color: 'var(--color-bg-dark)' }}>
            {t.impact.communityTitle}
          </h3>
        </div>
        <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          {t.impact.communityDesc.replace('{{count}}', String(exposure.communityImpact.households))}
        </p>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-brand-primary)' }}>
          {Math.round(exposure.communityImpact.totalReduction.min)}–{Math.round(exposure.communityImpact.totalReduction.max)} AQI points
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>aggregate neighborhood exposure reduction across 30 participating homes</span>
      </Card>

      {/* Per-action rationale */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', textTransform: 'lowercase', color: 'var(--color-bg-dark)' }}>
        {t.impact.whyThis}
      </h3>
      <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
        {topActions.map((ranked) => (
          <Card
            key={ranked.action.id}
            variant="default"
            padding="sm"
            style={{
              border: '2px solid var(--color-bg-dark)',
              boxShadow: '1.5px 1.5px 0px var(--color-bg-dark)',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  padding: '3px',
                  borderRadius: '5px',
                  background: 'var(--color-brand-primary-light)',
                  color: 'var(--color-brand-primary)',
                }}
              >
                <Shield size={13} />
              </span>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', margin: 0, color: 'var(--color-bg-dark)' }}>
                {ranked.action.title[language]}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
              Exposure reduction: <strong>{ranked.action.exposureReduction.min}–{ranked.action.exposureReduction.max}%</strong> · {ranked.action.evidenceNote}
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
