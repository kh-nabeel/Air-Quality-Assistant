import type { AqiData, RiskAssessment } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { classifyAqi } from '@/domain/classifyAqi';
import { formatAqi } from '@/utils/format';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';

interface AqiHeroCardProps {
  readonly aqi: AqiData;
  readonly risk: RiskAssessment;
}

/** Large hero card showing current AQI with category, icon, and household meaning */
export function AqiHeroCard({ aqi, risk }: AqiHeroCardProps) {
  const { t } = useTranslation();
  const classification = classifyAqi(aqi.usAqi);
  const aqiDescKey = `${classification.category}Desc` as keyof typeof t.aqi;
  const aqiLabelKey = classification.category as keyof typeof t.aqi;

  return (
    <Card
      variant="elevated"
      padding="lg"
      ariaLabel="Current Air Quality Index"
      style={{ textAlign: 'center' }}
    >
      {/* AQI Value */}
      <div
        style={{
          fontSize: 'var(--text-5xl)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          color: `var(--color-${classification.cssClass.replace('aqi-', 'aqi-')})`,
          lineHeight: 1,
          marginBottom: 'var(--space-2)',
        }}
      >
        {formatAqi(aqi.usAqi)}
      </div>

      {/* Category badge */}
      <Badge variant="aqi" aqiCategory={classification.category}>
        {t.aqi[aqiLabelKey]}
      </Badge>

      {/* Plain-language description */}
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-secondary)',
          marginTop: 'var(--space-4)',
          lineHeight: 'var(--leading-relaxed)',
        }}
      >
        {t.aqi[aqiDescKey]}
      </p>

      {/* Household risk */}
      <div
        style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-secondary)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            textTransform: 'lowercase',
          }}
        >
          {t.dashboard.riskLevel}:{' '}
        </span>
        <span style={{ fontWeight: 700 }}>{risk.tier}</span>
        {risk.factors.length > 0 && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', margin: 0 }}>
            {risk.factors[0]}
          </p>
        )}
      </div>

      {/* Last updated */}
      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          marginTop: 'var(--space-3)',
        }}
      >
        {t.aqi.lastUpdated}: {new Date(aqi.timestamp).toLocaleTimeString()}
      </p>
    </Card>
  );
}
