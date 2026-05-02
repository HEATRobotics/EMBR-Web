import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { sendMissionCoordinates, handleMavlinkData } from "./services/mavlink.service.mjs";
import { serverConfig } from './config/server.config.mjs';
import missionRoutes from './routes/mission.routes.js';
import botRoutes from './routes/bot.routes.mjs';
import temperatureRoutes from './routes/temperature.routes.mjs';
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
app.use('/api/bots', botRoutes);
app.use('/api/temperature', temperatureRoutes);


// ================= ROUTES =================

app.post('/api/send-coordinates', async (req, res) => {
    try {
        let coords = req.body;

        if (!coords || Object.keys(coords).length === 0) {
            console.log("No coordinates provided. Generating random test coordinates...");

            coords = {
                lat1: 499394300,
                lon1: -1193964200,
                lat2: 499394500,
                lon2: -1193964500,
                lat3: 499394700,
                lon3: -1193964300,
                lat4: 499394900,
                lon4: -1193964700
            };
        }
        botID = 1;
        console.log("Website requested send-coordinates (botID = 1):");
        console.log(coords);
        
        await sendMissionCoordinates(botID, coords);

        return res.status(200).json({
            success: true,
            message: "Mission coordinates successfully sent to robot.",
            sent: coords
        });

    } catch (error) {
        console.error("Error sending coordinates:", error);
        return res.status(500).json({ error: "Failed to send mission coordinates." });
    }
});



// Setup Socket.IO handlers
setupSocketHandlers(io);

// Setup MAVLink data handler with io context
setStoreMavlinkDataCallback((data) => storeMavlinkData(data, io));

// Start MAVLink data simulation
handleMavlinkData();      // for real data
// simulateMavlinkData();       // for simulated data


// Start server
httpServer.listen(serverConfig.port, () => {
    console.log(`Server running on port ${serverConfig.port}`);
    console.log(`WebSocket server ready`);
    console.log(`Environment: ${serverConfig.environment}`);
});

    
