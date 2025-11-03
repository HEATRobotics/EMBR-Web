import { useState, useEffect } from 'react';
import axios from 'axios';


const API_BASE_URL = 'http://localhost:3100/api';

export function useAllTemperatureData() {
    // const [id, setId] = useState<Number[]>(null);
    const [temperature, setTemperature] = useState<Number[]>([]);
    const [clockTime, setClockTime] = useState<Date[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllTemperatureData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/temperature/all`);
            console.log('All temperature information fetched!', response.data);

            const d = response.data;

            const tempList: Number[] = [];
            setTemperature(() => {
                for(let i = 0; i < d.length; i++){
                    if(d[i].botID == 1){ //NOTE: since there is only one EMBR robot this is hard coded.
                        tempList.push(d[i].temperature);
                    }
                }
                return tempList;
            });

            const timeList: Date[] = [];
            setClockTime(() => {
                for(let i = 0; i < d.length; i++){
                    if(d[i].botID == 1){ //NOTE: since there is only one EMBR robot this is hard coded.
                        timeList.push(d[i].clockTime);
                    }
                }
                return timeList;
            });
            setError(null);
        } catch (err: any) {
            setError('Failed to fetch all temperature data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch all data every 5 seconds (adjust as needed)
        const interval = setInterval(fetchAllTemperatureData, 5000);

        return () => clearInterval(interval);
    },[]);

    return {temperature, clockTime, loading, error };
}