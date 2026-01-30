import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  fetchBotTemperatures,
  fetchMissionTemperatures,
  fetchAllTemperatures,
  fetchAllBattery,
  fetchBotBattery,
} from '../temperature.api';

vi.mock('axios');

describe('Temperature API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchBotTemperatures', () => {
    it('should fetch temperatures for a specific bot', async () => {
      const mockData = [
        { id: 1, clockTime: '2024-01-01T00:00:00Z', temperature: 25.5, missionID: 1 },
        { id: 2, clockTime: '2024-01-01T01:00:00Z', temperature: 26.0, missionID: 1 },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockData });

      const result = await fetchBotTemperatures(1);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/temperature/bot/1')
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchMissionTemperatures', () => {
    it('should fetch temperatures for a specific mission', async () => {
      const mockData = [
        { id: 1, clockTime: '2024-01-01T00:00:00Z', temperature: 25.5, botID: 1 },
        { id: 2, clockTime: '2024-01-01T01:00:00Z', temperature: 26.0, botID: 2 },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockData });

      const result = await fetchMissionTemperatures(1);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/temperature/mission/1')
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchAllTemperatures', () => {
    it('should fetch all temperature data', async () => {
      const mockData = [
        { id: 1, clockTime: '2024-01-01T00:00:00Z', temperature: 25.5, botID: 1, missionID: 1 },
        { id: 2, clockTime: '2024-01-01T01:00:00Z', temperature: 26.0, botID: 2, missionID: 1 },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockData });

      const result = await fetchAllTemperatures();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/temperature')
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchAllBattery', () => {
    it('should fetch all battery data', async () => {
      const mockData = [
        { id: 1, clockTime: '2024-01-01T00:00:00Z', battery: 85, botID: 1 },
        { id: 2, clockTime: '2024-01-01T01:00:00Z', battery: 70, botID: 2 },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockData });

      const result = await fetchAllBattery();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/battery/all')
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchBotBattery', () => {
    it('should fetch battery data for a specific bot', async () => {
      const mockData = [
        { id: 1, clockTime: '2024-01-01T00:00:00Z', battery: 85 },
        { id: 2, clockTime: '2024-01-01T01:00:00Z', battery: 80 },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockData });

      const result = await fetchBotBattery(1);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/battery/bot/1')
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('Data Flow Consistency', () => {
    it('should maintain consistent temperature data structure from server to client', async () => {
      const serverResponse = [
        {
          id: 1,
          clockTime: '2024-01-01T00:00:00Z',
          temperature: 25.5,
          botID: 1,
          missionID: 1,
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: serverResponse });

      const result = await fetchAllTemperatures();

      // Verify data structure is preserved
      expect(result[0]).toMatchObject({
        id: serverResponse[0].id,
        clockTime: serverResponse[0].clockTime,
        temperature: serverResponse[0].temperature,
        botID: serverResponse[0].botID,
        missionID: serverResponse[0].missionID,
      });
    });

    it('should maintain consistent battery data structure from server to client', async () => {
      const serverResponse = [
        {
          id: 1,
          clockTime: '2024-01-01T00:00:00Z',
          battery: 85,
          botID: 1,
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: serverResponse });

      const result = await fetchAllBattery();

      // Verify data structure is preserved
      expect(result[0]).toMatchObject({
        id: serverResponse[0].id,
        clockTime: serverResponse[0].clockTime,
        battery: serverResponse[0].battery,
        botID: serverResponse[0].botID,
      });
    });
  });
});
