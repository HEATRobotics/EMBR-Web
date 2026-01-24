import {
    getAllTemperatureData,
    getTemperaturesByBot,
    getTemperaturesByMission
} from '../services/database.service.mjs';

export async function getAllTemperature(req, res) {
    try {
        const data = await getAllTemperatureData();
        if (!data) return res.status(500).json({ error: 'Failed to fetch temperature data' });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getTemperaturesByBotController(req, res) {
    try {
        const data = await getTemperaturesByBot(req.params.botID);
        if (data === false) return res.status(500).json({ error: 'Failed to fetch temperature data' });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getTemperaturesByMissionController(req, res) {
    try {
        const data = await getTemperaturesByMission(req.params.missionID);
        if (data === false) return res.status(500).json({ error: 'Failed to fetch temperature data' });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
