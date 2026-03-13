import axios from 'axios';

import { HotspotType } from '@/types/hotspot.type';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3100/api';

type HotspotDto = {
  id: number;
  botID: number;
  missionID:number | null;
  detectedAt: number;
  latitude?: number | string;
  longitude?: number | string;
  altitude?: number |string |null;
};


export const mapHotspotDtoToHotspot = (hotspot: HotspotDto): HotspotType => {
  return {
    id: hotspot.id,
    botID: hotspot.botID,
    missionID: hotspot.missionID,
    detectedAt: hotspot.detectedAt,
    latitude: Number(hotspot.latitude ?? 0),
    longitude: Number(hotspot.longitude ?? 0),
    altitude: Number(hotspot.altitude ?? 0)
  };
  };

  export const fetchHotspots = async (): Promise<HotspotType[]> =>{
    try {
        const response = await axios.get(`${API_BASE_URL}/hotspots`);
    const data = response.data;
    if (!Array.isArray(data)) throw new Error('hotspots response was not an array');
    return data.map(mapHotspotDtoToHotspot);
  } catch (error: any) {
    console.error('Error fetching hotspots:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch hotspots');
  }
};
    
  


