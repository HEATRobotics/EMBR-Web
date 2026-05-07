import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['src/__tests__/integration/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,mjs}'],
      exclude: [
        'src/**/*.test.{js,mjs}',
        'src/**/*.spec.{js,mjs}',
        'node_modules/**',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
