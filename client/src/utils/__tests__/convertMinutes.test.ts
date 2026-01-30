import { describe, it, expect } from 'vitest';
import { convertMinutes } from '../convertMinutes';

describe('convertMinutes', () => {
  it('should convert minutes only', () => {
    expect(convertMinutes(30)).toBe('30 min');
    expect(convertMinutes(1)).toBe('1 min');
    expect(convertMinutes(59)).toBe('59 min');
  });

  it('should convert hours and minutes', () => {
    expect(convertMinutes(60)).toBe('1 hours 0 min');
    expect(convertMinutes(90)).toBe('1 hours 30 min');
    expect(convertMinutes(120)).toBe('2 hours 0 min');
    expect(convertMinutes(125)).toBe('2 hours 5 min');
  });

  it('should convert days, hours, and minutes', () => {
    expect(convertMinutes(1440)).toBe('1 days 0 hours 0 min');
    expect(convertMinutes(1500)).toBe('1 days 1 hours 0 min');
    expect(convertMinutes(1555)).toBe('1 days 1 hours 55 min');
    expect(convertMinutes(2880)).toBe('2 days 0 hours 0 min');
  });

  it('should handle zero', () => {
    expect(convertMinutes(0)).toBe('0 min');
  });

  it('should round minutes correctly', () => {
    // Test rounding behavior
    expect(convertMinutes(60.4)).toBe('1 hours 0 min');
    expect(convertMinutes(60.5)).toBe('1 hours 1 min');
    expect(convertMinutes(60.9)).toBe('1 hours 1 min');
  });

  it('should handle large values', () => {
    expect(convertMinutes(10080)).toBe('7 days 0 hours 0 min'); // 1 week
    expect(convertMinutes(43200)).toBe('30 days 0 hours 0 min'); // ~1 month
  });

  it('should handle edge cases near boundaries', () => {
    expect(convertMinutes(59.9)).toBe('60 min'); // Rounds up to 60 minutes
    expect(convertMinutes(1439)).toBe('23 hours 59 min');
    expect(convertMinutes(1441)).toBe('1 days 0 hours 1 min');
  });
});
