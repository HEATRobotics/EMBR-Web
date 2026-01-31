# Quick Reference: Integration Tests & Schema Validation

## For Developers

### Running Tests

```bash
# Unit tests (fast, no Docker)
npm test

# Schema tests only
npm test -- schemas.test.mjs

# Integration tests (requires Docker)
npm run test:integration

# Watch mode
npm run test:integration:watch
```

### When to Write Integration Tests

✅ **Write integration tests when:**
- Adding new API endpoints
- Modifying database schema
- Changing data transformations
- Adding complex business logic
- Refactoring database queries

❌ **Don't need integration tests for:**
- Simple utility functions (unit test is fine)
- UI components (use component tests)
- Pure client-side logic

### Quick Start: Adding a New Integration Test

```javascript
// server/src/__tests__/integration/your-feature.integration.test.mjs
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestDatabase } from './test-database.mjs';
import { createTestApp } from './test-app.mjs';
import { YourSchema, safeValidateSchema } from '../../schemas/api.schemas.mjs';

describe('Integration - Your Feature', () => {
  let testDb, app;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    app = createTestApp(testDb.getConfig());
  }, 180000);

  afterAll(async () => {
    if (testDb) await testDb.stop();
  });

  it('should test your endpoint', async () => {
    const response = await request(app)
      .get('/api/your-endpoint')
      .expect(200);

    const validation = safeValidateSchema(YourSchema, response.body);
    expect(validation.success).toBe(true);
  });
});
```

### Quick Start: Adding a New Schema

```javascript
// server/src/schemas/api.schemas.mjs
import { z } from 'zod';

export const YourSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  status: z.enum(['active', 'inactive']),
  value: z.number().optional(),
});

export const YourArraySchema = z.array(YourSchema);
```

### Schema Test Template

```javascript
// server/src/__tests__/schemas.test.mjs
describe('YourSchema', () => {
  it('should validate valid data', () => {
    const valid = { id: 1, name: 'Test', status: 'active' };
    const result = safeValidateSchema(YourSchema, valid);
    expect(result.success).toBe(true);
  });

  it('should fail for invalid data', () => {
    const invalid = { id: -1, name: '', status: 'invalid' };
    const result = safeValidateSchema(YourSchema, invalid);
    expect(result.success).toBe(false);
  });
});
```

## Common Issues

### Issue: "Docker not running"
**Solution:** Start Docker Desktop or Docker daemon

### Issue: "Container startup timeout"
**Solution:** Increase timeout in test:
```javascript
beforeAll(async () => {
  // ... 
}, 180000); // 3 minutes
```

### Issue: "Tests fail intermittently"
**Solution:** Ensure cleanup is working:
```javascript
afterEach(async () => {
  await testDb.cleanup();
  await testDb.seedDatabase();
});
```

### Issue: "Schema validation fails unexpectedly"
**Solution:** Check response data:
```javascript
const validation = safeValidateSchema(Schema, data);
if (!validation.success) {
  console.error('Validation error:', validation.error);
  console.error('Actual data:', JSON.stringify(data, null, 2));
}
```

## Best Practices

### ✅ DO
- Write integration tests for critical flows
- Validate all API responses with schemas
- Use descriptive test names
- Clean up resources in afterAll
- Test both success and error cases

### ❌ DON'T
- Mock the database in integration tests
- Skip schema validation
- Leave containers running
- Test implementation details
- Copy-paste without understanding

## CI Behavior

### On PR:
1. Unit tests run first (fast feedback)
2. Integration tests run if unit tests pass
3. All tests must pass to merge

### On Failure:
- Check CI logs for error details
- Run tests locally to reproduce
- Fix issue and push again

## Performance Tips

1. **First run is slow** (~1 minute for container download)
2. **Subsequent runs are fast** (~30-40 seconds)
3. **Run unit tests first** to catch simple bugs
4. **Use watch mode** during development

## Help & Resources

- 📖 Full Guide: `TESTING.md`
- 📋 Summary: `INTEGRATION_TESTS_SUMMARY.md`
- 💻 Examples: `server/src/__tests__/integration/`
- 🔍 Schemas: `server/src/schemas/api.schemas.mjs`

## Questions?

Ask in the team channel or check existing integration tests for examples.
