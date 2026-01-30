import { calculateRectangleArea, formatArea } from './calculateArea';

describe('calculateArea', () => {
  describe('calculateRectangleArea', () => {
    it('should calculate area for a small rectangle', () => {
      const bounds = {
        north: 40.01,
        south: 40.00,
        east: -105.00,
        west: -105.01,
      };
      
      const area = calculateRectangleArea(bounds);
      
      // Should be approximately 0.95 km²
      expect(area).toBeGreaterThan(0.9);
      expect(area).toBeLessThan(1.0);
    });

    it('should calculate area for a large rectangle', () => {
      const bounds = {
        north: 41.0,
        south: 40.0,
        east: -104.0,
        west: -105.0,
      };
      
      const area = calculateRectangleArea(bounds);
      
      // Should be approximately 9600 km² (roughly 96 km width × 111 km height)
      expect(area).toBeGreaterThan(9000);
      expect(area).toBeLessThan(10000);
    });

    it('should handle rectangles crossing the equator', () => {
      const bounds = {
        north: 1.0,
        south: -1.0,
        east: 1.0,
        west: -1.0,
      };
      
      const area = calculateRectangleArea(bounds);
      
      // Should be approximately 49,457 km² (roughly 222 km × 222 km at equator)
      expect(area).toBeGreaterThan(49000);
      expect(area).toBeLessThan(50000);
    });

    it('should return 0 for a zero-area rectangle', () => {
      const bounds = {
        north: 40.0,
        south: 40.0,
        east: -105.0,
        west: -105.0,
      };
      
      const area = calculateRectangleArea(bounds);
      
      expect(area).toBe(0);
    });

    it('should handle negative longitude correctly', () => {
      const bounds = {
        north: 40.01,
        south: 40.00,
        east: -105.00,
        west: -105.01,
      };
      
      const area = calculateRectangleArea(bounds);
      
      expect(area).toBeGreaterThan(0);
    });
  });

  describe('formatArea', () => {
    it('should format very small areas in square meters', () => {
      expect(formatArea(0.000001)).toBe('1 m²');
      expect(formatArea(0.005)).toBe('5000 m²');
    });

    it('should format small areas with 3 decimal places', () => {
      expect(formatArea(0.01)).toBe('0.010 km²');
      expect(formatArea(0.123)).toBe('0.123 km²');
      expect(formatArea(0.999)).toBe('0.999 km²');
    });

    it('should format large areas with 2 decimal places', () => {
      expect(formatArea(1.0)).toBe('1.00 km²');
      expect(formatArea(1.234)).toBe('1.23 km²');
      expect(formatArea(100.567)).toBe('100.57 km²');
      expect(formatArea(9876.543)).toBe('9876.54 km²');
    });

    it('should handle zero area', () => {
      expect(formatArea(0)).toBe('0 m²');
    });

    it('should handle boundary cases', () => {
      // Just under 0.01 km² threshold
      expect(formatArea(0.0099)).toBe('9900 m²');
      
      // Just at 0.01 km² threshold
      expect(formatArea(0.01)).toBe('0.010 km²');
      
      // Just under 1 km² threshold
      expect(formatArea(0.999)).toBe('0.999 km²');
      
      // Just at 1 km² threshold
      expect(formatArea(1.0)).toBe('1.00 km²');
    });
  });
});
