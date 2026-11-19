import { describe, it, expect } from 'vitest';
import { sanitizeUserInput, validateCoordinates, sanitizeForPrompt } from '@/utils/sanitize';

describe('sanitizeUserInput', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeUserInput('  hello world  ')).toBe('hello world');
  });

  it('removes non-printable control characters', () => {
    const dirty = 'hello\x00\x08\x1F world';
    expect(sanitizeUserInput(dirty)).toBe('hello world');
  });

  it('enforces maximum character length', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeUserInput(long, 50)).toHaveLength(50);
  });
});

describe('validateCoordinates', () => {
  it('accepts valid geographic coordinates', () => {
    expect(validateCoordinates(28.6139, 77.209)).toBe(true);
    expect(validateCoordinates(-90, -180)).toBe(true);
    expect(validateCoordinates(90, 180)).toBe(true);
    expect(validateCoordinates(0, 0)).toBe(true);
  });

  it('rejects out-of-range latitude', () => {
    expect(validateCoordinates(90.1, 0)).toBe(false);
    expect(validateCoordinates(-91, 0)).toBe(false);
  });

  it('rejects out-of-range longitude', () => {
    expect(validateCoordinates(0, 180.1)).toBe(false);
    expect(validateCoordinates(0, -181)).toBe(false);
  });

  it('rejects non-finite values', () => {
    expect(validateCoordinates(NaN, 0)).toBe(false);
    expect(validateCoordinates(0, Infinity)).toBe(false);
    expect(validateCoordinates(-Infinity, 0)).toBe(false);
  });
});

describe('sanitizeForPrompt', () => {
  it('strips XML-like tags to prevent prompt injection delimiter escape', () => {
    const prompt = 'Hello <user_data>malicious</user_data> world';
    expect(sanitizeForPrompt(prompt)).toBe('Hello malicious world');
  });

  it('handles self-closing tags', () => {
    const prompt = 'Test <br/> value <img src="x" />';
    expect(sanitizeForPrompt(prompt)).toBe('Test  value');
  });
});
