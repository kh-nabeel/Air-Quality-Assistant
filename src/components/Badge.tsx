import type { ReactNode, CSSProperties } from 'react';
import type { AqiCategory, BudgetTier, EffortLevel, EvidenceStrength } from '@/domain/types';

type BadgeVariant = 'default' | 'aqi' | 'cost' | 'effort' | 'evidence';

interface BadgeProps {
  readonly children: ReactNode;
  readonly variant?: BadgeVariant;
  readonly aqiCategory?: AqiCategory;
  readonly costTier?: BudgetTier;
  readonly effort?: EffortLevel;
  readonly evidence?: EvidenceStrength;
  readonly style?: CSSProperties;
}

/** AQI category to CSS color variable mapping */
const aqiColorMap: Record<AqiCategory, string> = {
  good: 'var(--color-aqi-good)',
  moderate: 'var(--color-aqi-moderate)',
  sensitive: 'var(--color-aqi-sensitive)',
  unhealthy: 'var(--color-aqi-unhealthy)',
  veryUnhealthy: 'var(--color-aqi-very-unhealthy)',
  hazardous: 'var(--color-aqi-hazardous)',
};

/** AQI category to pattern/icon for color-independence */
const aqiPatternMap: Record<AqiCategory, string> = {
  good: '✓',
  moderate: '~',
  sensitive: '!',
  unhealthy: '!!',
  veryUnhealthy: '‼',
  hazardous: '☠',
};

/** Design-system badge for labels, AQI categories, cost tiers, and evidence strength */
export function Badge({ children, variant = 'default', aqiCategory, costTier, effort, evidence, style }: BadgeProps) {
  let bg = 'var(--color-bg-secondary)';
  let color = 'var(--color-text-secondary)';
  let prefix = '';

  if (variant === 'aqi' && aqiCategory) {
    bg = aqiColorMap[aqiCategory];
    color = '#ffffff';
    prefix = aqiPatternMap[aqiCategory] + ' ';
  }

  if (variant === 'cost') {
    if (costTier === 'free') { bg = 'var(--color-success)'; color = '#ffffff'; }
    else if (costTier === 'low') { bg = 'var(--color-brand-accent)'; color = 'var(--color-text-primary)'; }
    else { bg = 'var(--color-brand-secondary)'; color = '#ffffff'; }
  }

  if (variant === 'effort') {
    if (effort === 'minimal') { bg = 'var(--color-brand-primary-light)'; color = 'var(--color-brand-primary)'; }
    else if (effort === 'moderate') { bg = 'var(--color-brand-accent)'; color = 'var(--color-text-primary)'; }
    else { bg = 'var(--color-brand-secondary)'; color = '#ffffff'; }
  }

  if (variant === 'evidence') {
    if (evidence === 'strong') { bg = 'var(--color-success)'; color = '#ffffff'; }
    else if (evidence === 'moderate') { bg = 'var(--color-brand-accent)'; color = 'var(--color-text-primary)'; }
    else { bg = 'var(--color-text-muted)'; color = '#ffffff'; }
  }

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-1) var(--space-3)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'lowercase' as const,
    background: bg,
    color,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <span style={badgeStyle}>
      {prefix}{children}
    </span>
  );
}
