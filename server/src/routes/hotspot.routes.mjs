import express from 'express';
import {
   fetchAllHotspots,
   fetchHotspotsByID,
} from '../controllers/hotspot.controller.mjs';

const router = express.Router();


router.get('/', fetchAllHotspots);
router.get('/:id', fetchHotspotsByID);


export default router;