import { MAX_USER_INPUT_LENGTH } from '@/config/constants';

/** Regular expression matching ASCII control characters (excluding standard whitespace). */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/** Regular expression matching XML-like tags (including attributes) that could interfere with prompt delimiters. */
const XML_TAG_RE = /<\/?[a-zA-Z_][^>]*>/g;

/**
 * Sanitize user input: trim, remove control characters, enforce max length.
 * Used before sending text to Gemini or displaying user content.
 *
 * @param input - Raw user input string.
 * @param maxLength - Maximum allowed character length (defaults to {@link MAX_USER_INPUT_LENGTH}).
 * @returns Sanitized string safe for display and API consumption.
 */
export function sanitizeUserInput(input: string, maxLength = MAX_USER_INPUT_LENGTH): string {
  return input.trim().replace(CONTROL_CHARS_RE, '').slice(0, maxLength);
}

/**
 * Validate that geographic coordinates fall within valid ranges.
 *
 * @param lat - Latitude value (must be between -90 and 90 inclusive).
 * @param lng - Longitude value (must be between -180 and 180 inclusive).
 * @returns `true` if both coordinates are finite and within valid bounds.
 */
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

/**
 * Strip potential prompt-injection patterns from user text before sending to Gemini.
 * Removes XML-like tags that could interfere with system prompt delimiters.
 *
 * @param input - Raw user input string.
 * @returns Sanitized string safe for inclusion in LLM prompts.
 */
export function sanitizeForPrompt(input: string): string {
  const sanitized = sanitizeUserInput(input);
  return sanitized.replace(XML_TAG_RE, '').trim();
}
