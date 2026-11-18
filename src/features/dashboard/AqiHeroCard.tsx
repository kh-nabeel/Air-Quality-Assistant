import type { AqiData, RiskAssessment } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { classifyAqi } from '@/domain/classifyAqi';
import { formatAqi } from '@/utils/format';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Shield, Clock, Wind, AlertCircle } from 'lucide-react';

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
      style={{
        textAlign: 'center',
        border: '2.5px solid var(--color-bg-dark)',
        boxShadow: 'var(--shadow-md)',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top micro badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '2px 8px',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-full)',
            border: '1.5px solid var(--color-bg-dark)',
          }}
        >
          <Wind size={13} />
          LIVE AIR QUALITY
        </span>
      </div>

      {/* AQI Value */}
      <div
        style={{
          fontSize: 'var(--text-5xl)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          color: `var(--color-${classification.cssClass.replace('aqi-', 'aqi-')})`,
          lineHeight: 1,
          marginBottom: 'var(--space-3)',
          letterSpacing: '-0.04em',
        }}
      >
        {formatAqi(aqi.usAqi)}
      </div>

      {/* Category badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
        <Badge variant="aqi" aqiCategory={classification.category}>
          {t.aqi[aqiLabelKey]}
        </Badge>
      </div>

      {/* Plain-language description */}
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-secondary)',
          marginTop: 'var(--space-3)',
          lineHeight: 'var(--leading-relaxed)',
          maxWidth: '32rem',
          marginInline: 'auto',
          fontWeight: 500,
        }}
      >
        {t.aqi[aqiDescKey]}
      </p>

      {/* Household risk summary */}
      <div
        style={{
          marginTop: 'var(--space-5)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          background: '#FFFBEB',
          border: '2px solid var(--color-bg-dark)',
          boxShadow: '2px 2px 0px var(--color-bg-dark)',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            padding: '6px',
            borderRadius: '8px',
            background: '#FDE047',
            border: '1.5px solid var(--color-bg-dark)',
            color: 'var(--color-bg-dark)',
            flexShrink: 0,
          }}
        >
          {risk.tier === 'low' || risk.tier === 'moderate' ? <Shield size={18} /> : <AlertCircle size={18} />}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 'var(--text-sm)',
                textTransform: 'lowercase',
                color: 'var(--color-bg-dark)',
              }}
            >
              {t.dashboard.riskLevel}:
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: 'var(--text-xs)',
                textTransform: 'uppercase',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'var(--color-bg-dark)',
                color: '#ffffff',
              }}
            >
              {risk.tier}
            </span>
          </div>
          {risk.factors.length > 0 && (
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--space-1)',
                lineHeight: 'var(--leading-normal)',
                margin: '4px 0 0',
              }}
            >
              {risk.factors[0]}
            </p>
          )}
        </div>
      </div>

      {/* Last updated */}
      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          marginTop: 'var(--space-4)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <Clock size={12} />
        <span>{t.aqi.lastUpdated}: {new Date(aqi.timestamp).toLocaleTimeString()}</span>
      </p>
    </Card>
  );
}
