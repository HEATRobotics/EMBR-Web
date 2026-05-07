import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  fetchMissions,
  fetchMissionById,
  createMission,
  updateMission,
  startMission,
  endMission,
  deleteMission,
  assignBotsToMission,
} from '../missions.api';
import type { MissionType } from '@/types/mission.type';

vi.mock('axios');

describe('Missions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchMissions', () => {
    it('should fetch and transform missions successfully', async () => {
      const mockServerResponse = [
        {
          missionID: 1,
          missionName: 'Test Mission',
          progress: 50,
          avgTemp: 25.5,
          timePassed: 30,
          timeEstimated: 60,
          timeStart: '2024-01-01T00:00:00Z',
          timeEnd: null,
          areaCoordinates: { north: 50, south: 49, east: -119, west: -120 },
          assignedBots: [1, 2],
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockServerResponse });

      const result = await fetchMissions();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        missionID: 1,
        missionName: 'Test Mission',
        progress: 50,
        averageTemperature: 25.5,
        timePassed: 30,
        timeEstimated: 60,
        assignedBots: [1, 2],
      });
      expect(result[0].areaCoordinates).toEqual([
        { lat: 50, lng: -120 },
        { lat: 49, lng: -119 },
      ]);
    });

    it('should handle string areaCoordinates', async () => {
      const mockServerResponse = [
        {
          missionID: 1,
          missionName: 'Test Mission',
          progress: 0,
          avgTemp: 0,
          timePassed: 0,
          timeEstimated: 0,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: JSON.stringify({ north: 50, south: 49, east: -119, west: -120 }),
          assignedBots: [],
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockServerResponse });

      const result = await fetchMissions();

      expect(result[0].areaCoordinates).toEqual([
        { lat: 50, lng: -120 },
        { lat: 49, lng: -119 },
      ]);
    });

    it('should handle null areaCoordinates', async () => {
      const mockServerResponse = [
        {
          missionID: 1,
          missionName: 'Test Mission',
          progress: 0,
          avgTemp: 0,
          timePassed: 0,
          timeEstimated: 0,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: null,
          assignedBots: [],
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockServerResponse });

      const result = await fetchMissions();

      expect(result[0].areaCoordinates).toBeUndefined();
    });
  });

  describe('fetchMissionById', () => {
    it('should fetch a single mission by ID', async () => {
      const mockServerResponse = {
        missionID: 1,
        missionName: 'Test Mission',
        progress: 50,
        avgTemp: 25.5,
        timePassed: 30,
        timeEstimated: 60,
        timeStart: '2024-01-01T00:00:00Z',
        timeEnd: null,
        areaCoordinates: { north: 50, south: 49, east: -119, west: -120 },
        assignedBots: [1, 2],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockServerResponse });

      const result = await fetchMissionById(1);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/missions/1')
      );
      expect(result.missionID).toBe(1);
      expect(result.missionName).toBe('Test Mission');
    });
  });

  describe('createMission', () => {
    it('should create a mission with correct payload transformation', async () => {
      const mission: MissionType = {
        missionID: 0,
        missionName: 'New Mission',
        progress: 0,
        averageTemperature: 0,
        timePassed: 0,
        timeEstimated: 60,
        timeStart: null,
        timeEnd: null,
        areaCoordinates: [
          { lat: 50, lng: -120 },
          { lat: 49, lng: -119 },
        ],
        assignedBots: [],
        hotspots: [],
      };

      vi.mocked(axios.post).mockResolvedValue({ data: { missionID: 1 } });

      await createMission(mission, [1, 2]);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/missions'),
        expect.objectContaining({
          missionName: 'New Mission',
          areaCoordinates: {
            north: 50,
            west: -120,
            south: 49,
            east: -119,
          },
          botIds: [1, 2],
        }),
        expect.any(Object)
      );
    });

    it('should handle null areaCoordinates when creating mission', async () => {
      const mission: MissionType = {
        missionID: 0,
        missionName: 'New Mission',
        progress: 0,
        averageTemperature: 0,
        timePassed: 0,
        timeEstimated: 60,
        timeStart: null,
        timeEnd: null,
        areaCoordinates: undefined,
        assignedBots: [],
        hotspots: [],
      };

      vi.mocked(axios.post).mockResolvedValue({ data: { missionID: 1 } });

      await createMission(mission);

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          areaCoordinates: null,
        }),
        expect.any(Object)
      );
    });
  });

  describe('updateMission', () => {
    it('should update mission with partial data', async () => {
      const partialMission = {
        missionID: 1,
        missionName: 'Updated Mission',
        progress: 75,
      };

      vi.mocked(axios.put).mockResolvedValue({ data: { message: 'Success' } });

      await updateMission(partialMission);

      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/missions/1'),
        expect.objectContaining({
          missionName: 'Updated Mission',
          progress: 75,
        }),
        expect.any(Object)
      );
    });

    it('should transform areaCoordinates correctly when updating', async () => {
      const partialMission = {
        missionID: 1,
        areaCoordinates: [
          { lat: 50, lng: -120 },
          { lat: 49, lng: -119 },
        ] as [{ lat: number; lng: number }, { lat: number; lng: number }],
      };

      vi.mocked(axios.put).mockResolvedValue({ data: { message: 'Success' } });

      await updateMission(partialMission);

      expect(axios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          areaCoordinates: {
            north: 50,
            west: -120,
            south: 49,
            east: -119,
          },
        }),
        expect.any(Object)
      );
    });
  });

  describe('startMission', () => {
    it('should start a mission with correct parameters', async () => {
      vi.mocked(axios.put).mockResolvedValue({ data: { message: 'Mission started' } });

      await startMission(1, '2024-01-01T00:00:00Z');

      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/missions/start/1'),
        { time: '2024-01-01T00:00:00Z' },
        expect.any(Object)
      );
    });
  });

  describe('endMission', () => {
    it('should end a mission with correct parameters', async () => {
      vi.mocked(axios.put).mockResolvedValue({ data: { message: 'Mission ended' } });

      await endMission(1, '2024-01-01T01:00:00Z');

      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/missions/end/1'),
        { time: '2024-01-01T01:00:00Z' },
        expect.any(Object)
      );
    });
  });

  describe('deleteMission', () => {
    it('should delete a mission', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: { message: 'Mission deleted' } });

      await deleteMission(1);

      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/missions/1')
      );
    });
  });

  describe('assignBotsToMission', () => {
    it('should assign bots to a mission', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { message: 'Bots assigned' } });

      await assignBotsToMission(1, [1, 2, 3]);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/missions/1/assign'),
        { botIds: [1, 2, 3] },
        expect.any(Object)
      );
    });
  });

  describe('Data Flow Consistency', () => {
    it('should maintain data structure consistency from server to client', async () => {
      // This test validates that the data structure from the server
      // is correctly transformed into the client MissionType structure
      const serverResponse = {
        missionID: 1,
        missionName: 'Test Mission',
        progress: 50,
        avgTemp: 25.5,
        timePassed: 30,
        timeEstimated: 60,
        timeStart: '2024-01-01T00:00:00Z',
        timeEnd: '2024-01-01T01:00:00Z',
        areaCoordinates: { north: 50, south: 49, east: -119, west: -120 },
        assignedBots: [1, 2],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: serverResponse });

      const result = await fetchMissionById(1);

      // Verify all critical fields are mapped correctly
      expect(result).toMatchObject({
        missionID: serverResponse.missionID,
        missionName: serverResponse.missionName,
        progress: serverResponse.progress,
        averageTemperature: serverResponse.avgTemp,
        timePassed: serverResponse.timePassed,
        timeEstimated: serverResponse.timeEstimated,
        timeStart: serverResponse.timeStart,
        timeEnd: serverResponse.timeEnd,
        assignedBots: serverResponse.assignedBots,
      });

      // Verify coordinate transformation
      expect(result.areaCoordinates).toEqual([
        { lat: serverResponse.areaCoordinates.north, lng: serverResponse.areaCoordinates.west },
        { lat: serverResponse.areaCoordinates.south, lng: serverResponse.areaCoordinates.east },
      ]);
    });

    it('should correctly round-trip mission data', async () => {
      // Test that we can fetch a mission, modify it, and send it back
      const serverMission = {
        missionID: 1,
        missionName: 'Test Mission',
        progress: 50,
        avgTemp: 25.5,
        timePassed: 30,
        timeEstimated: 60,
        timeStart: '2024-01-01T00:00:00Z',
        timeEnd: null,
        areaCoordinates: { north: 50, south: 49, east: -119, west: -120 },
        assignedBots: [1, 2],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: serverMission });
      vi.mocked(axios.put).mockResolvedValue({ data: { message: 'Success' } });

      const fetchedMission = await fetchMissionById(1);
      
      // Modify and send back
      const updatedMission = {
        ...fetchedMission,
        progress: 75,
      };

      await updateMission(updatedMission);

      // Verify the update call transforms the data correctly back to server format
      const updateCall = vi.mocked(axios.put).mock.calls[0];
      expect(updateCall[1]).toMatchObject({
        missionName: serverMission.missionName,
        progress: 75,
        avgTemp: serverMission.avgTemp,
        areaCoordinates: {
          north: serverMission.areaCoordinates.north,
          south: serverMission.areaCoordinates.south,
          east: serverMission.areaCoordinates.east,
          west: serverMission.areaCoordinates.west,
        },
      });
    });
  });
});
