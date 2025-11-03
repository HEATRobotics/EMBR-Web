import { useState, useEffect } from 'react';
import { fetchMissions } from '@/api/missions.api';
import { MissionType } from '@/types/mission.type';

export function useMissions() {
    const [missionsData, setMissions] = useState<MissionType[] | null>(null);
    const [missionsLoading, setLoading] = useState<boolean>(true);
    const [missionsError, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load mission data via API
        const loadMissions = async () => {
            try {
                const missions = await fetchMissions();
                setMissions(missions);
                console.log('Mission information fetched!', missions);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch mission.');
                setLoading(false);
            }
        };

        loadMissions();
    }, []);

    return { missionsData, missionsLoading, missionsError, setMissions };
}

export default useMissions;
