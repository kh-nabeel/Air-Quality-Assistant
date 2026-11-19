import type { AqiData } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/Layout';
import { Flame, Wind, Factory, Sun, CloudFog, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

/** Maximum percentage value for the progress bar clamp. */
const MAX_PERCENTAGE = 100;

/** Height in pixels for the pollutant progress bar. */
const BAR_HEIGHT_PX = 12;

/** Font size for the unit sub-label. */
const UNIT_FONT_SIZE = '10px';

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
  {
    key: 'pm25',
    label: 'PM2.5',
    name: 'Fine Particulates',
    unit: 'µg/m³',
    safeMax: 25,
    icon: <CloudFog size={16} />,
  },
  {
    key: 'pm10',
    label: 'PM10',
    name: 'Coarse Dust',
    unit: 'µg/m³',
    safeMax: 50,
    icon: <Wind size={16} />,
  },
  {
    key: 'no2',
    label: 'NO₂',
    name: 'Nitrogen Dioxide',
    unit: 'µg/m³',
    safeMax: 40,
    icon: <Factory size={16} />,
  },
  { key: 'o3', label: 'O₃', name: 'Ozone', unit: 'µg/m³', safeMax: 100, icon: <Sun size={16} /> },
  {
    key: 'so2',
    label: 'SO₂',
    name: 'Sulphur Dioxide',
    unit: 'µg/m³',
    safeMax: 40,
    icon: <Flame size={16} />,
  },
  {
    key: 'co',
    label: 'CO',
    name: 'Carbon Monoxide',
    unit: 'µg/m³',
    safeMax: 4000,
    icon: <Zap size={16} />,
  },
];

/** Component-scoped style definitions. */
const styles = {
  card: {
    border: '2.5px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-md)',
  } satisfies React.CSSProperties,

  grid: {
    display: 'grid',
    gap: 'var(--space-3)',
  } satisfies React.CSSProperties,

  labelCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  } satisfies React.CSSProperties,

  iconWrap: {
    display: 'inline-flex',
    padding: '4px',
    borderRadius: '6px',
    background: '#ffffff',
    border: '1px solid var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  pollutantLabel: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
    fontSize: 'var(--text-sm)',
  } satisfies React.CSSProperties,

  barTrack: {
    position: 'relative',
    height: BAR_HEIGHT_PX,
    background: '#ffffff',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    border: '1.5px solid var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  unitLabel: {
    fontSize: UNIT_FONT_SIZE,
    color: 'var(--color-text-muted)',
  } satisfies React.CSSProperties,
} as const;

/**
 * Builds the row style for a pollutant row, varying background for elevated values.
 * @param isElevated - Whether the pollutant concentration exceeds the safe threshold.
 * @returns CSS properties for the pollutant row.
 */
function rowStyle(isElevated: boolean): React.CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: '7.5rem 1fr 4.5rem',
    gap: 'var(--space-3)',
    alignItems: 'center',
    padding: 'var(--space-2) var(--space-3)',
    background: isElevated ? '#FEF2F2' : 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-bg-dark)',
  };
}

/**
 * Builds the bar fill style based on percentage and elevation state.
 * @param pct - The fill percentage (0–100).
 * @param isElevated - Whether the value exceeds the safe threshold.
 * @returns CSS properties for the bar fill element.
 */
function barFillStyle(pct: number, isElevated: boolean): React.CSSProperties {
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${Math.min(MAX_PERCENTAGE, pct)}%`,
    background: isElevated ? '#EF4444' : '#10B981',
    borderRadius: 'var(--radius-full)',
    transition: 'width var(--transition-normal)',
  };
}

/**
 * Builds the value cell style, varying color for elevated values.
 * @param isElevated - Whether the pollutant concentration exceeds the safe threshold.
 * @returns CSS properties for the value cell.
 */
function valueCellStyle(isElevated: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    fontWeight: 700,
    textAlign: 'right',
    color: isElevated ? 'var(--color-error)' : 'var(--color-bg-dark)',
  };
}

/** Pollutant breakdown grid with bar visualization. */
export function PollutantBreakdown({ aqi }: PollutantBreakdownProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Card variant="default" padding="md" style={styles.card}>
      <SectionHeader
        number="02"
        title={t.aqi.pollutants}
        subtitle="Concentration of airborne pollutants measured against WHO guideline thresholds"
      />
      <div role="table" aria-label="Pollutant levels" style={styles.grid}>
        {POLLUTANTS.map((p) => {
          const value = aqi[p.key] as number;
          const pct = Math.min(MAX_PERCENTAGE, (value / p.safeMax) * MAX_PERCENTAGE);
          const isElevated = pct > MAX_PERCENTAGE;
          return (
            <div key={p.key} role="row" style={rowStyle(isElevated)}>
              <div role="cell" style={styles.labelCell}>
                <span
                  style={{
                    ...styles.iconWrap,
                    color: isElevated ? 'var(--color-error)' : 'var(--color-brand-primary)',
                  }}
                >
                  {p.icon}
                </span>
                <span style={styles.pollutantLabel}>{p.label}</span>
              </div>
              <div role="cell" style={styles.barTrack}>
                <div
                  style={barFillStyle(pct, isElevated)}
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemax={p.safeMax}
                  aria-label={`${p.label}: ${Math.round(value)} ${p.unit}`}
                />
              </div>
              <span role="cell" style={valueCellStyle(isElevated)}>
                {Math.round(value)} <span style={styles.unitLabel}>{p.unit.split('/')[0]}</span>
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
