import { SerialPort } from "serialport";
import mavlink from "node-mavlink";
import fetch from "node-fetch";
import { storeMavlinkData } from "./server.mjs";

const {
  MavLinkPacketSplitter,
  MavLinkPacketParser,
  MavLinkPacketRegistry,
  minimal,
  common,
  ardupilotmega,
} = mavlink;


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


  storeMavlinkData(globalPositionData);
}

function processTemperatureMessage(data) {
  
  const temperatureData = {
    type: "temp_data",
    botID: 1,
    clockTime: data.timeBootMs,
    temperature: data.value,
  };

  storeMavlinkData(temperatureData);
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
