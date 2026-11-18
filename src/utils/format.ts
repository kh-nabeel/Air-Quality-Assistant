/** Format AQI value as a rounded integer string */
export function formatAqi(value: number): string {
  return Math.round(Math.max(0, value)).toString();
}

/**
 * Format an ISO timestamp to a localized time string.
 * Example: "2024-01-15T14:00" → "2:00 PM"
 */
export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

/** Format a decimal as a percentage string. Example: 0.35 → "35%" */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** Round coordinates to the given number of decimal places (default 2) */
export function roundCoordinates(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Format a date string for display */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

/** Generate a unique ID for chat messages */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
