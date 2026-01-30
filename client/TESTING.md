# Testing Framework Comparison: Jest vs Vitest

## Why Jest is Used in EMBR-Web

This document explains the choice of Jest over Vitest for the EMBR-Web project.

## Current Setup

- **Framework**: Next.js 14.2.24 (App Router)
- **Testing**: Jest 29.7.0 with `next/jest` integration
- **Test Count**: 143 tests (unit + integration)
- **Coverage**: 27.96%

## Comparison

### Jest ✅ (Current Choice)

**Advantages:**
1. **Native Next.js Integration**
   - `next/jest` provides automatic configuration for Next.js features
   - Handles App Router, Server Components, and module aliases automatically
   - Zero configuration needed for Next.js-specific features

2. **Mature Ecosystem**
   - Extensive documentation and community support
   - Most Stack Overflow answers and tutorials use Jest
   - Battle-tested in production environments

3. **Better for Next.js Projects**
   - Official Next.js testing documentation uses Jest
   - Vercel team optimizes for Jest compatibility
   - Handles Next.js quirks (dynamic imports, image optimization, etc.)

4. **Complex Mocking**
   - Superior support for complex mocking scenarios
   - Easier to mock Next.js-specific modules
   - Better module hoisting control

**Disadvantages:**
- Slower test execution (uses Node.js transformation)
- Slower watch mode
- Requires transpilation for ESM modules
- Larger dependency footprint

### Vitest ⚡

**Advantages:**
1. **Performance**
   - 5-10x faster test execution (uses Vite's esbuild transformation)
   - Near-instant watch mode (HMR-like experience)
   - Faster CI/CD pipeline execution

2. **Modern Tooling**
   - Native ESM support (no transpilation needed)
   - Built-in TypeScript support
   - Smaller bundle size and faster startup

3. **Jest-Compatible API**
   - Drop-in replacement for most Jest APIs
   - Easy migration path
   - Similar syntax and features

**Disadvantages:**
- **Requires manual Next.js configuration**
  - Must manually configure path aliases
  - Must manually handle Next.js features
  - No official Next.js support yet
- Less mature ecosystem for Next.js projects
- Some Next.js features may not work out-of-the-box
- Community support still growing

## Performance Benchmarks

### Current Project (143 tests)
- **Jest**: ~2.5 seconds (acceptable for this size)
- **Vitest**: ~0.5 seconds (estimated, but requires setup effort)

### At Scale (1000+ tests)
- **Jest**: 15-30 seconds (becomes noticeable)
- **Vitest**: 3-5 seconds (significant improvement)

## Decision for EMBR-Web

### ✅ Recommendation: Keep Jest

**Reasons:**
1. **Next.js First-Class Support**: The `next/jest` package provides zero-config setup for all Next.js features
2. **Current Scale**: 143 tests run in ~2.5 seconds - performance is not a bottleneck
3. **Stability**: Jest is the officially recommended testing framework for Next.js
4. **Migration Cost**: Time spent migrating could be better spent writing more tests
5. **Team Familiarity**: Most React/Next.js developers are familiar with Jest

### When to Reconsider Vitest

Consider migrating to Vitest if:
- Test suite grows beyond 1,000 tests and speed becomes a real pain point
- Project migrates away from Next.js to pure React/Vite
- Team has bandwidth for the migration effort (estimated 2-4 hours)
- Next.js adds official Vitest support

## Migration Effort (If Needed in Future)

If migrating to Vitest becomes necessary:

1. **Install Dependencies** (~5 min)
   ```bash
   npm install -D vitest @vitest/ui @vitejs/plugin-react
   npm uninstall jest @types/jest ts-jest jest-environment-jsdom
   ```

2. **Create vitest.config.ts** (~15 min)
   - Configure path aliases manually
   - Set up React plugin
   - Configure test environment

3. **Update Test Files** (~30 min)
   - Change imports from `@testing-library/jest-dom` to `@testing-library/dom`
   - Update any Jest-specific APIs

4. **Fix Next.js-Specific Issues** (~1-2 hours)
   - Mock Next.js modules manually
   - Handle dynamic imports
   - Configure module resolution

5. **Update CI/CD** (~15 min)
   - Update GitHub Actions workflow
   - Adjust test commands in package.json

**Total Estimated Effort**: 2-4 hours

## Conclusion

For the EMBR-Web project, **Jest is the right choice** because:
- It's optimized for Next.js projects
- Current performance is acceptable
- It provides the best developer experience for this tech stack
- Migration effort outweighs the benefits at current scale

The team should focus on **writing more tests** rather than optimizing the test runner at this stage.

---

## End-to-End (E2E) Testing: Why Not Playwright?

### Current Testing Pyramid

```
           /\
          /E2E\          ← Missing (0 tests)
         /------\
        /Integration\    ← Present (35 tests)
       /------------\
      /  Unit Tests  \   ← Strong (108 tests)
     /----------------\
```

### E2E Testing Options Comparison

#### Playwright ⚡ (Recommended)

**Advantages:**
1. **Multi-Browser Support**
   - Chromium, Firefox, WebKit (Safari) - all in one tool
   - Mobile device emulation
   - Real browser contexts

2. **Modern Architecture**
   - Auto-wait mechanisms (no flaky tests)
   - Network interception built-in
   - Parallelization out of the box
   - Video/screenshot on failure

3. **Developer Experience**
   - Excellent TypeScript support
   - Codegen tool (record tests by clicking)
   - VS Code extension with debugging
   - Trace viewer for debugging failures

4. **Performance**
   - Faster than Selenium/Cypress
   - Efficient parallel execution
   - Headless by default

**Disadvantages:**
- Requires separate test infrastructure
- Longer test execution time than unit tests (30s-5min per test)
- More complex CI/CD setup
- Higher maintenance burden

#### Cypress 🌲

**Advantages:**
- Time-travel debugging
- Real-time reloading
- Screenshot/video recording
- Large community and ecosystem

**Disadvantages:**
- Chrome-only (paid for other browsers)
- Runs inside browser (limitations on certain operations)
- Slower than Playwright
- Different async model (learning curve)

#### Puppeteer 🎭

**Advantages:**
- Lightweight and fast
- Direct Chrome DevTools Protocol access
- Good for scraping/automation

**Disadvantages:**
- Chrome/Chromium only
- More low-level (requires more code)
- No built-in assertion library
- Less focused on testing

### Recommendation for EMBR-Web

#### ✅ Add Playwright for E2E Testing

**Why Playwright:**
1. **Perfect for Full-Stack Apps**: EMBR-Web has complex user flows (bot management, mission creation, real-time updates)
2. **Multi-Browser Testing**: Ensures compatibility across all browsers
3. **Modern Next.js Support**: First-class support for Next.js App Router
4. **Cost-Effective**: Free and open-source, unlike Cypress paid tiers

**High-Value E2E Test Scenarios for EMBR-Web:**
1. **Mission Creation Flow**
   - User creates mission → Assigns bots → Starts mission → Verifies on map
   - Validates: Frontend + API + Database + WebSocket updates

2. **Bot Management**
   - User views bot list → Clicks bot → Views details → Checks telemetry
   - Validates: Real-time data updates, navigation, data visualization

3. **Dashboard Overview**
   - User opens dashboard → Sees bots on map → Checks status cards
   - Validates: Map rendering, Google Maps API, status calculations

4. **Real-time Updates**
   - Bot position changes → Map updates → Status card updates
   - Validates: WebSocket connections, real-time data flow

### Implementation Plan (If Adding Playwright)

#### Phase 1: Setup (~1 hour)
```bash
npm install -D @playwright/test
npx playwright install
```

Create `playwright.config.ts`:
```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
  },
});
```

#### Phase 2: Write Critical Tests (~4-8 hours)
1. Start with smoke test (homepage loads)
2. Add mission creation flow (highest value)
3. Add bot management flow
4. Add real-time update validation

#### Phase 3: CI/CD Integration (~1 hour)
Update `.github/workflows/e2e.yml`:
```yaml
name: E2E Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Cost-Benefit Analysis

#### Benefits of Adding E2E Tests:
- ✅ Catch integration bugs before production
- ✅ Validate user flows work end-to-end
- ✅ Test real browser behavior (not mocked)
- ✅ Confidence in releases
- ✅ Documentation of user flows (tests as documentation)

#### Costs:
- ❌ ~10-15 hours initial setup and first tests
- ❌ ~30-60 seconds per E2E test execution
- ❌ Ongoing maintenance (tests break with UI changes)
- ❌ More complex CI/CD pipeline
- ❌ Flakiness potential (network, timing issues)

### Current Recommendation: Not Yet

**Why wait:**
1. **Current Coverage is Sufficient**: Integration tests validate API-to-client data flow
2. **Small Team**: Focus on feature development first
3. **Low Defect Rate**: No evidence of integration bugs escaping to production
4. **Better ROI Later**: Add E2E when you have:
   - Recurring production bugs from integration issues
   - Dedicated QA resources
   - Larger team where coordination bugs appear
   - Critical user flows that must never break

**Add E2E When:**
- App is deployed to production with real users
- Integration bugs start appearing in production
- Team grows beyond 3-4 developers
- Critical business flows need guaranteed reliability
- Regulatory/compliance requirements need end-to-end proof

### Alternative: Manual Testing Checklist

For now, maintain a manual testing checklist for critical paths:
- [ ] Create mission with bots
- [ ] View bot details
- [ ] Check real-time map updates
- [ ] Verify temperature data displays
- [ ] Test on Chrome, Firefox, Safari

This provides 80% of the benefit with 5% of the effort.

---

## Summary: Testing Strategy for EMBR-Web

| Test Type | Current | Recommended | Priority |
|-----------|---------|-------------|----------|
| Unit Tests | 108 tests ✅ | Keep growing | High |
| Integration Tests | 35 tests ✅ | Keep growing | High |
| E2E Tests (Playwright) | 0 tests ⏸️ | Add later | Medium |
| Manual Testing | Ad-hoc ⚠️ | Checklist | High |

**Focus**: Continue writing unit and integration tests. Add Playwright E2E tests when the app reaches production.

---

**Last Updated**: January 30, 2026  
**Author**: Development Team  
**Related**: [Testing Documentation](../README.md#testing)
