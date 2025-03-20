import { useState, useEffect } from 'react';
import axios from 'axios';


const API_BASE_URL = 'http://localhost:3100/api';
//TODO id specify
export function useLatestBatteryData() {
    const [id, setId] = useState<Number[]>([]);
    const [battery, setBattery] = useState<Number[]>([]);
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
                    if(d[i].botID == 1){
                        batteryList.push(d[i].battery);
                    }
                }
                return batteryList;
            });
            setError(null);
        } catch (err: any) {
            setError('Failed to fetch all battery data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch all battery data every 5 seconds (adjust as needed)
        const interval = setInterval(fetchLatestBatteryData, 5000);

        //fetchLatestBatteryData();

        return () => clearInterval(interval);
    },);

    return { id, battery, loading, error };
}