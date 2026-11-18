import { useState } from 'react';
import type { HourlyAqiData, OutdoorWindow } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { classifyAqi } from '@/domain/classifyAqi';
import { formatTime, formatAqi } from '@/utils/format';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/Layout';
import { Sun, Table, BarChart3 } from 'lucide-react';

interface HourlyChartProps {
  readonly hourly: readonly HourlyAqiData[];
  readonly bestWindow: OutdoorWindow | null;
}

const BAR_MAX_HEIGHT = 120;
const AQI_DISPLAY_MAX = 300;

/** Accessible bar chart with data-table toggle and best-window highlight */
export function HourlyChart({ hourly, bestWindow }: HourlyChartProps) {
  const { t } = useTranslation();
  const [showTable, setShowTable] = useState(false);

  // Show only first 24 hours for display
  const displayHours = hourly.slice(0, 24);

  const isInBestWindow = (time: string): boolean => {
    if (!bestWindow) return false;
    return time >= bestWindow.startTime && time <= bestWindow.endTime;
  };

  return (
    <Card
      variant="default"
      padding="md"
      style={{
        border: '2.5px solid var(--color-bg-dark)',
        boxShadow: 'var(--shadow-md)',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <SectionHeader number="03" title={t.aqi.hourlyForecast} />
        <Button
          variant="ghost"
          size="sm"
          icon={showTable ? <BarChart3 size={15} /> : <Table size={15} />}
          onClick={() => setShowTable(!showTable)}
        >
          {showTable ? t.aqi.hourlyForecast : t.aqi.viewAsTable}
        </Button>
      </div>

      {/* Best window badge */}
      {bestWindow && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            background: '#FEF08A',
            border: '2px solid var(--color-bg-dark)',
            boxShadow: '2px 2px 0px var(--color-bg-dark)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            color: 'var(--color-bg-dark)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span style={{ display: 'inline-flex', color: 'var(--color-brand-secondary)' }}>
            <Sun size={16} />
          </span>
          <span>
            {t.aqi.bestWindow}: {formatTime(bestWindow.startTime)} – {formatTime(bestWindow.endTime)} (AQI ~{bestWindow.avgAqi})
          </span>
        </div>
      )}
      {!bestWindow && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: 'var(--space-4)' }}>
          {t.aqi.noBestWindow}
        </p>
      )}

      {showTable ? (
        /* Data table alternative */
        <div style={{ overflowX: 'auto', border: '1.5px solid var(--color-bg-dark)', borderRadius: 'var(--radius-md)' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--color-bg-secondary)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', borderBottom: '2px solid var(--color-bg-dark)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Time</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2) var(--space-3)', borderBottom: '2px solid var(--color-bg-dark)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>AQI</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2) var(--space-3)', borderBottom: '2px solid var(--color-bg-dark)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>PM2.5</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2) var(--space-3)', borderBottom: '2px solid var(--color-bg-dark)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {displayHours.map((h) => {
                const cls = classifyAqi(h.usAqi);
                const inWin = isInBestWindow(h.time);
                return (
                  <tr
                    key={h.time}
                    style={{
                      background: inWin ? '#FEF9C3' : undefined,
                    }}
                  >
                    <td style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border-light)' }}>{formatTime(h.time)}</td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border-light)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatAqi(h.usAqi)}</td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border-light)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{Math.round(h.pm25)}</td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border-light)', textAlign: 'right' }}>{cls.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Bar chart */
        <div
          role="img"
          aria-label="Hourly AQI bar chart"
          style={{
            display: 'flex',
            gap: 3,
            alignItems: 'flex-end',
            height: BAR_MAX_HEIGHT + 36,
            overflowX: 'auto',
            padding: '12px 6px',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--color-bg-dark)',
          }}
        >
          {displayHours.map((h) => {
            const cls = classifyAqi(h.usAqi);
            const height = Math.max(6, (Math.min(h.usAqi, AQI_DISPLAY_MAX) / AQI_DISPLAY_MAX) * BAR_MAX_HEIGHT);
            const inWindow = isInBestWindow(h.time);
            return (
              <div
                key={h.time}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: '1 0 auto',
                  minWidth: 20,
                }}
              >
                <div
                  title={`${formatTime(h.time)}: AQI ${formatAqi(h.usAqi)} (${cls.label})`}
                  style={{
                    width: '100%',
                    height,
                    borderRadius: '4px 4px 0 0',
                    background: `var(--color-${cls.cssClass})`,
                    border: inWindow ? '2px solid #000000' : '1px solid rgba(0,0,0,0.3)',
                    boxShadow: inWindow ? '0 0 6px rgba(0,0,0,0.4)' : 'none',
                    transition: 'height var(--transition-normal)',
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    color: inWindow ? '#000000' : 'var(--color-text-secondary)',
                    fontWeight: inWindow ? 800 : 500,
                    marginTop: 4,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {new Date(h.time).getHours()}h
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
