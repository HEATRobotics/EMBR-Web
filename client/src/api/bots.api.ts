import axios from 'axios';

import { RobotType } from '@/types/robot.type';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3100/api';

type BotDto = {
  botID: number;
  assignmentStatus: RobotType['assignmentStatus'];
  positionTime?: string;
  latitude?: number | string;
  longitude?: number | string;
  altitude?: number | string;
  relativeAltitude?: number | string;
  groundXSpeed?: number | string;
  groundYSpeed?: number | string;
  groundZSpeed?: number | string;
  vehicleHeading?: number | string;
  temperature?: number | string;
  battery?: number | string;
};

const toNumber = (value: unknown): number => Number(value ?? 0);

const determineOperationalStatus = (
  battery: number
): RobotType['operationalStatus'] => {
  if (battery === 0) return 'systemFailed';
  if (battery < 20) return 'chargingRequired';
  if (!battery) return 'attentionRequired'; 
  return 'operational';
};

export const mapBotDtoToRobot = (bot: BotDto): RobotType => {
  const UBCO_COORDS: google.maps.LatLngLiteral = {
  lat: 49.939434,
  lng: -119.396427,
};
  const latitude = toNumber(bot.latitude) || UBCO_COORDS.lat;
  const longitude = toNumber(bot.longitude) || UBCO_COORDS.lng;
  const battery = toNumber(bot.battery);

  return {
    id: bot.botID,
    name: `Bot ${bot.botID}`,
    assignmentStatus: bot.assignmentStatus ?? 'ready',
    operationalStatus: determineOperationalStatus(battery),
    battery,
    coordinates: {
      lat: latitude,
      lng: longitude,
      alt: toNumber(bot.altitude),
    },
    lastMove: bot.positionTime ?? '',
    gx: toNumber(bot.groundXSpeed),
    gy: toNumber(bot.groundYSpeed),
    gz: toNumber(bot.groundZSpeed),
    lat: latitude,
    lng: longitude,
    heading: toNumber(bot.vehicleHeading),
  };
};

export const fetchBots = async (): Promise<RobotType[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bots`);
    const data = response.data;
    if (!Array.isArray(data)) throw new Error('Bots response was not an array');
    return data.map(mapBotDtoToRobot);
  } catch (error: any) {
    console.error('Error fetching bots:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch bots');
  }
};
