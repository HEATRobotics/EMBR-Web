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
  const portSerialNumber = "\\\\.\\COM18";

  const serialPort = new SerialPort({
    path: portSerialNumber,
    baudRate: 1200,
  });

  //constructing a reader that will emit each packet separately
  const mavlinkRead = serialPort
    .pipe(new MavLinkPacketSplitter())
    .pipe(new MavLinkPacketParser());
  console.log("hello from mavlink");
  //storeMavlinkData(1);

  //setup mavlink to listen for packets
  mavlinkRead.on("data", async (packet) => {
    const clazz = REGISTRY[packet.header.msgid];
    if (clazz) {
      const data = packet.protocol.data(packet.payload, clazz);
      //process the parsed data based on type
      switch (clazz.MSG_NAME) {
        case "GLOBAL_POSITION_INT":
          processGlobalPositionMessage(data);
          break;
        case "NAMED_VALUE_FLOAT":
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

  setInterval(() => {

    // Possible message types correspond to the two types of REGISTRY[packet.header.msgid] from above switch case
    const messageType = Math.random() > 0.5 ? "GLOBAL_POSITION_INT" : "NAMED_VALUE_FLOAT";

    if (messageType === "GLOBAL_POSITION_INT") {

      const simulatedGlobalPositionData = {
        timeBootMs: new Date(),
        id: Math.floor(Math.random() * 5) + 1,    // Assuming 5 bots
        lat: Math.floor(Math.random() * 180000000) - 90000000, // Simulated latitude
        lon: Math.floor(Math.random() * 360000000) - 180000000, // Simulated longitude
        alt: Math.random() * 10000, // Simulated altitude (in meters)
        relative_alt: Math.random() * 5000, // Simulated relative altitude
        vx: Math.random() * 100, // Simulated X speed
        vy: Math.random() * 100, // Simulated Y speed
        vz: Math.random() * 100, // Simulated Z speed
        hdg: Math.random() * 36000, // Simulated heading (in centidegrees)
      };
      processGlobalPositionMessage(simulatedGlobalPositionData);

    } else if (messageType === "NAMED_VALUE_FLOAT") {

      const simulatedTempData = {
        timeBootMs: new Date(),
        id: Math.floor(Math.random() * 10) + 1,
        name: "temp",
        value: Math.random() * 100,
      };
      processTemperatureMessage(simulatedTempData);
    }

  }, 5000); // 5 second timer

  // Simulate incoming battery data from all bots, every 15 seconds 

  let batteryPercentages = [100,100,100,100,100];
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
    botID: data.id,
    clockTime: data.timeBootMs,
    latitude: data.lat / 1.0e7,
    longitude: data.lon / 1.0e7,
    altitude: data.alt / 1000.0,
    relativeAltitude: data.relative_alt / 1000.0,
    groundXSpeed: data.vx / 100.0,
    groundYSpeed: data.vy / 100.0,
    groundZSpeed: data.vz / 100.0,
    vehicleHeading: data.hdg / 100.0,
  };

  storeMavlinkData(globalPositionData);
}

function processTemperatureMessage(data) {
  
  const temperatureData = {
    type: "temp_data",
    botID: data.id,
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
    botID: data.id,
    clockTime: data.timeBootMs,
    battery: data.battery
  };

  storeMavlinkData(batteryData);
}

export { handleMavlinkData, simulateMavlinkData };
