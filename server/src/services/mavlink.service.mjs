// mavlinkHandler.mjs
import { SerialPort } from "serialport";
import mavlink from "node-mavlink";
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

// --- START CHANGE: Reuse serial port for mission upload ---
async function sendMissionCoordinates(coords) {
  const { lat1, lon1, lat2, lon2, lat3, lon3, lat4, lon4 } = coords;

  console.log("Sending mission coordinates to robot...");

  const port = getSerialPort(); // <-- REUSED SINGLETON

  // Helper to send one waypoint
  const sendWp = (seq, lat, lon) => {
    const wp = new common.MissionItemInt(
      1,   // target system id
      1,   // target component id
      seq, // waypoint index
      0,   // frame (0 = global)
      16,  // command (16 = NAV_WAYPOINT)
      0,   // current
      1,   // autocontinue
      0, 0, 0, 0,  
      lat, // latitude * 1e7
      lon, // longitude * 1e7
      50   // altitude 50m
    );

    const buffer = mavEncoder.pack(wp);
    port.write(buffer);
    console.log(`Sent WP ${seq}: lat=${lat}, lon=${lon}`);
  };

  // Send 4 mission points
  sendWp(0, lat1, lon1);
  sendWp(1, lat2, lon2);
  sendWp(2, lat3, lon3);
  sendWp(3, lat4, lon4);

  console.log("All mission coordinates sent.");
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
  console.log("Simulating MAVLink data...");
  const NUM_SIMULATED_BOTS = 3;

  // Initalize list of bot (Assume 3 bots for now)
  let botPositionData = [];
  let botTempData = [];

  for (let i = 0; i < NUM_SIMULATED_BOTS; i++) {
    
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
      id: i+1,
      name: "temp",
      value: Math.random() * 100,
    }
  }


  setInterval(() => {
    // Randomly select a bot and update it's postion or temperature value
    const messageType = Math.random() > 0.5 ? "GLOBAL_POSITION_INT" : "NAMED_VALUE_FLOAT";
    for (let botId = 0; botId < NUM_SIMULATED_BOTS; botId++) {
      if (messageType === "GLOBAL_POSITION_INT") {
        let data = botPositionData[botId];
        // Randomly update data relative to previous value
        data.timeBootMs = new Date();
        data.lat += (Math.random() * 400) - 200;
        data.lon += (Math.random() * 800) - 400;
        data.alt += (Math.random() * 100) - 50; 
        data.relative_alt += (Math.random() * 10) - 5;
        data.vx += (Math.random() * 10) - 5;
        data.vy += (Math.random() * 10) - 5;
        data.vz += (Math.random() * 10) - 5;
        data.hdg += (Math.random() * 10) - 5;
        
        botPositionData[botId] = data;
        processGlobalPositionMessage(data);
  
      } else if (messageType === "NAMED_VALUE_FLOAT") {
        let data = botTempData[botId]
        
        data.timeBootMs = new Date();
        data.value += (Math.random() * 4);

        botTempData[botId] = data;
        processTemperatureMessage(data);
      }
    }
    

  }, 5000); // 5 second timer

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
  const globalPositionData = {
    type: "global_position",
    botID: 1,
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

  if (storeMavlinkDataCallback) {
    storeMavlinkDataCallback(globalPositionData);
  }
}

function processTemperatureMessage(data) {
  
  const temperatureData = {
    type: "temp_data",
    botID: 1,
    clockTime: data.timeBootMs,
    temperature: data.value,
  };

  if (storeMavlinkDataCallback) {
    storeMavlinkDataCallback(temperatureData);
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
