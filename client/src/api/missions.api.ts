import axios from 'axios';
import { MissionType } from '@/types/mission.type';
const API_BASE_URL = 'http://localhost:3100/api';
import { normalizeTimeField } from '@/utils/DateTimeConversion';

/**
 * Fetches missions from the API and transforms the areaCoordinates
 * to match the frontend format.
 * 
 * @returns {Promise<MissionType[]>} - Array of missions
 * @throws {Error} - If the request fails
 */
export const fetchMissions = async (): Promise<MissionType[]> => {
  try {
      const response = await axios.get(`${API_BASE_URL}/missions/get-all`);
      const missions = response.data;

      // Transform areaCoordinates to match CoordinatesType format
      const transformedMissions = missions.map((mission: any) => ({
          ...mission,
          areaCoordinates: [
              { lat: mission.areaCoordinates.north, lng: mission.areaCoordinates.west },  // NW corner
              { lat: mission.areaCoordinates.south, lng: mission.areaCoordinates.east }   // SE corner
          ],
      }));

      console.log('Fetched missions:', transformedMissions);
      return transformedMissions as MissionType[];

  } catch (error: any) {
      console.error('Error fetching missions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch missions');
  }
};
export const addMissionToDB = async (mission: MissionType): Promise<{ message: string; missionID: string }> => {
    // Before sending to the server, reverse the transformation from fetchMissions (since the database stores coords in north, south, east, west format):
    const missionForDB = {
        name: mission.missionName,
        botID: mission.botID,
        areaCoordinates: {
            north: mission.areaCoordinates![0].lat,
            west: mission.areaCoordinates![0].lng,
            south: mission.areaCoordinates![1].lat,
            east: mission.areaCoordinates![1].lng,
        },
    };
    console.log("Calling /create endpoint with:", missionForDB);

    const response = await axios.post(
        `${API_BASE_URL}/missions/create`, 
        missionForDB, 
        {
            headers: {'Content-Type': 'application/json'}
    });
    return response.data as { message: string; missionID: string };
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
    const response = await axios.delete(`${API_BASE_URL}/missions/delete/${missionId}`);
    return response.data; 
  } catch (error: any) {
    console.error('Error deleting mission:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to delete mission');
  }
};

export const fetchMissionById = async (id: number): Promise<MissionType> => {
  try {
      const response = await axios.get(`${API_BASE_URL}/missions/get/${id}`);
      const mission = response.data;

      // Transform areaCoordinates to match CoordinatesType format
      const transformedMission = {
          ...mission,
          areaCoordinates: [
          { lat: mission.areaCoordinates.north, lng: mission.areaCoordinates.west }, // NW corner
          { lat: mission.areaCoordinates.south, lng: mission.areaCoordinates.east }  // SE corner
          ],
      } as MissionType;

      console.log('Fetched mission:', transformedMission);

      return transformedMission;

  } catch (error: any) {
      console.error('Error fetching missions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch missions');
  }
};

