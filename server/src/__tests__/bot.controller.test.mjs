import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLatestBots, getAllBattery, getLatestBattery } from '../controllers/bot.controller.mjs';
import * as databaseService from '../services/database.service.mjs';

vi.mock('../services/database.service.mjs');

describe('Bot Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getLatestBots', () => {
    it('should return latest bot data successfully', async () => {
      const mockBotData = [
        {
          botID: 1,
          assignmentStatus: 'ready',
          latitude: 49.939434,
          longitude: -119.396427,
          battery: 85,
        },
        {
          botID: 2,
          assignmentStatus: 'assigned',
          latitude: 49.940000,
          longitude: -119.397000,
          battery: 70,
        },
      ];

      databaseService.getLatestBotData.mockResolvedValue(mockBotData);

      await getLatestBots(mockReq, mockRes);

      expect(databaseService.getLatestBotData).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockBotData);
    });

    it('should return 500 when database service fails', async () => {
      databaseService.getLatestBotData.mockResolvedValue(false);

      await getLatestBots(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch bot data' });
    });

    it('should handle errors', async () => {
      const errorMessage = 'Database connection failed';
      databaseService.getLatestBotData.mockRejectedValue(new Error(errorMessage));

      await getLatestBots(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getAllBattery', () => {
    it('should return all battery data successfully', async () => {
      const mockBatteryData = [
        { botID: 1, battery: 85, clockTime: '2024-01-01T00:00:00Z' },
        { botID: 2, battery: 70, clockTime: '2024-01-01T00:00:00Z' },
      ];

      databaseService.getAllBatteryData.mockResolvedValue(mockBatteryData);

      await getAllBattery(mockReq, mockRes);

      expect(databaseService.getAllBatteryData).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockBatteryData);
    });

    it('should return 500 when database service fails', async () => {
      databaseService.getAllBatteryData.mockResolvedValue(false);

      await getAllBattery(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch battery data' });
    });

    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      databaseService.getAllBatteryData.mockRejectedValue(new Error(errorMessage));

      await getAllBattery(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getLatestBattery', () => {
    it('should return latest battery data successfully', async () => {
      const mockBatteryData = [
        { botID: 1, battery: 85, clockTime: '2024-01-01T00:00:00Z', assignmentStatus: 'ready' },
        { botID: 2, battery: 70, clockTime: '2024-01-01T00:00:00Z', assignmentStatus: 'assigned' },
      ];

      databaseService.getLatestBatteryData.mockResolvedValue(mockBatteryData);

      await getLatestBattery(mockReq, mockRes);

      expect(databaseService.getLatestBatteryData).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockBatteryData);
    });

    it('should return 500 when database service fails', async () => {
      databaseService.getLatestBatteryData.mockResolvedValue(false);

      await getLatestBattery(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch battery data' });
    });

    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      databaseService.getLatestBatteryData.mockRejectedValue(new Error(errorMessage));

      await getLatestBattery(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
