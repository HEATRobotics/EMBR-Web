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
} from './missions.api';
import { MissionType } from '@/types/mission.type';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('missions.api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchMissions', () => {
    it('should fetch and map missions successfully', async () => {
      const mockMissions = [
        {
          missionID: 1,
          missionName: 'Test Mission',
          progress: 50,
          avgTemp: 25.5,
          timePassed: 120,
          timeEstimated: 240,
          timeStart: '2024-01-15 10:00:00',
          timeEnd: null,
          areaCoordinates: { north: 50, south: 49, east: -119, west: -120 },
          assignedBots: [1, 2],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockMissions });

      const result = await fetchMissions();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/missions'));
      expect(result).toHaveLength(1);
      expect(result[0].missionID).toBe(1);
      expect(result[0].missionName).toBe('Test Mission');
      expect(result[0].areaCoordinates).toEqual([
        { lat: 50, lng: -120 },
        { lat: 49, lng: -119 },
      ]);
    });

    it('should handle string areaCoordinates', async () => {
      const mockMissions = [
        {
          missionID: 2,
          missionName: 'Mission 2',
          progress: 0,
          avgTemp: 20,
          timePassed: 0,
          timeEstimated: 100,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: '{"north":50,"south":49,"east":-119,"west":-120}',
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockMissions });

      const result = await fetchMissions();

      expect(result[0].areaCoordinates).toEqual([
        { lat: 50, lng: -120 },
        { lat: 49, lng: -119 },
      ]);
    });

    it('should handle null areaCoordinates', async () => {
      const mockMissions = [
        {
          missionID: 3,
          missionName: 'Mission 3',
          progress: 0,
          avgTemp: 20,
          timePassed: 0,
          timeEstimated: 100,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: null,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockMissions });

      const result = await fetchMissions();

      expect(result[0].areaCoordinates).toBeUndefined();
    });

    it('should handle invalid JSON in areaCoordinates', async () => {
      const mockMissions = [
        {
          missionID: 4,
          missionName: 'Mission 4',
          progress: 0,
          avgTemp: 20,
          timePassed: 0,
          timeEstimated: 100,
          timeStart: null,
          timeEnd: null,
          areaCoordinates: 'invalid json',
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockMissions });

      const result = await fetchMissions();

      expect(result[0].areaCoordinates).toBeUndefined();
    });
  });

  describe('fetchMissionById', () => {
    it('should fetch a specific mission by ID', async () => {
      const mockMission = {
        missionID: 5,
        missionName: 'Specific Mission',
        progress: 75,
        avgTemp: 22,
        timePassed: 180,
        timeEstimated: 240,
        timeStart: '2024-01-15 10:00:00',
        timeEnd: null,
        areaCoordinates: { north: 50, south: 49, east: -119, west: -120 },
        assignedBots: [3],
      };

      mockedAxios.get.mockResolvedValue({ data: mockMission });

      const result = await fetchMissionById(5);

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/missions/5'));
      expect(result.missionID).toBe(5);
      expect(result.missionName).toBe('Specific Mission');
    });
  });

  describe('createMission', () => {
    it('should create a mission with area coordinates', async () => {
      const mission: MissionType = {
        missionID: 0,
        missionName: 'New Mission',
        progress: 0,
        averageTemperature: 0,
        timePassed: 0,
        timeEstimated: 300,
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

      const result = await createMission(mission, [1, 2]);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/missions'),
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
      expect(result.missionID).toBe(10);
    });

    it('should create a mission without area coordinates', async () => {
      const mission: MissionType = {
        missionID: 0,
        missionName: 'No Area Mission',
        progress: 0,
        averageTemperature: 0,
        timePassed: 0,
        timeEstimated: 200,
        timeStart: null,
        timeEnd: null,
        areaCoordinates: undefined,
        assignedBots: [],
        hotspots: [],
      };

      mockedAxios.post.mockResolvedValue({ data: { missionID: 11 } });

      await createMission(mission);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/missions'),
        expect.objectContaining({
          areaCoordinates: null,
        }),
        expect.any(Object)
      );
    });
  });

  describe('updateMission', () => {
    it('should update mission with all fields', async () => {
      const mission: Partial<MissionType> = {
        missionID: 15,
        missionName: 'Updated Mission',
        progress: 80,
        averageTemperature: 23,
        timePassed: 200,
        timeEstimated: 250,
        assignedBots: [5, 6],
        timeStart: '2024-01-16 09:00:00',
        timeEnd: '2024-01-16 12:00:00',
        areaCoordinates: [
          { lat: 51, lng: -121 },
          { lat: 50, lng: -120 },
        ],
      };

      mockedAxios.put.mockResolvedValue({ data: { message: 'Success' } });

      const result = await updateMission(mission);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/missions/15'),
        expect.objectContaining({
          missionName: 'Updated Mission',
          progress: 80,
          avgTemp: 23,
          timePassed: 200,
          timeEstimated: 250,
          botIds: [5, 6],
          timeStart: '2024-01-16 09:00:00',
          timeEnd: '2024-01-16 12:00:00',
          areaCoordinates: {
            north: 51,
            west: -121,
            south: 50,
            east: -120,
          },
        }),
        expect.any(Object)
      );
      expect(result.message).toBe('Success');
    });

    it('should update mission with partial fields', async () => {
      const mission: Partial<MissionType> = {
        missionID: 16,
        progress: 90,
      };

      mockedAxios.put.mockResolvedValue({ data: { message: 'Updated' } });

      await updateMission(mission);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/missions/16'),
        { progress: 90 },
        expect.any(Object)
      );
    });
  });

  describe('startMission', () => {
    it('should start a mission', async () => {
      mockedAxios.put.mockResolvedValue({ data: { message: 'Mission started' } });

      const result = await startMission(20, '2024-01-17 08:00:00');

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/missions/start/20'),
        { time: '2024-01-17 08:00:00' },
        expect.any(Object)
      );
      expect(result.message).toBe('Mission started');
    });
  });

  describe('endMission', () => {
    it('should end a mission', async () => {
      mockedAxios.put.mockResolvedValue({ data: { message: 'Mission ended' } });

      const result = await endMission(21, '2024-01-17 16:00:00');

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/missions/end/21'),
        { time: '2024-01-17 16:00:00' },
        expect.any(Object)
      );
      expect(result.message).toBe('Mission ended');
    });
  });

  describe('deleteMission', () => {
    it('should delete a mission', async () => {
      mockedAxios.delete.mockResolvedValue({ data: { message: 'Mission deleted' } });

      const result = await deleteMission(22);

      expect(mockedAxios.delete).toHaveBeenCalledWith(expect.stringContaining('/missions/22'));
      expect(result.message).toBe('Mission deleted');
    });
  });

  describe('assignBotsToMission', () => {
    it('should assign bots to a mission', async () => {
      mockedAxios.post.mockResolvedValue({ data: { message: 'Bots assigned' } });

      const result = await assignBotsToMission(25, [7, 8, 9]);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/missions/25/assign'),
        { botIds: [7, 8, 9] },
        expect.any(Object)
      );
      expect(result.message).toBe('Bots assigned');
    });
  });
});
