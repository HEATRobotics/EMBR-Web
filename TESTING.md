# EMBR-Web Testing Guide

## Overview

This project uses a comprehensive testing infrastructure with:
- **Vitest** for unit and integration tests (server & client)
- **Testcontainers** for disposable test databases
- **Zod** for schema validation and contract enforcement
- **Playwright** for end-to-end (E2E) testing
- **GitHub Actions** for continuous integration

## Test Coverage Goals

We aim for **~80% coverage** with special focus on:
- Data flow from database → server → client
- Critical business logic (bot/mission management)
- Data transformation functions
- API endpoints and controllers
- Schema contract validation

### Current Coverage

**Server:**
- 62.69% statement coverage
- 61.82% line coverage
- 107 passing unit tests
- 24 schema validation tests
- Full integration test suite

**Client:**
- 93.33% statement coverage for API & utils
- 88.88% function coverage for API & utils
- 55 passing tests

## Running Tests

### Server Tests

```bash
cd server
npm test                      # Run unit tests only
npm run test:watch            # Run unit tests in watch mode
npm run test:ui               # Open Vitest UI
npm run test:coverage         # Generate coverage report
npm run test:integration      # Run integration tests with disposable DB
npm run test:integration:watch # Run integration tests in watch mode
```

### Client Tests

```bash
cd client
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Generate coverage report
```

### End-to-End Tests

```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with UI
npm run test:e2e:headed   # Run E2E tests in headed mode
```

## Test Structure

### Server Tests (`server/src/__tests__/`)

```
server/src/__tests__/
├── Unit Tests
│   ├── database.service.test.mjs      # Database operations (27 tests)
│   ├── bot.controller.test.mjs        # Bot endpoints (9 tests)
│   ├── mission.controller.test.mjs    # Mission endpoints (18 tests)
│   ├── temperature.controller.test.mjs # Temperature endpoints (9 tests)
│   ├── bot.routes.test.mjs            # Bot routing (3 tests)
│   ├── mission.routes.test.mjs        # Mission routing (8 tests)
│   ├── temperature.routes.test.mjs    # Temperature routing (3 tests)
│   ├── dateTime.utils.test.mjs        # Date/time utilities (6 tests)
│   └── schemas.test.mjs               # Schema validation (24 tests)
├── Integration Tests
│   ├── missions.integration.test.mjs  # Full stack mission tests
│   ├── test-database.mjs              # Disposable test DB setup
│   └── test-app.mjs                   # Express app test helper
```

**Key Test Areas:**
- Database CRUD operations with transaction handling
- Error handling and edge cases
- Controller request/response validation
- Route endpoint mapping
- **Schema contract enforcement**
- **Full stack integration tests with real database**

### Client Tests (`client/src/`)

```
client/src/
├── api/__tests__/
│   ├── bots.api.test.ts           # Bot API client (10 tests)
│   ├── missions.api.test.ts       # Mission API client (14 tests)
│   └── temperature.api.test.ts    # Temperature API client (7 tests)
├── utils/__tests__/
│   ├── calculateArea.test.ts      # Area calculations (11 tests)
│   └── convertMinutes.test.ts     # Time conversions (7 tests)
└── __tests__/
    └── integration.test.ts        # Data flow validation (6 tests)
```

**Key Test Areas:**
- API client functions
- Data transformation (DB → Client types)
- Utility functions
- Data flow consistency

### E2E Tests (`e2e/`)

```
e2e/
└── basic.spec.ts                  # Basic application tests
```

## Critical Data Flow Tests

### Bot Data Flow: Database → Server → Client

The test suite includes specific tests to ensure database structure changes are caught:

1. **Database Service** (`database.service.test.mjs`):
   - Tests CRUD operations
   - Validates data structure from queries

2. **API Client** (`bots.api.test.ts`):
   - Tests `mapBotDtoToRobot` transformation
   - Validates field mapping

3. **Integration Tests** (`integration.test.ts`):
   - End-to-end data flow validation
   - Schema change detection
   - Breaking change prevention

**Example:** If `latitude` is renamed to `lat` in the database, tests will fail at:
- Database service layer (missing field)
- API transformation layer (type mismatch)
- Integration tests (field mapping assertion)

### Mission Data Flow: Database → Server → Client

Similar coverage for mission data with tests for:
- Area coordinate transformations
- Time calculations
- Bot assignments
- Round-trip data consistency

## Integration Tests

### Overview

Integration tests run against a **disposable MySQL database** seeded from `init.sql`. They test the full stack (database → service → controller → API response) to catch schema mismatches and ensure end-to-end consistency.

### Key Features

1. **Disposable Test Database**: Uses testcontainers to spin up a real MySQL 8.3 instance
2. **Seeded from DDL**: Automatically loads `server/docker/ddl/init.sql`
3. **Isolated Tests**: Each test gets a clean database state
4. **Schema Validation**: All responses validated against Zod schemas
5. **Full Stack Coverage**: Tests entire request/response cycle

### Running Integration Tests

```bash
cd server
npm run test:integration        # Run all integration tests
npm run test:integration:watch  # Watch mode for development
```

**Note**: Integration tests require Docker to be running. The first run will download the MySQL image (~200MB).

### Test Structure

Integration tests are located in `server/src/__tests__/integration/`:

```javascript
describe('Integration Tests - Mission Flow', () => {
  let testDb;
  let app;

  beforeAll(async () => {
    testDb = await createTestDatabase();  // Start MySQL container
    app = createTestApp(testDb.getConfig());
  }, 180000);

  afterEach(async () => {
    await testDb.cleanup();  // Truncate tables
    await testDb.seedDatabase();  // Re-seed with init.sql
  });

  afterAll(async () => {
    await testDb.stop();  // Stop container
  });

  it('should fetch all missions with correct schema', async () => {
    const response = await request(app)
      .get('/api/missions')
      .expect(200);

    // Schema validation
    const validation = safeValidateSchema(MissionArraySchema, response.body);
    expect(validation.success).toBe(true);
  });
});
```

### What Integration Tests Catch

1. **Schema Mismatches**: If database fields change, schema validation fails
2. **Missing Fields**: Ensures all expected fields are present
3. **Type Errors**: Catches type mismatches (string vs number, etc.)
4. **SQL Errors**: Real database catches JOIN errors, constraint violations
5. **Data Transformation Bugs**: Tests entire transformation pipeline

**Example:** If someone renames `missionName` to `mission_name` in the database:
- SQL query still works (database accepts snake_case)
- Integration test fails: schema expects `missionName`
- Developer is alerted before PR merge

## Schema Validation

### Zod Schemas

All API responses are validated using Zod schemas located in `server/src/schemas/api.schemas.mjs`:

```javascript
// Example: Bot schema
export const BotSchema = z.object({
  botID: z.number().int().positive(),
  assignmentStatus: z.enum(['ready', 'assigned', 'inactive', 'active']),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  battery: z.number().int().min(0).max(100).optional().nullable(),
  // ... other fields
});
```

### Schema Tests

24 dedicated tests validate schema definitions:

```bash
cd server
npm test -- schemas.test.mjs  # Run schema tests only
```

Tests cover:
- Valid data passes validation
- Invalid types are rejected
- Enum values are enforced
- Number ranges are validated
- Required vs optional fields

### Using Schemas in Code

```javascript
import { BotArraySchema, safeValidateSchema } from './schemas/api.schemas.mjs';

// Validate API response
const validation = safeValidateSchema(BotArraySchema, responseData);
if (!validation.success) {
  console.error('Schema mismatch:', validation.error);
  // Handle error
}
```

### Validation Middleware (Optional)

Validation middleware can be added to routes to enforce schemas:

```javascript
import { validateResponse } from './middleware/validation.middleware.mjs';
import { MissionArraySchema } from './schemas/api.schemas.mjs';

router.get('/', validateResponse(MissionArraySchema), getAllMissions);
```

This is currently disabled in production but can be enabled with `VALIDATE_SCHEMAS=true`.

## Continuous Integration

GitHub Actions workflow (`.github/workflows/ci-tests.yml`) runs on all PRs:

1. **Server Unit Tests** - All unit tests (107 tests)
2. **Integration Tests** - Full stack tests with disposable DB
3. **Client Tests** - Unit tests for client code
4. **E2E Tests** - Integration tests with Playwright
5. **Coverage Report** - Aggregated coverage summary

**PR Requirements:**
- All tests must pass
- No regressions in test coverage
- Integration tests must pass with real database
- Schema validation must pass

## Writing New Tests

### Server Unit Test Example

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Your Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    const input = { /* test data */ };
    
    // Act
    const result = await yourFunction(input);
    
    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

### Client Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('Your API Client', () => {
  it('should fetch data correctly', async () => {
    // Mock API response
    vi.mocked(axios.get).mockResolvedValue({ data: mockData });
    
    // Call function
    const result = await fetchData();
    
    // Verify
    expect(result).toEqual(expectedData);
  });
});
```

### Integration Test Example

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestDatabase } from './integration/test-database.mjs';
import { createTestApp } from './integration/test-app.mjs';
import { MissionSchema, safeValidateSchema } from '../schemas/api.schemas.mjs';

describe('Integration Tests - Your Feature', () => {
  let testDb;
  let app;

  beforeAll(async () => {
    // Start disposable MySQL container
    testDb = await createTestDatabase();
    app = createTestApp(testDb.getConfig());
  }, 180000);

  afterAll(async () => {
    // Stop container and cleanup
    if (testDb) await testDb.stop();
  });

  it('should test full stack flow', async () => {
    // Make real HTTP request to API
    const response = await request(app)
      .get('/api/missions')
      .expect(200);

    // Validate response schema
    const validation = safeValidateSchema(MissionSchema, response.body[0]);
    expect(validation.success).toBe(true);

    // Verify data
    expect(response.body[0]).toHaveProperty('missionID');
    expect(response.body[0]).toHaveProperty('missionName');
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

## Mocking Guidelines

### Server Mocks

- Use `vi.mock()` for database connections
- Mock external services (MAVLink, Serial)
- Provide realistic test data

### Client Mocks

- Mock `axios` for API calls
- Use `@testing-library/react` for component tests
- Mock environment variables when needed

## Best Practices

1. **Test Structure**: Follow Arrange-Act-Assert pattern
2. **Test Names**: Use descriptive names: "should [do something] when [condition]"
3. **Test Independence**: Each test should be independent
4. **Mock Cleanup**: Always clear mocks in `beforeEach`
5. **Data Flow**: Add integration tests for new data models
6. **Error Cases**: Test both success and error paths
7. **Edge Cases**: Test boundary conditions and null values

## Troubleshooting

### Tests Failing Locally

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear vitest cache
npx vitest --clearCache
```

### Coverage Not Generated

```bash
# Ensure coverage tools are installed
npm install --save-dev @vitest/coverage-v8
```

### E2E Tests Timing Out

```bash
# Install Playwright browsers
npx playwright install --with-deps chromium
```

## Future Enhancements

- [ ] Add React component tests
- [ ] Add React hook tests
- [ ] Expand E2E test scenarios
- [ ] Add performance tests
- [ ] Add visual regression tests
- [ ] Increase server coverage to 80%
- [ ] Add socket.io real-time tests

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass locally
3. Maintain or improve coverage
4. Add E2E tests for user-facing features
5. Update this README if adding new test patterns
