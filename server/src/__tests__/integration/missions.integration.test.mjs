import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { createTestDatabase } from './test-database.mjs';
import { createTestApp } from './test-app.mjs';
import { 
  MissionArraySchema, 
  MissionSchema, 
  MissionIdResponseSchema,
  BotArraySchema,
  safeValidateSchema 
} from '../../schemas/api.schemas.mjs';

describe('Integration Tests - Mission Flow', () => {
  let testDb;
  let app;
  let dbConfig;

  // Setup: Start test database before all tests
  beforeAll(async () => {
    testDb = await createTestDatabase();
    dbConfig = testDb.getConfig();
    app = createTestApp(dbConfig);
  }, 180000); // 3 minute timeout for container startup

  // Cleanup: Clean database after each test
  afterEach(async () => {
    await testDb.cleanup();
    await testDb.seedDatabase(); // Re-seed with initial data
  });

  // Teardown: Stop test database after all tests
  afterAll(async () => {
    if (testDb) {
      await testDb.stop();
    }
  });

  describe('GET /api/missions - Fetch Missions', () => {
    it('should fetch all missions with correct schema', async () => {
      const response = await request(app)
        .get('/api/missions')
        .expect(200);

      // Validate response schema
      const validation = safeValidateSchema(MissionArraySchema, response.body);
      expect(validation.success).toBe(true);

      // Verify data structure
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const mission = response.body[0];
      expect(mission).toHaveProperty('missionID');
      expect(mission).toHaveProperty('missionName');
      expect(mission).toHaveProperty('areaCoordinates');
      expect(mission).toHaveProperty('assignedBots');
    });

    it('should return mission with area coordinates from database', async () => {
      const response = await request(app)
        .get('/api/missions')
        .expect(200);

      const mission = response.body[0];
      
      // Validate areaCoordinates structure matches database JSON
      if (mission.areaCoordinates) {
        expect(mission.areaCoordinates).toHaveProperty('north');
        expect(mission.areaCoordinates).toHaveProperty('south');
        expect(mission.areaCoordinates).toHaveProperty('east');
        expect(mission.areaCoordinates).toHaveProperty('west');
      }
    });

    it('should catch schema mismatch if database structure changes', async () => {
      const response = await request(app)
        .get('/api/missions')
        .expect(200);

      // This test ensures that if database fields are renamed/removed,
      // the schema validation will catch it
      const validation = safeValidateSchema(MissionArraySchema, response.body);
      
      if (!validation.success) {
        console.error('Schema validation failed:', validation.error);
        expect.fail('Database structure does not match expected schema');
      }

      expect(validation.success).toBe(true);
    });
  });

  describe('GET /api/missions/:id - Fetch Single Mission', () => {
    it('should fetch a single mission with correct schema', async () => {
      // First, get all missions to find a valid ID
      const allMissions = await request(app).get('/api/missions');
      const missionId = allMissions.body[0].missionID;

      const response = await request(app)
        .get(`/api/missions/${missionId}`)
        .expect(200);

      // Validate response schema
      const validation = safeValidateSchema(MissionSchema, response.body);
      expect(validation.success).toBe(true);

      expect(response.body.missionID).toBe(missionId);
    });

    it('should return 404 for non-existent mission', async () => {
      await request(app)
        .get('/api/missions/99999')
        .expect(404);
    });
  });

  describe('POST /api/missions - Create Mission', () => {
    it('should create a new mission and return correct schema', async () => {
      const newMission = {
        missionName: 'Integration Test Mission',
        areaCoordinates: {
          north: 50.0,
          south: 49.0,
          east: -119.0,
          west: -120.0,
        },
        progress: 0,
        avgTemp: 20.0,
        timeEstimated: 180,
      };

      const response = await request(app)
        .post('/api/missions')
        .send(newMission)
        .expect(201);

      // Validate response schema
      const validation = safeValidateSchema(MissionIdResponseSchema, response.body);
      expect(validation.success).toBe(true);

      expect(response.body).toHaveProperty('missionID');
      expect(response.body.missionID).toBeGreaterThan(0);

      // Verify the mission was created in the database
      const fetchResponse = await request(app)
        .get(`/api/missions/${response.body.missionID}`)
        .expect(200);

      expect(fetchResponse.body.missionName).toBe('Integration Test Mission');
      expect(fetchResponse.body.areaCoordinates.north).toBe(50.0);
    });

    it('should create mission with bot assignments', async () => {
      const newMission = {
        missionName: 'Mission with Bots',
        areaCoordinates: {
          north: 50.0,
          south: 49.0,
          east: -119.0,
          west: -120.0,
        },
        botIds: [1, 2], // Bots from init.sql
      };

      const response = await request(app)
        .post('/api/missions')
        .send(newMission)
        .expect(201);

      expect(response.body.missionID).toBeGreaterThan(0);

      // Verify bots are assigned
      const fetchResponse = await request(app)
        .get(`/api/missions/${response.body.missionID}`)
        .expect(200);

      expect(fetchResponse.body.assignedBots).toEqual(expect.arrayContaining([1, 2]));
    });

    it('should handle invalid mission data', async () => {
      const invalidMission = {
        // Missing required missionName
        areaCoordinates: null,
      };

      const response = await request(app)
        .post('/api/missions')
        .send(invalidMission)
        .expect(500); // Or appropriate error code

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/missions/:id - Update Mission', () => {
    it('should update an existing mission', async () => {
      // First create a mission
      const newMission = {
        missionName: 'Mission to Update',
        areaCoordinates: {
          north: 50.0,
          south: 49.0,
          east: -119.0,
          west: -120.0,
        },
        progress: 0,
      };

      const createResponse = await request(app)
        .post('/api/missions')
        .send(newMission)
        .expect(201);

      const missionId = createResponse.body.missionID;

      // Update the mission
      const updates = {
        missionName: 'Updated Mission Name',
        progress: 50,
      };

      await request(app)
        .put(`/api/missions/${missionId}`)
        .send(updates)
        .expect(200);

      // Verify updates
      const fetchResponse = await request(app)
        .get(`/api/missions/${missionId}`)
        .expect(200);

      expect(fetchResponse.body.missionName).toBe('Updated Mission Name');
      expect(fetchResponse.body.progress).toBe(50);
    });
  });

  describe('DELETE /api/missions/:id - Delete Mission', () => {
    it('should delete a mission', async () => {
      // First create a mission
      const newMission = {
        missionName: 'Mission to Delete',
        areaCoordinates: null,
      };

      const createResponse = await request(app)
        .post('/api/missions')
        .send(newMission)
        .expect(201);

      const missionId = createResponse.body.missionID;

      // Delete the mission
      await request(app)
        .delete(`/api/missions/${missionId}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/missions/${missionId}`)
        .expect(404);
    });
  });

  describe('Database Schema Consistency', () => {
    it('should ensure bot data structure matches between database and API', async () => {
      const response = await request(app)
        .get('/api/bots')
        .expect(200);

      // Validate bot schema
      const validation = safeValidateSchema(BotArraySchema, response.body);
      
      if (!validation.success) {
        console.error('Bot schema validation failed:', validation.error);
        console.error('Actual data:', JSON.stringify(response.body, null, 2));
        expect.fail('Bot database structure does not match expected schema');
      }

      expect(validation.success).toBe(true);
    });

    it('should detect if database field is renamed or missing', async () => {
      const response = await request(app)
        .get('/api/missions')
        .expect(200);

      const mission = response.body[0];

      // These assertions will fail if database fields are changed
      expect(mission).toHaveProperty('missionID');
      expect(mission).toHaveProperty('missionName');
      expect(mission).toHaveProperty('areaCoordinates');
      expect(typeof mission.missionID).toBe('number');
      expect(typeof mission.missionName).toBe('string');
    });
  });
});
