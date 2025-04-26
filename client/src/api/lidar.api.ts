import axios from "axios";

const API_BASE_URL = 'http://localhost:3100/api';


export type LidarData = {
    id: number;
    clockTime: string;
    distances: number[];
}

export const fetchLidarData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/lidar`);
        console.log(response.data);
        return response.data[0] as LidarData;
    } catch (error: any) {
        console.error('Error fetching lidar data:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch lidar data');
    }
}