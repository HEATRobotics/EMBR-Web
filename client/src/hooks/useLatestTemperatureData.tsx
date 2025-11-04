import { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';

export function useLatestTemperatureData() {
    const [temperature, setTemperature] = useState<Number[]>([]);
    const [clockTime, setClockTime] = useState<Date[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { socket, isConnected } = useWebSocket();

    useEffect(() => {
        if (!socket) return;

        // Listen for temperature data updates
        const handleTemperatureUpdate = (data: any[]) => {
            console.log('Latest temperature information received!', data);
            processLatestTemperatureData(data);
        };

        socket.on('temperature:initial', handleTemperatureUpdate);
        socket.on('temperature:update', handleTemperatureUpdate);

        // Cleanup listeners on unmount
        return () => {
            socket.off('temperature:initial', handleTemperatureUpdate);
            socket.off('temperature:update', handleTemperatureUpdate);
        };
    }, [socket]);

    const processLatestTemperatureData = (data: any[]) => {
        try {
            const tempList: Number[] = [];
            const timeList: Date[] = [];

            for (let i = 0; i < data.length; i++) {
                if (data[i].botID == 2) { //NOTE: since there is only one EMBR robot this is hard coded.
                    tempList.push(data[i].temperature);
                    timeList.push(data[i].clockTime);
                }
            }

            setTemperature(tempList);
            setClockTime(timeList);
            setError(null);
            setLoading(false);
        } catch (err: any) {
            setError('Failed to process latest temperature data.');
            console.error(err);
            setLoading(false);
        }
    };

    return { temperature, clockTime, loading, error, isConnected };
}