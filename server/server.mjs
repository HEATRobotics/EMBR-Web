import express from 'express'
import cors from 'cors';
import assert from 'assert';

import missionRoutes from './routes/mission.routes.js';

import { handleMavlinkData, simulateMavlinkData } from './mavlinkHandler.mjs';
import {
    insertPositionData,
    insertTemperatureData,
    insertBatteryData
} from './database.mjs';
import { getAllBatteryData, getLatestBatteryData, getAllTemperatureData, getLatestTemperatureData, getLatestBotData } from './database.mjs';
import router from "./routes/mission.routes.js";

const app = express();
const port = 3100; 

app.use(cors({
    origin: 'http://localhost:3000', // Allow requests only from this origin
    methods: 'GET,POST', // Allow only specified HTTP methods
    credentials: true // Allow cookies to be sent cross-origin
}));
app.use(express.json()); 

// Routes (TODO: Move the other routes to separate files, like how we separated the mission routes into mission.routes.js)
app.use('/api/missions', missionRoutes);

// Object to store latest datapoints of each type of data. Each type is an array so we can keep track of latest position and temp data from multiple bots.
let latestMavlinkData = {
    position: [],
    temperature: []
};

/*
    Setup handler to receive realtime MAVLink data
*/
// handleMavlinkData();      // for real data, untouched from last year's competition
// simulateMavlinkData();  // for simulated data, copying the format of real data



/*
    Function to update the database and set latestMavlinkData to newest datapoint 
*/
async function storeMavlinkData(data) {

    assert(data.type === 'global_position' || data.type === 'temp_data' || data.type === 'battery_data', "Invalid MAVLink data type");

    // Change date/time to a format that works with the database
    data.clockTime = parseDateTime(data.clockTime);

    if (data.type === 'global_position') {
        await insertPositionData(data);
    } else if (data.type === 'temp_data') {
        await insertTemperatureData(data);
        // console.log(await getAllTemperatureData());
    }  else {
        await insertBatteryData(data);
        // console.log(await getAllBatteryData());
    }

    // Update the latestMavlinkData array with the newest data point
    latestMavlinkData = [];
    latestMavlinkData.push(data);
    console.log("Latest MAVLink data:", latestMavlinkData);
}

// Since I don't know what format the date/time will be sent by the bot, all you will need to do is update this function once you know the actual format
function parseDateTime(datetime){
    // Logic for parsing javascript's Date() object into YYYY-MM-DD HH:MM:SS format
    const year = datetime.getUTCFullYear();
    const month = String(datetime.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(datetime.getUTCDate()).padStart(2, '0');
    const hours = String(datetime.getUTCHours()).padStart(2, '0');
    const minutes = String(datetime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(datetime.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Get all temperature data
app.get('/api/temperature/all', async (req, res) => {
    try {
        const data = await getAllTemperatureData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Database function returned null.' });
        }
    } catch (error) {
        res.status(500).json({ error: `There was an error with calling the getAllTemperatureData database function: ${error.message}` });
    }
});

// Get latest temperature data
app.get('/api/temperature/latest', async (req, res) => {
    try {
        const data = await getLatestTemperatureData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Database function returned null.' });
        }
    } catch (error) {
        res.status(500).json({ error: `There was an error with calling the getLatestTemperatureData database function: ${error.message}` });
    }
});

// Get all battery data
app.get('/api/battery/all', async (req, res) => {
    try {
        const data = await getAllBatteryData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Database function returned null.' });
        }
    } catch (error) {
        res.status(500).json({ error: `There was an error with calling the getAllBatteryData database function: ${error.message}` });
    }
});

// Get latest battery data
app.get('/api/battery/latest', async (req, res) => {
    try {
        const data = await getLatestBatteryData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Database function returned null.' });
        }
    } catch (error) {
        res.status(500).json({ error: `There was an error with calling the getLatestBatteryData database function: ${error.message}` });
    }
});

// Get latest bots data
app.get('/api/bots/latest', async (req, res) => {
    try {
        const data = await getLatestBotData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Database function returned null.' });
        }
    } catch (error) {
        res.status(500).json({ error: `There was an error with calling the getLatestBotData database function: ${error.message}` });
    }
});




// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export { storeMavlinkData };