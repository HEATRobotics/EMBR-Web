import { useState, useEffect } from 'react';
import axios from 'axios';

import { RobotType } from '@/types/robot.type';
import { CoordinatesType } from '@/types/coordinate.type';

const API_BASE_URL = 'http://localhost:3100/api';

export function useBotData() {
    const [bots, setBots] = useState<RobotType[]>([]);
    const [botsLoading, setBotsLoading] = useState<boolean>(true);
    const [botError, setBotError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch fleet data every 5 seconds
        const interval = setInterval(fetchBotData, 5000);
        
        fetchBotData();

        // Stop on component unmount
        return () => clearInterval(interval);
    }, []);

    const fetchBotData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bots/latest`);
            console.log(`Bot information fetched!`, response.data);

            const botList: RobotType[] = response.data.map((bot: any) => {
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
            console.log(botList);
        } catch (err) {
            setBotError('Failed to fetch bot data.');
        } finally {
            setBotsLoading(false);
        }
    };

    return { bots, botsLoading, botError };
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