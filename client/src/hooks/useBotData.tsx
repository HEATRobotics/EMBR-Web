import { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import axios from 'axios';

import { RobotType } from '@/types/robot.type';
import { CoordinatesType } from '@/types/coordinate.type';

const API_BASE_URL = 'http://localhost:3100/api';

export function useBotData() {
    const [bots, setBots] = useState<RobotType[]>([]);
    const [botsLoading, setBotsLoading] = useState<boolean>(true);
    const [botError, setBotError] = useState<string | null>(null);
    const { socket, isConnected } = useWebSocket();

    // Fetch initial data immediately via HTTP (faster than waiting for WebSocket)
    useEffect(() => {
        const fetchInitialBotData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/bots/latest`);
                console.log('Initial bot information fetched via HTTP!', response.data);
                processBotData(response.data);
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
            const botList: RobotType[] = data.map((bot: any) => {
                const coordinates: CoordinatesType = {
                    lat: Number(bot.latitude),
                    lng: Number(bot.longitude),
                    alt: Number(bot.altitude),
                };

                // Calculate operational status from live sensor data (not stored in DB)
                const operationalStatus = determineOperationalStatus(bot.battery, bot.temperature);

                return {
                    id: bot.botID.toString(),
                    name: `Bot ${bot.botID}`,
                    assignmentStatus: bot.assignmentStatus || "ready", // From DB: ready, assigned, inactive
                    operationalStatus, // Calculated from sensors
                    coordinates,
                    lastMove: bot.positionTime,
                    gx: Number(bot.groundXSpeed),
                    gy: Number(bot.groundYSpeed),
                    gz: Number(bot.groundZSpeed),
                    lat: Number(bot.latitude),
                    lng: Number(bot.longitude),
                    temperature: Number(bot.temperature),
                    heading: Number(bot.vehicleHeading),
                };
            });
            setBots(botList);
            setBotError(null);
            setBotsLoading(false);
        } catch (err) {
            setBotError('Failed to process bot data.');
            setBotsLoading(false);
        }
    };

    return { bots, botsLoading, botError, isConnected };
}

/**
 * Determines the operational status of a robot based on sensor readings
 * @param battery - Battery percentage (0-100)
 * @param temperature - Temperature reading in Celsius
 * @returns The operational status of the robot
 */
function determineOperationalStatus(
    battery: number, 
    temperature: number
): RobotType["operationalStatus"] {
    // Critical failure: battery completely depleted
    if (battery === 0) {
        return "systemFailed";
    }
    
    // Warning: battery low
    if (battery < 20) {
        return "chargingRequired";
    }
    
    // Warning: temperature too high
    if (temperature > 80) {
        return "attentionRequired";
    }
    
    // All systems normal
    return "operational";
}