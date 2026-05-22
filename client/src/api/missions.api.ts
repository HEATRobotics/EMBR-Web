import axios from 'axios';

import { MissionType } from '@/types/mission.type';
import { HotspotStatus, HotspotTemperature, HotspotType } from '@/types/hotspot.type';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3100/api';

type AreaDto = { north: number; south: number; east: number; west: number } | null;


type HotspotDto = {
  id: number;
  botID: number;
  missionId: number |null;
  detectedAt: number;
  latitude?: number | string;
  longitude?: number | string;
  altitude?: number | string |null;
  temperatures?: HotspotTemperature[] | null;
  averageTemperature?: number | string | null;
  status?: HotspotStatus;

}
type MissionDto = {
  missionId: number;
  missionName: string;
  progress: number;
  avgTemp: number;
  timePassed: number;
  timeEstimated: number;
  timeStart: string | null;
  timeEnd: string | null;
  areaCoordinates: AreaDto | string;
  assignedBots?: number[];
  hotspots?: HotspotDto[];
};

const mapHotspotDtoToHotspot= (hotspot: HotspotDto): HotspotType =>({
  id: hotspot.id,
  botID: hotspot.botID,
  missionID: hotspot.missionId,
  detectedAt: hotspot.detectedAt,
  latitude: Number(hotspot.latitude ?? 0),
  longitude: Number(hotspot.longitude ?? 0),
  altitude: Number(hotspot.altitude ?? 0),
  temperatures: hotspot.temperatures?.map((t) => ({ ...t })) || [],
  averageTemperature: hotspot.averageTemperature == null ? null : Number(hotspot.averageTemperature),
  status: hotspot.status ?? 'unresolved',
});

const parseArea = (area: AreaDto | string): AreaDto => {
  if (!area) return null;
  if (typeof area === 'string') {
    try {
      return JSON.parse(area);
    } catch {
      return null;
    }
  }
  return area;
};

const toFrontend = (dto: MissionDto): MissionType => {
  const area = parseArea(dto.areaCoordinates);
  const coords = area
    ? [
        { lat: area.north, lng: area.west },
        { lat: area.south, lng: area.east },
      ]
    : undefined;

  const assigned = dto.assignedBots ?? [];

  return {
    missionID: dto.missionId,
    missionName: dto.missionName,
    progress: dto.progress,
    averageTemperature: dto.avgTemp,
    timePassed: dto.timePassed,
    timeEstimated: dto.timeEstimated,
    timeStart: dto.timeStart,
    timeEnd: dto.timeEnd,
    areaCoordinates: coords,
    assignedBots: assigned,
    hotspots: (dto.hotspots ?? []).map(mapHotspotDtoToHotspot),
  };
};

const toPayload = (mission: MissionType, botIds: number[] = []) => ({
  missionName: mission.missionName,
  areaCoordinates: mission.areaCoordinates
    ? {
        north: mission.areaCoordinates[0].lat,
        west: mission.areaCoordinates[0].lng,
        south: mission.areaCoordinates[1].lat,
        east: mission.areaCoordinates[1].lng,
      }
    : null,
  progress: mission.progress,
  avgTemp: mission.averageTemperature,
  timePassed: mission.timePassed,
  timeEstimated: mission.timeEstimated,
  botIds: botIds.length ? botIds : (mission.assignedBots ?? []),
});

export const fetchMissions = async (): Promise<MissionType[]> => {
  const response = await axios.get(`${API_BASE_URL}/missions`);
  return (response.data as MissionDto[]).map(toFrontend);
};

export const fetchMissionById = async (id: number): Promise<MissionType> => {
  const response = await axios.get(`${API_BASE_URL}/missions/${id}`);
  return toFrontend(response.data as MissionDto);
};

export const createMission = async (mission: MissionType, botIds: number[] = []) => {
  const payload = toPayload(mission, botIds);
  const response = await axios.post(`${API_BASE_URL}/missions`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data as { missionID: number };
};

export const updateMission = async (mission: Partial<MissionType>) => {
  const payload: Record<string, unknown> = {};

  if (mission.missionName !== undefined) payload.missionName = mission.missionName;
  if (mission.progress !== undefined) payload.progress = mission.progress;
  if (mission.averageTemperature !== undefined) payload.avgTemp = mission.averageTemperature;
  if (mission.timePassed !== undefined) payload.timePassed = mission.timePassed;
  if (mission.timeEstimated !== undefined) payload.timeEstimated = mission.timeEstimated;
  if (mission.assignedBots !== undefined) payload.botIds = mission.assignedBots;
  if (mission.timeStart !== undefined) payload.timeStart = mission.timeStart;
  if (mission.timeEnd !== undefined) payload.timeEnd = mission.timeEnd;
  if (mission.areaCoordinates) {
    payload.areaCoordinates = {
      north: mission.areaCoordinates[0].lat,
      west: mission.areaCoordinates[0].lng,
      south: mission.areaCoordinates[1].lat,
      east: mission.areaCoordinates[1].lng,
    };
  }

  const response = await axios.put(`${API_BASE_URL}/missions/${mission.missionID}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data as { message: string };
};

export const startMission = async (id: number, time: string) => {
  const response = await axios.put(
    `${API_BASE_URL}/missions/start/${id}`,
    { time },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return response.data as { message: string };
};

export const endMission = async (id: number, time: string) => {
  const response = await axios.put(
    `${API_BASE_URL}/missions/end/${id}`,
    { time },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return response.data as { message: string };
};

export const deleteMission = async (id: number) => {
  const response = await axios.delete(`${API_BASE_URL}/missions/${id}`);
  return response.data as { message: string };
};

export const assignBotsToMission = async (missionId: number, botIds: number[]) => {
  const response = await axios.post(
    `${API_BASE_URL}/missions/${missionId}/assign`,
    { botIds },
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data as { message: string };
};
