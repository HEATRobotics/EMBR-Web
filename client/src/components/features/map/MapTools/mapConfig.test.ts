import {
  GOOGLE_MAPS_LIBRARIES,
  DEFAULT_ZOOM,
  UBCO_COORDS,
  RECTANGLE_STYLE,
  getMapOptions,
} from './mapConfig';

describe('mapConfig', () => {
  describe('Constants', () => {
    it('should export GOOGLE_MAPS_LIBRARIES with places', () => {
      expect(GOOGLE_MAPS_LIBRARIES).toEqual(['places']);
    });

    it('should export DEFAULT_ZOOM as 14', () => {
      expect(DEFAULT_ZOOM).toBe(14);
    });

    it('should export UBCO_COORDS with correct lat/lng', () => {
      expect(UBCO_COORDS).toEqual({
        lat: 49.939434,
        lng: -119.396427,
      });
    });

    it('should export RECTANGLE_STYLE with correct styling', () => {
      expect(RECTANGLE_STYLE).toEqual({
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#3b82f6',
        fillOpacity: 0.25,
      });
    });
  });

  describe('getMapOptions', () => {
    it('should return roadmap options when isSatelliteView is false', () => {
      const options = getMapOptions(false);

      expect(options).toEqual({
        streetViewControl: false,
        scaleControl: false,
        fullscreenControl: false,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        rotateControl: false,
        mapTypeId: 'roadmap',
      });
    });

    it('should return satellite options when isSatelliteView is true', () => {
      const options = getMapOptions(true);

      expect(options).toEqual({
        streetViewControl: false,
        scaleControl: false,
        fullscreenControl: false,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        rotateControl: false,
        mapTypeId: 'satellite',
      });
    });
  });
});
