import { pool } from '../config/database.config.mjs';
import assert from 'assert';

// Helper to parse JSON columns safely
const parseJSON = (value, fallback = null) => {
	if (value === null || value === undefined) return fallback;
	try {
		return typeof value === 'string' ? JSON.parse(value) : value;
	} catch (err) {
		return fallback;
	}
};

// Insert telemetry rows with optional mission context
export async function insertPositionData(data) {
	const required = ['botID', 'clockTime', 'latitude', 'longitude'];
	required.forEach((field) => assert(data[field] !== undefined, `${field} is required`));

	let conn;
	try {
		conn = await pool.getConnection();
		const query = `
			INSERT INTO \`position\`
				(botID, missionID, clockTime, latitude, longitude, altitude, relativeAltitude, groundXSpeed, groundYSpeed, groundZSpeed, vehicleHeading)
			VALUES
				(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`;
		const params = [
			data.botID,
			data.missionID ?? null,
			data.clockTime,
			data.latitude,
			data.longitude,
			data.altitude ?? null,
			data.relativeAltitude ?? null,
			data.groundXSpeed ?? null,
			data.groundYSpeed ?? null,
			data.groundZSpeed ?? null,
			data.vehicleHeading ?? null,
		];
		const [results] = await conn.execute(query, params);
		return results.affectedRows === 1;
	} catch (error) {
		console.error('Error inserting position data:', error);
		return false;
	} finally {
		if (conn) await conn.release();
	}
}

export async function insertTemperatureData(data) {
	const required = ['botID', 'clockTime', 'temperature'];
	required.forEach((field) => assert(data[field] !== undefined, `${field} is required`));

	let conn;
	try {
		conn = await pool.getConnection();
		const query = `
			INSERT INTO temperature
				(botID, missionID, hotspotID, clockTime, temperature)
			VALUES
				(?, ?, ?, ?, ?)
		`;
		const params = [
			data.botID,
			data.missionID ?? null,
			data.hotspotID ?? null,
			data.clockTime,
			data.temperature,
		];
		const [results] = await conn.execute(query, params);
		return results.affectedRows === 1;
	} catch (error) {
		console.error('Error inserting temperature data:', error);
		return false;
	} finally {
		if (conn) await conn.release();
	}
}

export async function insertBatteryData(data) {
	const required = ['botID', 'clockTime', 'battery'];
	required.forEach((field) => assert(data[field] !== undefined, `${field} is required`));

	let conn;
	try {
		conn = await pool.getConnection();
		const query = `
			INSERT INTO battery
				(botID, missionID, clockTime, battery)
			VALUES
				(?, ?, ?, ?)
		`;
		const params = [
			data.botID,
			data.missionID ?? null,
			data.clockTime,
			data.battery,
		];
		const [results] = await conn.execute(query, params);
		return results.affectedRows === 1;
	} catch (error) {
		console.error('Error inserting battery data:', error);
		return false;
	} finally {
		if (conn) await conn.release();
	}
}

// Temperature queries
export async function getAllTemperatureData() {
	let conn;
	try {
		conn = await pool.getConnection();
		const query = `SELECT * FROM temperature ORDER BY clockTime ASC;`;
		const [rows] = await conn.execute(query);
		return rows;
	} catch (error) {
		console.error('Error fetching temperature data:', error);
		return false;
	} finally {
		if (conn) await conn.release();
	}
}

export async function getTemperaturesByBot(botID) {
	let conn;
	try {
		conn = await pool.getConnection();
		const [rows] = await conn.execute(
			`SELECT * FROM temperature WHERE botID = ? ORDER BY clockTime ASC;`,
			[botID]
		);
		return rows;
	} catch (error) {
		console.error('Error fetching bot temperatures:', error);
		return false;
	} finally {
		if (conn) await conn.release();
	}
}

export async function getTemperaturesByMission(missionID) {
	let conn;
	try {
		conn = await pool.getConnection();
		const [rows] = await conn.execute(
			`SELECT * FROM temperature WHERE missionID = ? ORDER BY clockTime ASC;`,
			[missionID]
		);
		return rows;
	} catch (error) {
		console.error('Error fetching mission temperatures:', error);
		return false;
	} finally {
		if (conn) await conn.release();
	}
}

// Battery queries
export async function getAllBatteryData() {
	let conn;
	try {
		conn = await pool.getConnection();
		const [rows] = await conn.execute(`SELECT * FROM battery ORDER BY clockTime ASC;`);
		return rows;
	} catch (error) {
		console.error('Error fetching battery data:', error);
		return false;
	} finally {
		if (conn) await conn.release();
	}
}

export async function getLatestBatteryData() {
	let conn;
	try {
		conn = await pool.getConnection();
		const query = `
			SELECT b.botID, b.assignmentStatus, ba.battery, ba.clockTime, ba.missionID
			FROM bot b
			LEFT JOIN (
				SELECT bt.*
				FROM battery bt
				INNER JOIN (
					SELECT botID, MAX(clockTime) AS latestClockTime
					FROM battery
					GROUP BY botID
				) latest ON bt.botID = latest.botID AND bt.clockTime = latest.latestClockTime
			) ba ON ba.botID = b.botID
			ORDER BY b.botID;
		`;
		const [rows] = await conn.execute(query);
		return rows;
	} catch (error) {
		console.error('Error fetching latest battery data:', error);
		return false;
	} finally {
		if (conn) await conn.release();
	}
}

// Latest snapshot of bots (position, battery, mission)
export async function getLatestBotData() {
	let conn;
	try {
		conn = await pool.getConnection();
		const query = `
			SELECT
				b.botID,
				b.assignmentStatus,
				bm.missionID,
				p.clockTime AS positionTime,
				p.latitude,
				p.longitude,
				p.altitude,
				p.relativeAltitude,
				p.groundXSpeed,
				p.groundYSpeed,
				p.groundZSpeed,
				p.vehicleHeading,
				ba.battery,
				ba.clockTime AS batteryTime
			FROM bot b
			LEFT JOIN (
                SELECT botID, clockTime, latitude, longitude, altitude, 
                       relativeAltitude, groundXSpeed, groundYSpeed, groundZSpeed, vehicleHeading,
                       ROW_NUMBER() OVER (PARTITION BY botID ORDER BY clockTime DESC) as rn
                FROM position
            ) p ON b.botID = p.botID AND p.rn = 1
            LEFT JOIN battery ba ON b.botID = ba.botID AND ba.clockTime = (
                SELECT MAX(clockTime)
                FROM battery ba2
                WHERE ba2.botID = b.botID
            )
            LEFT JOIN bot_mission_assignment bm ON b.botID = bm.botID
		`;
		const [rows] = await conn.execute(query);
		return rows;
	} catch (error) {
		console.error('Error fetching latest bot data:', error);
		return false;
	} finally {
		if (conn) await conn.release();
	}
}

// Missions
export async function getMissionByID(missionID) {
	let conn;
	try {
		conn = await pool.getConnection();
		const [rows] = await conn.execute(`SELECT * FROM mission WHERE missionID = ?`, [missionID]);
		return rows[0] ? { success: true, data: rows[0] } : { success: false, error: 'Mission not found' };
	} catch (error) {
		console.error('Error getting mission by ID:', error);
		return { success: false, error: error.message };
	} finally {
		if (conn) await conn.release();
	}
}

export async function getAllMissions() {
	let conn;
	try {
		conn = await pool.getConnection();
		const [rows] = await conn.execute(`SELECT * FROM mission`);
		return rows;
	} catch (error) {
		console.error('Error fetching all missions:', error);
		return false;
	} finally {
		if (conn) await conn.release();
	}
}

export async function createMission(missionData) {
	const {
		missionName,
		areaCoordinates,
		progress = 0,
		avgTemp = 0,
		timePassed = 0,
		timeEstimated = 0,
		timeStart = null,
		timeEnd = null,
		botIds = [],
	} = missionData;

	if (!missionName || !areaCoordinates) {
		throw new Error('Mission name and areaCoordinates are required');
	}

	let conn;
	try {
		conn = await pool.getConnection();
		await conn.beginTransaction();

		const [result] = await conn.execute(
			`INSERT INTO mission (missionName, areaCoordinates, progress, avgTemp, timePassed, timeEstimated, timeStart, timeEnd)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
			[missionName, JSON.stringify(areaCoordinates), progress, avgTemp, timePassed, timeEstimated, timeStart, timeEnd]
		);

		const missionID = result.insertId;

		if (botIds && botIds.length > 0) {
			for (const botID of botIds) {
				await conn.execute(
					`INSERT INTO bot_mission_assignment (botID, missionID) VALUES (?, ?) ON DUPLICATE KEY UPDATE missionID = missionID`,
					[botID, missionID]
				);
			}
			await conn.execute(
				`UPDATE bot SET assignmentStatus = 'assigned' WHERE botID IN (${botIds.map(() => '?').join(',')})`,
				botIds
			);
		}

		await conn.commit();
		return { success: true, missionID };
	} catch (error) {
		if (conn) {
			try { await conn.rollback(); } catch (_) {}
		}
		console.error('Error creating mission:', error);
		return { success: false, error: error.message };
	} finally {
		if (conn) await conn.release();
	}
}

export async function updateMission(missionId, missionData) {
	const {
		missionName,
		areaCoordinates,
		progress,
		avgTemp,
		timePassed,
		timeEstimated,
		timeStart,
		timeEnd,
	} = missionData;

	let conn;
	try {
		conn = await pool.getConnection();
		await conn.execute(
			`UPDATE mission SET missionName = COALESCE(?, missionName), areaCoordinates = COALESCE(?, areaCoordinates),
			 progress = COALESCE(?, progress), avgTemp = COALESCE(?, avgTemp), timePassed = COALESCE(?, timePassed),
			 timeEstimated = COALESCE(?, timeEstimated), timeStart = COALESCE(?, timeStart), timeEnd = COALESCE(?, timeEnd)
			 WHERE missionID = ?`,
			[
				missionName ?? null,
				areaCoordinates ? JSON.stringify(areaCoordinates) : null,
				progress ?? null,
				avgTemp ?? null,
				timePassed ?? null,
				timeEstimated ?? null,
				timeStart ?? null,
				timeEnd ?? null,
				missionId,
			]
		);
		return { success: true };
	} catch (error) {
		console.error('Error updating mission:', error);
		return { success: false, error: error.message };
	} finally {
		if (conn) await conn.release();
	}
}

export async function deleteMission(missionId) {
	let conn;
	try {
		conn = await pool.getConnection();
		await conn.beginTransaction();

		await conn.execute(`DELETE FROM mission WHERE missionID = ?`, [missionId]);

		// Reset bots that are no longer assigned to any mission
		await conn.execute(
			`UPDATE bot SET assignmentStatus = 'ready' WHERE botID NOT IN (SELECT botID FROM bot_mission_assignment)`
		);

		await conn.commit();
		return { success: true };
	} catch (error) {
		if (conn) {
			try { await conn.rollback(); } catch (_) {}
		}
		console.error('Error deleting mission:', error);
		return { success: false, error: error.message };
	} finally {
		if (conn) await conn.release();
	}
}

// Assignments
export async function assignBotsToMission(missionID, botIds = []) {
	let conn;
	try {
		conn = await pool.getConnection();
		await conn.beginTransaction();

		await conn.execute(`DELETE FROM bot_mission_assignment WHERE missionID = ?`, [missionID]);

		if (botIds.length > 0) {
			for (const botID of botIds) {
				await conn.execute(
					`INSERT INTO bot_mission_assignment (botID, missionID) VALUES (?, ?) ON DUPLICATE KEY UPDATE missionID = missionID`,
					[botID, missionID]
				);
			}
			await conn.execute(
				`UPDATE bot SET assignmentStatus = 'assigned' WHERE botID IN (${botIds.map(() => '?').join(',')})`,
				botIds
			);
		}

		await conn.execute(
			`UPDATE bot SET assignmentStatus = 'ready' WHERE botID NOT IN (SELECT botID FROM bot_mission_assignment)`
		);

		await conn.commit();
		return { success: true };
	} catch (error) {
		if (conn) {
			try { await conn.rollback(); } catch (_) {}
		}
		console.error('Error assigning bots to mission:', error);
		return { success: false, error: error.message };
	} finally {
		if (conn) await conn.release();
	}
}

export async function getAssignmentsForMission(missionID) {
	let conn;
	try {
		conn = await pool.getConnection();
		const [rows] = await conn.execute(
			`SELECT botID FROM bot_mission_assignment WHERE missionID = ?`,
			[missionID]
		);
		return rows.map((r) => r.botID);
	} catch (error) {
		console.error('Error fetching mission assignments:', error);
		return [];
	} finally {
		if (conn) await conn.release();
	}
}

