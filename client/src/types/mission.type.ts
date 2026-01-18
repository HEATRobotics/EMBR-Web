import { CoordinatesType } from './coordinate.type';

export interface MissionType {
  missionID: number;
  missionName: string;
  progress: number;
  averageTemperature: number;
  timePassed: number; // in minutes
  timeEstimated: number;
  areaCoordinates: CoordinatesType[] | undefined;
  assignedBots?: number[];
  timeStart?: string | null;
  timeEnd?: string | null;
  hotspots?: CoordinatesType[];
}
