import {
	getAllBatteryData,
	getLatestBatteryData,
	getLatestBotData
} from '../services/database.service.mjs';

export async function getLatestBots(req, res) {
	try {
		const data = await getLatestBotData();
		if (!data) return res.status(500).json({ error: 'Failed to fetch bot data' });
		res.status(200).json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export async function getAllBattery(req, res) {
	try {
		const data = await getAllBatteryData();
		if (!data) return res.status(500).json({ error: 'Failed to fetch battery data' });
		res.status(200).json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export async function getLatestBattery(req, res) {
	try {
		const data = await getLatestBatteryData();
		if (!data) return res.status(500).json({ error: 'Failed to fetch battery data' });
		res.status(200).json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

