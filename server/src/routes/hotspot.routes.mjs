import express from 'express';
import {
   fetchAllHotspots,
   fetchHotspotsByID,
   fetchTemperaturesByHotspotID
} from '../controllers/hotspot.controller.mjs';

const router = express.Router();

router.get(`/:id/temperatures`, fetchTemperaturesByHotspotID);
router.get('/', fetchAllHotspots);
router.get('/:id', fetchHotspotsByID);


export default router;
