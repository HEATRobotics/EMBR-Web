import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllMissionsController,
  getMissionByIdController,
  createMissionController,
  updateMissionController,
  startMissionController,
  endMissionController,
  deleteMissionController,
  assignBotsController,
} from '../controllers/mission.controller.mjs';
import * as databaseService from '../services/database.service.mjs';

vi.mock('../services/database.service.mjs');

describe('Mission Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      params: {},
      body: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getAllMissionsController', () => {
    it('should return all missions with mapped data', async () => {
      const mockMissions = [
        {
          missionID: 1,
          missionName: 'Mission 1',
          areaCoordinates: JSON.stringify([{ lat: 49.939434, lng: -119.396427 }]),
          timeStart: '2024-01-01T00:00:00Z',
          timeEnd: '2024-01-01T01:00:00Z',
        },
      ];

      databaseService.getAllMissions.mockResolvedValue(mockMissions);
      databaseService.getAssignmentsForMission.mockResolvedValue([1, 2]);

      await getAllMissionsController(mockReq, mockRes);

      expect(databaseService.getAllMissions).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            missionID: 1,
            missionName: 'Mission 1',
            areaCoordinates: expect.any(Array),
            assignedBots: [1, 2],
            timePassed: expect.any(Number),
          }),
        ])
      );
    });

    it('should return 500 when database service fails', async () => {
      databaseService.getAllMissions.mockResolvedValue(false);

      await getAllMissionsController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch missions' });
    });

    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      databaseService.getAllMissions.mockRejectedValue(new Error(errorMessage));

      await getAllMissionsController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getMissionByIdController', () => {
    it('should return a mission by ID', async () => {
      mockReq.params.id = '1';

      const mockMission = {
        missionID: 1,
        missionName: 'Mission 1',
        areaCoordinates: JSON.stringify([{ lat: 49.939434, lng: -119.396427 }]),
      };

      databaseService.getMissionByID.mockResolvedValue({ success: true, data: mockMission });
      databaseService.getAssignmentsForMission.mockResolvedValue([1]);

      await getMissionByIdController(mockReq, mockRes);

      expect(databaseService.getMissionByID).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          missionID: 1,
          missionName: 'Mission 1',
        })
      );
    });

    it('should return 404 when mission not found', async () => {
      mockReq.params.id = '999';

      databaseService.getMissionByID.mockResolvedValue({ success: false, error: 'Mission not found' });

      await getMissionByIdController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Mission not found' });
    });
  });

  describe('createMissionController', () => {
    it('should create a mission successfully', async () => {
      mockReq.body = {
        missionName: 'New Mission',
        areaCoordinates: [{ lat: 49.939434, lng: -119.396427 }],
        botIds: [1, 2],
      };

      databaseService.createMission.mockResolvedValue({ success: true, missionID: 1 });

      await createMissionController(mockReq, mockRes);

      expect(databaseService.createMission).toHaveBeenCalledWith(
        expect.objectContaining({
          missionName: 'New Mission',
          areaCoordinates: expect.any(Array),
          botIds: [1, 2],
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ missionID: 1 });
    });

    it('should return 500 when creation fails', async () => {
      mockReq.body = {
        missionName: 'New Mission',
        areaCoordinates: [{ lat: 49.939434, lng: -119.396427 }],
      };

      databaseService.createMission.mockResolvedValue({ success: false, error: 'Database error' });

      await createMissionController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should handle exceptions', async () => {
      mockReq.body = {
        missionName: 'New Mission',
        areaCoordinates: [{ lat: 49.939434, lng: -119.396427 }],
      };

      databaseService.createMission.mockRejectedValue(new Error('Database connection failed'));

      await createMissionController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database connection failed' });
    });
  });

  describe('updateMissionController', () => {
    it('should update a mission successfully', async () => {
      mockReq.params.id = '1';
      mockReq.body = {
        missionName: 'Updated Mission',
        progress: 50,
      };

      databaseService.updateMission.mockResolvedValue({ success: true });

      await updateMissionController(mockReq, mockRes);

      expect(databaseService.updateMission).toHaveBeenCalledWith('1', mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Mission updated successfully' });
    });

    it('should return 500 when update fails', async () => {
      mockReq.params.id = '1';
      mockReq.body = { missionName: 'Updated Mission' };

      databaseService.updateMission.mockResolvedValue({ success: false, error: 'Update failed' });

      await updateMissionController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Update failed' });
    });
  });

  describe('startMissionController', () => {
    it('should start a mission successfully', async () => {
      mockReq.params.id = '1';
      mockReq.body = { time: '2024-01-01T00:00:00Z' };

      databaseService.getAssignmentsForMission.mockResolvedValue([1, 2]);
      databaseService.startMission.mockResolvedValue({ success: true });

      await startMissionController(mockReq, mockRes);

      expect(databaseService.getAssignmentsForMission).toHaveBeenCalledWith('1');
      expect(databaseService.startMission).toHaveBeenCalledWith('1', '2024-01-01T00:00:00Z', [1, 2]);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Mission started successfully' });
    });

    it('should return 400 when time is missing', async () => {
      mockReq.params.id = '1';
      mockReq.body = {};

      await startMissionController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Start time is required' });
    });
  });

  describe('endMissionController', () => {
    it('should end a mission successfully', async () => {
      mockReq.params.id = '1';
      mockReq.body = { time: '2024-01-01T01:00:00Z' };

      databaseService.getAssignmentsForMission.mockResolvedValue([1, 2]);
      databaseService.endMission.mockResolvedValue({ success: true });

      await endMissionController(mockReq, mockRes);

      expect(databaseService.getAssignmentsForMission).toHaveBeenCalledWith('1');
      expect(databaseService.endMission).toHaveBeenCalledWith('1', '2024-01-01T01:00:00Z', [1, 2]);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Mission ended successfully' });
    });

    it('should return 400 when time is missing', async () => {
      mockReq.params.id = '1';
      mockReq.body = {};

      await endMissionController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'End time is required' });
    });
  });

  describe('deleteMissionController', () => {
    it('should delete a mission successfully', async () => {
      mockReq.params.id = '1';

      databaseService.deleteMission.mockResolvedValue({ success: true });

      await deleteMissionController(mockReq, mockRes);

      expect(databaseService.deleteMission).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Mission deleted successfully' });
    });

    it('should return 404 when mission not found', async () => {
      mockReq.params.id = '999';

      databaseService.deleteMission.mockResolvedValue({ success: false, error: 'Mission not found' });

      await deleteMissionController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Mission not found' });
    });
  });

  describe('assignBotsController', () => {
    it('should assign bots to a mission successfully', async () => {
      mockReq.params.id = '1';
      mockReq.body = { botIds: [1, 2, 3] };

      databaseService.assignBotsToMission.mockResolvedValue({ success: true });

      await assignBotsController(mockReq, mockRes);

      expect(databaseService.assignBotsToMission).toHaveBeenCalledWith('1', [1, 2, 3]);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Bots assigned successfully' });
    });

    it('should handle empty bot list', async () => {
      mockReq.params.id = '1';
      mockReq.body = {};

      databaseService.assignBotsToMission.mockResolvedValue({ success: true });

      await assignBotsController(mockReq, mockRes);

      expect(databaseService.assignBotsToMission).toHaveBeenCalledWith('1', []);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
