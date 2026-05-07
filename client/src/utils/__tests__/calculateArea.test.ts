import { describe, it, expect } from 'vitest';
import { calculateRectangleArea, formatArea } from '../calculateArea';

describe('calculateArea utilities', () => {
  describe('calculateRectangleArea', () => {
    it('should calculate area for a simple rectangle', () => {
      const bounds: google.maps.LatLngBoundsLiteral = {
        north: 50,
        south: 49,
        east: -119,
        west: -120,
      };

      const area = calculateRectangleArea(bounds);

      // The area should be positive and reasonable
      expect(area).toBeGreaterThan(0);
      expect(area).toBeLessThan(20000); // Should be less than 20,000 km²
    });

    it('should calculate zero area for a point', () => {
      const bounds: google.maps.LatLngBoundsLiteral = {
        north: 49.939434,
        south: 49.939434,
        east: -119.396427,
        west: -119.396427,
      };

      const area = calculateRectangleArea(bounds);

      expect(area).toBeCloseTo(0, 5);
    });

    it('should handle bounds crossing the equator', () => {
      const bounds: google.maps.LatLngBoundsLiteral = {
        north: 1,
        south: -1,
        east: 1,
        west: -1,
      };

      const area = calculateRectangleArea(bounds);

      expect(area).toBeGreaterThan(0);
    });

    it('should calculate consistent areas for same-sized rectangles at different latitudes', () => {
      // Rectangle at high latitude
      const boundsHigh: google.maps.LatLngBoundsLiteral = {
        north: 60,
        south: 59,
        east: 0,
        west: -1,
      };

      // Rectangle at low latitude (same degree differences)
      const boundsLow: google.maps.LatLngBoundsLiteral = {
        north: 1,
        south: 0,
        east: 0,
        west: -1,
      };

      const areaHigh = calculateRectangleArea(boundsHigh);
      const areaLow = calculateRectangleArea(boundsLow);

      // Area at higher latitude should be smaller due to Earth's curvature
      expect(areaHigh).toBeLessThan(areaLow);
    });

    it('should handle negative coordinates', () => {
      const bounds: google.maps.LatLngBoundsLiteral = {
        north: -30,
        south: -31,
        east: -60,
        west: -61,
      };

      const area = calculateRectangleArea(bounds);

      expect(area).toBeGreaterThan(0);
    });
  });

  describe('formatArea', () => {
    it('should format very small areas in square meters', () => {
      const result = formatArea(0.000001); // Very small area
      expect(result).toContain('m²');
      expect(result).toContain('1');
    });

    it('should format small areas with 3 decimal places', () => {
      const result = formatArea(0.123);
      expect(result).toBe('0.123 km²');
    });

    it('should format medium areas with 2 decimal places', () => {
      const result = formatArea(12.3456);
      expect(result).toBe('12.35 km²');
    });

    it('should format large areas with 2 decimal places', () => {
      const result = formatArea(1234.5678);
      expect(result).toBe('1234.57 km²');
    });

    it('should handle zero area', () => {
      const result = formatArea(0);
      expect(result).toContain('m²');
    });

    it('should handle boundary cases', () => {
      // Just below 0.01 km²
      expect(formatArea(0.009)).toContain('m²');
      
      // Just above 0.01 km²
      expect(formatArea(0.011)).toContain('km²');
      
      // Just below 1 km²
      expect(formatArea(0.999)).toMatch(/0\.\d{3} km²/);
      
      // Exactly 1 km²
      expect(formatArea(1.0)).toBe('1.00 km²');
    });
  });
});
