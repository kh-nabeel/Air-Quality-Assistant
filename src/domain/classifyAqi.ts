import type { AqiCategory, AqiClassification } from './types';
import { AQI_BREAKPOINTS } from '@/config/constants';

const { GOOD_MAX, MODERATE_MAX, SENSITIVE_MAX, UNHEALTHY_MAX, VERY_UNHEALTHY_MAX } =
  AQI_BREAKPOINTS;

/** AQI classification lookup table (US EPA standard) */
const CLASSIFICATIONS: readonly AqiClassification[] = [
  {
    category: 'good',
    label: 'Good',
    description: 'Air quality is satisfactory. Little or no health risk.',
    cssClass: 'aqi-good',
    iconName: 'check-circle',
    min: 0,
    max: GOOD_MAX,
  },
  {
    category: 'moderate',
    label: 'Moderate',
    description:
      'Air quality is acceptable. Some pollutants may concern unusually sensitive people.',
    cssClass: 'aqi-moderate',
    iconName: 'info',
    min: GOOD_MAX + 1,
    max: MODERATE_MAX,
  },
  {
    category: 'sensitive',
    label: 'Unhealthy for Sensitive Groups',
    description:
      'Members of sensitive groups may experience health effects. General public is less likely to be affected.',
    cssClass: 'aqi-sensitive',
    iconName: 'alert-triangle',
    min: MODERATE_MAX + 1,
    max: SENSITIVE_MAX,
  },
  {
    category: 'unhealthy',
    label: 'Unhealthy',
    description:
      'Everyone may begin to experience health effects. Sensitive groups may experience more serious effects.',
    cssClass: 'aqi-unhealthy',
    iconName: 'alert-circle',
    min: SENSITIVE_MAX + 1,
    max: UNHEALTHY_MAX,
  },
  {
    category: 'veryUnhealthy',
    label: 'Very Unhealthy',
    description: 'Health alert: everyone may experience more serious health effects.',
    cssClass: 'aqi-very-unhealthy',
    iconName: 'alert-octagon',
    min: UNHEALTHY_MAX + 1,
    max: VERY_UNHEALTHY_MAX,
  },
  {
    category: 'hazardous',
    label: 'Hazardous',
    description:
      'Health warning of emergency conditions. The entire population is likely to be affected.',
    cssClass: 'aqi-hazardous',
    iconName: 'skull',
    min: VERY_UNHEALTHY_MAX + 1,
    max: 500,
  },
] as const;

/**
 * Classify an AQI value into an EPA category with label, description, and styling info.
 *
 * @param value - US AQI value (0–500+)
 * @returns Classification with category, label, description, CSS class, and icon
 */
export function classifyAqi(value: number): AqiClassification {
  const clamped = Math.max(0, Math.round(value));

  for (const classification of CLASSIFICATIONS) {
    if (clamped <= classification.max) {
      return classification;
    }
  }

  // Values above 500 are still hazardous
  return CLASSIFICATIONS[CLASSIFICATIONS.length - 1]!;
}

/** Get the CSS class name for a given AQI category */
export function getAqiCssClass(category: AqiCategory): string {
  const match = CLASSIFICATIONS.find((c) => c.category === category);
  return match?.cssClass ?? 'aqi-good';
}
