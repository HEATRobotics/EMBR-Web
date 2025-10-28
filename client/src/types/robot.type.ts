import { CoordinatesType } from "./coordinate.type";

/**
 * Robot Type Definition
 * 
 * assignmentStatus: Whether the robot is available for missions (STORED IN DATABASE)
 *   - "ready": Bot is available and ready to be assigned to a new mission
 *   - "assigned": Bot is currently assigned to and executing a mission
 *   - "inactive": Bot is temporarily out of service (maintenance, decommissioned, etc.)
 * 
 * operationalStatus: The real-time operational health based on sensor data (CALCULATED, NOT STORED)
 *   - "operational": All systems functioning normally
 *   - "chargingRequired": Battery is low and needs charging
 *   - "attentionRequired": Temperature or other sensor reading requires attention
 *   - "systemFailed": Critical system failure detected
 */
export interface RobotType {
  id: string;
  name: string;
  assignmentStatus: "ready" | "assigned" | "inactive";
  operationalStatus: "operational" | "chargingRequired" | "attentionRequired" | "systemFailed";
  coordinates: CoordinatesType;
  lastMove: string;
  gx: number;
  gy: number;
  gz: number;
  lat: number;
  lng: number;
  temperature: number;
  heading: number;
}