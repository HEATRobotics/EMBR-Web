import assert from 'assert';
import {
    insertPositionData,
    insertTemperatureData,
    insertBatteryData,
    getAllBatteryData,
    getAllTemperatureData,
    getLatestBotData,
    insertHotspotData
} from '../services/database.service.mjs';
import { parseDateTime } from '../utils/dateTime.utils.mjs';

// Object to store latest datapoints of each type of data. Each type is an array so we can keep track of latest position and temp data from multiple bots.
let latestMavlinkData = {
    position: [],
    temperature: []
};

/*
    Function to update the database and set latestMavlinkData to newest datapoint 
*/
export async function storeMavlinkData(data, io) {

    assert(data.type === 'global_position' || data.type === 'temp_data' || data.type === 'battery_data'|| data.type === 'hotspot_data', "Invalid MAVLink data type");

    // Change date/time to a format that works with the database
   if (data.clockTime) {
        data.clockTime = parseDateTime(data.clockTime);
    }
    if (data.detectedAt) {
        data.detectedAt = parseDateTime(data.detectedAt);
    }
    if (data.type === 'global_position') {
        await insertPositionData(data);
        // Emit position update to all connected clients
        const latestBotData = await getLatestBotData();
        io.emit('bots:update', latestBotData);
    } else if (data.type === 'temp_data') {
        await insertTemperatureData(data);
        // Emit temperature update to all connected clients
        const allTemperatureData = await getAllTemperatureData();
        io.emit('temperature:update', allTemperatureData);
    }else if(data.type === 'hotspot_data'){
        const res = await insertHotspotData({
            ...data, 
            detectedAt: data.detectedAt ?? data.clockTime,
        });
        io.emit('hotspot.created', res);
        return res; // this is what lets processTemperatureMessage know the hotspotID
        
    }  else {
        await insertBatteryData(data);
        // Emit battery update to all connected clients
        const allBatteryData = await getAllBatteryData();
        io.emit('battery:update', allBatteryData);
    }
    //TODO: insert hotspot data, don't worry about io.emit for now

    // Update the latestMavlinkData array with the newest data point
    latestMavlinkData = [];
    latestMavlinkData.push(data);
    console.log("Latest MAVLink data:", latestMavlinkData);
}
