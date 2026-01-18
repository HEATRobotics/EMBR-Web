import { CoordinatesType } from '@/types/coordinate.type';
import { RECTANGLE_STYLE } from './mapConfig';

/**
 * Create an editable rectangle on the map
 */
export const createRectangle = (
  bounds: google.maps.LatLngBoundsLiteral,
  map: google.maps.Map,
  onBoundsChange: (northWest: CoordinatesType, southEast: CoordinatesType) => void
): google.maps.Rectangle => {
  const rectangle = new google.maps.Rectangle({
    bounds,
    map,
    editable: true,
    draggable: true,
    ...RECTANGLE_STYLE,
  });

  // Listen for bounds changes from user interaction
  rectangle.addListener('bounds_changed', () => {
    const newBounds = rectangle.getBounds();
    if (newBounds) {
      const ne = newBounds.getNorthEast();
      const sw = newBounds.getSouthWest();
      onBoundsChange(
        { lat: ne.lat(), lng: sw.lng() },
        { lat: sw.lat(), lng: ne.lng() }
      );
    }
  });

  return rectangle;
};

/**
 * Update rectangle bounds if they have changed significantly
 */
export const updateRectangleBounds = (
  rectangle: google.maps.Rectangle,
  bounds: google.maps.LatLngBoundsLiteral
): boolean => {
  const currentBounds = rectangle.getBounds();
  if (!currentBounds) return false;

  const ne = currentBounds.getNorthEast();
  const sw = currentBounds.getSouthWest();

  // Only update if bounds have actually changed to avoid infinite loops
  if (
    Math.abs(ne.lat() - bounds.north) > 0.000001 ||
    Math.abs(sw.lat() - bounds.south) > 0.000001 ||
    Math.abs(sw.lng() - bounds.west) > 0.000001 ||
    Math.abs(ne.lng() - bounds.east) > 0.000001
  ) {
    rectangle.setBounds(bounds);
    return true;
  }
  return false;
};

/**
 * Convert coordinates to LatLngBoundsLiteral
 */
export const coordinatesToBounds = (
  northWest: CoordinatesType,
  southEast: CoordinatesType
): google.maps.LatLngBoundsLiteral => {
  return {
    north: Math.max(northWest.lat, southEast.lat),
    south: Math.min(northWest.lat, southEast.lat),
    west: Math.min(northWest.lng, southEast.lng),
    east: Math.max(northWest.lng, southEast.lng),
  };
};

/**
 * Remove rectangle from map and cleanup
 */
export const removeRectangle = (rectangle: google.maps.Rectangle | null): void => {
  if (rectangle) {
    rectangle.setMap(null);
  }
};
