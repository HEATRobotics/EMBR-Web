import {
    getAllBatteryData,
    getLatestBatteryData,
    getAllTemperatureData,
    getLatestTemperatureData,
    getLatestBotData
} from '../services/database.service.mjs';

// Get all temperature data
export async function getAllTemperature(req, res) {
    try {
        const data = await getAllTemperatureData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Database function returned null.' });
        }
    } catch (error) {
        res.status(500).json({ error: `There was an error with calling the getAllTemperatureData database function: ${error.message}` });
    }
}

// Get latest temperature data
export async function getLatestTemperature(req, res) {
    try {
        const data = await getLatestTemperatureData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Database function returned null.' });
        }
    } catch (error) {
        res.status(500).json({ error: `There was an error with calling the getLatestTemperatureData database function: ${error.message}` });
    }
}

// Get all battery data
export async function getAllBattery(req, res) {
    try {
        const data = await getAllBatteryData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Database function returned null.' });
        }
    } catch (error) {
        res.status(500).json({ error: `There was an error with calling the getAllBatteryData database function: ${error.message}` });
    }
}

// Get latest battery data
export async function getLatestBattery(req, res) {
    try {
        const data = await getLatestBatteryData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Database function returned null.' });
        }
    } catch (error) {
        res.status(500).json({ error: `There was an error with calling the getLatestBatteryData database function: ${error.message}` });
    }
}

// Get latest bots data
export async function getLatestBots(req, res) {
    try {
        const data = await getLatestBotData();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: 'Database function returned null.' });
        }
    } catch (error) {
        res.status(500).json({ error: `There was an error with calling the getLatestBotData database function: ${error.message}` });
    }
}
