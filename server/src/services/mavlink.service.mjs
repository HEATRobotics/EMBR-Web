// mavlinkHandler.mjs
import { SerialPort } from "serialport";
import mavlink from "node-mavlink";
import { MavLinkProtocolV2, send} from 'node-mavlink';
import fetch from "node-fetch";

let storeMavlinkDataCallback = null;

const {
  MavLinkPacketSplitter,
  MavLinkPacketParser,
  MavLinkPacketRegistry,
  minimal,
  common,
  ardupilotmega,
} = mavlink;

export function setStoreMavlinkDataCallback(callback) {
    storeMavlinkDataCallback = callback;
}

// --- START CHANGE: Singleton Serial Port Setup ---
let serialPort = null;

function getSerialPort() {
  if (!serialPort) {
    serialPort = new SerialPort({
      path: "/dev/ttyUSB0",  // <-- Change this if you use by-id path
      baudRate: 57600,
    });

    serialPort.on("open", () => {
      console.log("Serial port open.");
    });

    serialPort.on("error", (err) => {
      console.error("Serial port error:", err);
    });
  }
  return serialPort;
}
// --- END CHANGE: Singleton Serial Port Setup ---



// Registry for message parsing
const REGISTRY = {
  ...minimal.REGISTRY,
  ...common.REGISTRY,
  ...ardupilotmega.REGISTRY,
};

///
function encodeMissionData(numTempReadings , coords) {

  const { lat1, lon1, lat2, lon2, lat3, lon3, lat4, lon4 } = coords;

  const lats = [lat1,lat2,lat3,lat4];
  const lons = [lon1,lon2,lon3,lon4];

  // Create a buffer for the full MAVLink payload (249 bytes)
  const buffer = Buffer.alloc(249);
  let offset = 0;

  // Pack number of temperature readings
  buffer.writeInt32LE(numTempReadings, offset);
  offset += 4;

  // Pack Latitudes (Int32, Little Endian)
  lats.forEach(lat => {
      buffer.writeInt32LE((lat*1e7), offset);
      offset += 4;
  });

  // Pack Longitudes (Int32, Little Endian)
  lons.forEach(lon => {
      buffer.writeInt32LE(lon*1e7, offset);
      offset += 4;
  });

  // Return the 249-byte array ready for MAVLink
  return Array.from(buffer);
}
///

// --- START CHANGE: Reuse serial port for mission upload ---
let receivedAck = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMissionCoordinates(botId, numTempReadings , coords) {
///
  const payload = encodeMissionData(numTempReadings , coords);
  
  const msg = new common.LoggingDataAcked();
    msg.target_system = botId;
    msg.target_component = 0;
    msg.seq = 0;
    msg.length = 249;
    msg.first_message_offset = 0;
    msg.data = payload;

  console.log("Sending mission data to bot " + botId + "...");

  const port = getSerialPort();

  await send(port, msg, new MavLinkProtocolV2());

  let timer = 0;
  const timeLimit = 5;  // maximum wait time(in seconds) to receive acknowledgement
  let countSend = 1;
  const sendLimit = 3;  // limit of amount time for data to be sent until acknowledgement is received
  while(receivedAck == false && countSend <= sendLimit) {
    while(receivedAck == false && timer <= timeLimit) {
      await sleep(1000);
      timer++;
    }
    timer = 0; // reset the timer

    if (receivedAck == true) {
      console.log("Received acknowledgement from bot", botId);
    }
    else {
      console.error("Did not receive acknowledgement from bot", botId);
      console.log("Trying again...");
      await send(port, msg, new MavLinkProtocolV2());
    }
    countSend++;
  }
  if(receivedAck == false) {
    throw new Error("Failed to receive acknowledgement from bot " + botId + 
      " after trying " + sendLimit + " times");
  }
  receivedAck = false;
}
// --- END CHANGE: Reuse serial port for mission upload ---

// --- START CHANGE: Reuse serial port for reading MAVLink ---
function handleMavlinkData() {
  const port = getSerialPort(); // <-- REUSED SINGLETON

  // constructing a reader that will emit each packet separately
  const mavlinkRead = port
    .pipe(new mavlink.MavLinkPacketSplitter())
    .pipe(new mavlink.MavLinkPacketParser());

  console.log("MAVLink reader initialized.");

  mavlinkRead.on("data", (packet) => {
    const clazz = REGISTRY[packet.header.msgid];
    if (clazz) {
      const data = packet.protocol.data(packet.payload, clazz);
      data.timeBootMs = new Date();
      switch (clazz.MSG_NAME) {
        case "GLOBAL_POSITION_INT":
          console.log("GLOBAL_POSITION_INT received");
          processGlobalPositionMessage(data);
          break;
        case "NAMED_VALUE_FLOAT":
          console.log("NAMED_VALUE_FLOAT received");
          processTemperatureMessage(data);
          break;
        case "LOGGING_ACK":
          console.log("LOGGING_ACK received");
          receivedAck = true;
          break;
        default:
          console.log("Unknown message type:", clazz.MSG_NAME);
      }
    }
  });

  mavlinkRead.on("error", (err) => {
    console.error("Error reading MAVLink:", err);
  });
}
// --- END CHANGE: Reuse serial port for reading MAVLink ---

// Simulate data (unchanged)
function simulateMavlinkData() {
  //make it so that one temperature value is stored every second for each bot
 
  console.log("Simulating MAVLink data...");
  const NUM_SIMULATED_BOTS = 3;

  // Initalize list of bot (Assume 3 bots for now)
  let botPositionData = [];
  let botTempData = [];


  for (let i = 0; i < NUM_SIMULATED_BOTS; i++) { //to initialize data for each bot
    
    // UBCO location:
    // Lat: 49.939434 -> 499394340
    // Lon: -119.396427 -> -1193964270
    
    // Initizalize Position Data For bot
    botPositionData[i] = {
      timeBootMs: new Date(),
      id: i+1,
      lat: 499394340 + Math.floor(Math.random() * 4000) - 2000, // 1 represents ~1cm
      lon: -1193964270 + Math.floor(Math.random() * 4000) - 2000,
      alt: Math.random() * 10000,
      relative_alt: Math.random() * 5000,
      vx: Math.random() * 100,
      vy: Math.random() * 100,
      vz: Math.random() * 100,
      hdg: Math.random() * 36000, // (in centidegrees)
    };
    

    // Initialize Temp Data for bot
    botTempData[i] = {
      timeBootMs: new Date(),
      id: i + 1,
      name: "temp",
      value: 20 + Math.random() * 80,
    }

  
  }

  for (let i = 0; i < NUM_SIMULATED_BOTS; i++) {
    processGlobalPositionMessage(botPositionData[i]);
  }
  let stationaryCounters = new Array(NUM_SIMULATED_BOTS).fill(0);
  const STATIONARY_REQUIRED_SECONDS = 1; // seconds
// simulate incoming position or temp data from all bots every second

  const GPS_TICK_MS = 5000;          
  const GPS_SEND_EVERY_MS = 12000;     
  const TEMP_SEND_EVERY_MS = 10000;    

let nextBotToUpdate = 0;

// Per-bot “next allowed send time” so they don’t all send together
const nextGpsSendAt = new Array(NUM_SIMULATED_BOTS).fill(0);
const nextTempSendAt = new Array(NUM_SIMULATED_BOTS).fill(0);

setInterval(() => {
  const botID = nextBotToUpdate;
  nextBotToUpdate = (nextBotToUpdate + 1) % NUM_SIMULATED_BOTS;

  let posData = botPositionData[botID];
  const now = Date.now();

  // --- update the bot "state" every time it gets its turn ---
  posData.timeBootMs = new Date();
  posData.alt += (Math.random() * 100) - 50;
  posData.relative_alt += (Math.random() * 10) - 5;

  if (Math.random() < 0.5) {
    posData.vx = 0;
    posData.vy = 0;
    posData.vz = 0;
  } else {
    posData.vx += (Math.random() * 10) - 5;
    posData.vy += (Math.random() * 10) - 5;
    posData.vz += (Math.random() * 10) - 5;
  }

  const stopped = (posData.vx === 0 && posData.vy === 0 && posData.vz === 0);
  if (stopped) {
    posData.lat += (Math.random() * 20) - 10;
    posData.lon += (Math.random() * 20) - 10;
  } else {
    posData.lat += (Math.random() * 400) - 200;
    posData.lon += (Math.random() * 800) - 400;
  }
  posData.hdg += (Math.random() * 10) - 5;

  botPositionData[botID] = posData;

  // send GPS only when this bot is “due”
  if (now >= nextGpsSendAt[botID]) {
    processGlobalPositionMessage(posData);

    const jitter = Math.floor((Math.random() * 600) - 300); 
    nextGpsSendAt[botID] = now + GPS_SEND_EVERY_MS + jitter;
  }

  // temp only if stopped for a few seconds
  if (stopped) {
    stationaryCounters[botID]++;

    if (stationaryCounters[botID] >= STATIONARY_REQUIRED_SECONDS) {
      if (now >= nextTempSendAt[botID]) {
        let tempData = botTempData[botID];
        tempData.timeBootMs = posData.timeBootMs;
        tempData.value += (Math.random() * 0.6) - 0.2;
        botTempData[botID] = tempData;

        processTemperatureMessage(tempData);

        const tempJitter = Math.floor((Math.random() * 300) - 150);
        nextTempSendAt[botID] = now + TEMP_SEND_EVERY_MS + tempJitter;
      }
    }
  } else {
    stationaryCounters[botID] = 0;
  }

}, GPS_TICK_MS);

  // Simulate incoming battery data from all bots, every 15 seconds 

  let batteryPercentages = [100,100,100];
  setInterval(() => {
    for (let index = 0; index < batteryPercentages.length; index++) {

      batteryPercentages[index] = Math.max(0, batteryPercentages[index] - Math.random() * 5); // Decrease battery percentage by a random amount

      const simulatedBatteryData = {
        id: index+1,            
        timeBootMs: new Date(),
        battery: batteryPercentages[index],
      };
      processBatteryMessage(simulatedBatteryData);
    }
  }, 15000); // 15 second timer
}

//process gps coordinates and send to server
function processGlobalPositionMessage(data) {
  const botID = data.id ?? 1;
  const globalPositionData = {
    type: "global_position",
    botID, 
    clockTime: data.timeBootMs,
    latitude: data.lat / 1.0e7,
    longitude: data.lon / 1.0e7,
    altitude: data.alt / 1000.0,
    relativeAltitude: 0,
    groundXSpeed: data.vx,
    groundYSpeed: data.vy,
    groundZSpeed: data.vz,
    vehicleHeading: data.hdg / 100.0,
  };

  latestGPS[globalPositionData.botID] = {latitude: globalPositionData.latitude, 
    longitude: globalPositionData.longitude, altitude: globalPositionData.altitude, clockTime: globalPositionData.clockTime}; // store latest GPS for the specified bot which in this case is BOtID 1
  console.log("GPS stored for bot", botID, latestGPS[botID]);


  if (storeMavlinkDataCallback) {
    storeMavlinkDataCallback(globalPositionData);
  }
}
const tempCounters = {};
const currentHotspotID = {}; 
const latestGPS = {};
// declare constant gps data
async function processTemperatureMessage(data) {
   const botID = data.id ?? 1;

  if (tempCounters[botID] == null) tempCounters[botID] = 0;
  if (currentHotspotID[botID] == null) currentHotspotID[botID] = null;
  const gps = latestGPS[botID];
  if(!gps){
    console.log("No GPS data for botID ", botID, " cannot process temperature message");
    return; // Stop processing if no GPS data
  }

  if(tempCounters[botID] === 0){
    const hotspotData = {
      type : "hotspot_data",
      botID, 
      missionID: currentMissionID,
      detectedAt: data.timeBootMs,
      latitude : latestGPS[botID].latitude, 
      longitude : latestGPS[botID].longitude, 
      altitude : latestGPS[botID].altitude ?? null, 
      // notes : null ?
     

    };
    try { 
      const res = await storeMavlinkDataCallback(hotspotData);
      currentHotspotID[botID] = (res && (res.id ?? res.hotspotID)) || null;

    }catch (error){
      console.error("Hotspot creation threw for bot", botID, error);
      currentHotspotID[botID] = null;
      return;
    }

    
  }
  
  const lastTempHotspot = (tempCounters[botID] === 9);
   
    const temperatureData = {
    type: "temp_data",
    botID,
    hotspotID: currentHotspotID[botID],
    clockTime: data.timeBootMs,
    temperature: data.value,
    finalize : lastTempHotspot,
  };

  try { 
    await storeMavlinkDataCallback(temperatureData);

  }catch (error) { 
    console.error("Storing temperature data threw for bot", botID, error);
    currentHotspotID[botID] = null;

  }
    

  tempCounters[botID] = (tempCounters[botID] + 1) % 10;

  //After 10 temperature readings, reset hotspot so next temperature reading creates a new hotspot
     if (tempCounters[botID] === 0) {
      currentHotspotID[botID] = null;
    
  }
}
  

function processBatteryMessage(data) {
  
  // This function assumes the actual incoming battery data has keys "id", "timeBootMs", and "battery". 
  // This is because previously written functions for processing temp and position messages expect "id" and "timeBootMs".
  // However, it is unlikely that actual battery data will have the same keys (since idk if it comes from the same module), so the below object will need to be changed. 

  const batteryData = {
    type: "battery_data",
    botID: 1,
    clockTime: data.timeBootMs,
    battery: data.battery
  };

  // storeMavlinkData(batteryData);
}

export { handleMavlinkData, simulateMavlinkData, sendMissionCoordinates };