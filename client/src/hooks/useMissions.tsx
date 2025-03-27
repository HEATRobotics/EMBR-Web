import { useState, useEffect } from 'react';
import axios from 'axios';
import { MissionType } from '@/types/mission.type'; 

const API_BASE_URL = 'http://localhost:3100/api'; 

export function useMissions() {
    const [missionData, setMission] = useState<MissionType[] | null>(null);
    const [missionLoading, setLoading] = useState<boolean>(true);
    const [missionError, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMission = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/missions/get-all`);
                const missions = response.data;

                // In the database, mission's areaCoordinates is stored as a JSON with keys for north, south, east, and west (how GoogleMaps API Rectangle() expects it)
                // We need to convert it to an array of CoordinatesType objects for the frontend
                missions.forEach((mission: any) => {
                    // where CoordinateType is north-west (top left) and second is south-east (bottom right)
                    mission.areaCoordinates = [
                        { lat: mission.areaCoordinates.north, lng: mission.areaCoordinates.west },
                        { lat: mission.areaCoordinates.south, lng: mission.areaCoordinates.east },
                    ];
                });

                setMission(missions as MissionType[]);
                console.log(`Mission information fetched!`, missions);

                setMission(response.data);
            } catch (err) {
                setError('Failed to fetch mission.');
            } finally {
                setLoading(false);
            }
        };

        fetchMission();
    }, []);

    return { missionData, missionLoading, missionError, setMission };
}

export default useMissions;
