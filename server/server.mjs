import express from 'express'
import cors from 'cors';
import mysql from 'mysql2/promise';
import assert from 'assert';

import { handleMavlinkData, simulateMavlinkData } from './mavlinkHandler.mjs';
import { insertPositionData, insertTemperatureData, insertBatteryData } from './database.mjs';

const pool = await mysql.createPool({
  host: 'localhost',
  user: 'testuser',
  password: 'pw',
  database: 'embr',
  port: 3307,
  waitForConnections: true, // if connection limit is reached, queue the connection and wait for it to be released
  connectionLimit: 5,
  maxIdle: 10, // max idle connections
  idleTimeout: 120000, // idle connections timeout: 2 minutes
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

const app = express();
const port = 3100; 

// Object to store latest datapoints of each type of data. Each type is an array so we can keep track of latest position and temp data from multiple bots.
let latestMavlinkData = {
    position: [],
    temperature: []
};

/*
    Setup handler to receive realtime MAVLink data
*/
// handleMavlinkData();     for real data, untouched from last year's competition
handleSampleMavlinkData();  // for simulated data, copying the format of real data

/* 
    Function to update the database and set latestMavlinkData to newest datapoint 
*/
async function storeMavlinkData(data) {

    assert(data.type === 'global_position' || data.type === 'temp_data', "Invalid MAVLink data type");

    // Change date/time to a format that works with the database
    data.timestamp = parseDateTime(data.timestamp);

    if (data.type === 'global_position') {
        await insertPositionData(data);
    } else if (data.type === 'temp_data') {
        await insertTemperatureData(data);
    }

    // Update the latestMavlinkData array with the newest data point
    latestMavlinkData = [];
    latestMavlinkData.push(data);
    console.log("Latest MAVLink data:", latestMavlinkData);
}

// Since we don't know what format the date/time will be sent by the bot, all you will need to do is update this function once you know the actual format
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

app.use(cors({
    origin: 'http://localhost:3000', // Allow requests only from this origin
    methods: 'GET,POST', // Allow only specified HTTP methods
    credentials: true // Allow cookies to be sent cross-origin
}));


app.get('/api/all-mavlink-data', (req, res) => {

});

// Returns latest datapoint received from MAVLink
app.get('/api/latest-mavlink-data', (req, res) => {
    res.json(latestMavlinkData); 
    console.log(latestMavlinkData);
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export { storeMavlinkData };