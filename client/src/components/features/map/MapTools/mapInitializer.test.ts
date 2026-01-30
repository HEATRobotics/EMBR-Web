import { calculateBoundsFromData, initializeMapView } from './mapInitializer';
import { RobotType } from '@/types/robot.type';
import { MissionType } from '@/types/mission.type';
import { UBCO_COORDS, DEFAULT_ZOOM } from './mapConfig';

describe('mapInitializer', () => {
  describe('calculateBoundsFromData', () => {
    // Mock google.maps.LatLngBounds
    let mockBounds: any;
    let extendCalls: any[];

    beforeEach(() => {
      extendCalls = [];
      mockBounds = {
        extend: jest.fn((point) => extendCalls.push(point)),
      };
      global.google = {
        maps: {
          LatLngBounds: jest.fn(() => mockBounds) as any,
        } as any,
      } as any;
    });

    it('should return bounds with no points when no data provided', () => {
      const result = calculateBoundsFromData();

      expect(result.hasPoints).toBe(false);
      expect(extendCalls).toHaveLength(0);
    });

    it('should return bounds with no points for empty arrays', () => {
      const result = calculateBoundsFromData([], []);

      expect(result.hasPoints).toBe(false);
      expect(extendCalls).toHaveLength(0);
    });

    it('should add bot coordinates to bounds', () => {
      const bots: RobotType[] = [
        {
          id: 1,
          name: 'Bot 1',
          coordinates: { lat: 49.5, lng: -119.5, alt: 100 },
          assignmentStatus: 'ready',
          operationalStatus: 'operational',
          battery: 80,
          lastMove: '',
          gx: 0,
          gy: 0,
          gz: 0,
          lat: 49.5,
          lng: -119.5,
          heading: 0,
        },
        {
          id: 2,
          name: 'Bot 2',
          coordinates: { lat: 50.0, lng: -120.0, alt: 100 },
          assignmentStatus: 'assigned',
          operationalStatus: 'operational',
          battery: 75,
          lastMove: '',
          gx: 0,
          gy: 0,
          gz: 0,
          lat: 50.0,
          lng: -120.0,
          heading: 0,
        },
      ];

      const result = calculateBoundsFromData(bots);

      expect(result.hasPoints).toBe(true);
      expect(extendCalls).toHaveLength(2);
      expect(extendCalls[0]).toEqual({ lat: 49.5, lng: -119.5, alt: 100 });
      expect(extendCalls[1]).toEqual({ lat: 50.0, lng: -120.0, alt: 100 });
    });

    it('should add mission area coordinates to bounds', () => {
      const missions: MissionType[] = [
        {
          missionID: 1,
          missionName: 'Mission 1',
          progress: 50,
          averageTemperature: 25,
          timePassed: 120,
          timeEstimated: 240,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: [
            { lat: 51, lng: -121 },
            { lat: 50, lng: -120 },
          ],
          assignedBots: [],
          hotspots: [],
        },
      ];

      const result = calculateBoundsFromData(undefined, missions);

      expect(result.hasPoints).toBe(true);
      expect(extendCalls).toHaveLength(2);
      expect(extendCalls[0]).toEqual({ lat: 51, lng: -121 });
      expect(extendCalls[1]).toEqual({ lat: 50, lng: -120 });
    });

    it('should combine bot and mission coordinates', () => {
      const bots: RobotType[] = [
        {
          id: 1,
          name: 'Bot 1',
          coordinates: { lat: 49.5, lng: -119.5, alt: 100 },
          assignmentStatus: 'ready',
          operationalStatus: 'operational',
          battery: 80,
          lastMove: '',
          gx: 0,
          gy: 0,
          gz: 0,
          lat: 49.5,
          lng: -119.5,
          heading: 0,
        },
      ];

      const missions: MissionType[] = [
        {
          missionID: 1,
          missionName: 'Mission 1',
          progress: 50,
          averageTemperature: 25,
          timePassed: 120,
          timeEstimated: 240,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: [
            { lat: 51, lng: -121 },
            { lat: 50, lng: -120 },
          ],
          assignedBots: [],
          hotspots: [],
        },
      ];

      const result = calculateBoundsFromData(bots, missions);

      expect(result.hasPoints).toBe(true);
      expect(extendCalls).toHaveLength(3);
    });

    it('should skip bots without coordinates', () => {
      const bots: RobotType[] = [
        {
          id: 1,
          name: 'Bot 1',
          coordinates: undefined as any,
          assignmentStatus: 'ready',
          operationalStatus: 'operational',
          battery: 80,
          lastMove: '',
          gx: 0,
          gy: 0,
          gz: 0,
          lat: 0,
          lng: 0,
          heading: 0,
        },
      ];

      const result = calculateBoundsFromData(bots);

      expect(result.hasPoints).toBe(false);
      expect(extendCalls).toHaveLength(0);
    });

    it('should skip missions without area coordinates', () => {
      const missions: MissionType[] = [
        {
          missionID: 1,
          missionName: 'Mission 1',
          progress: 50,
          averageTemperature: 25,
          timePassed: 120,
          timeEstimated: 240,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: undefined,
          assignedBots: [],
          hotspots: [],
        },
      ];

      const result = calculateBoundsFromData(undefined, missions);

      expect(result.hasPoints).toBe(false);
      expect(extendCalls).toHaveLength(0);
    });

    it('should skip missions with incomplete area coordinates', () => {
      const missions: MissionType[] = [
        {
          missionID: 1,
          missionName: 'Mission 1',
          progress: 50,
          averageTemperature: 25,
          timePassed: 120,
          timeEstimated: 240,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: [{ lat: 51, lng: -121 }], // Only one coordinate
          assignedBots: [],
          hotspots: [],
        },
      ];

      const result = calculateBoundsFromData(undefined, missions);

      expect(result.hasPoints).toBe(false);
      expect(extendCalls).toHaveLength(0);
    });
  });

  describe('initializeMapView', () => {
    let mockMap: any;
    let fitBoundsCalls: any[];
    let setCenterCalls: any[];
    let setZoomCalls: number[];

    beforeEach(() => {
      fitBoundsCalls = [];
      setCenterCalls = [];
      setZoomCalls = [];

      mockMap = {
        fitBounds: jest.fn((bounds, padding) => fitBoundsCalls.push({ bounds, padding })),
        setCenter: jest.fn((center) => setCenterCalls.push(center)),
        setZoom: jest.fn((zoom) => setZoomCalls.push(zoom)),
      };

      global.google = {
        maps: {
          LatLngBounds: jest.fn(() => ({
            extend: jest.fn(),
          })) as any,
        } as any,
      } as any;
    });

    it('should not change map when no data provided', () => {
      initializeMapView(mockMap);

      expect(fitBoundsCalls).toHaveLength(0);
      expect(setCenterCalls).toHaveLength(0);
      expect(setZoomCalls).toHaveLength(0);
    });

    it('should not change map when empty arrays provided', () => {
      initializeMapView(mockMap, [], []);

      expect(fitBoundsCalls).toHaveLength(0);
      expect(setCenterCalls).toHaveLength(0);
      expect(setZoomCalls).toHaveLength(0);
    });

    it('should fit bounds when bots have coordinates', () => {
      const bots: RobotType[] = [
        {
          id: 1,
          name: 'Bot 1',
          coordinates: { lat: 49.5, lng: -119.5, alt: 100 },
          assignmentStatus: 'ready',
          operationalStatus: 'operational',
          battery: 80,
          lastMove: '',
          gx: 0,
          gy: 0,
          gz: 0,
          lat: 49.5,
          lng: -119.5,
          heading: 0,
        },
      ];

      initializeMapView(mockMap, bots);

      expect(fitBoundsCalls).toHaveLength(1);
      expect(fitBoundsCalls[0].padding).toBe(50);
      expect(setCenterCalls).toHaveLength(0);
    });

    it('should use fallback center when no valid coordinates', () => {
      const bots: RobotType[] = [
        {
          id: 1,
          name: 'Bot 1',
          coordinates: undefined as any,
          assignmentStatus: 'ready',
          operationalStatus: 'operational',
          battery: 80,
          lastMove: '',
          gx: 0,
          gy: 0,
          gz: 0,
          lat: 0,
          lng: 0,
          heading: 0,
        },
      ];

      initializeMapView(mockMap, bots);

      expect(fitBoundsCalls).toHaveLength(0);
      expect(setCenterCalls).toHaveLength(1);
      expect(setCenterCalls[0]).toEqual(UBCO_COORDS);
      expect(setZoomCalls).toHaveLength(1);
      expect(setZoomCalls[0]).toBe(DEFAULT_ZOOM);
    });
  });
});
