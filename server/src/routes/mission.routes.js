import express from 'express';
import {
	getAllMissionsController,
	getMissionByIdController,
	createMissionController,
	updateMissionController,
	deleteMissionController,
	assignBotsController
} from '../controllers/mission.controller.mjs';

const router = express.Router();

// Missions CRUD
router.get('/', getAllMissionsController);
router.get('/:id', getMissionByIdController);
router.post('/', createMissionController);
router.put('/:id', updateMissionController);
router.delete('/:id', deleteMissionController);

// Assign bots to mission
router.post('/:id/assign', assignBotsController);

export default router;
