import { useState, useEffect } from 'react';
import { fetchMissions } from '@/api/missions.api';
import { MissionType } from '@/types/mission.type'; 

const API_BASE_URL = 'http://localhost:3100/api'; 

export function useMissions() {
    const [missionsData, setMissions] = useState<MissionType[] | null>(null);
    const [missionsLoading, setLoading] = useState<boolean>(true);
    const [missionsError, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMissions = async () => {
            try {
                const missions = await fetchMissions();
                setMissions(missions);
                console.log('Mission information fetched!', missions);
            } catch (err) {
                setError('Failed to fetch mission.');
            } finally {
                setLoading(false);
            }
        };

        loadMissions();
    }, []);

    return { missionsData, missionsLoading, missionsError, setMissions };
}

export default useMissions;
