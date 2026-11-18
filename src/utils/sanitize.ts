import { MAX_USER_INPUT_LENGTH } from '@/config/constants';

/**
 * Sanitize user input: trim, remove control characters, enforce max length.
 * Used before sending text to Gemini or displaying user content.
 */
export function sanitizeUserInput(input: string, maxLength = MAX_USER_INPUT_LENGTH): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, maxLength);
}

/** Validate that latitude is between -90 and 90 and longitude between -180 and 180 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/** Strip potential prompt-injection patterns from user text */
export function sanitizeForPrompt(input: string): string {
  const sanitized = sanitizeUserInput(input);
  // Remove XML-like tags that could interfere with our delimiters
  return sanitized.replace(/<\/?[a-zA-Z_][a-zA-Z0-9_-]*\s*\/?>/g, '');
}
