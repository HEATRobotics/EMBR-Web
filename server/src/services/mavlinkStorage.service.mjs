import assert from 'assert';
import {
  insertPositionData,
  insertTemperatureData,
  insertBatteryData,
  getAllBatteryData,
  getAllTemperatureData,
  getLatestBotData,
  insertHotspotData,
  getHotspotByID,
  getTemperatureByHotspotID
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

        if(data.finalize && data.hotspotID){
            const hotspot = await getHotspotByID(data.hotspotID);
            const temperature = await getTemperatureByHotspotID(data.hotspotID);
            if(temperature && temperature.length == 10){
                io.emit('hotspot.created', { ...hotspot, temperatures: temperature });
            }

        }
    }else if(data.type === 'hotspot_data'){
        const newHotspotData = {
            ...data,
            detectedAt: data.detectedAt ?? data.clockTime,
        };
        
        const res = await insertHotspotData(newHotspotData);

  // Log so you can see it in the server console
        console.log("HOTSPOT CREATED:", { ... newHotspotData, hotspotID: res?.hotspotID });

  // Emit so clients can see it instantly
        if (res?.hotspotID) {
            io.emit('hotspot:created', { ...newHotspotData, hotspotID: res.hotspotID });
        } else {
            console.error('ERROR: hotspot:create_failed', { ...newHotspotData, result: res });
        }

  // Return so processTemperatureMessage can attach temperatures to this hotspot

      return res;
    }  else {
        await insertBatteryData(data);
        // Emit battery update to all connected clients
        const allBatteryData = await getAllBatteryData();
        io.emit('battery:update', allBatteryData);
    }
   

    // Update the latestMavlinkData array with the newest data point
    latestMavlinkData = [];
    latestMavlinkData.push(data);
    console.log("Latest MAVLink data:", latestMavlinkData);
}
