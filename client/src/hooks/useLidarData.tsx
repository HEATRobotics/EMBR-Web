import {useEffect, useState} from "react";
import {fetchLidarData, LidarData} from "@/api/lidar.api";

const API_BASE_URL = 'http://localhost:3100/api';


export const useLidarData = () => {
    const [lidarData, setLidarData] = useState<LidarData>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchLidarData();
                setLidarData(data);
                console.log("Lidar Data Updated", data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        const interval = setInterval(loadData, 100);
        return () => clearInterval(interval);
    }, []);

    return { lidarData, loading };

}