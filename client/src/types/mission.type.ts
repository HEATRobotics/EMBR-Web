import { CoordinatesType } from "./coordinate.type";
import { RobotType } from "./robot.type";

/*
  Questions: 
    1) what are the red, orange, and blue coordinates?
    2) what is a "process"?
    3) what is averageTemperature? Average over how much time?
  TODO:
    - change "smokes" to "hotspots" and add some internal logic to determine what is a hotspot
*/
export interface MissionType {
  name: string;
  process: number;
  smokesDetected: number;
  averageTemperature: number;
  timePassed: number;
  timeEstimated: number;
  redCoordinates?: CoordinatesType[];
  orangeCoordinates?: CoordinatesType[];
  blueCoordinates?: CoordinatesType[] | google.maps.MVCArray<any>;
  robots?: RobotType[];
  smokes?: CoordinatesType[];
  fleetName?: string;
  fleetId?: string | number;
}
