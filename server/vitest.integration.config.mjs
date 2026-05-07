import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/integration/**/*.test.mjs'],
    testTimeout: 60000, // 60 seconds for integration tests
    hookTimeout: 180000, // 3 minutes for setup/teardown
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,mjs}'],
      exclude: [
        'src/**/*.test.{js,mjs}',
        'src/**/*.spec.{js,mjs}',
        'node_modules/**',
      ],
    },
  },
});
