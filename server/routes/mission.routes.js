import express from 'express';
import { getMissionByBotID, getAllMissions, updateMission, createMission } from '../database.mjs';

const router = express.Router();

// Get a mission by ID
router.get('/get/:id', async (req, res) => {
    try {
        const mission = await getMissionByBotID(req.params.id);
        if (mission) {
            res.json(mission);
        } else {
            res.status(404).json({ message: 'Mission not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to get mission', error: error.message });
    }
});

// Get all missions
router.get('/get-all', async (req, res) => {
    try {
        const missions = await getAllMissions();
        res.json(missions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get missions', error: error.message });
    }
});

// Update a mission
router.put('/update/:id', async (req, res) => {
    try {
        await updateMission(req.params.id, req.body);
        res.json({ message: 'Mission updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update mission', error: error.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const missionData = req.body; 

        // should be validated on the frontend, but adding here as a backup
        if (!missionData.name || !missionData.botID || !missionData.areaCoordinates) {
            return res.status(400).json({ message: "Mission name, bot ID, and area coordinates are required." });
        }

        const result = await createMission(missionData); 

        if (result.success) {
            res.status(201).json({ message: `Mission with ID ${result.missionID} created successfully`, missionID: result.missionID }); 
        } else {
            res.status(500).json({ message: 'Failed to create mission' }); 
        }

    } catch (error) {
        console.error('Error in mission creation endpoint:', error);
        res.status(500).json({ message: 'Failed to create mission', error: error.message }); // Respond with 500 and error message
    }
});

export default router;