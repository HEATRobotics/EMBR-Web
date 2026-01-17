import { useState, useEffect } from 'react';

import { fetchBots, mapBotDtoToRobot } from '@/api/bots.api';
import { useWebSocket } from '@/context/WebSocketContext';
import { RobotType } from '@/types/robot.type';

export function useBotData() {
  const [bots, setBots] = useState<RobotType[]>([]);
  const [botsLoading, setBotsLoading] = useState<boolean>(true);
  const [botError, setBotError] = useState<string | null>(null);
  const { socket, isConnected } = useWebSocket();

  // Fetch initial data immediately via HTTP (faster than waiting for WebSocket)
  useEffect(() => {
    const fetchInitialBotData = async () => {
      try {
        const botData = await fetchBots();
        console.log('Initial bot information fetched via HTTP!', botData);
        setBots(botData);
        setBotError(null);
        setBotsLoading(false);
      } catch (err) {
        setBotError('Failed to fetch bot data.');
        setBotsLoading(false);
      }
    };

    fetchInitialBotData();
  }, []);

  // Listen for real-time updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    // Listen for bot data updates
    const handleBotUpdate = (data: any[]) => {
      console.log('Bot information updated via WebSocket!', data);
      processBotData(data);
    };

    socket.on('bots:update', handleBotUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off('bots:update', handleBotUpdate);
    };
  }, [socket]);

  const processBotData = (data: any[]) => {
    try {
      const botList = data.map((bot) => mapBotDtoToRobot(bot));
      setBots(botList);
      setBotError(null);
      setBotsLoading(false);
    } catch (err) {
      setBotError('Failed to process bot data.');
      setBotsLoading(false);
    }
  };

  return { bots, botsLoading, botError, isConnected, setBots };
}
