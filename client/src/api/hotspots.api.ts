  import axios from 'axios';

  import {HotspotStatus, HotspotTemperature, HotspotType } from '@/types/hotspot.type';


  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3100/api';

  type HotspotDto = {
    id: number;
    botID: number;
    missionID:number | null;
    detectedAt: number;
    latitude?: number | string;
    longitude?: number | string;
    altitude?: number |string |null;
    temperatures?: HotspotTemperature[] | null;
    averageTemperature?: number | string | null;
    status?: HotspotStatus;
  };

  export const fetchTemperaturesByHotspotID=async (HotspotID:number):Promise<HotspotTemperature[]>=>{
    const response = await axios.get(`${API_BASE_URL}/hotspots/${HotspotID}/temperatures`);
    return response.data;
  };
  export const fetchHotspotByID=async (hotspotID:number): Promise<HotspotType> =>{
    try {
      const response = await axios.get(`${API_BASE_URL}/hotspots/${hotspotID}`);
      return mapHotspotDtoToHotspot(response.data);
    } catch (error: any) {  
      console.error(`Error fetching hotspot with ID ${hotspotID}:`, error);
      throw new Error(error.response?.data?.error || `Failed to fetch hotspot with ID ${hotspotID}`);
    }
  };
  export const updateHotspotStatus = async (
    hotspotID: number,
    status:HotspotType['status']
  ): Promise<HotspotType['status']> => {
    const response = await axios.patch(`${API_BASE_URL}/hotspots/${hotspotID}/status`, { status });
    return response.data.status;
  };
  export const mapHotspotDtoToHotspot = (hotspot: HotspotDto): HotspotType => {
    return {
      id: hotspot.id,
      botID: hotspot.botID,
      missionID: hotspot.missionID,
      detectedAt: hotspot.detectedAt,
      latitude: Number(hotspot.latitude ?? 0),
      longitude: Number(hotspot.longitude ?? 0),
      altitude: Number(hotspot.altitude ?? 0),
      temperatures: hotspot.temperatures ?? [],
      averageTemperature: 
        hotspot.averageTemperature == null ? null : Number(hotspot.averageTemperature),
      status: hotspot.status ?? 'unresolved',
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
      
    


