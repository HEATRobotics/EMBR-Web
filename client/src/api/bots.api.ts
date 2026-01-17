import axios from "axios";
import { RobotType } from "@/types/robot.type";

const API_BASE_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3100/api";

type BotDto = {
  botID: number;
  battery: number;
  temperature: number;
  assignmentStatus?: RobotType["assignmentStatus"];
  positionTime: string;
  groundXSpeed: number;
  groundYSpeed: number;
  groundZSpeed: number;
  latitude: number | string;
  longitude: number | string;
  altitude: number | string;
  vehicleHeading: number;
};

const toNumber = (value: unknown): number => Number(value ?? 0);

const determineOperationalStatus = (
  battery: number,
  temperature: number
): RobotType["operationalStatus"] => {
  if (battery === 0) {
    return "systemFailed";
  }

  if (battery < 20) {
    return "chargingRequired";
  }

  if (temperature > 80) {
    return "attentionRequired";
  }

  return "operational";
};

const mapBotDtoToRobot = (bot: BotDto): RobotType => {
  const latitude = toNumber(bot.latitude);
  const longitude = toNumber(bot.longitude);

  return {
    id: bot.botID.toString(),
    name: `Bot ${bot.botID}`,
    assignmentStatus: bot.assignmentStatus ?? "ready",
    operationalStatus: determineOperationalStatus(bot.battery, bot.temperature),
    coordinates: {
      lat: latitude,
      lng: longitude,
      alt: toNumber(bot.altitude),
    },
    lastMove: bot.positionTime,
    gx: toNumber(bot.groundXSpeed),
    gy: toNumber(bot.groundYSpeed),
    gz: toNumber(bot.groundZSpeed),
    lat: latitude,
    lng: longitude,
    temperature: toNumber(bot.temperature),
    heading: toNumber(bot.vehicleHeading),
  };
};

export const fetchBots = async (): Promise<RobotType[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bots`);
    const data = response.data;

    if (!Array.isArray(data)) {
      throw new Error("Bots response was not an array");
    }

    return data.map(mapBotDtoToRobot);
  } catch (error: any) {
    console.error('Error fetching bots:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch bots');
  }
};
