import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    pool: 'threads',
    maxThreads: 1,
    minThreads: 1,
    include: ['tests/**/*.test.ts'],
    sequence: {
      concurrent: false
    },
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/**/*.test.js']
  }
});
