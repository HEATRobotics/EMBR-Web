import {
  isISOFormat,
  convertISOToTimestamp,
  normalizeTimeField,
} from './DateTimeConversion';

describe('DateTimeConversion', () => {
  describe('isISOFormat', () => {
    it('should return true for valid ISO 8601 format strings', () => {
      expect(isISOFormat('2024-01-15T10:30:00Z')).toBe(true);
      expect(isISOFormat('2024-12-31T23:59:59Z')).toBe(true);
      expect(isISOFormat('2024-06-15T14:30:45.123Z')).toBe(true);
    });

    it('should return false for non-ISO format strings', () => {
      expect(isISOFormat('2024-01-15 10:30:00')).toBe(false);
      expect(isISOFormat('2024-01-15')).toBe(false);
      expect(isISOFormat('10:30:00')).toBe(false);
    });

    it('should return false for strings without T separator', () => {
      expect(isISOFormat('2024-01-15 10:30:00Z')).toBe(false);
    });

    it('should return false for strings without Z suffix', () => {
      expect(isISOFormat('2024-01-15T10:30:00')).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      expect(isISOFormat(null)).toBe(false);
      expect(isISOFormat(undefined)).toBe(false);
      expect(isISOFormat(123)).toBe(false);
      expect(isISOFormat({})).toBe(false);
      expect(isISOFormat([])).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isISOFormat('')).toBe(false);
    });
  });

  describe('convertISOToTimestamp', () => {
    it('should convert ISO 8601 format to SQL timestamp format', () => {
      expect(convertISOToTimestamp('2024-01-15T10:30:00Z')).toBe('2024-01-15 10:30:00');
      expect(convertISOToTimestamp('2024-12-31T23:59:59Z')).toBe('2024-12-31 23:59:59');
    });

    it('should handle ISO format with milliseconds', () => {
      expect(convertISOToTimestamp('2024-06-15T14:30:45.123Z')).toBe('2024-06-15 14:30:45');
    });

    it('should convert by replacing T with space and removing Z and beyond', () => {
      expect(convertISOToTimestamp('2024-03-20T08:15:30.500Z')).toBe('2024-03-20 08:15:30');
    });

    it('should handle midnight correctly', () => {
      expect(convertISOToTimestamp('2024-01-01T00:00:00Z')).toBe('2024-01-01 00:00:00');
    });

    it('should handle end of day correctly', () => {
      expect(convertISOToTimestamp('2024-12-31T23:59:59Z')).toBe('2024-12-31 23:59:59');
    });
  });

  describe('normalizeTimeField', () => {
    it('should return null for null input', () => {
      expect(normalizeTimeField(null)).toBe(null);
    });

    it('should return null for undefined input', () => {
      expect(normalizeTimeField(undefined)).toBe(null);
    });

    it('should return null for empty string', () => {
      expect(normalizeTimeField('')).toBe(null);
    });

    it('should convert ISO format to timestamp format', () => {
      expect(normalizeTimeField('2024-01-15T10:30:00Z')).toBe('2024-01-15 10:30:00');
      expect(normalizeTimeField('2024-12-31T23:59:59Z')).toBe('2024-12-31 23:59:59');
    });

    it('should return timestamp format unchanged', () => {
      expect(normalizeTimeField('2024-01-15 10:30:00')).toBe('2024-01-15 10:30:00');
      expect(normalizeTimeField('2024-12-31 23:59:59')).toBe('2024-12-31 23:59:59');
    });

    it('should handle date-only strings', () => {
      expect(normalizeTimeField('2024-01-15')).toBe('2024-01-15');
    });

    it('should handle ISO format with milliseconds', () => {
      expect(normalizeTimeField('2024-06-15T14:30:45.123Z')).toBe('2024-06-15 14:30:45');
    });

    it('should return null for numeric 0', () => {
      expect(normalizeTimeField(0)).toBe(null);
    });

    it('should handle non-date strings', () => {
      expect(normalizeTimeField('some random string')).toBe('some random string');
    });
  });
});
