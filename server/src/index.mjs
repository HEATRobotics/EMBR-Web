import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { serverConfig } from './config/server.config.mjs';
import missionRoutes from './routes/mission.routes.js';
import botRoutes from './routes/bot.routes.mjs';
import { setupSocketHandlers } from './sockets/socket.handlers.mjs';
import { simulateMavlinkData, setStoreMavlinkDataCallback } from './services/mavlink.service.mjs';
import { storeMavlinkData } from './services/mavlinkStorage.service.mjs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: serverConfig.corsOrigin,
        methods: ['GET', 'POST', 'DELETE', 'PUT'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: serverConfig.corsOrigin,
    methods: 'GET,POST,DELETE,PUT',
    credentials: true
}));
app.use(express.json()); 

// Routes
app.use('/api/missions', missionRoutes);
app.use('/api', botRoutes);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Setup MAVLink data handler with io context
setStoreMavlinkDataCallback((data) => storeMavlinkData(data, io));

// Start MAVLink data simulation
// handleMavlinkData();      // for real data
simulateMavlinkData();       // for simulated data

// Start server
httpServer.listen(serverConfig.port, () => {
    console.log(`Server running on port ${serverConfig.port}`);
    console.log(`WebSocket server ready`);
    console.log(`Environment: ${serverConfig.environment}`);
});
