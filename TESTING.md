# EMBR-Web Testing Guide

## Overview

This project uses a comprehensive testing infrastructure with:
- **Vitest** for unit and integration tests (server & client)
- **Playwright** for end-to-end (E2E) testing
- **GitHub Actions** for continuous integration

## Test Coverage Goals

We aim for **~80% coverage** with special focus on:
- Data flow from database → server → client
- Critical business logic (bot/mission management)
- Data transformation functions
- API endpoints and controllers

### Current Coverage

**Server:**
- 62.69% statement coverage
- 61.82% line coverage
- 75 passing tests

**Client:**
- 93.33% statement coverage for API & utils
- 88.88% function coverage for API & utils
- 55 passing tests

## Running Tests

### Server Tests

```bash
cd server
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Generate coverage report
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
├── database.service.test.mjs      # Database operations (27 tests)
├── bot.controller.test.mjs        # Bot endpoints (9 tests)
├── mission.controller.test.mjs    # Mission endpoints (18 tests)
├── temperature.controller.test.mjs # Temperature endpoints (9 tests)
├── bot.routes.test.mjs            # Bot routing (3 tests)
├── mission.routes.test.mjs        # Mission routing (8 tests)
├── temperature.routes.test.mjs    # Temperature routing (3 tests)
└── dateTime.utils.test.mjs        # Date/time utilities (6 tests)
```

**Key Test Areas:**
- Database CRUD operations with transaction handling
- Error handling and edge cases
- Controller request/response validation
- Route endpoint mapping

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

## Continuous Integration

GitHub Actions workflow (`.github/workflows/ci-tests.yml`) runs on all PRs:

1. **Server Tests** - Unit tests for all server code
2. **Client Tests** - Unit tests for all client code
3. **E2E Tests** - Integration tests with Playwright
4. **Coverage Report** - Aggregated coverage summary

**PR Requirements:**
- All tests must pass
- No regressions in test coverage
- E2E tests must complete successfully

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
