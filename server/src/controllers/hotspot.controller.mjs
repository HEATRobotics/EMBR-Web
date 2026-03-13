import {
    getAllHotspots,
    getHotspotsByID,
} from '../services/database.service.mjs';

export async function fetchAllHotspots(req, res){
    try{
        const hotspots = await getAllHotspots();
        if (!hotspots) return res.status(500).json({ error: 'Failed to fetch hotspots' });
    
    res.json(hotspots);
    }
     catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getHotspotsByID(req, res){
    try{
        const{id}=req.params;
        const hotspot = await getHotspotsByID(id);
        if (!hotspot) return res.status(404).json({ error: 'Hotspot not found' });
        res.json(hotspot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
