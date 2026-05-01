# Server Documentation

The server code is responsible for handling backend operations, including API endpoints, database interactions, and MAVLink data processing. It is built using Node.js and Express, with MySQL as the database.

---

## **Database Structure**

The database is managed using MySQL. Below is an overview of the key tables:

### **1. `bot`**

- **Fields**:
  - `botID`: Primary key, unique identifier for each bot.
  - Other bot-specific details (not fully detailed in the provided code).

### **2. `mission`**

- **Fields**:
  - `missionID`: Primary key, auto-incremented.
  - `botID`: Foreign key referencing the `bot` table.
  - `missionName`: Name of the mission.
  - `areaCoordinates`: JSON field storing mission area coordinates.
  - `progress`: Decimal value indicating mission progress.
  - `avgTemp`: Average temperature recorded during the mission.
  - `timeStart`: Time Stamp of when the mission is started 'null' if mission not started yet.
  - `timeEnd`: Time Stamp since the mission is ended, 'null if the mission is not ended yet'.
  - `timePassed`: Time elapsed since the mission started.
  - `timeEstimated`: Estimated time for mission completion.

### **3. `temperature`**

- **Fields**:
  - `botID`: Foreign key referencing the `bot` table.
  - `clockTime`: Timestamp of the temperature reading.
  - `temperature`: Temperature value.

### **4. `battery`**

- **Fields**:
  - `botID`: Foreign key referencing the `bot` table.
  - `clockTime`: Timestamp of the battery reading.
  - `battery`: Battery percentage.

### **5. `position`**

- **Fields**:
  - `botID`: Foreign key referencing the `bot` table.
  - `clockTime`: Timestamp of the position reading.
  - `latitude`, `longitude`: GPS coordinates.
  - `altitude`, `relativeAltitude`: Altitude values.
  - `groundXSpeed`, `groundYSpeed`, `groundZSpeed`: Speed values.
  - `vehicleHeading`: Heading of the bot.

---

## **`server.mjs`**

The main entry point for the server. It sets up the Express application, defines API routes, and handles MAVLink data processing.

### **Key Features**

1. **API Routes**
   - `/api/missions`: Routes for mission-related operations (defined in `routes/mission.routes.js`).
   - `/api/temperature/all`: Fetches all temperature data.
   - `/api/temperature/latest`: Fetches the latest temperature data.
   - `/api/battery/all`: Fetches all battery data.
   - `/api/battery/latest`: Fetches the latest battery data.
   - `/api/bots/latest`: Fetches the latest bot data.

    > These routes should eventually be separated into separate directories within `/routes` (following the convention of mission.routes.js).  

2. **MAVLink Data Handling**:
   - Uses `handleMavlinkData` for real bot data.
   - Uses `simulateMavlinkData` for simulated data.

3. **Helper Functions**:
   - `storeMavlinkData(data)`: Processes and stores MAVLink data (position, temperature, or battery) in the database.
   - `parseDateTime(datetime)`: Converts a JavaScript `Date` object into a database-compatible format (`YYYY-MM-DD HH:MM:SS`).

4. **Server Setup**:
   - Runs on port `3100`.
   - Configured with CORS to allow requests from `http://localhost:3000`.

---

## **`mavlinkHandler.mjs`**

Handles MAVLink data processing, including both real bot data and simulated data.

### **Real Bot Logic**

- **`handleMavlinkData()`**:
  - Reads MAVLink data from a serial port.
  - Parses incoming packets using `MavLinkPacketSplitter` and `MavLinkPacketParser`.
  - Processes data based on message type:
    - `GLOBAL_POSITION_INT`: Processes GPS coordinates.
    - `NAMED_VALUE_FLOAT`: Processes temperature data.
  - Calls `storeMavlinkData` to save the data in the database.

### **Simulation Logic**

- **`simulateMavlinkData()`**:
  - Simulates MAVLink data for testing purposes.
  - Generates random data for:
    - Position: Latitude, longitude, altitude, speed, and heading. Sets starting position at UBCO and moves randomly (for now, until we figure out path-ing and progress towards missions)
    - Temperature: Random temperature values.
    - Battery: Random battery percentages.
  - Sends simulated data to `storeMavlinkData` every few seconds:
    - Position/temperature: Every 5 seconds.
    - Battery: Every 15 seconds.

### **Helper Functions**

- **`processGlobalPositionMessage(data)`**:
  - Processes GPS data and sends it to `storeMavlinkData`.
- **`processTemperatureMessage(data)`**:
  - Processes temperature data and sends it to `storeMavlinkData`.
- **`processBatteryMessage(data)`**:
  - Processes battery data and sends it to `storeMavlinkData`.

---

## **`database.mjs`**

Handles all database interactions using MySQL.

### **Key Functions**

#### **Insert Functions**

- **`insertPositionData(data)`**:
  - Inserts position data into the `position` table.
- **`insertTemperatureData(data)`**:
  - Inserts temperature data into the `temperature` table.
- **`insertBatteryData(data)`**:
  - Inserts battery data into the `battery` table.

#### **Fetch Functions**

- **`getAllTemperatureData()`**:
  - Fetches all temperature data from the `temperature` table.
- **`getLatestTemperatureData()`**:
  - Fetches the latest temperature data for each bot.
- **`getAllBatteryData()`**:
  - Fetches all battery data from the `battery` table.
- **`getLatestBatteryData()`**:
  - Fetches the latest battery data for each bot.
- **`getLatestBotData()`**:
  - Fetches the latest position, temperature, and battery data for all bots.

#### **Mission Functions**

- **`getAllMissions()`**:
  - Fetches all missions from the `mission` table.
- **`getMissionByBotID(missionID)`**:
  - Fetches a specific mission by `botID`.
- **`createMission(missionData)`**:
  - Creates a new mission in the `mission` table.
- **`updateMission(missionId, missionData)`**:
  - Updates an existing mission in the `mission` table.

---

## **`routes/mission.routes.js`**

Defines API routes for mission-related operations.

### **Routes**

1. **`GET /api/missions/get/:id`**:
   - Fetches a mission by its ID.
2. **`GET /api/missions/get-all`**:
   - Fetches all missions.
3. **`POST /api/missions/create`**:
   - Creates a new mission.
4. **`PUT /api/missions/update/:id`**:
   - Updates an existing mission.

---

## **Simulation vs Real Data**

The server can handle both real and simulated MAVLink data:

- **Real Data**: Uses `handleMavlinkData` to read from a serial port.
- **Simulated Data**: Uses `simulateMavlinkData` to generate simulated data for demonstration purposes.

---

## **Further development**
- Set up radio connection port to be modifiable through settings
  - For windows, must setup wsl to enable serial passthrough (create setup script)
- Add and remove bots
- Add reports
- Develop hotspot functionality
- Send mission area, temp threshold, # of temp readings per hotspot to bot on mission start


## **`Connection Bridge from Windows to Linux`**
To get your RFD900X radio working inside WSL (Ubuntu 22.04), you need to "bridge" the USB connection from Windows to Linux. Windows owns the hardware by default, so `usbipd` acts as the middleman.

### 1. Install usbipd-win on Windows

First, ensure you have the software installed on your **Windows host** (not inside WSL).

1. Download the latest `.msi` installer from the [usbipd-win GitHub releases](https://github.com/dorssel/usbipd-win/releases).
2. Run the installer.
3. Open a **PowerShell** or **Command Prompt** with **Administrator privileges**.

---

### 2. Identify and Bind the Radio

You need to tell Windows that it's okay to let WSL "borrow" this specific USB device.

1. **List all USB devices:**
```powershell
usbipd list

```


Look for a device named something like "Silicon Labs CP210x USB to UART Bridge" or similar (the RFD900X uses a standard USB-to-Serial chip). Note the **BUSID** (e.g., `2-3`).
2. **Bind the device:**
This step is only required once. It prepares the device for sharing.
```powershell
usbipd bind --busid <BUSID>

```



---

### 3. Attach the Device to WSL

Now, you actually send the connection over to your Ubuntu distro.

1. **Attach the device:**
```powershell
usbipd attach --wsl --busid <BUSID>

```


*Note: Keep this terminal window open if you didn't use a persistent flag, though usually, it stays attached until unplugged or the WSL instance shuts down.*
2. **Verify in Ubuntu:**
Open your **WSL Ubuntu-22.04** terminal and run:
```bash
lsusb

```


You should see the Silicon Labs / RFD900X device listed there.

---

### 4. Locate the Port in WSL

In Linux, USB-to-Serial devices are mapped to `/dev/tty`. Usually, the first one plugged in is:
` /dev/ttyUSB0`

**Check permissions:**
By default, your user might not have permission to read/write to the serial port. Run this in WSL to grant access:

```bash
sudo chmod 666 /dev/ttyUSB0

```

---

### Common Gotchas

* **WSL Kernel:** If `lsusb` shows the device but your Python script says `/dev/ttyUSB0` doesn't exist, you might be on a very old WSL kernel. Update it by running `wsl --update` in PowerShell.
* **Automatic Detach:** If you unplug the RFD900X and plug it back in, you must run the `usbipd attach` command again.
* **Docker:** If you are running your code inside a **Docker container** within WSL, remember to start your container with the `--privileged` flag or by mapping the device specifically:
`docker run -it --privileged -v /dev/ttyUSB0:/dev/ttyUSB0 my-mavlink-image`
