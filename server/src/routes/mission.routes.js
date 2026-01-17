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

export default router;