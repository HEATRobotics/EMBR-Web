import { CoordinatesType } from "./coordinate.type";
// import { MissionType } from "./mission.type";
import { RobotType } from "./robot.type";

/* 
  TODO: 
    - probably just keep track of current mission (singular)
    - separately keep track of robots in the fleet (should just be one for now)
    - add logic for determining the center (if one bot, just use its coordinates)
*/
export interface FleetItemType {
  id: string | number;
  name: string;
  center: CoordinatesType;
  bots: RobotType[];
}