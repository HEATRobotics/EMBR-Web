import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import botRoutes from '../routes/bot.routes.mjs';
import * as botController from '../controllers/bot.controller.mjs';

vi.mock('../controllers/bot.controller.mjs');

describe('Bot Routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/bots', botRoutes);
  });

  describe('GET /', () => {
    it('should call getLatestBots controller', async () => {
      vi.mocked(botController.getLatestBots).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app).get('/api/bots');

      expect(response.status).toBe(200);
      expect(botController.getLatestBots).toHaveBeenCalled();
    });
  });

  describe('GET /battery', () => {
    it('should call getAllBattery controller', async () => {
      vi.mocked(botController.getAllBattery).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app).get('/api/bots/battery');

      expect(response.status).toBe(200);
      expect(botController.getAllBattery).toHaveBeenCalled();
    });
  });

  describe('GET /battery/latest', () => {
    it('should call getLatestBattery controller', async () => {
      vi.mocked(botController.getLatestBattery).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app).get('/api/bots/battery/latest');

      expect(response.status).toBe(200);
      expect(botController.getLatestBattery).toHaveBeenCalled();
    });
  });
});
