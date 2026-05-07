import { z } from 'zod';

/**
 * Schema definitions for API responses
 * These schemas provide runtime validation and type safety
 */

// Bot/Robot Schema
export const BotSchema = z.object({
  botID: z.number().int().positive(),
  assignmentStatus: z.enum(['ready', 'assigned', 'inactive', 'active']),
  positionTime: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  altitude: z.number().optional().nullable(),
  relativeAltitude: z.number().optional().nullable(),
  groundXSpeed: z.number().optional().nullable(),
  groundYSpeed: z.number().optional().nullable(),
  groundZSpeed: z.number().optional().nullable(),
  vehicleHeading: z.number().optional().nullable(),
  battery: z.number().int().min(0).max(100).optional().nullable(),
  batteryTime: z.string().optional().nullable(),
});

export const BotArraySchema = z.array(BotSchema);

// Mission Schema
export const MissionSchema = z.object({
  missionID: z.number().int().positive(),
  missionName: z.string(),
  areaCoordinates: z.union([
    z.object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
    }),
    z.string(),
    z.null(),
  ]).optional(),
  progress: z.number().min(0).max(100).optional().nullable(),
  avgTemp: z.number().optional().nullable(),
  timeEstimated: z.number().int().optional().nullable(),
  timePassed: z.number().int().optional().nullable(),
  timeStart: z.string().optional().nullable(),
  timeEnd: z.string().optional().nullable(),
  timeCreated: z.string().optional(),
  lastUpdated: z.string().optional(),
  assignedBots: z.array(z.number().int()).optional(),
});

export const MissionArraySchema = z.array(MissionSchema);

// Mission Create/Update Schema
export const MissionCreateSchema = z.object({
  missionName: z.string().min(1),
  areaCoordinates: z.union([
    z.object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
    }),
    z.null(),
  ]),
  progress: z.number().min(0).max(100).optional(),
  avgTemp: z.number().optional(),
  timeEstimated: z.number().int().optional(),
  timeStart: z.string().optional().nullable(),
  timeEnd: z.string().optional().nullable(),
  botIds: z.array(z.number().int()).optional(),
});

export const MissionUpdateSchema = MissionCreateSchema.partial();

// Temperature Schema
export const TemperatureSchema = z.object({
  id: z.number().int().positive(),
  botID: z.number().int().positive(),
  missionID: z.number().int().positive().optional().nullable(),
  hotspotID: z.number().int().positive().optional().nullable(),
  clockTime: z.string(),
  temperature: z.number(),
});

export const TemperatureArraySchema = z.array(TemperatureSchema);

// Battery Schema
export const BatterySchema = z.object({
  id: z.number().int().positive(),
  botID: z.number().int().positive(),
  missionID: z.number().int().positive().optional().nullable(),
  clockTime: z.string(),
  battery: z.number().int().min(0).max(100),
});

export const BatteryArraySchema = z.array(BatterySchema);

// Position Schema
export const PositionSchema = z.object({
  id: z.number().int().positive(),
  botID: z.number().int().positive(),
  missionID: z.number().int().positive().optional().nullable(),
  clockTime: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number().optional().nullable(),
  relativeAltitude: z.number().optional().nullable(),
  groundXSpeed: z.number().optional().nullable(),
  groundYSpeed: z.number().optional().nullable(),
  groundZSpeed: z.number().optional().nullable(),
  vehicleHeading: z.number().optional().nullable(),
});

export const PositionArraySchema = z.array(PositionSchema);

// API Response Schemas
export const ApiSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
});

export const ApiErrorResponseSchema = z.object({
  error: z.string(),
});

export const MissionIdResponseSchema = z.object({
  missionID: z.number().int().positive(),
});

export const MessageResponseSchema = z.object({
  message: z.string(),
});

/**
 * Validate data against a schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws error
 */
export function validateSchema(schema, data) {
  return schema.parse(data);
}

/**
 * Validate data against a schema and return result
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success boolean and data/error
 */
export function safeValidateSchema(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
