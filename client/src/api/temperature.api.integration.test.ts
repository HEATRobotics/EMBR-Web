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

describe('Temperature API Integration Tests - Server to Client Data Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Bot Temperature Data Mapping', () => {
    it('should correctly map server bot temperature response to client structure', async () => {
      // Simulate actual server response structure from temperature.controller.mjs
      const serverResponse = [
        {
          id: 1,
          clockTime: '2024-01-15 10:00:00',
          temperature: 25.5,
          missionID: 10,
        },
        {
          id: 2,
          clockTime: '2024-01-15 10:05:00',
          temperature: 26.0,
          missionID: null,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientTemperatures = await fetchBotTemperatures(5);

      expect(clientTemperatures).toHaveLength(2);
      
      // Verify first temperature reading
      expect(clientTemperatures[0]).toEqual({
        id: 1,
        clockTime: '2024-01-15 10:00:00',
        temperature: 25.5,
        missionID: 10,
      });

      // Verify handling of null missionID
      expect(clientTemperatures[1].missionID).toBeNull();
    });

    it('should handle database returning numeric types correctly', async () => {
      const serverResponse = [
        {
          id: 10,
          clockTime: '2024-01-16 14:30:00',
          temperature: 24.75,
          missionID: 5,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const result = await fetchBotTemperatures(3);

      expect(typeof result[0].id).toBe('number');
      expect(typeof result[0].temperature).toBe('number');
      expect(typeof result[0].missionID).toBe('number');
      expect(typeof result[0].clockTime).toBe('string');
    });
  });

  describe('Mission Temperature Data Mapping', () => {
    it('should correctly map server mission temperature response to client structure', async () => {
      const serverResponse = [
        {
          id: 5,
          clockTime: '2024-01-17 09:00:00',
          temperature: 23.8,
          botID: 1,
        },
        {
          id: 6,
          clockTime: '2024-01-17 09:05:00',
          temperature: 24.2,
          botID: 2,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientTemperatures = await fetchMissionTemperatures(10);

      expect(clientTemperatures).toHaveLength(2);
      expect(clientTemperatures[0]).toEqual({
        id: 5,
        clockTime: '2024-01-17 09:00:00',
        temperature: 23.8,
        botID: 1,
      });
      expect(clientTemperatures[1].botID).toBe(2);
    });

    it('should verify botID field exists for mission temperatures', async () => {
      const serverResponse = [
        {
          id: 7,
          clockTime: '2024-01-17 10:00:00',
          temperature: 25.0,
          botID: 3,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const result = await fetchMissionTemperatures(15);

      expect(result[0]).toHaveProperty('botID');
      expect(typeof result[0].botID).toBe('number');
    });
  });

  describe('All Temperatures Data Mapping', () => {
    it('should correctly map server all temperatures response with mixed missionID states', async () => {
      const serverResponse = [
        {
          id: 1,
          clockTime: '2024-01-18 08:00:00',
          temperature: 22.5,
          botID: 1,
          missionID: 5,
        },
        {
          id: 2,
          clockTime: '2024-01-18 08:05:00',
          temperature: 23.0,
          botID: 2,
          missionID: null, // Bot not on mission
        },
        {
          id: 3,
          clockTime: '2024-01-18 08:10:00',
          temperature: 24.5,
          botID: 3,
          missionID: 5,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientTemperatures = await fetchAllTemperatures();

      expect(clientTemperatures).toHaveLength(3);
      
      // Verify structure includes both botID and missionID
      expect(clientTemperatures[0]).toEqual({
        id: 1,
        clockTime: '2024-01-18 08:00:00',
        temperature: 22.5,
        botID: 1,
        missionID: 5,
      });

      // Verify null missionID is preserved
      expect(clientTemperatures[1].missionID).toBeNull();
      expect(clientTemperatures[1].botID).toBe(2);
    });
  });

  describe('Battery Data Mapping', () => {
    it('should correctly map server battery response to client structure', async () => {
      const serverResponse = [
        {
          id: 100,
          clockTime: '2024-01-19 12:00:00',
          battery: 85,
          botID: 1,
        },
        {
          id: 101,
          clockTime: '2024-01-19 12:05:00',
          battery: 78,
          botID: 2,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientBattery = await fetchAllBattery();

      expect(clientBattery).toHaveLength(2);
      expect(clientBattery[0]).toEqual({
        id: 100,
        clockTime: '2024-01-19 12:00:00',
        battery: 85,
        botID: 1,
      });
    });

    it('should handle battery levels as numbers', async () => {
      const serverResponse = [
        {
          id: 102,
          clockTime: '2024-01-19 13:00:00',
          battery: 92,
          botID: 3,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const result = await fetchAllBattery();

      expect(typeof result[0].battery).toBe('number');
      expect(result[0].battery).toBeGreaterThanOrEqual(0);
      expect(result[0].battery).toBeLessThanOrEqual(100);
    });
  });

  describe('Bot-specific Battery Data Mapping', () => {
    it('should correctly map server bot battery response without botID field', async () => {
      // When fetching battery for a specific bot, botID is implicit
      const serverResponse = [
        {
          id: 200,
          clockTime: '2024-01-20 08:00:00',
          battery: 95,
        },
        {
          id: 201,
          clockTime: '2024-01-20 08:05:00',
          battery: 93,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientBattery = await fetchBotBattery(7);

      expect(clientBattery).toHaveLength(2);
      
      // Note: botID is not included when fetching for specific bot
      expect(clientBattery[0]).toEqual({
        id: 200,
        clockTime: '2024-01-20 08:00:00',
        battery: 95,
      });
      
      expect(clientBattery[0]).not.toHaveProperty('botID');
    });
  });

  describe('Time Series Data Integrity', () => {
    it('should maintain chronological order and data integrity for temperature readings', async () => {
      const serverResponse = [
        {
          id: 1,
          clockTime: '2024-01-21 10:00:00',
          temperature: 20.0,
          botID: 1,
          missionID: 1,
        },
        {
          id: 2,
          clockTime: '2024-01-21 10:05:00',
          temperature: 20.5,
          botID: 1,
          missionID: 1,
        },
        {
          id: 3,
          clockTime: '2024-01-21 10:10:00',
          temperature: 21.0,
          botID: 1,
          missionID: 1,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientTemperatures = await fetchAllTemperatures();

      // Verify all data points are preserved in order
      expect(clientTemperatures).toHaveLength(3);
      expect(clientTemperatures[0].temperature).toBe(20.0);
      expect(clientTemperatures[1].temperature).toBe(20.5);
      expect(clientTemperatures[2].temperature).toBe(21.0);
      
      // Verify timestamps are preserved
      expect(clientTemperatures[0].clockTime).toBe('2024-01-21 10:00:00');
      expect(clientTemperatures[1].clockTime).toBe('2024-01-21 10:05:00');
      expect(clientTemperatures[2].clockTime).toBe('2024-01-21 10:10:00');
    });
  });

  describe('Database Schema Compatibility', () => {
    it('should verify temperature table fields match between server and client', async () => {
      const serverResponse = [
        {
          id: 1,
          clockTime: '2024-01-22 14:00:00',
          temperature: 25.5,
          botID: 2,
          missionID: 3,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const result = await fetchAllTemperatures();

      // Verify all expected fields are present
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('clockTime');
      expect(result[0]).toHaveProperty('temperature');
      expect(result[0]).toHaveProperty('botID');
      expect(result[0]).toHaveProperty('missionID');
      
      // Verify no unexpected fields
      const keys = Object.keys(result[0]);
      expect(keys).toEqual(['id', 'clockTime', 'temperature', 'botID', 'missionID']);
    });

    it('should verify battery table fields match between server and client', async () => {
      const serverResponse = [
        {
          id: 1,
          clockTime: '2024-01-22 15:00:00',
          battery: 87,
          botID: 4,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const result = await fetchAllBattery();

      // Verify all expected fields are present
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('clockTime');
      expect(result[0]).toHaveProperty('battery');
      expect(result[0]).toHaveProperty('botID');
      
      // Verify no unexpected fields
      const keys = Object.keys(result[0]);
      expect(keys).toEqual(['id', 'clockTime', 'battery', 'botID']);
    });
  });

  describe('Empty and Edge Case Data Handling', () => {
    it('should handle empty temperature data arrays', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const result = await fetchAllTemperatures();

      expect(result).toEqual([]);
    });

    it('should handle zero temperature values', async () => {
      const serverResponse = [
        {
          id: 1,
          clockTime: '2024-01-23 05:00:00',
          temperature: 0,
          botID: 1,
          missionID: null,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const result = await fetchAllTemperatures();

      expect(result[0].temperature).toBe(0);
    });

    it('should handle extreme battery values', async () => {
      const serverResponse = [
        {
          id: 1,
          clockTime: '2024-01-23 06:00:00',
          battery: 0, // Dead battery
          botID: 1,
        },
        {
          id: 2,
          clockTime: '2024-01-23 07:00:00',
          battery: 100, // Full battery
          botID: 2,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const result = await fetchAllBattery();

      expect(result[0].battery).toBe(0);
      expect(result[1].battery).toBe(100);
    });
  });
});
