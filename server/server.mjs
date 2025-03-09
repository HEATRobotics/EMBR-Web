import express from 'express'
import cors from 'cors';
import assert from 'assert';

import missionRoutes from './routes/mission.routes.js';

import { handleMavlinkData, simulateMavlinkData } from './mavlinkHandler.mjs';
import { insertPositionData, insertTemperatureData, insertBatteryData } from './database.mjs';
import { getAllBatteryData, getLatestBatteryData, getAllTemperatureData, getLatestTemperatureData, getLatestFleetData } from './database.mjs';

const app = express();
const port = 3100; 

app.use(cors({
    origin: 'http://localhost:3000', // Allow requests only from this origin
    methods: 'GET,POST', // Allow only specified HTTP methods
    credentials: true // Allow cookies to be sent cross-origin
}));
app.use('/api/missions', missionRoutes);

// Object to store latest datapoints of each type of data. Each type is an array so we can keep track of latest position and temp data from multiple bots.
let latestMavlinkData = {
    position: [],
    temperature: []
};

/*
    Setup handler to receive realtime MAVLink data
*/
// handleMavlinkData();     for real data, untouched from last year's competition
simulateMavlinkData();  // for simulated data, copying the format of real data

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
    } else {
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
            res.status(500).json({ error: 'Failed to fetch temperature data.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching temperature data.' });
    }
});

// Get latest temperature data
app.get('/api/temperature/latest', async (req, res) => {
    try {
        const data = await getLatestTemperatureData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Failed to fetch the latest temperature data.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the latest temperature data.' });
    }
});

// Get all battery data
app.get('/api/battery/all', async (req, res) => {
    try {
        const data = await getAllBatteryData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Failed to fetch battery data.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching battery data.' });
    }
});

// Get latest battery data
app.get('/api/battery/latest', async (req, res) => {
    try {
        const data = await getLatestBatteryData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Failed to fetch the latest battery data.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the latest battery data.' });
    }
});

// Get latest fleets data
app.get('/api/fleets/latest', async (req, res) => {
    try {
        const data = await getLatestFleetData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Failed to fetch latest bot data.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching latest bot data.' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export { storeMavlinkData };