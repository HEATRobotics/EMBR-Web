export interface HotspotTemperature {
  id:number;
  hotspotID: number;
  temperature:number;
  clockTime:number | string;
}

export interface HotspotType {
  id: number;
 botID: number;
  missionID: number | null;
  detectedAt: number;
  latitude: number;
  longitude: number;
  altitude: number;
  temperatures: HotspotTemperature[];
  averageTemperature?: number |string | null;
  
};

