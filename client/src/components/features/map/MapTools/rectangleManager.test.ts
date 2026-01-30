import { coordinatesToBounds, removeRectangle } from './rectangleManager';
import { CoordinatesType } from '@/types/coordinate.type';

describe('rectangleManager', () => {
  describe('coordinatesToBounds', () => {
    it('should convert coordinates to bounds correctly when northWest is actually NW', () => {
      const northWest: CoordinatesType = { lat: 50, lng: -120 };
      const southEast: CoordinatesType = { lat: 49, lng: -119 };

      const result = coordinatesToBounds(northWest, southEast);

      expect(result).toEqual({
        north: 50,
        south: 49,
        west: -120,
        east: -119,
      });
    });

    it('should handle coordinates in any order (swap if needed)', () => {
      const coord1: CoordinatesType = { lat: 49, lng: -119 };
      const coord2: CoordinatesType = { lat: 50, lng: -120 };

      const result = coordinatesToBounds(coord1, coord2);

      expect(result.north).toBe(50);
      expect(result.south).toBe(49);
      expect(result.west).toBe(-120);
      expect(result.east).toBe(-119);
    });

    it('should handle same latitude values', () => {
      const coord1: CoordinatesType = { lat: 49.5, lng: -120 };
      const coord2: CoordinatesType = { lat: 49.5, lng: -119 };

      const result = coordinatesToBounds(coord1, coord2);

      expect(result.north).toBe(49.5);
      expect(result.south).toBe(49.5);
    });

    it('should handle same longitude values', () => {
      const coord1: CoordinatesType = { lat: 50, lng: -119.5 };
      const coord2: CoordinatesType = { lat: 49, lng: -119.5 };

      const result = coordinatesToBounds(coord1, coord2);

      expect(result.west).toBe(-119.5);
      expect(result.east).toBe(-119.5);
    });

    it('should handle positive longitude values', () => {
      const coord1: CoordinatesType = { lat: 50, lng: 10 };
      const coord2: CoordinatesType = { lat: 49, lng: 20 };

      const result = coordinatesToBounds(coord1, coord2);

      expect(result.west).toBe(10);
      expect(result.east).toBe(20);
    });

    it('should handle coordinates crossing the equator', () => {
      const coord1: CoordinatesType = { lat: 5, lng: 0 };
      const coord2: CoordinatesType = { lat: -5, lng: 10 };

      const result = coordinatesToBounds(coord1, coord2);

      expect(result.north).toBe(5);
      expect(result.south).toBe(-5);
      expect(result.west).toBe(0);
      expect(result.east).toBe(10);
    });
  });

  describe('removeRectangle', () => {
    it('should call setMap(null) on rectangle when rectangle exists', () => {
      const mockRectangle = {
        setMap: jest.fn(),
      } as unknown as google.maps.Rectangle;

      removeRectangle(mockRectangle);

      expect(mockRectangle.setMap).toHaveBeenCalledWith(null);
      expect(mockRectangle.setMap).toHaveBeenCalledTimes(1);
    });

    it('should handle null rectangle gracefully', () => {
      expect(() => removeRectangle(null)).not.toThrow();
    });

    it('should not throw error when called with null', () => {
      const result = removeRectangle(null);
      expect(result).toBeUndefined();
    });
  });
});
