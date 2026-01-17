import axios from 'axios';
import { MissionType } from '@/types/mission.type';
const API_BASE_URL = 'http://localhost:3100/api';
import { normalizeTimeField } from '@/utils/DateTimeConversion';

// Type for mission data as stored in the database
type MissionDto = {
  missionID: number;
  missionName: string;
  botID: number;
  areaCoordinates: string; // JSON string
  progress: number;
  avgTemp: number;
  timePassed: number;
  timeEstimated: number;
};

// Type for area coordinates from database
type AreaCoordinatesDto = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/**
 * Transforms mission data from database format to frontend format
 */
const transformMissionFromDto = (mission: MissionDto): MissionType => {
  const areaCoords: AreaCoordinatesDto = JSON.parse(mission.areaCoordinates);
  
  return {
    ...mission,
    areaCoordinates: [
      { lat: areaCoords.north, lng: areaCoords.west },  // NW corner
      { lat: areaCoords.south, lng: areaCoords.east }   // SE corner
    ],
  };
};

/**
 * Transforms mission data from frontend format to database format
 */
const transformMissionToDto = (mission: MissionType) => {
  return {
    name: mission.missionName,
    botID: mission.botID,
    areaCoordinates: {
      north: mission.areaCoordinates![0].lat,
      west: mission.areaCoordinates![0].lng,
      south: mission.areaCoordinates![1].lat,
      east: mission.areaCoordinates![1].lng,
    },
  };
};

/**
 * Fetches all missions from the API
 * 
 * @returns {Promise<MissionType[]>} - Array of missions
 * @throws {Error} - If the request fails
 */
export const fetchMissions = async (): Promise<MissionType[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/missions`);
    const missions = response.data;

    return missions.map(transformMissionFromDto);
  } catch (error: any) {
    console.error('Error fetching missions:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch missions');
  }
};

/**
 * Creates a new mission in the database
 * 
 * @param {MissionType} mission - Mission data to create
 * @returns {Promise<{ missionID: string }>} - Created mission ID
 * @throws {Error} - If the request fails
 */
export const addMissionToDB = async (mission: MissionType): Promise<{ missionID: string }> => {
  try {
    const missionForDB = transformMissionToDto(mission);
    const response = await axios.post(
      `${API_BASE_URL}/missions`, 
      missionForDB, 
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating mission:', error);
    throw new Error(error.response?.data?.error || 'Failed to create mission');
  }
};

// Mission API update
export const updateMissionInDB = async (mission: MissionType): Promise<{ message: string }> => {
    // Normalize all time fields so backend always gets "YYYY-MM-DD HH:mm:ss"
    const normalizedTimeStart = normalizeTimeField(mission.timeStart);
    const normalizedTimeEnd = normalizeTimeField(mission.timeEnd);

    // Transform coordinates back to backend format
    const missionForDB = {
      id: mission.missionID, // assuming the backend identifies the mission with missionID
      missionName: mission.missionName,
      botID: mission.botID,
      areaCoordinates: {
        north: mission.areaCoordinates![0].lat,
        west: mission.areaCoordinates![0].lng,
        south: mission.areaCoordinates![1].lat,
        east: mission.areaCoordinates![1].lng,
      },
      progress: mission.progress || 0,
      averageTemperature: mission.avgTemp || 0,
      timeStart: normalizedTimeStart || null,
      timeEnd: normalizedTimeEnd || null,
      timePassed: mission.timePassed || 0,
      timeEstimated: mission.timeEstimated || 0 ,
    };
    console.log("Check mission passed with:", mission);

    console.log("Calling /update endpoint with:", missionForDB);

    const response = await axios.put(
      `${API_BASE_URL}/missions/update/${mission.missionID}`, // <- include ID
      missionForDB,
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data as { message: string };
};
export const deleteMission = async (missionId: string): Promise<{ message: string }> => {//export func to make it available to other files
  try {
    const response = await axios.delete(`${API_BASE_URL}/missions/${missionId}`);
    return response.data; 
  } catch (error: any) {
    console.error('Error deleting mission:', error.response?.data);
    throw new Error(error.response?.data?.error || 'Failed to delete mission');
  }
};

/**
 * Fetches a single mission by ID
 * 
 * @param {number} id - Mission ID
 * @returns {Promise<MissionType>} - Mission data
 * @throws {Error} - If the request fails
 */
export const fetchMissionById = async (id: number): Promise<MissionType> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/missions/${id}`);
    return transformMissionFromDto(response.data);
  } catch (error: any) {
    console.error('Error fetching mission:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch mission');
  }
};

