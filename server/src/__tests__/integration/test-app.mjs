import express from 'express';
import cors from 'cors';
import missionRoutes from '../../routes/mission.routes.js';
import botRoutes from '../../routes/bot.routes.mjs';
import temperatureRoutes from '../../routes/temperature.routes.mjs';

/**
 * Create an Express app configured for integration testing
 * @param {Object} dbConfig - Database configuration to override environment variables
 * @returns {Express.Application} Configured Express app
 */
export function createTestApp(dbConfig) {
  // Set environment variables for the test database
  if (dbConfig) {
    process.env.DB_HOST = dbConfig.host;
    process.env.DB_USER = dbConfig.user;
    process.env.DB_PASSWORD = dbConfig.password;
    process.env.DB_NAME = dbConfig.database;
    process.env.DB_PORT = dbConfig.port?.toString();
  }

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/missions', missionRoutes);
  app.use('/api/bots', botRoutes);
  app.use('/api/temperature', temperatureRoutes);

  // Error handling
  app.use((err, req, res, next) => {
    console.error('Test app error:', err);
    res.status(500).json({ error: err.message });
  });

  return app;
}
