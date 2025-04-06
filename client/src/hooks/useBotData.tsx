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

                let state: RobotType["state"];
                if (bot.battery < 20) {
                    state = "chargingRequired";
                } else if (bot.temperature > 80) {
                    state = "attentionRequired";
                } else if (bot.battery === 0) {
                    state = "systemFailed";
                } else {
                    state = "active";
                }

                // Can probably also use the other fields in bot table like status (active, inactive, decommissioned etc) 

                return {
                    id: bot.botID.toString(),
                    name: `Bot ${bot.botID}`,
                    state,
                    coordinates,
                };
            });
            setBots(botList);
        } catch (err) {
            setBotError('Failed to fetch bot data.');
        } finally {
            setBotsLoading(false);
        }
    };

    return { bots, botsLoading, botError };
}