import axios from 'axios';
import { MissionType } from '@/types/mission.type';
const API_BASE_URL = 'http://localhost:3100/api';

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
        name: mission.name,
        botID: mission.botID,
        areaCoordinates: {
            north: mission.areaCoordinates[0].lat,
            west: mission.areaCoordinates[0].lng,
            south: mission.areaCoordinates[1].lat,
            east: mission.areaCoordinates[1].lng,
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
