import { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';

export function useLatestBatteryData() {
    const [battery, setBattery] = useState<Number[]>([]);
    const [clockTime, setClockTime] = useState<Date[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { socket, isConnected } = useWebSocket();

    useEffect(() => {
        if (!socket) return;

        // Listen for battery data updates
        const handleBatteryUpdate = (data: any[]) => {
            console.log('Latest battery information received!', data);
            processLatestBatteryData(data);
        };

        socket.on('battery:initial', handleBatteryUpdate);
        socket.on('battery:update', handleBatteryUpdate);

        // Cleanup listeners on unmount
        return () => {
            socket.off('battery:initial', handleBatteryUpdate);
            socket.off('battery:update', handleBatteryUpdate);
        };
    }, [socket]);

    const processLatestBatteryData = (data: any[]) => {
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
            setError('Failed to process latest battery data.');
            console.error(err);
            setLoading(false);
        }
    };

    return { battery, clockTime, loading, error, isConnected };
}