import { useState, useEffect } from 'react';
import axios from 'axios';
import { MissionType } from '@/types/mission.type'; 

const API_BASE_URL = 'http://localhost:3100/api'; 

export function useMissions() {
    const [mission, setMission] = useState<MissionType | null>(null);
    const [missionLoading, setLoading] = useState<boolean>(true);
    const [missionError, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMission = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/missions/get-all`);
                console.log(`Mission information fetched!`, response.data);
                setMission(response.data);
            } catch (err) {
                setError('Failed to fetch mission.');
            } finally {
                setLoading(false);
            }
        };

        fetchMission();
    }, []);

    return { mission, missionLoading, missionError, setMission };
}

export default useMissions;
