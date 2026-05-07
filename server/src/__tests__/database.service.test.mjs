import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  insertPositionData,
  insertTemperatureData,
  insertBatteryData,
  getAllTemperatureData,
  getTemperaturesByBot,
  getTemperaturesByMission,
  getAllBatteryData,
  getLatestBatteryData,
  getLatestBotData,
  getMissionByID,
  getAllMissions,
  createMission,
  updateMission,
  startMission,
  endMission,
  deleteMission,
  assignBotsToMission,
  getAssignmentsForMission,
} from '../services/database.service.mjs';
import { pool } from '../config/database.config.mjs';

// Mock the database pool
vi.mock('../config/database.config.mjs', () => ({
  pool: {
    getConnection: vi.fn(),
  },
}));

describe('Database Service', () => {
  let mockConnection;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection = {
      execute: vi.fn(),
      release: vi.fn(),
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
    };
    pool.getConnection.mockResolvedValue(mockConnection);
  });

  describe('insertPositionData', () => {
    it('should insert position data successfully', async () => {
      const mockData = {
        botID: 1,
        clockTime: '2024-01-01T00:00:00Z',
        latitude: 49.939434,
        longitude: -119.396427,
      };

      mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await insertPositionData(mockData);

      expect(result).toBe(true);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO `position`'),
        expect.arrayContaining([1, null, '2024-01-01T00:00:00Z', 49.939434, -119.396427])
      );
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should throw error when required fields are missing', async () => {
      const mockData = {
        botID: 1,
        // Missing clockTime, latitude, longitude
      };

      await expect(insertPositionData(mockData)).rejects.toThrow();
    });

    it('should handle database errors', async () => {
      const mockData = {
        botID: 1,
        clockTime: '2024-01-01T00:00:00Z',
        latitude: 49.939434,
        longitude: -119.396427,
      };

      mockConnection.execute.mockRejectedValue(new Error('Database error'));

      const result = await insertPositionData(mockData);

      expect(result).toBe(false);
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe('insertTemperatureData', () => {
    it('should insert temperature data successfully', async () => {
      const mockData = {
        botID: 1,
        clockTime: '2024-01-01T00:00:00Z',
        temperature: 25.5,
      };

      mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await insertTemperatureData(mockData);

      expect(result).toBe(true);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO temperature'),
        expect.arrayContaining([1, null, null, '2024-01-01T00:00:00Z', 25.5])
      );
    });

    it('should throw error when required fields are missing', async () => {
      const mockData = {
        botID: 1,
        // Missing clockTime and temperature
      };

      await expect(insertTemperatureData(mockData)).rejects.toThrow();
    });
  });

  describe('insertBatteryData', () => {
    it('should insert battery data successfully', async () => {
      const mockData = {
        botID: 1,
        clockTime: '2024-01-01T00:00:00Z',
        battery: 85,
      };

      mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await insertBatteryData(mockData);

      expect(result).toBe(true);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO battery'),
        expect.arrayContaining([1, null, '2024-01-01T00:00:00Z', 85])
      );
    });
  });

  describe('getAllTemperatureData', () => {
    it('should fetch all temperature data', async () => {
      const mockRows = [
        { botID: 1, temperature: 25.5, clockTime: '2024-01-01T00:00:00Z' },
        { botID: 2, temperature: 30.0, clockTime: '2024-01-01T01:00:00Z' },
      ];

      mockConnection.execute.mockResolvedValue([mockRows]);

      const result = await getAllTemperatureData();

      expect(result).toEqual(mockRows);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM temperature')
      );
    });

    it('should handle errors', async () => {
      mockConnection.execute.mockRejectedValue(new Error('Database error'));

      const result = await getAllTemperatureData();

      expect(result).toBe(false);
    });
  });

  describe('getTemperaturesByBot', () => {
    it('should fetch temperatures for a specific bot', async () => {
      const botID = 1;
      const mockRows = [
        { botID: 1, temperature: 25.5, clockTime: '2024-01-01T00:00:00Z' },
      ];

      mockConnection.execute.mockResolvedValue([mockRows]);

      const result = await getTemperaturesByBot(botID);

      expect(result).toEqual(mockRows);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('WHERE botID = ?'),
        [botID]
      );
    });
  });

  describe('getLatestBotData', () => {
    it('should fetch latest bot data with position and battery', async () => {
      const mockRows = [
        {
          botID: 1,
          assignmentStatus: 'ready',
          latitude: 49.939434,
          longitude: -119.396427,
          battery: 85,
          positionTime: '2024-01-01T00:00:00Z',
          batteryTime: '2024-01-01T00:00:00Z',
        },
      ];

      mockConnection.execute.mockResolvedValue([mockRows]);

      const result = await getLatestBotData();

      expect(result).toEqual(mockRows);
      expect(mockConnection.execute).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockConnection.execute.mockRejectedValue(new Error('Database error'));

      const result = await getLatestBotData();

      expect(result).toBe(false);
    });
  });

  describe('getMissionByID', () => {
    it('should fetch a mission by ID successfully', async () => {
      const mockMission = {
        missionID: 1,
        missionName: 'Test Mission',
        areaCoordinates: JSON.stringify([]),
      };

      mockConnection.execute.mockResolvedValue([[mockMission]]);

      const result = await getMissionByID(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMission);
    });

    it('should return error when mission not found', async () => {
      mockConnection.execute.mockResolvedValue([[]]);

      const result = await getMissionByID(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Mission not found');
    });
  });

  describe('getAllMissions', () => {
    it('should fetch all missions', async () => {
      const mockMissions = [
        { missionID: 1, missionName: 'Mission 1' },
        { missionID: 2, missionName: 'Mission 2' },
      ];

      mockConnection.execute.mockResolvedValue([mockMissions]);

      const result = await getAllMissions();

      expect(result).toEqual(mockMissions);
    });
  });

  describe('createMission', () => {
    it('should create a mission successfully', async () => {
      const mockMissionData = {
        missionName: 'Test Mission',
        areaCoordinates: [{ lat: 49.939434, lng: -119.396427 }],
      };

      mockConnection.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      const result = await createMission(mockMissionData);

      expect(result.success).toBe(true);
      expect(result.missionID).toBe(1);
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('should create mission with bot assignments', async () => {
      const mockMissionData = {
        missionName: 'Test Mission',
        areaCoordinates: [{ lat: 49.939434, lng: -119.396427 }],
        botIds: [1, 2],
      };

      mockConnection.execute.mockResolvedValue([{ insertId: 1 }]);

      const result = await createMission(mockMissionData);

      expect(result.success).toBe(true);
      // 1 insert mission + 2 bot assignments + 1 update bot status = 4 calls
      expect(mockConnection.execute).toHaveBeenCalledTimes(4);
    });

    it('should rollback on error', async () => {
      const mockMissionData = {
        missionName: 'Test Mission',
        areaCoordinates: [{ lat: 49.939434, lng: -119.396427 }],
      };

      mockConnection.execute.mockRejectedValue(new Error('Database error'));

      const result = await createMission(mockMissionData);

      expect(result.success).toBe(false);
      expect(mockConnection.rollback).toHaveBeenCalled();
    });

    it('should throw error when required fields are missing', async () => {
      const mockMissionData = {
        missionName: 'Test Mission',
        // Missing areaCoordinates
      };

      await expect(createMission(mockMissionData)).rejects.toThrow(
        'Mission name and areaCoordinates are required'
      );
    });
  });

  describe('updateMission', () => {
    it('should update mission successfully', async () => {
      const mockMissionData = {
        missionName: 'Updated Mission',
        progress: 50,
      };

      mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await updateMission(1, mockMissionData);

      expect(result.success).toBe(true);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE mission SET'),
        expect.any(Array)
      );
    });
  });

  describe('startMission', () => {
    it('should start a mission successfully', async () => {
      mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await startMission(1, '2024-01-01T00:00:00Z', [1, 2]);

      expect(result.success).toBe(true);
      expect(mockConnection.execute).toHaveBeenCalledTimes(2);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE mission SET timeStart'),
        expect.any(Array)
      );
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE bot SET assignmentStatus'),
        expect.any(Array)
      );
    });
  });

  describe('endMission', () => {
    it('should end a mission successfully', async () => {
      mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await endMission(1, '2024-01-01T01:00:00Z', [1, 2]);

      expect(result.success).toBe(true);
      expect(mockConnection.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteMission', () => {
    it('should delete a mission successfully', async () => {
      mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await deleteMission(1);

      expect(result.success).toBe(true);
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      mockConnection.execute.mockRejectedValue(new Error('Database error'));

      const result = await deleteMission(1);

      expect(result.success).toBe(false);
      expect(mockConnection.rollback).toHaveBeenCalled();
    });
  });

  describe('assignBotsToMission', () => {
    it('should assign bots to mission successfully', async () => {
      mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await assignBotsToMission(1, [1, 2]);

      expect(result.success).toBe(true);
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('should handle empty bot list', async () => {
      mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await assignBotsToMission(1, []);

      expect(result.success).toBe(true);
    });
  });

  describe('getAssignmentsForMission', () => {
    it('should fetch bot assignments for a mission', async () => {
      const mockRows = [{ botID: 1 }, { botID: 2 }];

      mockConnection.execute.mockResolvedValue([mockRows]);

      const result = await getAssignmentsForMission(1);

      expect(result).toEqual([1, 2]);
    });

    it('should handle errors', async () => {
      mockConnection.execute.mockRejectedValue(new Error('Database error'));

      const result = await getAssignmentsForMission(1);

      expect(result).toEqual([]);
    });
  });
});
