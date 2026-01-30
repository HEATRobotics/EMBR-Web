import axios from 'axios';
import { mapBotDtoToRobot, fetchBots } from './bots.api';
import { RobotType } from '@/types/robot.type';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Bots API Integration Tests - Server to Client Data Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to suppress error logs during tests
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Server Response to Client Object Mapping', () => {
    it('should correctly map server bot response to client RobotType structure', async () => {
      // Simulate actual server response structure from bot.controller.mjs
      const serverResponse = [
        {
          botID: 1,
          assignmentStatus: 'ready',
          positionTime: '2024-01-15T10:30:00Z',
          latitude: 49.939434,
          longitude: -119.396427,
          altitude: 350.5,
          relativeAltitude: 100.2,
          groundXSpeed: 1.5,
          groundYSpeed: 2.0,
          groundZSpeed: 0.5,
          vehicleHeading: 90,
          temperature: 25.5,
          battery: 85,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientBots = await fetchBots();

      // Verify the data structure matches what the client expects (RobotType)
      expect(clientBots).toHaveLength(1);
      const bot = clientBots[0];

      // Verify all required fields are present and correctly mapped
      expect(bot).toMatchObject({
        id: 1,
        name: 'Bot 1',
        assignmentStatus: 'ready',
        operationalStatus: 'operational',
        battery: 85,
        coordinates: {
          lat: 49.939434,
          lng: -119.396427,
          alt: 350.5,
        },
        lastMove: '2024-01-15T10:30:00Z',
        gx: 1.5,
        gy: 2.0,
        gz: 0.5,
        lat: 49.939434,
        lng: -119.396427,
        heading: 90,
      });

      // Verify the object conforms to RobotType interface
      expect(typeof bot.id).toBe('number');
      expect(typeof bot.name).toBe('string');
      expect(typeof bot.battery).toBe('number');
      expect(typeof bot.coordinates.lat).toBe('number');
      expect(typeof bot.coordinates.lng).toBe('number');
    });

    it('should handle database returning string values for numeric fields', async () => {
      // Some databases may return numeric values as strings
      const serverResponse = [
        {
          botID: 2,
          assignmentStatus: 'assigned',
          latitude: '49.5',
          longitude: '-119.5',
          altitude: '250',
          battery: '75',
          groundXSpeed: '0.5',
          groundYSpeed: '1.0',
          groundZSpeed: '0.2',
          vehicleHeading: '180',
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientBots = await fetchBots();

      expect(clientBots[0].lat).toBe(49.5);
      expect(clientBots[0].lng).toBe(-119.5);
      expect(clientBots[0].battery).toBe(75);
      expect(clientBots[0].coordinates.alt).toBe(250);
      expect(clientBots[0].gx).toBe(0.5);
      expect(clientBots[0].heading).toBe(180);
    });

    it('should handle missing optional server fields with proper defaults', async () => {
      // Server may not always provide all optional fields
      const serverResponse = [
        {
          botID: 3,
          assignmentStatus: 'ready',
          battery: 90,
          // Missing: positionTime, latitude, longitude, altitude, speeds, heading
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientBots = await fetchBots();
      const bot = clientBots[0];

      // Should use default UBCO coordinates when lat/lng missing
      expect(bot.lat).toBe(49.939434);
      expect(bot.lng).toBe(-119.396427);
      
      // Should have defaults for missing fields
      expect(bot.lastMove).toBe('');
      expect(bot.gx).toBe(0);
      expect(bot.gy).toBe(0);
      expect(bot.gz).toBe(0);
      expect(bot.heading).toBe(0);
      expect(bot.coordinates.alt).toBe(0);
    });

    it('should correctly determine operational status based on battery level from server', async () => {
      const testCases = [
        { battery: 100, expectedStatus: 'operational' },
        { battery: 50, expectedStatus: 'operational' },
        { battery: 20, expectedStatus: 'operational' },
        { battery: 19, expectedStatus: 'chargingRequired' },
        { battery: 10, expectedStatus: 'chargingRequired' },
        { battery: 0, expectedStatus: 'systemFailed' },
      ];

      for (const testCase of testCases) {
        const serverResponse = [
          {
            botID: 1,
            assignmentStatus: 'ready',
            battery: testCase.battery,
          },
        ];

        mockedAxios.get.mockResolvedValue({ data: serverResponse });
        const clientBots = await fetchBots();

        expect(clientBots[0].operationalStatus).toBe(testCase.expectedStatus);
      }
    });

    it('should handle empty server response array', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const clientBots = await fetchBots();

      expect(clientBots).toEqual([]);
    });

    it('should handle multiple bots from server correctly', async () => {
      const serverResponse = [
        {
          botID: 1,
          assignmentStatus: 'ready',
          battery: 85,
          latitude: 49.0,
          longitude: -119.0,
        },
        {
          botID: 2,
          assignmentStatus: 'assigned',
          battery: 60,
          latitude: 50.0,
          longitude: -120.0,
        },
        {
          botID: 3,
          assignmentStatus: 'ready',
          battery: 15,
          latitude: 48.0,
          longitude: -118.0,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientBots = await fetchBots();

      expect(clientBots).toHaveLength(3);
      expect(clientBots[0].id).toBe(1);
      expect(clientBots[1].id).toBe(2);
      expect(clientBots[2].id).toBe(3);
      
      expect(clientBots[0].operationalStatus).toBe('operational');
      expect(clientBots[1].operationalStatus).toBe('operational');
      expect(clientBots[2].operationalStatus).toBe('chargingRequired');
    });

    it('should throw error when server returns invalid data structure', async () => {
      // Server returns malformed data
      mockedAxios.get.mockResolvedValue({ data: { error: 'Invalid data' } });

      await expect(fetchBots()).rejects.toThrow('Failed to fetch bots');
    });

    it('should handle database field name changes gracefully', async () => {
      // Test that the mapping function works with the expected database field names
      const serverResponse = [
        {
          botID: 1, // Server uses botID
          assignmentStatus: 'ready',
          battery: 80,
          positionTime: '2024-01-15T10:30:00Z',
          latitude: 49.5,
          longitude: -119.5,
          altitude: 300,
          relativeAltitude: 50,
          groundXSpeed: 1.0,
          groundYSpeed: 1.5,
          groundZSpeed: 0.3,
          vehicleHeading: 45,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: serverResponse });

      const clientBots = await fetchBots();

      // Verify mapping from botID (server) to id (client)
      expect(clientBots[0].id).toBe(1);
      expect(clientBots[0]).not.toHaveProperty('botID');
      
      // Verify other field mappings
      expect(clientBots[0].lastMove).toBe('2024-01-15T10:30:00Z'); // positionTime -> lastMove
      expect(clientBots[0].lat).toBe(49.5); // latitude -> lat
      expect(clientBots[0].lng).toBe(-119.5); // longitude -> lng
      expect(clientBots[0].coordinates.alt).toBe(300); // altitude -> coordinates.alt
      expect(clientBots[0].gx).toBe(1.0); // groundXSpeed -> gx
      expect(clientBots[0].gy).toBe(1.5); // groundYSpeed -> gy
      expect(clientBots[0].gz).toBe(0.3); // groundZSpeed -> gz
      expect(clientBots[0].heading).toBe(45); // vehicleHeading -> heading
    });
  });

  describe('Error Handling in Data Flow', () => {
    it('should handle server errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          data: {
            error: 'Database connection failed',
          },
        },
      });

      await expect(fetchBots()).rejects.toThrow('Database connection failed');
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network timeout'));

      await expect(fetchBots()).rejects.toThrow('Failed to fetch bots');
    });
  });
});
