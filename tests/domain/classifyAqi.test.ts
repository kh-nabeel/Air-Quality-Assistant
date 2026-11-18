import { describe, it, expect } from 'vitest';
import { classifyAqi, getAqiCssClass } from '../../src/domain/classifyAqi';

describe('classifyAqi', () => {
  it('classifies AQI 0 as good', () => {
    const result = classifyAqi(0);
    expect(result.category).toBe('good');
    expect(result.label).toBe('Good');
  });

  it('classifies AQI 50 as good (boundary)', () => {
    expect(classifyAqi(50).category).toBe('good');
  });

  it('classifies AQI 51 as moderate', () => {
    expect(classifyAqi(51).category).toBe('moderate');
  });

  it('classifies AQI 100 as moderate (boundary)', () => {
    expect(classifyAqi(100).category).toBe('moderate');
  });

  it('classifies AQI 101 as sensitive', () => {
    expect(classifyAqi(101).category).toBe('sensitive');
  });

  it('classifies AQI 150 as sensitive (boundary)', () => {
    expect(classifyAqi(150).category).toBe('sensitive');
  });

  it('classifies AQI 151 as unhealthy', () => {
    expect(classifyAqi(151).category).toBe('unhealthy');
  });

  it('classifies AQI 200 as unhealthy (boundary)', () => {
    expect(classifyAqi(200).category).toBe('unhealthy');
  });

  it('classifies AQI 201 as veryUnhealthy', () => {
    expect(classifyAqi(201).category).toBe('veryUnhealthy');
  });

  it('classifies AQI 300 as veryUnhealthy (boundary)', () => {
    expect(classifyAqi(300).category).toBe('veryUnhealthy');
  });

  it('classifies AQI 301 as hazardous', () => {
    expect(classifyAqi(301).category).toBe('hazardous');
  });

  it('classifies AQI 500 as hazardous', () => {
    expect(classifyAqi(500).category).toBe('hazardous');
  });

  it('classifies AQI above 500 as hazardous', () => {
    expect(classifyAqi(999).category).toBe('hazardous');
  });

  it('rounds fractional AQI values', () => {
    expect(classifyAqi(50.4).category).toBe('good');
    expect(classifyAqi(50.5).category).toBe('moderate');
  });

  it('clamps negative AQI to 0', () => {
    expect(classifyAqi(-10).category).toBe('good');
  });

  it('returns cssClass for each category', () => {
    expect(classifyAqi(25).cssClass).toBe('aqi-good');
    expect(classifyAqi(75).cssClass).toBe('aqi-moderate');
    expect(classifyAqi(125).cssClass).toBe('aqi-sensitive');
    expect(classifyAqi(175).cssClass).toBe('aqi-unhealthy');
    expect(classifyAqi(250).cssClass).toBe('aqi-very-unhealthy');
    expect(classifyAqi(400).cssClass).toBe('aqi-hazardous');
  });

  it('returns iconName for each category', () => {
    expect(classifyAqi(25).iconName).toBe('check-circle');
    expect(classifyAqi(400).iconName).toBe('skull');
  });
});

describe('getAqiCssClass', () => {
  it('returns correct class for good', () => {
    expect(getAqiCssClass('good')).toBe('aqi-good');
  });

  it('returns correct class for hazardous', () => {
    expect(getAqiCssClass('hazardous')).toBe('aqi-hazardous');
  });

  it('falls back to aqi-good for unknown category', () => {
    expect(getAqiCssClass('unknown' as never)).toBe('aqi-good');
  });
});
