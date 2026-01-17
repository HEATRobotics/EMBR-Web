import { pool } from '../config/database.config.mjs';
import assert from 'assert';

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
        const query = `SELECT temperature.botID, temperature, clockTime FROM temperature ORDER BY clockTime ASC;`;
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
            SELECT DISTINCT 
                b.botID,
                b.assignmentStatus,
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
                ba.battery
            FROM bot b
                     LEFT JOIN (
                SELECT p1.*
                FROM position p1
                         INNER JOIN (
                    SELECT botID, MAX(clockTime) AS maxClockTime
                    FROM position
                    GROUP BY botID
                ) p2 ON p1.botID = p2.botID AND p1.clockTime = p2.maxClockTime
                ORDER BY p1.id DESC LIMIT 1
            ) AS p ON b.botID = p.botID
                     LEFT JOIN (
                SELECT t1.*
                FROM temperature t1
                         INNER JOIN (
                    SELECT botID, MAX(clockTime) AS maxClockTime
                    FROM temperature
                    GROUP BY botID
                ) t2 ON t1.botID = t2.botID AND t1.clockTime = t2.maxClockTime
                ORDER BY t1.id DESC LIMIT 1
            ) AS t ON b.botID = t.botID
                     LEFT JOIN (
                SELECT ba1.*
                FROM battery ba1
                         INNER JOIN (
                    SELECT botID, MAX(clockTime) AS maxClockTime
                    FROM battery
                    GROUP BY botID
                ) ba2 ON ba1.botID = ba2.botID AND ba1.clockTime = ba2.maxClockTime
                ORDER BY ba1.id DESC LIMIT 1
            ) AS ba ON ba.botID = b.botID;
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
export async function getMissionByBotID(botID) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `SELECT * FROM mission WHERE botID = ?`;
        const [rows] = await conn.execute(query, [botID]);
        return {success: true, data: rows[0]};
    } catch (error) {
        console.error('Error getting mission by Bot ID:', error);
        return {success: false, error: error.message}
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

export async function getMissionByID(missionID) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `SELECT * FROM mission WHERE missionID = ?`;
        const [rows] = await conn.execute(query, [missionID]);
        return {success: true, data: rows[0]};
    } catch (error) {
        console.error('Error getting mission by mission ID:', error);
        return {success: false, error: error.message}
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



export async function updateMission(missionId, missionData) {
    const { missionName, areaCoordinates, botID, progress, averageTemperature, timePassed, timeEstimated, timeStart, timeEnd } = missionData;
    try {
        const connection = await pool.getConnection();

    
        //Compare previous mission and new data mission so that other data table that are affected by the update are also updated
        // 1) Get the current mission row
        const [rows] = await connection.execute(
            'SELECT timeStart, timeEnd FROM mission WHERE missionID = ?',
            [missionId]
        );
        if (rows.length === 0) {
            throw new Error("Mission not found");
        }
         
        const current = rows[0];
        // Compare only timeStart and timeEnd for now
        if (current.timeStart !== missionData.timeStart) {//Check if mission is started
            // Mark the bot as active
            console.log("=== MISSION STARTED - UPDATING BOT STATUS TO ACTIVE ===");
            const updateBotQuery = `UPDATE bot SET assignmentStatus = 'active' WHERE botID = ?`;
            await connection.execute(updateBotQuery, [botID]);
        }

        if (current.timeEnd !== missionData.timeEnd) {
            // Mark the bot as active
            console.log("=== MISSION ENDED - UPDATING BOT STATUS TO ASSIGNED ===");
            const updateBotQuery = `UPDATE bot SET assignmentStatus = 'assigned' WHERE botID = ?`;
            await connection.execute(updateBotQuery, [botID]);
        }
            

        // Acuallu update
        await connection.execute(
            'UPDATE mission SET missionName = ?, areaCoordinates = ?, progress = ?, avgTemp = ?, timePassed = ?, timeEstimated = ?, timeStart = ?, timeEnd = ? WHERE missionID = ?',
            [missionName, JSON.stringify(areaCoordinates), progress, averageTemperature, timePassed, timeEstimated, timeStart, timeEnd, missionId]
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
        await conn.beginTransaction();

        // 1) Create the mission
        const insertMissionQuery = `
            INSERT INTO mission (missionName, botID, areaCoordinates, progress, avgTemp, timePassed, timeEstimated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const areaCoordinatesJSON = JSON.stringify(areaCoordinates); // Important: stringify areaCoordinates for database storage
        const [result] = await conn.execute(insertMissionQuery, [name, botID, areaCoordinatesJSON, process, averageTemperature, timePassed, timeEstimated]);

        // 2) Mark the bot as assigned
        const updateBotQuery = `UPDATE bot SET assignmentStatus = 'assigned' WHERE botID = ?`;
        await conn.execute(updateBotQuery, [botID]);

        await conn.commit();
        return { success: true, missionID: result.insertId };

    } catch (error) {
        console.error('Error creating mission:', error);
        if (conn) {
            try { await conn.rollback(); } catch (_) {}
        }
        throw error; // Re-throw the error to be handled by the endpoint
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

// this is to delete a mission by id
export async function deleteMission(missionId) {//export to make this func available to other files, async is when we need to wait for database operations (await)
    let conn;//declare variable conn to connect the server and database
    try {
        conn = await pool.getConnection();

        //delete the mission
        const deleteQuery = `DELETE FROM mission WHERE missionID = ?`;
        const [result] = await conn.execute(deleteQuery, [missionId]);

        // unassign the bot that was assigned to this mission
        if (result.affectedRows > 0) {
            const updateBotQuery = `UPDATE bot SET assignmentStatus = 'ready' WHERE botID NOT IN (SELECT botID FROM mission)`;
            await conn.execute(updateBotQuery);
        }

        return { success: result.affectedRows > 0 };
    } catch (error) {
        console.error('Error deleting mission:', error);//if mission not found
        return { success: false, error: error.message };//return false if error occurs
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}


