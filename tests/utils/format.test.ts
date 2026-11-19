import { describe, it, expect } from 'vitest';
import {
  formatAqi,
  formatPercent,
  roundCoordinates,
  generateId,
  formatTime,
  formatDate,
} from '@/utils/format';

describe('formatAqi', () => {
  it('rounds decimal AQI to integer string', () => {
    expect(formatAqi(152.6)).toBe('153');
    expect(formatAqi(45.2)).toBe('45');
  });

  it('clamps negative values to 0', () => {
    expect(formatAqi(-10)).toBe('0');
  });
});

describe('formatPercent', () => {
  it('formats decimals as percentage strings', () => {
    expect(formatPercent(0.35)).toBe('35%');
    expect(formatPercent(0.678)).toBe('68%');
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('roundCoordinates', () => {
  it('rounds to specified decimal places', () => {
    expect(roundCoordinates(28.613928, 2)).toBe(28.61);
    expect(roundCoordinates(77.209021, 4)).toBe(77.209);
  });
});

describe('generateId', () => {
  it('generates unique non-empty string IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });
});

describe('formatTime and formatDate', () => {
  it('formats valid ISO strings without crashing', () => {
    const iso = '2026-11-19T10:00:00Z';
    expect(formatTime(iso)).toBeTruthy();
    expect(formatDate(iso)).toBeTruthy();
  });

  it('handles invalid strings gracefully by returning input', () => {
    expect(formatTime('invalid-date')).toBe('invalid-date');
    expect(formatDate('invalid-date')).toBe('invalid-date');
  });
});
