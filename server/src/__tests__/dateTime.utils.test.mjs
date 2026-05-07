import { describe, it, expect } from 'vitest';
import { parseDateTime } from '../utils/dateTime.utils.mjs';

describe('DateTime Utils', () => {
  describe('parseDateTime', () => {
    it('should format a date to YYYY-MM-DD HH:MM:SS format', () => {
      const date = new Date('2024-01-15T14:30:45.000Z');
      const result = parseDateTime(date);
      
      expect(result).toBe('2024-01-15 14:30:45');
    });

    it('should pad single-digit months, days, hours, minutes, and seconds', () => {
      const date = new Date('2024-01-05T08:05:03.000Z');
      const result = parseDateTime(date);
      
      expect(result).toBe('2024-01-05 08:05:03');
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2024-06-15T00:00:00.000Z');
      const result = parseDateTime(date);
      
      expect(result).toBe('2024-06-15 00:00:00');
    });

    it('should handle end of day correctly', () => {
      const date = new Date('2024-12-31T23:59:59.000Z');
      const result = parseDateTime(date);
      
      expect(result).toBe('2024-12-31 23:59:59');
    });

    it('should use UTC time', () => {
      // Create a date that might have different local time
      const date = new Date('2024-07-04T12:00:00.000Z');
      const result = parseDateTime(date);
      
      // Should always be UTC time, not local
      expect(result).toBe('2024-07-04 12:00:00');
    });

    it('should handle leap year dates', () => {
      const date = new Date('2024-02-29T10:30:00.000Z');
      const result = parseDateTime(date);
      
      expect(result).toBe('2024-02-29 10:30:00');
    });
  });
});
