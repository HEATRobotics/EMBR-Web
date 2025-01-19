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
  TODO: support fleet ID
*/
function handleSampleMavlinkData(){

  console.log("Simulating MAVLink data...");

  // simulate incoming data every 10 seconds
  setInterval(() => {

    // simulating REGISTRY[packet.header.msgid] above
    const messageType = Math.random() > 0.5 ? "GLOBAL_POSITION_INT" : "NAMED_VALUE_FLOAT";
    
    if (messageType === "GLOBAL_POSITION_INT") {

      const simulatedGlobalPositionData = {
        timeBootMs: new Date(),
        id: Math.floor(Math.random() * 10) + 1,
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

      const simulatedCustomData = {
        timeBootMs: new Date(),
        id: Math.floor(Math.random() * 10) + 1,
        name: "temp",
        value: Math.random() * 100, 
      };

      processTemperatureMessage(simulatedCustomData);

    }
  }, 10000); // Every 10 seconds
}

//process gps coordinates and send to server
function processGlobalPositionMessage(data) {
  const globalPositionData = {
    type: "global_position",
    bot_id: data.id,
    timestamp: data.timeBootMs,
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
  
  const TemperatureData = {
    type: "temp_data",
    bot_id: data.id,
    timestamp: data.timeBootMs,
    temperature: data.value,
  };

  storeMavlinkData(TemperatureData);
}

export { handleMavlinkData, handleSampleMavlinkData };
