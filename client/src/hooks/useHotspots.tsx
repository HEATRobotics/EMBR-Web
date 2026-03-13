import { useState, useEffect } from 'react'; 

import { fetchHotspots, mapHotspotDtoToHotspot } from '@/api/hotspots.api';
import { useWebSocket } from '@/context/WebSocketContext';
import { HotspotType } from '@/types/hotspot.type';

export function useHotspots() {
  const [hotspots, setHotspots] = useState<HotspotType[]>([]);
  const [hotspotsLoading, setHotspotsLoading] = useState<boolean>(true);
  const [hotspotError, setHotspotError] = useState<string | null>(null);
  const { socket, isConnected } = useWebSocket();

  // Fetch initial data immediately via HTTP (faster than waiting for WebSocket)
  useEffect(() => {
    const fetchInitialHotspotData = async () => {
      try {
        const hotspotData = await fetchHotspots();
        console.log('Initial hotspot information fetched via HTTP!', hotspotData);
        setHotspots(hotspotData);
        setHotspotError(null);
        setHotspotsLoading(false);
      } catch (err) {
        setHotspotError('Failed to fetch hotspot data.');
        setHotspotsLoading(false);
      }
    };

    fetchInitialHotspotData();
  }, []);

  // Listen for real-time updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    // Listen for hotspot data updates
    const handleHotspotUpdate = (data: HotspotType) => { 
      console.log('Hotspot information updated via WebSocket!', data);
    try {
        const mappedHotspot = mapHotspotDtoToHotspot(data);
        setHotspots((prevHotspots) => [mappedHotspot, ...prevHotspots]);
        setHotspotError(null);
        setHotspotsLoading(false);
      } catch (err) {
        setHotspotError('Failed to process hotspot data.');
        setHotspotsLoading(false);
      }
    };
     

    socket.on('hotspot:created', handleHotspotUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off('hotspot:created', handleHotspotUpdate);
    };
  }, [socket]);
};
