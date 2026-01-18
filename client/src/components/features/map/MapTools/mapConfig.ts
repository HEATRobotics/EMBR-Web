// ========== MAP CONFIGURATION ==========

// Google Maps API Libraries
export const GOOGLE_MAPS_LIBRARIES: ('places')[] = ['places'];

// Map Zoom Levels
export const DEFAULT_ZOOM = 14;

// Default Map Center (UBCO Campus)
export const UBCO_COORDS: google.maps.LatLngLiteral = {
  lat: 49.939434,
  lng: -119.396427,
};

// Rectangle styling constants
export const RECTANGLE_STYLE = {
  strokeColor: '#2563eb',
  strokeOpacity: 0.8,
  strokeWeight: 3,
  fillColor: '#3b82f6',
  fillOpacity: 0.25,
};

/**
 * Get map options based on map type
 */
export const getMapOptions = (isSatelliteView: boolean): google.maps.MapOptions => ({
  streetViewControl: false,
  scaleControl: false,
  fullscreenControl: false,
  panControl: false,
  zoomControl: false,
  mapTypeControl: false,
  rotateControl: false,
  mapTypeId: isSatelliteView ? 'satellite' : 'roadmap',
});
