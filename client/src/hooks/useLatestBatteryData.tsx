import { useState, useEffect } from 'react';

import { fetchBotBattery } from '@/api/temperature.api';
import { useWebSocket } from '@/context/WebSocketContext';

// Helper function to extract bot-specific data
const filterBotData = (data: any[], botId: number) => {
  const batteryList: Number[] = [];
  const timeList: Date[] = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i].botID === botId) {
      batteryList.push(data[i].battery);
      timeList.push(data[i].clockTime);
    }
  }

  return { batteryList, timeList };
};

export function useLatestBatteryData(botId: number = 1) {
  const [battery, setBattery] = useState<Number[]>([]);
  const [clockTime, setClockTime] = useState<Date[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected } = useWebSocket();

  // Fetch initial data immediately via API
  useEffect(() => {
    const fetchInitialBatteryData = async () => {
      try {
        const response = await fetchBotBattery(botId);
        console.log('Initial battery information fetched via API!', response);
        const { batteryList, timeList } = filterBotData(response, botId);
        setBattery(batteryList);
        setClockTime(timeList);
        setError(null);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch battery data.');
        setLoading(false);
      }
    };

    fetchInitialBatteryData();
  }, [botId]);

  useEffect(() => {
    if (!socket) return;

    // Listen for battery data updates
    const handleBatteryUpdate = (data: any[]) => {
      console.log('Latest battery information received!', data);
      const { batteryList, timeList } = filterBotData(data, botId);
      setBattery(batteryList);
      setClockTime(timeList);
      setError(null);
      setLoading(false);
    };

    socket.on('battery:initial', handleBatteryUpdate);
    socket.on('battery:update', handleBatteryUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off('battery:initial', handleBatteryUpdate);
      socket.off('battery:update', handleBatteryUpdate);
    };
  }, [socket, botId]);

  return { battery, clockTime, loading, error, isConnected };
}
