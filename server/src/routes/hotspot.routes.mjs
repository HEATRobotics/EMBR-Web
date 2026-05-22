import express from 'express';
import {
   fetchAllHotspots,
   fetchHotspotsByID,
   fetchTemperaturesByHotspotID,
   updateHotspotStatusController
} from '../controllers/hotspot.controller.mjs';

const router = express.Router();

router.get(`/:id/temperatures`, fetchTemperaturesByHotspotID);
router.patch('/:id/status', updateHotspotStatusController);
router.get('/', fetchAllHotspots);
router.get('/:id', fetchHotspotsByID);


export default router;
