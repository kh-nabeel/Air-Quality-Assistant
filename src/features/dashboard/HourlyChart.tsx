import { useState } from 'react';
import type { HourlyAqiData, OutdoorWindow } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { classifyAqi } from '@/domain/classifyAqi';
import { formatTime, formatAqi } from '@/utils/format';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/Layout';

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
    <Card variant="default" padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <SectionHeader number="03" title={t.aqi.hourlyForecast} />
        <Button variant="ghost" size="sm" onClick={() => setShowTable(!showTable)}>
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
            background: 'var(--color-brand-primary-light)',
            border: '2px solid var(--color-brand-primary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            marginBottom: 'var(--space-4)',
          }}
        >
          <span aria-hidden="true">🌤</span>
          {t.aqi.bestWindow}: {formatTime(bestWindow.startTime)} – {formatTime(bestWindow.endTime)} (AQI ~{bestWindow.avgAqi})
        </div>
      )}
      {!bestWindow && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: 'var(--space-4)' }}>
          {t.aqi.noBestWindow}
        </p>
      )}

      {showTable ? (
        /* Data table alternative */
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', borderBottom: '2px solid var(--color-border)' }}>Time</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '2px solid var(--color-border)' }}>AQI</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '2px solid var(--color-border)' }}>PM2.5</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '2px solid var(--color-border)' }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {displayHours.map((h) => {
                const cls = classifyAqi(h.usAqi);
                return (
                  <tr
                    key={h.time}
                    style={{
                      background: isInBestWindow(h.time) ? 'var(--color-brand-primary-light)' : undefined,
                    }}
                  >
                    <td style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--color-border-light)' }}>{formatTime(h.time)}</td>
                    <td style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--color-border-light)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatAqi(h.usAqi)}</td>
                    <td style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--color-border-light)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{Math.round(h.pm25)}</td>
                    <td style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--color-border-light)', textAlign: 'right' }}>{cls.label}</td>
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
            gap: 2,
            alignItems: 'flex-end',
            height: BAR_MAX_HEIGHT + 30,
            overflowX: 'auto',
            paddingBottom: 24,
          }}
        >
          {displayHours.map((h) => {
            const cls = classifyAqi(h.usAqi);
            const height = Math.max(4, (Math.min(h.usAqi, AQI_DISPLAY_MAX) / AQI_DISPLAY_MAX) * BAR_MAX_HEIGHT);
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
                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                    background: `var(--color-${cls.cssClass})`,
                    border: inWindow ? '2px solid var(--color-brand-primary)' : 'none',
                    transition: 'height var(--transition-normal)',
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    color: 'var(--color-text-muted)',
                    marginTop: 2,
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {new Date(h.time).getHours()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
