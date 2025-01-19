import mysql from 'mysql2/promise';
import assert from 'assert';

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "testuser",
    password: process.env.DB_PASSWORD || "pw",
    database: process.env.DB_NAME || "embr"
});

export async function insertPositionData(data) {
    let conn; 
    try {
        const requiredFields = [
            'bot_id',
            'timestamp',
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
            (vehicleID, timestamp, latitude, longitude, altitude, relativeAltitude, groundXSpeed, groundYSpeed, groundZSpeed, vehicleHeading)
            VALUES (?, FROM_UNIXTIME(? / 1000), ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.bot_id,
            data.timestamp,
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
            'bot_id',
            'timestamp',
            'temperature',
        ];
    
        requiredFields.forEach(field => {
            assert(data[field] !== undefined, `${field} is required`);
        });
        conn = await pool.getConnection();
        
        const query = `INSERT INTO temperature (vehicleID, timestamp, temperature) VALUES (?, FROM_UNIXTIME(? / 1000), ?)`;
        const params = [
            data.bot_id,
            data.timestamp,
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

