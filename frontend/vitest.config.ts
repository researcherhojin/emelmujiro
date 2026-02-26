/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    testTimeout: process.env.CI ? 15000 : 10000, // 15s in CI, 10s locally
    hookTimeout: process.env.CI ? 15000 : 10000, // 15s in CI, 10s locally
    pool: 'forks', // Use forks pool for better isolation
    poolOptions: {
      forks: {
        maxForks: process.env.CI ? 2 : undefined, // Limit forks in CI to manage memory
        isolate: true, // Enable isolation for each test file
      },
    },
    isolate: true, // Enable isolation for better test stability
    clearMocks: true, // Clear all mocks between tests
    restoreMocks: true, // Restore all mocks between tests
    mockReset: true, // Reset mock state between tests
    unstubEnvs: true, // Restore environment variables after each test
    unstubGlobals: true, // Restore global stubs after each test
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'src/__mocks__/**',
        'e2e/**',
      ],
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.idea',
      '.git',
      '.cache',
      'e2e',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
