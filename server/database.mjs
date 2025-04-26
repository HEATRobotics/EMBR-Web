import mysql from 'mysql2/promise';
import assert from 'assert';

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "testuser",
    password: process.env.DB_PASSWORD || "pw",
    database: process.env.DB_NAME || "embr",
    port: 3306,
    waitForConnections: true, // if connection limit is reached, queue the connection and wait for it to be released
    connectionLimit: 5,
    maxIDle: 10, // max idle connections
    idleTimeout: 120000, // idle connections timeout: 2 minutes
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

/*
    Insert function conventions:    
        - always return true or false depending on if operation was successful
        - for now, assumes all required keys in the 'data' object passed in are not null
        - "botID" has both 'I' and 'D' capitalized
        - always gets a connection from the pool and releases it
*/

export async function insertPositionData(data) {
    let conn; 
    try {

        // console.log("Inside insertPos");
        // console.log(data);

        const requiredFields = [
            'botID',
            'clockTime',
            'latitude',
            'longitude',
            'altitude',
            'relativeAltitude',
            'groundXSpeed',
            'groundYSpeed',
            'groundZSpeed',
            'vehicleHeading'
        ];

        requiredFields.forEach(field => {
            assert(data[field] !== undefined, `${field} is required`);
        });

        conn = await pool.getConnection();
        const query = 
            `INSERT INTO \`position\`  
            (botID, clockTime, latitude, longitude, altitude, relativeAltitude, groundXSpeed, groundYSpeed, groundZSpeed, vehicleHeading)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            data.botID,
            data.clockTime,
            data.latitude,
            data.longitude,
            data.altitude,
            data.relativeAltitude,
            data.groundXSpeed,
            data.groundYSpeed,
            data.groundZSpeed,
            data.vehicleHeading,
        ];
        const [results] = await conn.execute(query, params);
        return results.affectedRows === 1;  // If more than one row is affected, then something went wrong
    } catch (error) { 
        console.error("Error inserting position data into the database:", error);
        return false; 
    } finally {
        // Note that this is run even if the above blocks hit the return statement
        if (conn) {
            await conn.release();
        }
    }
}

export async function insertTemperatureData(data) {

    let conn; 
    try {

        // console.log("Inside insertTemp");
        // console.log(data);

        const requiredFields = [
            'botID',
            'clockTime',
            'temperature',
        ];
    
        requiredFields.forEach(field => {
            assert(data[field] !== undefined, `${field} is required`);
        });
        conn = await pool.getConnection();
        
        const query = `INSERT INTO temperature (botID, clockTime, temperature) VALUES (?, ?, ?)`;
        const params = [
            data.botID,
            data.clockTime,
            data.temperature,
        ];
        const [results] = await conn.execute(query, params);
        return results.affectedRows === 1;  // If more than one row is affected, then something went wrong

    } catch (error) { 

        console.error("Error inserting temperature data into the database:", error);
        console.log(data)
        return false; 

    } finally {
        // Note that this is run even if any of the above blocks hit the return statement
        if (conn) {
            await conn.release();
        }
    }
}

export async function insertLidarData(data) {
    let conn;

    try {
        const requiredFields = [
            'clockTime',
            'distances',
        ];

        requiredFields.forEach(field => {
            assert(data[field] !== undefined, `${field} is required`);
        })

        conn = await pool.getConnection();

        const query = `
            INSERT INTO lidar_measurements (clockTime, distances) VALUES (?, ?);
        `

        const params = [
            data.clockTime,
            JSON.stringify(data.distances),
        ];

        const [results] = await conn.execute(query, params);
        return results.affectedRows === 1;  // If more than one row is affected, then something went wrong

    } catch (error) {

        console.error("Error inserting lidar data into the database:", error);
        console.log(data)
        return false;

    } finally {
        // Note that this is run even if any of the above blocks hit the return statement
        if (conn) {
            await conn.release();
        }
    }
}

export async function insertBatteryData(data) {

    let conn; 
    try {

        // console.log("Inside insertBattery");
        // console.log(data);

        const requiredFields = [
            'botID',
            'clockTime',
            'battery',
        ];
    
        requiredFields.forEach(field => {
            assert(data[field] !== undefined, `${field} is required`);
        });
        conn = await pool.getConnection();
        
        const query = `INSERT INTO battery (botID, clockTime, battery) VALUES (?, ?, ?)`;
        const params = [
            data.botID,
            data.clockTime,
            data.battery,
        ];
        const [results] = await conn.execute(query, params);
        return results.affectedRows === 1;  // If more than one row is affected, then something went wrong

    } catch (error) { 

        console.error("Error inserting battery data into the database:", error);
        console.log(data)
        return false; 

    } finally {
        // Note that this is run even if any of the above blocks hit the return statement
        if (conn) {
            await conn.release();
        }
    }
}

export async function getAllTemperatureData() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `SELECT temperature.botID, fleetID, temperature, clockTime FROM temperature JOIN fleet WHERE temperature.botID = fleet.botID ORDER BY clockTime ASC;`;
        const [rows, fields] = await conn.execute(query);
        return rows;
    } catch (error) {
        console.error("Error fetching temperature data from the database:", error);
        return false;
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

export async function getLatestTemperatureData() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = 
            `SELECT temperature.botID, temperature, clockTime
            FROM temperature
            JOIN bot ON temperature.botID = bot.botID
            JOIN (
                SELECT botID, MAX(clockTime) AS latestClockTime
                FROM temperature
                GROUP BY botID
            ) latestTemp
            ON temperature.botID = latestTemp.botID 
            AND temperature.clockTime = latestTemp.latestClockTime 
            ORDER BY clockTime ASC;`;
        const [rows, fields] = await conn.execute(query);
        return rows;
    } catch (error) {
        console.error("Error fetching battery data from the database:", error);
        return false;
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

export async function getAllBatteryData() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `SELECT battery.botID, fleetID, battery, clockTime FROM battery JOIN fleet WHERE battery.botID = fleet.botID ORDER BY clockTime ASC;`;
        const [rows, fields] = await conn.execute(query);
        return rows;
    } catch (error) {
        console.error("Error fetching battery data from the database:", error);
        return false;
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

export async function getLatestBatteryData() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = 
            `SELECT battery.botID, battery, clockTime
            FROM battery
            JOIN bot ON battery.botID = bot.botID
            JOIN (
                SELECT botID, MAX(clockTime) AS latestClockTime
                FROM battery
                GROUP BY botID
            ) latestBattery
            ON battery.botID = latestBattery.botID 
            AND battery.clockTime = latestBattery.latestClockTime 
            ORDER BY clockTime ASC;`;
        const [rows, fields] = await conn.execute(query);
        return rows;
    } catch (error) {
        console.error("Error fetching battery data from the database:", error);
        return false;
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

/*
    Fetches the latest fleet data from the database.
    This function retrieves the most recent position, temperature, and battery data for each bot in the fleet.
    Returns an array of objects containing the latest fleet data if successful, or false if an error occurs.
 */
export async function getLatestBotData() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT 
                p.botID,
                p.clockTime AS positionTime,
                p.latitude,
                p.longitude,
                p.altitude,
                p.relativeAltitude,
                p.groundXSpeed,
                p.groundYSpeed,
                p.groundZSpeed,
                p.vehicleHeading,
                t.temperature,
                b.battery
            FROM (
                SELECT botID, latitude, longitude, altitude, relativeAltitude, 
                       groundXSpeed, groundYSpeed, groundZSpeed, vehicleHeading, clockTime
                FROM position p1
                WHERE clockTime = (SELECT MAX(clockTime) FROM position p2 WHERE p1.botID = p2.botID)
            ) p
            LEFT JOIN bot ON p.botID = bot.botID
            LEFT JOIN (
                SELECT botID, temperature
                FROM temperature t1
                WHERE clockTime = (SELECT MAX(clockTime) FROM temperature t2 WHERE t1.botID = t2.botID)
            ) t ON p.botID = t.botID
            LEFT JOIN (
                SELECT botID, battery
                FROM battery b1
                WHERE clockTime = (SELECT MAX(clockTime) FROM battery b2 WHERE b1.botID = b2.botID)
            ) b ON p.botID = b.botID;
        `;
        const [rows] = await conn.execute(query);
        return rows;
    } catch (error) {
        console.error("Error fetching latest bot data from the database:", error);
        return false;
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

/*
    Fetches the latest mission data for a particular fleet from the database.
    Mission data includes fleetID, areaCoordinates, progress, avgTemp, etc
    Returns object containing mission data if successful, or false if an error occurs.
 */
export async function getMissionByBotID(missionID) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `SELECT * FROM mission WHERE botID = ?`;
        const [rows] = await conn.execute(query, [missionID]);
        return rows[0];
    } catch (error) {
        console.error('Error getting mission by Bot ID:', error);
        return false;
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}
/*
    Fetches all missions from the database.
    Returns an array of mission objects if successful, or false if an error occurs.
 */
export async function getAllMissions() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `SELECT * FROM mission`;
        const [rows] = await conn.execute(query);
        return rows;
    } catch (error) {
        console.error('Error fetching all missions:', error);
        return false;
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

export async function getLatestLidarData() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT *
            FROM lidar_measurements
            ORDER BY time_usec DESC
                LIMIT 1;
        `;
        const [rows] = await conn.execute(query);
        return rows;
    } catch (error) {
        console.error('Error fetching all missions:', error);
        return false;
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

export async function updateMission(missionId, missionData) {
    const { name, areaCoordinates, process, averageTemperature, timePassed, timeEstimated } = missionData;
    try {
        const connection = await pool.getConnection();
        await connection.execute(
            'UPDATE mission SET name = ?, area_coordinates = ?, progress = ?, avgTemp = ?, timePassed = ?, timeEstimated = ? WHERE missionID = ?',
            [name, JSON.stringify(areaCoordinates), process, averageTemperature, timePassed, timeEstimated, missionId]
        );
        connection.release();
        return { success: true }; 
    } catch (error) {
        console.error('Error updating mission:', error);
        throw error;
    }
}

// This function returns an object with "success" as a boolean and "missionID" containing the autoincrement ID of the newly created mission
export async function createMission(missionData) {
    let conn;
    const { name, botID, areaCoordinates, process = 0, averageTemperature = 0, timePassed = 0, timeEstimated = 2880 } = missionData; // Default values for optional fields

    if (!name || !botID || !areaCoordinates) {
        throw new Error("Mission name, fleet ID, and area coordinates are required."); // Basic validation
    }

    console.log("made it in DB createMission");

    try {
        conn = await pool.getConnection();
        const query = `
            INSERT INTO mission (missionName, botID, areaCoordinates, progress, avgTemp, timePassed, timeEstimated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const areaCoordinatesJSON = JSON.stringify(areaCoordinates); // Important: stringify areaCoordinates for database storage
        const [result] = await conn.execute(query, [name, botID, areaCoordinatesJSON, process, averageTemperature, timePassed, timeEstimated]);

        return { success: true, missionID: result.insertId };

    } catch (error) {
        console.error('Error creating mission:', error);
        throw error; // Re-throw the error to be handled by the endpoint
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}


