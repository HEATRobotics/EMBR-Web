import express from 'express';
import {
    getAllTemperature,
    getLatestTemperature,
    getAllBattery,
    getLatestBattery,
    getLatestBots
} from '../controllers/bot.controller.mjs';

const router = express.Router();

// Temperature routes
router.get('/temperature/all', getAllTemperature);
router.get('/temperature/latest', getLatestTemperature);

// Battery routes
router.get('/battery/all', getAllBattery);
router.get('/battery/latest', getLatestBattery);

// Bots routes
router.get('/bots/latest', getLatestBots);

export default router;
