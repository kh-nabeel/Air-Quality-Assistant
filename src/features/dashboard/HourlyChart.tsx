import { useState } from 'react';
import type { HourlyAqiData, OutdoorWindow } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { classifyAqi } from '@/domain/classifyAqi';
import { formatTime, formatAqi } from '@/utils/format';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/Layout';
import { Sun, Table, BarChart3 } from 'lucide-react';

/** Section number displayed in the header. */
const SECTION_NUMBER = '03';

/** Maximum pixel height of a bar in the chart. */
const BAR_MAX_HEIGHT = 120;

/** AQI value used to cap the bar height calculation. */
const AQI_DISPLAY_MAX = 300;

/** Number of hourly entries to display. */
const DISPLAY_HOURS = 24;

/** Minimum bar height in pixels. */
const MIN_BAR_HEIGHT = 6;

/** Minimum bar width in pixels. */
const MIN_BAR_WIDTH = 20;

/** Font size for bar hour labels. */
const BAR_LABEL_FONT_SIZE = 9;

/** Extra vertical space below chart for labels. */
const CHART_LABEL_OFFSET = 36;

/** Gap between bars in pixels. */
const BAR_GAP = 3;

interface HourlyChartProps {
  readonly hourly: readonly HourlyAqiData[];
  readonly bestWindow: OutdoorWindow | null;
}

/** Component-scoped style definitions. */
const styles = {
  cardOuter: {
    border: '2.5px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-md)',
    background: '#ffffff',
  } satisfies React.CSSProperties,

  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
  } satisfies React.CSSProperties,

  bestWindowBadge: {
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
  } satisfies React.CSSProperties,

  sunIcon: {
    display: 'inline-flex',
    color: 'var(--color-brand-secondary)',
  } satisfies React.CSSProperties,

  noBestWindow: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
    marginBottom: 'var(--space-4)',
  } satisfies React.CSSProperties,

  tableWrapper: {
    overflowX: 'auto',
    border: '1.5px solid var(--color-bg-dark)',
    borderRadius: 'var(--radius-md)',
  } satisfies React.CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
  } satisfies React.CSSProperties,

  theadRow: {
    background: 'var(--color-bg-secondary)',
  } satisfies React.CSSProperties,

  thCell: {
    textAlign: 'left',
    padding: 'var(--space-2) var(--space-3)',
    borderBottom: '2px solid var(--color-bg-dark)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
  } satisfies React.CSSProperties,

  thCellRight: {
    textAlign: 'right',
    padding: 'var(--space-2) var(--space-3)',
    borderBottom: '2px solid var(--color-bg-dark)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
  } satisfies React.CSSProperties,

  tdCell: {
    padding: 'var(--space-2) var(--space-3)',
    borderBottom: '1px solid var(--color-border-light)',
  } satisfies React.CSSProperties,

  tdCellRight: {
    padding: 'var(--space-2) var(--space-3)',
    borderBottom: '1px solid var(--color-border-light)',
    textAlign: 'right',
  } satisfies React.CSSProperties,

  tdCellMono: {
    padding: 'var(--space-2) var(--space-3)',
    borderBottom: '1px solid var(--color-border-light)',
    textAlign: 'right',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
  } satisfies React.CSSProperties,

  tdCellMonoNormal: {
    padding: 'var(--space-2) var(--space-3)',
    borderBottom: '1px solid var(--color-border-light)',
    textAlign: 'right',
    fontFamily: 'var(--font-mono)',
  } satisfies React.CSSProperties,

  barChartContainer: {
    display: 'flex',
    gap: BAR_GAP,
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT + CHART_LABEL_OFFSET,
    overflowX: 'auto',
    padding: '12px 6px',
    background: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  barColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: '1 0 auto',
    minWidth: MIN_BAR_WIDTH,
  } satisfies React.CSSProperties,
} as const;

/**
 * Returns the row background for a table row based on best-window membership.
 * @param inWindow - Whether the row's time falls within the best window.
 * @returns Row-level CSS properties.
 */
function getTableRowStyle(inWindow: boolean): React.CSSProperties {
  return { background: inWindow ? '#FEF9C3' : undefined };
}

/**
 * Returns bar element styles based on AQI classification and window membership.
 * @param height - Computed bar height in pixels.
 * @param cssClass - AQI category CSS class name.
 * @param inWindow - Whether this bar falls in the best outdoor window.
 * @returns Bar-specific CSS properties.
 */
function getBarStyle(height: number, cssClass: string, inWindow: boolean): React.CSSProperties {
  return {
    width: '100%',
    height,
    borderRadius: '4px 4px 0 0',
    background: `var(--color-${cssClass})`,
    border: inWindow ? '2px solid #000000' : '1px solid rgba(0,0,0,0.3)',
    boxShadow: inWindow ? '0 0 6px rgba(0,0,0,0.4)' : 'none',
    transition: 'height var(--transition-normal)',
  };
}

/**
 * Returns the hour-label styles below each bar.
 * @param inWindow - Whether this hour falls in the best outdoor window.
 * @returns Label-specific CSS properties.
 */
function getBarLabelStyle(inWindow: boolean): React.CSSProperties {
  return {
    fontSize: BAR_LABEL_FONT_SIZE,
    color: inWindow ? '#000000' : 'var(--color-text-secondary)',
    fontWeight: inWindow ? 800 : 500,
    marginTop: 4,
    fontFamily: 'var(--font-mono)',
  };
}

/** Accessible bar chart with data-table toggle and best-window highlight. */
export function HourlyChart({ hourly, bestWindow }: HourlyChartProps): React.JSX.Element {
  const { t } = useTranslation();
  const [showTable, setShowTable] = useState(false);

  // Show only first 24 hours for display
  const displayHours = hourly.slice(0, DISPLAY_HOURS);

  const isInBestWindow = (time: string): boolean => {
    if (!bestWindow) return false;
    return time >= bestWindow.startTime && time <= bestWindow.endTime;
  };

  return (
    <Card variant="default" padding="md" style={styles.cardOuter}>
      <div style={styles.headerRow}>
        <SectionHeader number={SECTION_NUMBER} title={t.aqi.hourlyForecast} />
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
        <div style={styles.bestWindowBadge}>
          <span style={styles.sunIcon}>
            <Sun size={16} />
          </span>
          <span>
            {t.aqi.bestWindow}: {formatTime(bestWindow.startTime)} –{' '}
            {formatTime(bestWindow.endTime)} (AQI ~{bestWindow.avgAqi})
          </span>
        </div>
      )}
      {!bestWindow && <p style={styles.noBestWindow}>{t.aqi.noBestWindow}</p>}

      {showTable ? (
        /* Data table alternative */
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.thCell}>Time</th>
                <th style={styles.thCellRight}>AQI</th>
                <th style={styles.thCellRight}>PM2.5</th>
                <th style={styles.thCellRight}>Category</th>
              </tr>
            </thead>
            <tbody>
              {displayHours.map((h) => {
                const cls = classifyAqi(h.usAqi);
                const inWin = isInBestWindow(h.time);
                return (
                  <tr key={h.time} style={getTableRowStyle(inWin)}>
                    <td style={styles.tdCell}>{formatTime(h.time)}</td>
                    <td style={styles.tdCellMono}>{formatAqi(h.usAqi)}</td>
                    <td style={styles.tdCellMonoNormal}>{Math.round(h.pm25)}</td>
                    <td style={styles.tdCellRight}>{cls.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Bar chart */
        <div role="img" aria-label="Hourly AQI bar chart" style={styles.barChartContainer}>
          {displayHours.map((h) => {
            const cls = classifyAqi(h.usAqi);
            const height = Math.max(
              MIN_BAR_HEIGHT,
              (Math.min(h.usAqi, AQI_DISPLAY_MAX) / AQI_DISPLAY_MAX) * BAR_MAX_HEIGHT,
            );
            const inWindow = isInBestWindow(h.time);
            return (
              <div key={h.time} style={styles.barColumn}>
                <div
                  title={`${formatTime(h.time)}: AQI ${formatAqi(h.usAqi)} (${cls.label})`}
                  style={getBarStyle(height, cls.cssClass, inWindow)}
                />
                <span style={getBarLabelStyle(inWindow)}>{new Date(h.time).getHours()}h</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
