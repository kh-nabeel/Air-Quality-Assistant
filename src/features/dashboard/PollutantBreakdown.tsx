import type { AqiData } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/Layout';
import { Flame, Wind, Factory, Sun, CloudFog, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

interface PollutantBreakdownProps {
  readonly aqi: AqiData;
}

interface PollutantInfo {
  readonly key: keyof AqiData;
  readonly label: string;
  readonly name: string;
  readonly unit: string;
  readonly safeMax: number;
  readonly icon: ReactNode;
}

const POLLUTANTS: readonly PollutantInfo[] = [
  { key: 'pm25', label: 'PM2.5', name: 'Fine Particulates', unit: 'µg/m³', safeMax: 25, icon: <CloudFog size={16} /> },
  { key: 'pm10', label: 'PM10', name: 'Coarse Dust', unit: 'µg/m³', safeMax: 50, icon: <Wind size={16} /> },
  { key: 'no2', label: 'NO₂', name: 'Nitrogen Dioxide', unit: 'µg/m³', safeMax: 40, icon: <Factory size={16} /> },
  { key: 'o3', label: 'O₃', name: 'Ozone', unit: 'µg/m³', safeMax: 100, icon: <Sun size={16} /> },
  { key: 'so2', label: 'SO₂', name: 'Sulphur Dioxide', unit: 'µg/m³', safeMax: 40, icon: <Flame size={16} /> },
  { key: 'co', label: 'CO', name: 'Carbon Monoxide', unit: 'µg/m³', safeMax: 4000, icon: <Zap size={16} /> },
];

/** Pollutant breakdown grid with bar visualization */
export function PollutantBreakdown({ aqi }: PollutantBreakdownProps) {
  const { t } = useTranslation();

  return (
    <Card variant="default" padding="md" style={{ border: '2.5px solid var(--color-bg-dark)', boxShadow: 'var(--shadow-md)' }}>
      <SectionHeader number="02" title={t.aqi.pollutants} subtitle="Concentration of airborne pollutants measured against WHO guideline thresholds" />
      <div
        role="table"
        aria-label="Pollutant levels"
        style={{ display: 'grid', gap: 'var(--space-3)' }}
      >
        {POLLUTANTS.map((p) => {
          const value = aqi[p.key] as number;
          const pct = Math.min(100, (value / p.safeMax) * 100);
          const isElevated = pct > 100;
          return (
            <div
              key={p.key}
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: '7.5rem 1fr 4.5rem',
                gap: 'var(--space-3)',
                alignItems: 'center',
                padding: 'var(--space-2) var(--space-3)',
                background: isElevated ? '#FEF2F2' : 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--color-bg-dark)',
              }}
            >
              <div role="cell" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    padding: '4px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid var(--color-bg-dark)',
                    color: isElevated ? 'var(--color-error)' : 'var(--color-brand-primary)',
                  }}
                >
                  {p.icon}
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                  {p.label}
                </span>
              </div>
              <div
                role="cell"
                style={{
                  position: 'relative',
                  height: 12,
                  background: '#ffffff',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  border: '1.5px solid var(--color-bg-dark)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${Math.min(100, pct)}%`,
                    background: isElevated ? '#EF4444' : '#10B981',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width var(--transition-normal)',
                  }}
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemax={p.safeMax}
                  aria-label={`${p.label}: ${Math.round(value)} ${p.unit}`}
                />
              </div>
              <span
                role="cell"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  textAlign: 'right',
                  color: isElevated ? 'var(--color-error)' : 'var(--color-bg-dark)',
                }}
              >
                {Math.round(value)} <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{p.unit.split('/')[0]}</span>
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
