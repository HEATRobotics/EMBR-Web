import { useState, useEffect } from 'react';

import { fetchAllTemperatures } from '@/api/temperature.api';
import { useWebSocket } from '@/context/WebSocketContext';

// Helper function to extract bot-specific data
const filterBotData = (data: any[], botId: number) => {
  const tempList: Number[] = [];
  const timeList: Date[] = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i].botID === botId) {
      tempList.push(data[i].temperature);
      timeList.push(data[i].clockTime);
    }
  }

  return { tempList, timeList };
};

export function useAllTemperatureData(botId: number = 1) {
  const [temperature, setTemperature] = useState<Number[]>([]);
  const [clockTime, setClockTime] = useState<Date[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected } = useWebSocket();

  // Fetch initial data immediately via HTTP
  useEffect(() => {
    const fetchInitialTemperatureData = async () => {
      try {
        const response = await fetchAllTemperatures();
        console.log('Initial temperature information fetched via HTTP!', response);
        const { tempList, timeList } = filterBotData(response, botId);
        setTemperature(tempList);
        setClockTime(timeList);
        setError(null);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch temperature data.');
        setLoading(false);
      }
    };

    fetchInitialTemperatureData();
  }, [botId]);

  // Listen for real-time updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    // Listen for temperature data updates
    const handleTemperatureUpdate = (data: any[]) => {
      console.log('Temperature information updated via WebSocket!', data);
      const { tempList, timeList } = filterBotData(data, botId);
      setTemperature(tempList);
      setClockTime(timeList);
      setError(null);
      setLoading(false);
    };

    socket.on('temperature:update', handleTemperatureUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off('temperature:update', handleTemperatureUpdate);
    };
  }, [socket, botId]);

  return { temperature, clockTime, loading, error, isConnected };
}
