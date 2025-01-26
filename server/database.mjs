import mysql from 'mysql2/promise';
import assert from 'assert';

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "testuser",
    password: process.env.DB_PASSWORD || "pw",
    database: process.env.DB_NAME || "embr"
});

/*
    Insert function conventions:    
        - always return true or false depending on if operation was successful
        - for now, assumes all required keys in the 'data' object passed in are not null
        - always gets a connection from the pool and releases it
*/

export async function insertPositionData(data) {
    let conn; 
    try {
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
        const query = `
            INSERT INTO position 
            (botID, clockTime, latitude, longitude, altitude, relativeAltitude, groundXSpeed, groundYSpeed, groundZSpeed, vehicleHeading)
            VALUES (?, FROM_UNIXTIME(? / 1000), ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.botId,
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
        const requiredFields = [
            'botID',
            'clockTime',
            'temperature',
        ];
    
        requiredFields.forEach(field => {
            assert(data[field] !== undefined, `${field} is required`);
        });
        conn = await pool.getConnection();
        
        const query = `INSERT INTO temperature (botID, clockTime, temperature) VALUES (?, FROM_UNIXTIME(? / 1000), ?)`;
        const params = [
            data.botId,
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
        const requiredFields = [
            'botID',
            'clockTime',
            'battery',
        ];
    
        requiredFields.forEach(field => {
            assert(data[field] !== undefined, `${field} is required`);
        });
        conn = await pool.getConnection();
        
        const query = `INSERT INTO temperature (botID, clockTime, battery) VALUES (?, FROM_UNIXTIME(? / 1000), ?)`;
        const params = [
            data.botId,
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

