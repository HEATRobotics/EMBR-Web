import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchBots, mapBotDtoToRobot } from '../bots.api';
import type { RobotType } from '@/types/robot.type';

vi.mock('axios');

describe('Bots API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mapBotDtoToRobot', () => {
    it('should correctly map bot DTO to RobotType with all fields', () => {
      const botDto = {
        botID: 1,
        assignmentStatus: 'ready' as const,
        positionTime: '2024-01-01T00:00:00Z',
        latitude: 49.939434,
        longitude: -119.396427,
        altitude: 500,
        relativeAltitude: 10,
        groundXSpeed: 1.5,
        groundYSpeed: 2.0,
        groundZSpeed: 0.5,
        vehicleHeading: 90,
        battery: 85,
      };

      const result = mapBotDtoToRobot(botDto);

      expect(result).toEqual({
        id: 1,
        name: 'Bot 1',
        assignmentStatus: 'ready',
        operationalStatus: 'operational',
        battery: 85,
        coordinates: {
          lat: 49.939434,
          lng: -119.396427,
          alt: 500,
        },
        lastMove: '2024-01-01T00:00:00Z',
        gx: 1.5,
        gy: 2.0,
        gz: 0.5,
        lat: 49.939434,
        lng: -119.396427,
        heading: 90,
      });
    });

    it('should use default UBCO coordinates when lat/lng are missing', () => {
      const botDto = {
        botID: 2,
        assignmentStatus: 'assigned' as const,
        battery: 70,
      };

      const result = mapBotDtoToRobot(botDto);

      expect(result.lat).toBe(49.939434);
      expect(result.lng).toBe(-119.396427);
      expect(result.coordinates.lat).toBe(49.939434);
      expect(result.coordinates.lng).toBe(-119.396427);
    });

    it('should determine operational status based on battery level', () => {
      const testCases = [
        { battery: 0, expectedStatus: 'systemFailed' },
        { battery: 10, expectedStatus: 'chargingRequired' },
        { battery: 50, expectedStatus: 'operational' },
        { battery: 100, expectedStatus: 'operational' },
      ];

      testCases.forEach(({ battery, expectedStatus }) => {
        const botDto = {
          botID: 1,
          assignmentStatus: 'ready' as const,
          battery,
        };

        const result = mapBotDtoToRobot(botDto);

        expect(result.operationalStatus).toBe(expectedStatus);
      });
    });

    it('should handle string number values correctly', () => {
      const botDto = {
        botID: 1,
        assignmentStatus: 'ready' as const,
        latitude: '49.939434',
        longitude: '-119.396427',
        altitude: '500',
        battery: '85',
        groundXSpeed: '1.5',
        groundYSpeed: '2.0',
        groundZSpeed: '0.5',
        vehicleHeading: '90',
      };

      const result = mapBotDtoToRobot(botDto as any);

      expect(result.lat).toBe(49.939434);
      expect(result.lng).toBe(-119.396427);
      expect(result.coordinates.alt).toBe(500);
      expect(result.battery).toBe(85);
      expect(result.gx).toBe(1.5);
      expect(result.gy).toBe(2.0);
      expect(result.gz).toBe(0.5);
      expect(result.heading).toBe(90);
    });

    it('should handle missing optional fields', () => {
      const botDto = {
        botID: 3,
        assignmentStatus: 'inactive' as const,
      };

      const result = mapBotDtoToRobot(botDto as any);

      expect(result.id).toBe(3);
      expect(result.assignmentStatus).toBe('inactive');
      expect(result.coordinates.alt).toBe(0);
      expect(result.gx).toBe(0);
      expect(result.gy).toBe(0);
      expect(result.gz).toBe(0);
      expect(result.heading).toBe(0);
    });
  });

  describe('fetchBots', () => {
    it('should fetch and map bots successfully', async () => {
      const mockBotData = [
        {
          botID: 1,
          assignmentStatus: 'ready',
          latitude: 49.939434,
          longitude: -119.396427,
          battery: 85,
        },
        {
          botID: 2,
          assignmentStatus: 'assigned',
          latitude: 49.940000,
          longitude: -119.397000,
          battery: 70,
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockBotData });

      const result = await fetchBots();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/bots')
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].assignmentStatus).toBe('ready');
      expect(result[1].id).toBe(2);
      expect(result[1].assignmentStatus).toBe('assigned');
    });

    it('should throw error when response is not an array', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { invalid: 'data' } });

      await expect(fetchBots()).rejects.toThrow('Failed to fetch bots');
    });

    it('should handle axios errors', async () => {
      const errorResponse = {
        response: {
          data: {
            error: 'Database connection failed',
          },
        },
      };

      vi.mocked(axios.get).mockRejectedValue(errorResponse);

      await expect(fetchBots()).rejects.toThrow('Database connection failed');
    });

    it('should handle generic errors', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      await expect(fetchBots()).rejects.toThrow('Failed to fetch bots');
    });
  });

  describe('Data Flow Consistency', () => {
    it('should maintain data structure consistency from server to client', async () => {
      // This test validates that the data structure from the server
      // is correctly transformed into the client RobotType structure
      const serverResponse = [
        {
          botID: 1,
          assignmentStatus: 'ready',
          positionTime: '2024-01-01T00:00:00Z',
          latitude: 49.939434,
          longitude: -119.396427,
          altitude: 500,
          relativeAltitude: 10,
          groundXSpeed: 1.5,
          groundYSpeed: 2.0,
          groundZSpeed: 0.5,
          vehicleHeading: 90,
          battery: 85,
          batteryTime: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: serverResponse });

      const result = await fetchBots();

      // Verify all critical fields are mapped correctly
      expect(result[0]).toMatchObject({
        id: serverResponse[0].botID,
        name: `Bot ${serverResponse[0].botID}`,
        assignmentStatus: serverResponse[0].assignmentStatus,
        battery: serverResponse[0].battery,
        lat: serverResponse[0].latitude,
        lng: serverResponse[0].longitude,
        coordinates: {
          lat: serverResponse[0].latitude,
          lng: serverResponse[0].longitude,
          alt: serverResponse[0].altitude,
        },
      });
    });
  });
});
