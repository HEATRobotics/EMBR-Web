import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import missionRoutes from '../routes/mission.routes.js';
import * as missionController from '../controllers/mission.controller.mjs';

vi.mock('../controllers/mission.controller.mjs');

describe('Mission Routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/missions', missionRoutes);
  });

  describe('GET /', () => {
    it('should call getAllMissionsController', async () => {
      vi.mocked(missionController.getAllMissionsController).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app).get('/api/missions');

      expect(response.status).toBe(200);
      expect(missionController.getAllMissionsController).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should call getMissionByIdController with mission ID', async () => {
      vi.mocked(missionController.getMissionByIdController).mockImplementation((req, res) => {
        res.status(200).json({});
      });

      const response = await request(app).get('/api/missions/1');

      expect(response.status).toBe(200);
      expect(missionController.getMissionByIdController).toHaveBeenCalled();
    });
  });

  describe('POST /', () => {
    it('should call createMissionController', async () => {
      vi.mocked(missionController.createMissionController).mockImplementation((req, res) => {
        res.status(201).json({ missionID: 1 });
      });

      const response = await request(app)
        .post('/api/missions')
        .send({ missionName: 'Test Mission' });

      expect(response.status).toBe(201);
      expect(missionController.createMissionController).toHaveBeenCalled();
    });
  });

  describe('PUT /:id', () => {
    it('should call updateMissionController', async () => {
      vi.mocked(missionController.updateMissionController).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Mission updated' });
      });

      const response = await request(app)
        .put('/api/missions/1')
        .send({ missionName: 'Updated Mission' });

      expect(response.status).toBe(200);
      expect(missionController.updateMissionController).toHaveBeenCalled();
    });
  });

  describe('PUT /start/:id', () => {
    it('should call startMissionController', async () => {
      vi.mocked(missionController.startMissionController).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Mission started' });
      });

      const response = await request(app)
        .put('/api/missions/start/1')
        .send({ time: '2024-01-01T00:00:00Z' });

      expect(response.status).toBe(200);
      expect(missionController.startMissionController).toHaveBeenCalled();
    });
  });

  describe('PUT /end/:id', () => {
    it('should call endMissionController', async () => {
      vi.mocked(missionController.endMissionController).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Mission ended' });
      });

      const response = await request(app)
        .put('/api/missions/end/1')
        .send({ time: '2024-01-01T01:00:00Z' });

      expect(response.status).toBe(200);
      expect(missionController.endMissionController).toHaveBeenCalled();
    });
  });

  describe('DELETE /:id', () => {
    it('should call deleteMissionController', async () => {
      vi.mocked(missionController.deleteMissionController).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Mission deleted' });
      });

      const response = await request(app).delete('/api/missions/1');

      expect(response.status).toBe(200);
      expect(missionController.deleteMissionController).toHaveBeenCalled();
    });
  });

  describe('POST /:id/assign', () => {
    it('should call assignBotsController', async () => {
      vi.mocked(missionController.assignBotsController).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Bots assigned' });
      });

      const response = await request(app)
        .post('/api/missions/1/assign')
        .send({ botIds: [1, 2] });

      expect(response.status).toBe(200);
      expect(missionController.assignBotsController).toHaveBeenCalled();
    });
  });
});
