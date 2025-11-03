import { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3100/api';

export function useAllTemperatureData() {
    const [temperature, setTemperature] = useState<Number[]>([]);
    const [clockTime, setClockTime] = useState<Date[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { socket, isConnected } = useWebSocket();

    // Fetch initial data immediately via HTTP
    useEffect(() => {
        const fetchInitialTemperatureData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/temperature/all`);
                console.log('Initial temperature information fetched via HTTP!', response.data);
                processTemperatureData(response.data);
            } catch (err: any) {
                setError('Failed to fetch temperature data.');
                setLoading(false);
            }
        };

        fetchInitialTemperatureData();
    }, []);

    // Listen for real-time updates via WebSocket
    useEffect(() => {
        if (!socket) return;

        // Listen for temperature data updates
        const handleTemperatureUpdate = (data: any[]) => {
            console.log('Temperature information updated via WebSocket!', data);
            processTemperatureData(data);
        };

        socket.on('temperature:update', handleTemperatureUpdate);

        // Cleanup listeners on unmount
        return () => {
            socket.off('temperature:update', handleTemperatureUpdate);
        };
    }, [socket]);

    const processTemperatureData = (data: any[]) => {
        try {
            const tempList: Number[] = [];
            const timeList: Date[] = [];

            for (let i = 0; i < data.length; i++) {
                if (data[i].botID == 1) { //NOTE: since there is only one EMBR robot this is hard coded.
                    tempList.push(data[i].temperature);
                    timeList.push(data[i].clockTime);
                }
            }

            setTemperature(tempList);
            setClockTime(timeList);
            setError(null);
            setLoading(false);
        } catch (err: any) {
            setError('Failed to process temperature data.');
            console.error(err);
            setLoading(false);
        }
    };

    return { temperature, clockTime, loading, error, isConnected };
}