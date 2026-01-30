import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import temperatureRoutes from '../routes/temperature.routes.mjs';
import * as temperatureController from '../controllers/temperature.controller.mjs';

vi.mock('../controllers/temperature.controller.mjs');

describe('Temperature Routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/temperature', temperatureRoutes);
  });

  describe('GET /', () => {
    it('should call getAllTemperature controller', async () => {
      vi.mocked(temperatureController.getAllTemperature).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app).get('/api/temperature');

      expect(response.status).toBe(200);
      expect(temperatureController.getAllTemperature).toHaveBeenCalled();
    });
  });

  describe('GET /bot/:botID', () => {
    it('should call getTemperaturesByBotController with bot ID', async () => {
      vi.mocked(temperatureController.getTemperaturesByBotController).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app).get('/api/temperature/bot/1');

      expect(response.status).toBe(200);
      expect(temperatureController.getTemperaturesByBotController).toHaveBeenCalled();
    });
  });

  describe('GET /mission/:missionID', () => {
    it('should call getTemperaturesByMissionController with mission ID', async () => {
      vi.mocked(temperatureController.getTemperaturesByMissionController).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app).get('/api/temperature/mission/1');

      expect(response.status).toBe(200);
      expect(temperatureController.getTemperaturesByMissionController).toHaveBeenCalled();
    });
  });
});
