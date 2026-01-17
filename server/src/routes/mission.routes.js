import express from 'express';
import {
    getAllMissionsController,
    getMissionByIdController,
    createMissionController,
    updateMissionController,
    deleteMissionController
} from '../controllers/mission.controller.mjs';

const router = express.Router();

// RESTful routes
router.get('/', getAllMissionsController);
router.get('/:id', getMissionByIdController);
router.post('/', createMissionController);
router.put('/:id', updateMissionController);
router.delete('/:id', deleteMissionController);

router.put('/update/:id', async (req, res) => {
    console.log("=== UPDATE ROUTE HIT ===");
    console.log("ID:", req.params.id);
    console.log("Body:", req.body);
    try {
        await updateMission(req.params.id, req.body);
        res.json({ message: 'Mission updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update mission', error: error.message });
    }
});

export default router;