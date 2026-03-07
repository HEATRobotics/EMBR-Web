import { SerialPort } from "serialport";
import mavlink from "node-mavlink";
import fetch from "node-fetch";

let storeMavlinkDataCallback = null;

export function setStoreMavlinkDataCallback(callback) {
    storeMavlinkDataCallback = callback;
}

const {
  MavLinkPacketSplitter,
  MavLinkPacketParser,
  MavLinkPacketRegistry,
  minimal,
  common,
  ardupilotmega,
} = mavlink;
const latestGPS = {};
const tempVals = {};


//create a registry of mappings between msg id and data
const REGISTRY = {
  ...minimal.REGISTRY,
  ...common.REGISTRY,
  ...ardupilotmega.REGISTRY,
};

// substitute /dev/ttyACM0 with your serial port!

function handleMavlinkData() {

  //serialPort.close();
  const portSerialNumber = "/dev/ttyUSB0";

  const serialPort = new SerialPort({
    path: portSerialNumber,
    baudRate: 57600,
  });

  //constructing a reader that will emit each packet separately
  const mavlinkRead = serialPort
    .pipe(new MavLinkPacketSplitter())
    .pipe(new MavLinkPacketParser());
  console.log("hello from mavlink");
  //storeMavlinkData(1);

  //setup mavlink to listen for packets
  mavlinkRead.on("data", async (packet) => {
    console.log("Packet received");
    const clazz = REGISTRY[packet.header.msgid];
    if (clazz) {
      const data = packet.protocol.data(packet.payload, clazz);
      data.timeBootMs = new Date();
      //process the parsed data based on type
      switch (clazz.MSG_NAME) {
        case "GLOBAL_POSITION_INT":
          console.log("GLOBAL_POSITION_INT");
          processGlobalPositionMessage(data);
          break;
        case "NAMED_VALUE_FLOAT":
          console.log("NAMED_VALUE_FLOAT");
          processTemperatureMessage(data);
          break;
        default:
          console.log("Unknown message type:", clazz.MSG_NAME);
      }
    }
  });

  mavlinkRead.on("error", (error) => {
    console.error("Error reading Mavlink data:", error);
  });
}

/*
  Function to simulate incoming temp/position/battery data, trying to copy the format of data objects that previous devs were processing in below functions (processTemperatureMessage and processGlobalPositionMessage, which I have mostly not touched since then). I assumed that the data format for temp and position data will stay the same as Apr 2024, because I was told that this code worked during the demo last year.

  This function simulates 
    1) Every 5 seconds, either position or temperature data with a 50/50 chance, coming in from a bot with random ID between 1-5    
    2) Every 15 seconds, data for percentage battery remaining for all 5 bots. 
    
  NOTE: data format for simulated battery data is arbitrary; i.e. the keys do not correspond to actual incoming data, because battery percentage is new and I do not yet know the format in which battery % will be sent by the bot. Once format is finalized, function processBatteryMessage() as well as the 'battery' table in DB must both be changed, and the battery simulation part of the function will break unless also changed accordingly.
*/

let simStarted = false;
function simulateMavlinkData() {
  if(simStarted) return; 
  simStarted = true;
  //make it so that one temperature value is stored every second for each bot
  console.log("Simulating MAVLink data...");
  const NUM_SIMULATED_BOTS = 3;

  // Initalize list of bot (Assume 3 bots for now)
  let botPositionData = [];
  let botTempData = [];

  let temperatureTick = false; //start with GPS so latestGPS is populated before temp data

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
  let stationaryCounters = new Array(NUM_SIMULATED_BOTS).fill(0);
  const STATIONARY_REQUIRED_SECONDS = 2; // seconds
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
      console.error("Hotspot creation threw for bot", botID, err);
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


export { handleMavlinkData, simulateMavlinkData };
