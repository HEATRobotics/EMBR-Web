import express from 'express';
import { getMissionByFleetID, getAllMissions, updateMission } from '../database.mjs';

const router = express.Router();

// Get a mission by ID
router.get('/get/:id', async (req, res) => {
    try {
        const mission = await getMissionByFleetID(req.params.id);
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

export default router;