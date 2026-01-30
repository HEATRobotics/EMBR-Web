# E2E Testing Examples for EMBR-Web

This directory contains example Playwright tests for reference **only**. These tests are **not currently implemented** in the project.

## Why This Folder Exists

This folder serves as:
1. **Reference documentation** for future E2E test implementation
2. **Examples** of what E2E tests would look like for EMBR-Web
3. **Quick-start guide** when the team decides to add E2E testing

## Current Status

❌ **E2E Testing Not Active**
- No Playwright installed
- No E2E tests running in CI/CD
- Manual testing checklist used instead

## When to Implement E2E Tests

Consider implementing Playwright E2E tests when:
- [ ] App is deployed to production with real users
- [ ] Integration bugs start appearing in production
- [ ] Team grows beyond 3-4 developers
- [ ] Critical business flows need guaranteed reliability
- [ ] Manual testing becomes too time-consuming

## How to Implement (Future)

### Step 1: Install Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

### Step 2: Create Configuration
Create `playwright.config.ts` in the client root:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 3: Move Examples to /e2e
```bash
mv e2e-examples/* e2e/
rmdir e2e-examples
```

### Step 4: Add Test Scripts
Update `package.json`:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### Step 5: Update CI/CD
Add E2E workflow to `.github/workflows/e2e.yml`

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Next.js E2E Testing Guide](https://nextjs.org/docs/app/building-your-application/testing/playwright)
- [TESTING.md](../TESTING.md) - Full testing strategy document
- [example.spec.ts](./example.spec.ts) - Example test file

## Estimated Effort

- **Initial Setup**: 1 hour
- **First 5 Critical Tests**: 4-8 hours
- **CI/CD Integration**: 1 hour
- **Total**: ~10-15 hours

## Questions?

See the main [TESTING.md](../TESTING.md) document for:
- Why Playwright over Cypress/Puppeteer
- Cost-benefit analysis
- When to implement E2E tests
- Complete comparison of testing frameworks
