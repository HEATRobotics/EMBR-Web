import {
    getAllHotspots,
    getHotspotByID,
    getTemperatureByHotspotID,
    updateHotspotStatus
} from '../services/database.service.mjs';

export async function fetchTemperaturesByHotspotID(req, res){
    try{
        const {id} = req.params;
        const temperatures = await getTemperatureByHotspotID(id);
        if (!temperatures) return res.status(500).json({ error: 'Failed to fetch temperatures' });
        res.json(temperatures);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

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

export async function fetchHotspotsByID(req, res){
    try{
        const{id}=req.params;
        const hotspot = await getHotspotByID(id);
        if (!hotspot) return res.status(404).json({ error: 'Hotspot not found' });
        res.json(hotspot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export async function updateHotspotStatusController(req, res){
    try{
        const {id} = req.params;
        const {status} = req.body;
        if (!['unresolved','resolved'].includes(status)){
            return res.status(400).json({ error: 'Invalid status value'});
        }
        const success = await updateHotspotStatus(id, status);
        if (!success) return res.status(404).json({ error: 'Hotspot not found' });
        res.json({ message: 'Hotspot status updated successfully', status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
