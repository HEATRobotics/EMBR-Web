import express from 'express';
import {
    getAllTemperature,
    getTemperaturesByBotController,
    getTemperaturesByMissionController
} from '../controllers/temperature.controller.mjs';

const router = express.Router();

// Temperature endpoints
router.get('/', getAllTemperature);
router.get('/bot/:botID', getTemperaturesByBotController);
router.get('/mission/:missionID', getTemperaturesByMissionController);

export default router;
