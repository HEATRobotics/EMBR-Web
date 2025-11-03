import { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3100/api';

export function useAllBatteryData() {
    const [battery, setBattery] = useState<Number[]>([]);
    const [clockTime, setClockTime] = useState<Date[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { socket, isConnected } = useWebSocket();

    // Fetch initial data immediately via HTTP
    useEffect(() => {
        const fetchInitialBatteryData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/battery/all`);
                console.log('Initial battery information fetched via HTTP!', response.data);
                processBatteryData(response.data);
            } catch (err: any) {
                setError('Failed to fetch battery data.');
                setLoading(false);
            }
        };

        fetchInitialBatteryData();
    }, []);

    // Listen for real-time updates via WebSocket
    useEffect(() => {
        if (!socket) return;

        // Listen for battery data updates
        const handleBatteryUpdate = (data: any[]) => {
            console.log('Battery information updated via WebSocket!', data);
            processBatteryData(data);
        };

        socket.on('battery:update', handleBatteryUpdate);

        // Cleanup listeners on unmount
        return () => {
            socket.off('battery:update', handleBatteryUpdate);
        };
    }, [socket]);

    const processBatteryData = (data: any[]) => {
        try {
            const batteryList: Number[] = [];
            const timeList: Date[] = [];

            for (let i = 0; i < data.length; i++) {
                if (data[i].botID == 1) { //NOTE: since there is only one EMBR robot this is hard coded.
                    batteryList.push(data[i].battery);
                    timeList.push(data[i].clockTime);
                }
            }

            setBattery(batteryList);
            setClockTime(timeList);
            setError(null);
            setLoading(false);
        } catch (err: any) {
            setError('Failed to process battery data.');
            console.error(err);
            setLoading(false);
        }
    };

    return { battery, clockTime, loading, error, isConnected };
}