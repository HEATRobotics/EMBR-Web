import { useState, useEffect } from 'react';
import axios from 'axios';

import { FleetItemType } from '@/types/fleet.type';
import { RobotType } from '@/types/robot.type';
import { CoordinatesType } from '@/types/coordinate.type';

const API_BASE_URL = 'http://localhost:3100/api';

export function useFleetData() {
    const [fleets, setFleets] = useState<FleetItemType[]>([]);
    const [bots, setBots] = useState<RobotType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch fleet data every 5 seconds
        const interval = setInterval(fetchFleetData, 5000);
        
        fetchFleetData();

        // Stop on component unmount
        return () => clearInterval(interval);
    }, []);

    const fetchFleetData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/fleets/latest`);
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

                return {
                    id: bot.botID.toString(),
                    name: `Bot ${bot.botID}`,
                    state,
                    coordinates,
                };
            });

            // Group bots by fleetID and determine fleet centers; by default, center is the first bot's coordinates
            const fleetMap: Record<number, FleetItemType> = {};

            botList.forEach(bot => {
                const fleetID = parseInt(response.data.find((b: any) => b.botID === parseInt(bot.id))?.fleetID) || 0;
                
                if (!fleetMap[fleetID]) {
                    fleetMap[fleetID] = {
                        id: fleetID,
                        name: `Fleet ${fleetID}`,
                        center: bot.coordinates,
                        bots: [],
                    };
                }
                fleetMap[fleetID].bots.push(bot);
            });

            // Compute the fleet center (average coordinates of its bots)
            Object.values(fleetMap).forEach(fleet => {
                if (fleet.bots.length > 1) {
                    const avgCoords = fleet.bots.reduce(
                        (acc, bot) => {
                            acc.latitude += bot.coordinates.lat;
                            acc.longitude += bot.coordinates.lng;
                            // acc.altitude += bot.coordinates.alt;
                            return acc;
                        },
                        { latitude: 0, longitude: 0, altitude: 0 }
                    );

                    fleet.center = {
                        lat: avgCoords.latitude / fleet.bots.length,
                        lng: avgCoords.longitude / fleet.bots.length,
                        // alt: avgCoords.altitude / fleet.bots.length,
                    };
                }
            });

            setBots(botList);
            setFleets(Object.values(fleetMap));
        } catch (err) {
            setError('Failed to fetch fleet data.');
        } finally {
            setLoading(false);
        }
    };

    return { fleets, bots, loading, error };
}
