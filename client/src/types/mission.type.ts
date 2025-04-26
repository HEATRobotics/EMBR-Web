import { CoordinatesType } from "./coordinate.type";
import { RobotType } from "./robot.type";

/*
  Questions: 
    1) what are the red, orange, and blue coordinates?
    2) what is a "process"?
    3) what is averageTemperature? Average over how much time?
  TODO:
    - add some internal logic to determine what is a hotspot
*/
export interface MissionType {
  name: string;
  progress: number;
  averageTemperature: number;
  timePassed: number;
  timeEstimated: number;
  areaCoordinates: CoordinatesType[] | undefined;
  botID: number;
  hotspots?: CoordinatesType[];
}
