import {
    getMissionByID,
    getAllMissions,
    updateMission,
    createMission,
    deleteMission
} from '../services/database.service.mjs';

// Get all missions
export async function getAllMissionsController(req, res) {
    try {
        const missions = await getAllMissions();
        if (missions) {
            res.status(200).json(missions);
        } else {
            res.status(500).json({ error: 'Failed to fetch missions' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get a mission by ID
export async function getMissionByIdController(req, res) {
    try {
        const mission = await getMissionByID(req.params.id);
        if (mission.success) {
            res.status(200).json(mission.data);
        } else {
            res.status(404).json({ error: mission.error || 'Mission not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Create a new mission
export async function createMissionController(req, res) {
    try {
        const missionData = req.body;

        if (!missionData.name || !missionData.botID || !missionData.areaCoordinates) {
            return res.status(400).json({ error: 'Mission name, bot ID, and area coordinates are required' });
        }

        const result = await createMission(missionData);

        if (result.success) {
            res.status(201).json({ missionID: result.missionID });
        } else {
            res.status(500).json({ error: 'Failed to create mission' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Update a mission
export async function updateMissionController(req, res) {
    try {
        await updateMission(req.params.id, req.body);
        res.status(200).json({ message: 'Mission updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Delete a mission
export async function deleteMissionController(req, res) {
    try {
        const result = await deleteMission(Number(req.params.id));

        if (result.success) {
            res.status(200).json({ message: 'Mission deleted successfully' });
        } else {
            res.status(404).json({ error: result.error || 'Mission not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
