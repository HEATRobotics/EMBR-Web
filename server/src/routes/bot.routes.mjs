import express from 'express';
import {
	getLatestBots,
	getAllBattery,
	getLatestBattery
} from '../controllers/bot.controller.mjs';

const router = express.Router();

// Bot snapshots
router.get('/', getLatestBots);

// Battery endpoints
router.get('/battery', getAllBattery);
router.get('/battery/latest', getLatestBattery);

export default router;
