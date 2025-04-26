import { useState, useEffect } from 'react';
import axios from 'axios';


const API_BASE_URL = 'http://localhost:3100/api';

export function useLatestBatteryData() {
    //const [id, setId] = useState<Number[]>([]);
    const [battery, setBattery] = useState<Number[]>([]);
    const [clockTime, setClockTime] = useState<Date[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLatestBatteryData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/battery/latest`);
            console.log('latest battery information fetched!', response.data);

            const d = response.data;
            
            const batteryList: Number[] = [];
            setBattery(() => {
                for(let i = 0; i < d.length; i++){
                    if(d[i].botID == 1){//NOTE: since there is only one EMBR robot this is hard coded.
                        batteryList.push(d[i].battery);
                    }
                }
                return batteryList;
            });

            const timeList: Date[] = [];
            setClockTime(() => {
                for(let i = 0; i < d.length; i++){
                    if(d[i].botID == 1){//NOTE: since there is only one EMBR robot this is hard coded.
                        timeList.push(d[i].clockTime);
                    }
                }
                return timeList;
            });
            setError(null);
        } catch (err: any) {
            setError('Failed to fetch latest battery data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch data every 5 seconds (adjust as needed)
        const interval = setInterval(fetchLatestBatteryData, 5000);

        return () => clearInterval(interval);
    },);

    return {battery, clockTime, loading, error };
}