import axios from 'axios';
import {
  fetchBotTemperatures,
  fetchMissionTemperatures,
  fetchAllTemperatures,
  fetchAllBattery,
  fetchBotBattery,
} from './temperature.api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('temperature.api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchBotTemperatures', () => {
    it('should fetch temperatures for a specific bot', async () => {
      const mockData = [
        {
          id: 1,
          clockTime: '2024-01-15 10:00:00',
          temperature: 25.5,
          missionID: 1,
        },
        {
          id: 2,
          clockTime: '2024-01-15 10:05:00',
          temperature: 26.0,
          missionID: null,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await fetchBotTemperatures(5);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/temperature/bot/5')
      );
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
      expect(result[0].temperature).toBe(25.5);
    });
  });

  describe('fetchMissionTemperatures', () => {
    it('should fetch temperatures for a specific mission', async () => {
      const mockData = [
        {
          id: 3,
          clockTime: '2024-01-15 11:00:00',
          temperature: 24.5,
          botID: 1,
        },
        {
          id: 4,
          clockTime: '2024-01-15 11:05:00',
          temperature: 25.2,
          botID: 2,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await fetchMissionTemperatures(10);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/temperature/mission/10')
      );
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
    });
  });

  describe('fetchAllTemperatures', () => {
    it('should fetch all temperature readings', async () => {
      const mockData = [
        {
          id: 5,
          clockTime: '2024-01-15 12:00:00',
          temperature: 23.5,
          botID: 1,
          missionID: 1,
        },
        {
          id: 6,
          clockTime: '2024-01-15 12:05:00',
          temperature: 24.0,
          botID: 2,
          missionID: null,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await fetchAllTemperatures();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/temperature')
      );
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
      expect(result[0].botID).toBe(1);
      expect(result[1].missionID).toBeNull();
    });
  });

  describe('fetchAllBattery', () => {
    it('should fetch all battery readings', async () => {
      const mockData = [
        {
          id: 7,
          clockTime: '2024-01-15 13:00:00',
          battery: 85,
          botID: 1,
        },
        {
          id: 8,
          clockTime: '2024-01-15 13:05:00',
          battery: 78,
          botID: 2,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await fetchAllBattery();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/battery/all')
      );
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
      expect(result[0].battery).toBe(85);
    });
  });

  describe('fetchBotBattery', () => {
    it('should fetch battery readings for a specific bot', async () => {
      const mockData = [
        {
          id: 9,
          clockTime: '2024-01-15 14:00:00',
          battery: 92,
        },
        {
          id: 10,
          clockTime: '2024-01-15 14:05:00',
          battery: 90,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await fetchBotBattery(3);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/battery/bot/3')
      );
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
      expect(result[1].battery).toBe(90);
    });
  });
});
