import { useState, useEffect } from 'react';
import axios from 'axios';

// Define the fleet structure
export interface FleetItemType {
    id: number | string;
    name: string;
    missions: {
        id: number | string;
        robots: RobotType[];
    }[];
}

export interface RobotType {
    id: number | string;
    name: string;
    state: number; // Use your predefined RobotStateType
}

const API_BASE_URL = 'http://localhost:3100/api';

export function useFleetData() {
    const [fleets, setFleets] = useState<FleetItemType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFleets = async () => {
            try {
                const response = await axios.get<FleetItemType[]>(`${API_BASE_URL}/fleets`);
                setFleets(response.data);
            } catch (err) {
                setError('Failed to fetch fleet data.');
            } finally {
                setLoading(false);
            }
        };

        fetchFleets();
    }, []);

    return { fleets, loading, error };
}
