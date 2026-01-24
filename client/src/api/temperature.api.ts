import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3100/api';

export const fetchBotTemperatures = async (botId: number) => {
  const response = await axios.get(`${API_BASE_URL}/temperature/bot/${botId}`);
  return response.data as Array<{
    id: number;
    clockTime: string;
    temperature: number;
    missionID: number | null;
  }>;
};

export const fetchMissionTemperatures = async (missionId: number) => {
  const response = await axios.get(`${API_BASE_URL}/temperature/mission/${missionId}`);
  return response.data as Array<{
    id: number;
    clockTime: string;
    temperature: number;
    botID: number;
  }>;
};

export const fetchAllTemperatures = async () => {
  const response = await axios.get(`${API_BASE_URL}/temperature`);
  return response.data as Array<{
    id: number;
    clockTime: string;
    temperature: number;
    botID: number;
    missionID: number | null;
  }>;
};

export const fetchAllBattery = async () => {
  const response = await axios.get(`${API_BASE_URL}/battery/all`);
  return response.data as Array<{
    id: number;
    clockTime: string;
    battery: number;
    botID: number;
  }>;
};

export const fetchBotBattery = async (botId: number) => {
  const response = await axios.get(`${API_BASE_URL}/battery/bot/${botId}`);
  return response.data as Array<{
    id: number;
    clockTime: string;
    battery: number;
  }>;
};
