import axios from 'axios';
import { mapBotDtoToRobot, fetchBots } from './bots.api';
import { RobotType } from '@/types/robot.type';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('bots.api', () => {
  describe('mapBotDtoToRobot', () => {
    it('should map a complete bot DTO to RobotType', () => {
      const botDto = {
        botID: 1,
        assignmentStatus: 'ready' as RobotType['assignmentStatus'],
        positionTime: '2024-01-15T10:30:00Z',
        latitude: 49.5,
        longitude: -119.5,
        altitude: 100,
        relativeAltitude: 50,
        groundXSpeed: 1.5,
        groundYSpeed: 2.0,
        groundZSpeed: 0.5,
        vehicleHeading: 90,
        temperature: 25,
        battery: 80,
      };

      const result = mapBotDtoToRobot(botDto);

      expect(result).toEqual({
        id: 1,
        name: 'Bot 1',
        assignmentStatus: 'ready',
        operationalStatus: 'operational',
        battery: 80,
        coordinates: {
          lat: 49.5,
          lng: -119.5,
          alt: 100,
        },
        lastMove: '2024-01-15T10:30:00Z',
        gx: 1.5,
        gy: 2.0,
        gz: 0.5,
        lat: 49.5,
        lng: -119.5,
        heading: 90,
      });
    });

    it('should use default UBCO coordinates when lat/lng are missing', () => {
      const botDto = {
        botID: 2,
        assignmentStatus: 'ready' as RobotType['assignmentStatus'],
        battery: 50,
      };

      const result = mapBotDtoToRobot(botDto);

      expect(result.lat).toBe(49.939434);
      expect(result.lng).toBe(-119.396427);
      expect(result.coordinates.lat).toBe(49.939434);
      expect(result.coordinates.lng).toBe(-119.396427);
    });

    it('should handle string values for numeric fields', () => {
      const botDto = {
        botID: 3,
        assignmentStatus: 'ready' as RobotType['assignmentStatus'],
        latitude: '49.5' as any,
        longitude: '-119.5' as any,
        battery: '75' as any,
        altitude: '100' as any,
      };

      const result = mapBotDtoToRobot(botDto);

      expect(result.lat).toBe(49.5);
      expect(result.lng).toBe(-119.5);
      expect(result.battery).toBe(75);
      expect(result.coordinates.alt).toBe(100);
    });

    it('should determine operational status as "operational" for battery > 20', () => {
      const botDto = {
        botID: 4,
        assignmentStatus: 'ready' as RobotType['assignmentStatus'],
        battery: 50,
      };

      const result = mapBotDtoToRobot(botDto);

      expect(result.operationalStatus).toBe('operational');
    });

    it('should determine operational status as "chargingRequired" for battery < 20', () => {
      const botDto = {
        botID: 5,
        assignmentStatus: 'ready' as RobotType['assignmentStatus'],
        battery: 15,
      };

      const result = mapBotDtoToRobot(botDto);

      expect(result.operationalStatus).toBe('chargingRequired');
    });

    it('should determine operational status as "systemFailed" for battery = 0', () => {
      const botDto = {
        botID: 6,
        assignmentStatus: 'ready' as RobotType['assignmentStatus'],
        battery: 0,
      };

      const result = mapBotDtoToRobot(botDto);

      expect(result.operationalStatus).toBe('systemFailed');
    });

    it('should handle missing optional fields', () => {
      const botDto = {
        botID: 7,
        assignmentStatus: 'ready' as RobotType['assignmentStatus'],
      };

      const result = mapBotDtoToRobot(botDto);

      expect(result.id).toBe(7);
      expect(result.lastMove).toBe('');
      expect(result.gx).toBe(0);
      expect(result.gy).toBe(0);
      expect(result.gz).toBe(0);
      expect(result.heading).toBe(0);
    });

    it('should default assignmentStatus to "ready" when missing', () => {
      const botDto = {
        botID: 8,
        assignmentStatus: undefined as any,
        battery: 50,
      };

      const result = mapBotDtoToRobot(botDto);

      expect(result.assignmentStatus).toBe('ready');
    });
  });

  describe('fetchBots', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch and map bots successfully', async () => {
      const mockBots = [
        {
          botID: 1,
          assignmentStatus: 'ready',
          battery: 80,
        },
        {
          botID: 2,
          assignmentStatus: 'assigned',
          battery: 60,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockBots });

      const result = await fetchBots();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/bots'));
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should throw error when response is not an array', async () => {
      mockedAxios.get.mockResolvedValue({ data: { invalid: 'data' } });

      await expect(fetchBots()).rejects.toThrow('Failed to fetch bots');
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(fetchBots()).rejects.toThrow('Failed to fetch bots');
    });

    it('should handle API error responses', async () => {
      const error = {
        response: {
          data: {
            error: 'Database connection failed',
          },
        },
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchBots()).rejects.toThrow('Database connection failed');
    });
  });
});
