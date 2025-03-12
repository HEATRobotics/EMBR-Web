import { CoordinatesType } from "./coordinate.type";

/*
  TODO: 
    - add fields for battery level, last 5 temperature readings, etc
    - add internal logic to determine state based on battery level and latest temp
    - does a bot need a name field?
*/
export interface RobotType {
  id: string;
  name: string;
  state: "active" | "chargingRequired" | "attentionRequired" | "systemFailed";
  coordinates: CoordinatesType;
  temperature: number;
  battery: number;
}