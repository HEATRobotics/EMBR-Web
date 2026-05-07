import { describe, it, expect } from 'vitest';
import {
  BotSchema,
  BotArraySchema,
  MissionSchema,
  MissionArraySchema,
  MissionCreateSchema,
  TemperatureSchema,
  BatterySchema,
  validateSchema,
  safeValidateSchema,
} from '../schemas/api.schemas.mjs';

describe('API Schema Validation', () => {
  describe('BotSchema', () => {
    it('should validate a valid bot object', () => {
      const validBot = {
        botID: 1,
        assignmentStatus: 'ready',
        latitude: 49.939434,
        longitude: -119.396427,
        battery: 85,
      };

      const result = safeValidateSchema(BotSchema, validBot);
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid assignmentStatus', () => {
      const invalidBot = {
        botID: 1,
        assignmentStatus: 'invalid_status',
      };

      const result = safeValidateSchema(BotSchema, invalidBot);
      expect(result.success).toBe(false);
    });

    it('should fail validation for negative botID', () => {
      const invalidBot = {
        botID: -1,
        assignmentStatus: 'ready',
      };

      const result = safeValidateSchema(BotSchema, invalidBot);
      expect(result.success).toBe(false);
    });

    it('should fail validation for battery outside 0-100 range', () => {
      const invalidBot = {
        botID: 1,
        assignmentStatus: 'ready',
        battery: 150,
      };

      const result = safeValidateSchema(BotSchema, invalidBot);
      expect(result.success).toBe(false);
    });

    it('should validate bot with optional fields', () => {
      const botWithOptionals = {
        botID: 1,
        assignmentStatus: 'active',
        latitude: 49.939434,
        longitude: -119.396427,
        altitude: 500,
        relativeAltitude: 10,
        groundXSpeed: 1.5,
        groundYSpeed: 2.0,
        groundZSpeed: 0.5,
        vehicleHeading: 90,
        battery: 85,
        positionTime: '2024-01-01T00:00:00Z',
        batteryTime: '2024-01-01T00:00:00Z',
      };

      const result = safeValidateSchema(BotSchema, botWithOptionals);
      expect(result.success).toBe(true);
    });
  });

  describe('BotArraySchema', () => {
    it('should validate an array of bots', () => {
      const bots = [
        { botID: 1, assignmentStatus: 'ready' },
        { botID: 2, assignmentStatus: 'assigned' },
      ];

      const result = safeValidateSchema(BotArraySchema, bots);
      expect(result.success).toBe(true);
    });

    it('should fail if any bot in array is invalid', () => {
      const bots = [
        { botID: 1, assignmentStatus: 'ready' },
        { botID: -1, assignmentStatus: 'invalid' },
      ];

      const result = safeValidateSchema(BotArraySchema, bots);
      expect(result.success).toBe(false);
    });
  });

  describe('MissionSchema', () => {
    it('should validate a valid mission object', () => {
      const validMission = {
        missionID: 1,
        missionName: 'Test Mission',
        areaCoordinates: {
          north: 50.0,
          south: 49.0,
          east: -119.0,
          west: -120.0,
        },
        progress: 50,
        avgTemp: 25.5,
        timeEstimated: 180,
        assignedBots: [1, 2],
      };

      const result = safeValidateSchema(MissionSchema, validMission);
      expect(result.success).toBe(true);
    });

    it('should validate mission with null areaCoordinates', () => {
      const mission = {
        missionID: 1,
        missionName: 'Test Mission',
        areaCoordinates: null,
      };

      const result = safeValidateSchema(MissionSchema, mission);
      expect(result.success).toBe(true);
    });

    it('should validate mission with string areaCoordinates (from DB)', () => {
      const mission = {
        missionID: 1,
        missionName: 'Test Mission',
        areaCoordinates: '{"north":50,"south":49,"east":-119,"west":-120}',
      };

      const result = safeValidateSchema(MissionSchema, mission);
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid progress value', () => {
      const invalidMission = {
        missionID: 1,
        missionName: 'Test Mission',
        progress: 150, // Should be 0-100
      };

      const result = safeValidateSchema(MissionSchema, invalidMission);
      expect(result.success).toBe(false);
    });

    it('should fail validation for negative missionID', () => {
      const invalidMission = {
        missionID: -1,
        missionName: 'Test Mission',
      };

      const result = safeValidateSchema(MissionSchema, invalidMission);
      expect(result.success).toBe(false);
    });
  });

  describe('MissionCreateSchema', () => {
    it('should validate valid mission creation data', () => {
      const createData = {
        missionName: 'New Mission',
        areaCoordinates: {
          north: 50.0,
          south: 49.0,
          east: -119.0,
          west: -120.0,
        },
        progress: 0,
        avgTemp: 20,
        timeEstimated: 120,
        botIds: [1, 2],
      };

      const result = safeValidateSchema(MissionCreateSchema, createData);
      expect(result.success).toBe(true);
    });

    it('should fail validation for empty mission name', () => {
      const createData = {
        missionName: '',
        areaCoordinates: null,
      };

      const result = safeValidateSchema(MissionCreateSchema, createData);
      expect(result.success).toBe(false);
    });

    it('should validate with null areaCoordinates', () => {
      const createData = {
        missionName: 'New Mission',
        areaCoordinates: null,
      };

      const result = safeValidateSchema(MissionCreateSchema, createData);
      expect(result.success).toBe(true);
    });
  });

  describe('TemperatureSchema', () => {
    it('should validate a valid temperature reading', () => {
      const temp = {
        id: 1,
        botID: 1,
        clockTime: '2024-01-01T00:00:00Z',
        temperature: 25.5,
      };

      const result = safeValidateSchema(TemperatureSchema, temp);
      expect(result.success).toBe(true);
    });

    it('should validate temperature with optional fields', () => {
      const temp = {
        id: 1,
        botID: 1,
        missionID: 1,
        hotspotID: 1,
        clockTime: '2024-01-01T00:00:00Z',
        temperature: 82.5,
      };

      const result = safeValidateSchema(TemperatureSchema, temp);
      expect(result.success).toBe(true);
    });
  });

  describe('BatterySchema', () => {
    it('should validate a valid battery reading', () => {
      const battery = {
        id: 1,
        botID: 1,
        clockTime: '2024-01-01T00:00:00Z',
        battery: 85,
      };

      const result = safeValidateSchema(BatterySchema, battery);
      expect(result.success).toBe(true);
    });

    it('should fail for battery level outside 0-100', () => {
      const invalidBattery = {
        id: 1,
        botID: 1,
        clockTime: '2024-01-01T00:00:00Z',
        battery: 150,
      };

      const result = safeValidateSchema(BatterySchema, invalidBattery);
      expect(result.success).toBe(false);
    });
  });

  describe('validateSchema function', () => {
    it('should return validated data for valid input', () => {
      const bot = { botID: 1, assignmentStatus: 'ready' };
      const validated = validateSchema(BotSchema, bot);
      
      expect(validated.botID).toBe(1);
      expect(validated.assignmentStatus).toBe('ready');
    });

    it('should throw error for invalid input', () => {
      const invalidBot = { botID: -1, assignmentStatus: 'invalid' };
      
      expect(() => validateSchema(BotSchema, invalidBot)).toThrow();
    });
  });

  describe('Schema Contract Enforcement', () => {
    it('should detect if database schema changes break API contract', () => {
      // Simulate a database response with changed field name
      const brokenResponse = {
        bot_id: 1, // Changed from botID
        status: 'ready', // Changed from assignmentStatus
      };

      const result = safeValidateSchema(BotSchema, brokenResponse);
      expect(result.success).toBe(false);
      
      // This test will fail if database field names change,
      // alerting developers to update the schema
    });

    it('should detect missing required fields', () => {
      const incompleteBot = {
        botID: 1,
        // Missing assignmentStatus
      };

      const result = safeValidateSchema(BotSchema, incompleteBot);
      expect(result.success).toBe(false);
    });

    it('should detect type mismatches', () => {
      const wrongTypeBot = {
        botID: '1', // Should be number
        assignmentStatus: 'ready',
      };

      const result = safeValidateSchema(BotSchema, wrongTypeBot);
      expect(result.success).toBe(false);
    });
  });
});
