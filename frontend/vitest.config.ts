/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    testTimeout: process.env.CI ? 15000 : 10000, // 15s in CI, 10s locally
    hookTimeout: process.env.CI ? 15000 : 10000, // 15s in CI, 10s locally
    pool: 'threads', // Threads are faster than forks (shared memory, lower spawn overhead)
    maxThreads: process.env.CI ? 4 : undefined, // CI runners benefit from I/O parallelism beyond core count
    minThreads: process.env.CI ? 2 : undefined,
    isolate: true, // Enable isolation for better test stability
    clearMocks: true, // Clear all mocks between tests
    restoreMocks: true, // Restore all mocks between tests
    mockReset: true, // Reset mock state between tests
    unstubEnvs: true, // Restore environment variables after each test
    unstubGlobals: true, // Restore global stubs after each test
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/test-utils/index.ts',
        'src/constants/index.ts',
        'src/test-utils/polyfills.ts',
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
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Ensure hoisted packages in root node_modules are found (npm workspaces)
    modules: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '../node_modules')],
  },
});
