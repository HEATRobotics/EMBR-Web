import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllTemperature,
  getTemperaturesByBotController,
  getTemperaturesByMissionController,
} from '../controllers/temperature.controller.mjs';
import * as databaseService from '../services/database.service.mjs';

vi.mock('../services/database.service.mjs');

describe('Temperature Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      params: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getAllTemperature', () => {
    it('should return all temperature data successfully', async () => {
      const mockTemperatureData = [
        { botID: 1, temperature: 25.5, clockTime: '2024-01-01T00:00:00Z' },
        { botID: 2, temperature: 30.0, clockTime: '2024-01-01T01:00:00Z' },
      ];

      databaseService.getAllTemperatureData.mockResolvedValue(mockTemperatureData);

      await getAllTemperature(mockReq, mockRes);

      expect(databaseService.getAllTemperatureData).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTemperatureData);
    });

    it('should return 500 when database service fails', async () => {
      databaseService.getAllTemperatureData.mockResolvedValue(false);

      await getAllTemperature(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch temperature data' });
    });

    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      databaseService.getAllTemperatureData.mockRejectedValue(new Error(errorMessage));

      await getAllTemperature(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getTemperaturesByBotController', () => {
    it('should return temperatures for a specific bot', async () => {
      mockReq.params.botID = '1';
      const mockTemperatureData = [
        { botID: 1, temperature: 25.5, clockTime: '2024-01-01T00:00:00Z' },
        { botID: 1, temperature: 26.0, clockTime: '2024-01-01T01:00:00Z' },
      ];

      databaseService.getTemperaturesByBot.mockResolvedValue(mockTemperatureData);

      await getTemperaturesByBotController(mockReq, mockRes);

      expect(databaseService.getTemperaturesByBot).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTemperatureData);
    });

    it('should return 500 when database service fails', async () => {
      mockReq.params.botID = '1';
      databaseService.getTemperaturesByBot.mockResolvedValue(false);

      await getTemperaturesByBotController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch temperature data' });
    });

    it('should handle errors', async () => {
      mockReq.params.botID = '1';
      const errorMessage = 'Database error';
      databaseService.getTemperaturesByBot.mockRejectedValue(new Error(errorMessage));

      await getTemperaturesByBotController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getTemperaturesByMissionController', () => {
    it('should return temperatures for a specific mission', async () => {
      mockReq.params.missionID = '1';
      const mockTemperatureData = [
        { missionID: 1, temperature: 25.5, clockTime: '2024-01-01T00:00:00Z' },
        { missionID: 1, temperature: 26.0, clockTime: '2024-01-01T01:00:00Z' },
      ];

      databaseService.getTemperaturesByMission.mockResolvedValue(mockTemperatureData);

      await getTemperaturesByMissionController(mockReq, mockRes);

      expect(databaseService.getTemperaturesByMission).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTemperatureData);
    });

    it('should return 500 when database service fails', async () => {
      mockReq.params.missionID = '1';
      databaseService.getTemperaturesByMission.mockResolvedValue(false);

      await getTemperaturesByMissionController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch temperature data' });
    });

    it('should handle errors', async () => {
      mockReq.params.missionID = '1';
      const errorMessage = 'Database error';
      databaseService.getTemperaturesByMission.mockRejectedValue(new Error(errorMessage));

      await getTemperaturesByMissionController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
