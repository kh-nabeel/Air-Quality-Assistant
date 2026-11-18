import type { ReactNode, CSSProperties } from 'react';
import type { AqiCategory, BudgetTier, EffortLevel, EvidenceStrength } from '@/domain/types';
import { Check, AlertCircle, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

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

function getAqiIcon(category: AqiCategory): ReactNode {
  switch (category) {
    case 'good':
      return <Check size={13} strokeWidth={2.5} />;
    case 'moderate':
      return <Activity size={13} strokeWidth={2.5} />;
    case 'sensitive':
      return <AlertCircle size={13} strokeWidth={2.5} />;
    case 'unhealthy':
    case 'veryUnhealthy':
      return <AlertTriangle size={13} strokeWidth={2.5} />;
    case 'hazardous':
      return <ShieldAlert size={13} strokeWidth={2.5} />;
  }
}

/** Design-system badge for labels, AQI categories, cost tiers, and evidence strength */
export function Badge({ children, variant = 'default', aqiCategory, costTier, effort, evidence, style }: BadgeProps) {
  let bg = 'var(--color-bg-secondary)';
  let color = 'var(--color-text-primary)';
  let icon: ReactNode = null;

  if (variant === 'aqi' && aqiCategory) {
    bg = aqiColorMap[aqiCategory];
    color = '#ffffff';
    icon = getAqiIcon(aqiCategory);
  }

  if (variant === 'cost') {
    if (costTier === 'free') { bg = '#10B981'; color = '#ffffff'; }
    else if (costTier === 'low') { bg = '#F59E0B'; color = '#000000'; }
    else { bg = '#3B82F6'; color = '#ffffff'; }
  }

  if (variant === 'effort') {
    if (effort === 'minimal') { bg = 'var(--color-brand-primary-light)'; color = 'var(--color-brand-primary)'; }
    else if (effort === 'moderate') { bg = '#FCD34D'; color = '#18181B'; }
    else { bg = '#F97316'; color = '#ffffff'; }
  }

  if (variant === 'evidence') {
    if (evidence === 'strong') { bg = '#059669'; color = '#ffffff'; }
    else if (evidence === 'moderate') { bg = '#D97706'; color = '#ffffff'; }
    else { bg = '#6B7280'; color = '#ffffff'; }
  }

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: '0.2rem 0.65rem',
    borderRadius: 'var(--radius-full)',
    border: '1.5px solid var(--color-bg-dark)',
    fontSize: 'var(--text-xs)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'lowercase' as const,
    background: bg,
    color,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    boxShadow: '1.5px 1.5px 0px rgba(0,0,0,0.8)',
    ...style,
  };

  return (
    <span style={badgeStyle}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
}
