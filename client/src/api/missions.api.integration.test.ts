import axios from 'axios';
import {
  fetchMissions,
  fetchMissionById,
  createMission,
  updateMission,
} from './missions.api';
import { MissionType } from '@/types/mission.type';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Missions API Integration Tests - Server to Client Data Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Server Response to Client Object Mapping', () => {
    it('should correctly map server mission response to client MissionType structure', async () => {
      // Simulate actual server response structure from mission.controller.mjs
      const serverResponse = [
        {
          missionID: 1,
          missionName: 'Forest Survey Mission',
          progress: 65,
          avgTemp: 24.5,
          timePassed: 180, // Server calculates this from timeStart/timeEnd
          timeEstimated: 300,
          timeStart: '2024-01-15 10:00:00',
          timeEnd: null,
          areaCoordinates: {
            north: 50.0,
            south: 49.0,
            east: -119.0,
            west: -120.0,
          },
          assignedBots: [1, 2, 3],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientMissions = await fetchMissions();

      // Verify the data structure matches what the client expects (MissionType)
      expect(clientMissions).toHaveLength(1);
      const mission = clientMissions[0];

      expect(mission).toMatchObject({
        missionID: 1,
        missionName: 'Forest Survey Mission',
        progress: 65,
        averageTemperature: 24.5, // avgTemp -> averageTemperature
        timePassed: 180,
        timeEstimated: 300,
        timeStart: '2024-01-15 10:00:00',
        timeEnd: null,
        areaCoordinates: [
          { lat: 50.0, lng: -120.0 }, // north/west -> lat/lng
          { lat: 49.0, lng: -119.0 }, // south/east -> lat/lng
        ],
        assignedBots: [1, 2, 3],
        hotspots: [],
      });
    });

    it('should handle server returning areaCoordinates as JSON string', async () => {
      // Database may return JSON fields as strings
      const serverResponse = [
        {
          missionID: 2,
          missionName: 'Urban Mapping',
          progress: 30,
          avgTemp: 22.0,
          timePassed: 60,
          timeEstimated: 200,
          timeStart: '2024-01-16 09:00:00',
          timeEnd: null,
          areaCoordinates: '{"north":51,"south":50,"east":-118,"west":-119}',
          assignedBots: [4, 5],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientMissions = await fetchMissions();

      expect(clientMissions[0].areaCoordinates).toEqual([
        { lat: 51, lng: -119 },
        { lat: 50, lng: -118 },
      ]);
    });

    it('should handle null areaCoordinates from server', async () => {
      const serverResponse = [
        {
          missionID: 3,
          missionName: 'Patrol Mission',
          progress: 0,
          avgTemp: 0,
          timePassed: 0,
          timeEstimated: 150,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: null,
          assignedBots: [],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientMissions = await fetchMissions();

      expect(clientMissions[0].areaCoordinates).toBeUndefined();
    });

    it('should handle invalid JSON string for areaCoordinates', async () => {
      const serverResponse = [
        {
          missionID: 4,
          missionName: 'Test Mission',
          progress: 0,
          avgTemp: 20,
          timePassed: 0,
          timeEstimated: 100,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: 'invalid json string',
          assignedBots: [],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientMissions = await fetchMissions();

      expect(clientMissions[0].areaCoordinates).toBeUndefined();
    });

    it('should handle missing assignedBots field from server', async () => {
      const serverResponse = [
        {
          missionID: 5,
          missionName: 'Solo Mission',
          progress: 50,
          avgTemp: 25,
          timePassed: 120,
          timeEstimated: 240,
          timeStart: '2024-01-17 08:00:00',
          timeEnd: null,
          areaCoordinates: { north: 52, south: 51, east: -117, west: -118 },
          // assignedBots field missing
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientMissions = await fetchMissions();

      expect(clientMissions[0].assignedBots).toEqual([]);
    });
  });

  describe('Client to Server Data Transformation', () => {
    it('should correctly transform client mission to server payload for creation', async () => {
      const clientMission: MissionType = {
        missionID: 0,
        missionName: 'New Survey',
        progress: 0,
        averageTemperature: 0,
        timePassed: 0,
        timeEstimated: 240,
        timeStart: null,
        timeEnd: null,
        areaCoordinates: [
          { lat: 50, lng: -120 },
          { lat: 49, lng: -119 },
        ],
        assignedBots: [],
        hotspots: [],
      };

      mockedAxios.post.mockResolvedValue({ data: { missionID: 10 } });

      await createMission(clientMission, [1, 2]);

      // Verify the payload sent to server has correct structure
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/missions'),
        expect.objectContaining({
          missionName: 'New Survey',
          areaCoordinates: {
            north: 50,
            west: -120,
            south: 49,
            east: -119,
          },
          progress: 0,
          avgTemp: 0, // averageTemperature -> avgTemp
          timePassed: 0,
          timeEstimated: 240,
          botIds: [1, 2],
        }),
        expect.any(Object)
      );
    });

    it('should correctly transform client mission to server payload for update', async () => {
      const clientMission: Partial<MissionType> = {
        missionID: 15,
        missionName: 'Updated Mission',
        progress: 75,
        averageTemperature: 23.5,
        timePassed: 200,
        timeEstimated: 250,
        assignedBots: [5, 6, 7],
        timeStart: '2024-01-18 10:00:00',
        timeEnd: '2024-01-18 14:00:00',
        areaCoordinates: [
          { lat: 51, lng: -121 },
          { lat: 50, lng: -120 },
        ],
      };

      mockedAxios.put.mockResolvedValue({ data: { message: 'Success' } });

      await updateMission(clientMission);

      // Verify field name mappings in update payload
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/missions/15'),
        expect.objectContaining({
          missionName: 'Updated Mission',
          progress: 75,
          avgTemp: 23.5, // Client averageTemperature -> Server avgTemp
          timePassed: 200,
          timeEstimated: 250,
          botIds: [5, 6, 7], // Client assignedBots -> Server botIds
          timeStart: '2024-01-18 10:00:00',
          timeEnd: '2024-01-18 14:00:00',
          areaCoordinates: {
            north: 51,
            west: -121,
            south: 50,
            east: -120,
          },
        }),
        expect.any(Object)
      );
    });

    it('should handle partial updates without overwriting other fields', async () => {
      const partialMission: Partial<MissionType> = {
        missionID: 20,
        progress: 90,
      };

      mockedAxios.put.mockResolvedValue({ data: { message: 'Updated' } });

      await updateMission(partialMission);

      // Should only send the field that was updated
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/missions/20'),
        { progress: 90 },
        expect.any(Object)
      );
    });
  });

  describe('Round-trip Data Integrity', () => {
    it('should maintain data integrity in create-fetch cycle', async () => {
      const clientMission: MissionType = {
        missionID: 0,
        missionName: 'Data Integrity Test',
        progress: 0,
        averageTemperature: 21.5,
        timePassed: 0,
        timeEstimated: 180,
        timeStart: null,
        timeEnd: null,
        areaCoordinates: [
          { lat: 49.5, lng: -119.5 },
          { lat: 48.5, lng: -118.5 },
        ],
        assignedBots: [2, 4, 6],
        hotspots: [],
      };

      // Mock creation response
      mockedAxios.post.mockResolvedValue({ data: { missionID: 25 } });

      const createResult = await createMission(clientMission, [2, 4, 6]);
      expect(createResult.missionID).toBe(25);

      // Mock fetch response with what server would return
      const serverResponse = {
        missionID: 25,
        missionName: 'Data Integrity Test',
        progress: 0,
        avgTemp: 21.5,
        timePassed: 0,
        timeEstimated: 180,
        timeStart: null,
        timeEnd: null,
        areaCoordinates: {
          north: 49.5,
          south: 48.5,
          east: -118.5,
          west: -119.5,
        },
        assignedBots: [2, 4, 6],
      };

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const fetchedMission = await fetchMissionById(25);

      // Verify round-trip data integrity
      expect(fetchedMission.missionName).toBe(clientMission.missionName);
      expect(fetchedMission.progress).toBe(clientMission.progress);
      expect(fetchedMission.averageTemperature).toBe(clientMission.averageTemperature);
      expect(fetchedMission.timeEstimated).toBe(clientMission.timeEstimated);
      expect(fetchedMission.assignedBots).toEqual(clientMission.assignedBots);
      
      // Verify area coordinates are preserved
      expect(fetchedMission.areaCoordinates).toEqual([
        { lat: 49.5, lng: -119.5 },
        { lat: 48.5, lng: -118.5 },
      ]);
    });
  });

  describe('Multiple Missions Data Flow', () => {
    it('should handle fetching multiple missions with various data states', async () => {
      const serverResponse = [
        {
          missionID: 1,
          missionName: 'Active Mission',
          progress: 50,
          avgTemp: 24,
          timePassed: 120,
          timeEstimated: 240,
          timeStart: '2024-01-15 10:00:00',
          timeEnd: null,
          areaCoordinates: { north: 50, south: 49, east: -119, west: -120 },
          assignedBots: [1, 2],
        },
        {
          missionID: 2,
          missionName: 'Completed Mission',
          progress: 100,
          avgTemp: 22,
          timePassed: 300,
          timeEstimated: 300,
          timeStart: '2024-01-14 08:00:00',
          timeEnd: '2024-01-14 13:00:00',
          areaCoordinates: '{"north":51,"south":50,"east":-118,"west":-119}',
          assignedBots: [3],
        },
        {
          missionID: 3,
          missionName: 'Planned Mission',
          progress: 0,
          avgTemp: 0,
          timePassed: 0,
          timeEstimated: 180,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: null,
          assignedBots: [],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientMissions = await fetchMissions();

      expect(clientMissions).toHaveLength(3);
      
      // Verify each mission is correctly mapped
      expect(clientMissions[0].missionID).toBe(1);
      expect(clientMissions[0].areaCoordinates).toBeDefined();
      
      expect(clientMissions[1].missionID).toBe(2);
      expect(clientMissions[1].progress).toBe(100);
      expect(clientMissions[1].areaCoordinates).toBeDefined();
      
      expect(clientMissions[2].missionID).toBe(3);
      expect(clientMissions[2].areaCoordinates).toBeUndefined();
    });
  });

  describe('Database Schema Changes Detection', () => {
    it('should verify all expected server fields are mapped to client fields', async () => {
      const serverResponse = [
        {
          missionID: 100,
          missionName: 'Schema Test',
          progress: 45,
          avgTemp: 23.5,
          timePassed: 90,
          timeEstimated: 200,
          timeStart: '2024-01-19 09:00:00',
          timeEnd: null,
          areaCoordinates: { north: 52, south: 51, east: -117, west: -118 },
          assignedBots: [1, 2, 3, 4],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientMissions = await fetchMissions();
      const mission = clientMissions[0];

      // Verify all server fields are accessible in client object
      expect(mission.missionID).toBe(100); // Server: missionID
      expect(mission.missionName).toBe('Schema Test'); // Server: missionName
      expect(mission.progress).toBe(45); // Server: progress
      expect(mission.averageTemperature).toBe(23.5); // Server: avgTemp
      expect(mission.timePassed).toBe(90); // Server: timePassed
      expect(mission.timeEstimated).toBe(200); // Server: timeEstimated
      expect(mission.timeStart).toBe('2024-01-19 09:00:00'); // Server: timeStart
      expect(mission.timeEnd).toBeNull(); // Server: timeEnd
      expect(mission.areaCoordinates).toBeDefined(); // Server: areaCoordinates
      expect(mission.assignedBots).toEqual([1, 2, 3, 4]); // Server: assignedBots
      expect(mission.hotspots).toEqual([]); // Client-only field
    });
  });
});
