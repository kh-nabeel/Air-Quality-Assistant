import type { AqiData } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/Layout';

interface PollutantBreakdownProps {
  readonly aqi: AqiData;
}

interface PollutantInfo {
  readonly key: keyof AqiData;
  readonly label: string;
  readonly unit: string;
  readonly safeMax: number;
}

const POLLUTANTS: readonly PollutantInfo[] = [
  { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', safeMax: 25 },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³', safeMax: 50 },
  { key: 'no2', label: 'NO₂', unit: 'µg/m³', safeMax: 40 },
  { key: 'o3', label: 'O₃', unit: 'µg/m³', safeMax: 100 },
  { key: 'so2', label: 'SO₂', unit: 'µg/m³', safeMax: 40 },
  { key: 'co', label: 'CO', unit: 'µg/m³', safeMax: 4000 },
];

/** Pollutant breakdown grid with bar visualization */
export function PollutantBreakdown({ aqi }: PollutantBreakdownProps) {
  const { t } = useTranslation();

  return (
    <Card variant="default" padding="md">
      <SectionHeader number="02" title={t.aqi.pollutants} />
      <div
        role="table"
        aria-label="Pollutant levels"
        style={{ display: 'grid', gap: 'var(--space-3)' }}
      >
        <div role="row" style={{ display: 'grid', gridTemplateColumns: '5rem 1fr 4rem', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span role="columnheader" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Pollutant</span>
          <span role="columnheader" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Level</span>
          <span role="columnheader" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'right' }}>Value</span>
        </div>
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
                gridTemplateColumns: '5rem 1fr 4rem',
                gap: 'var(--space-2)',
                alignItems: 'center',
              }}
            >
              <span role="cell" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                {p.label}
              </span>
              <div role="cell" style={{ position: 'relative', height: 8, background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${Math.min(100, pct)}%`,
                    background: isElevated ? 'var(--color-error)' : 'var(--color-brand-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width var(--transition-normal)',
                  }}
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemax={p.safeMax}
                  aria-label={`${p.label}: ${Math.round(value)} ${p.unit}`}
                />
              </div>
              <span role="cell" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textAlign: 'right', color: isElevated ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                {Math.round(value)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
