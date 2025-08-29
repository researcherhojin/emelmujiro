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
    testTimeout: process.env.CI ? 5000 : 10000, // 5s in CI, 10s locally
    hookTimeout: process.env.CI ? 5000 : 10000, // 5s in CI, 10s locally
    pool: 'forks', // Use forks pool for better isolation
    poolOptions: {
      forks: {
        maxForks: process.env.CI ? 1 : undefined, // Single process in CI to avoid memory issues
        singleFork: process.env.CI ? true : false, // Run tests sequentially in CI
      },
    },
    isolate: process.env.CI ? false : true, // Disable isolation in CI for better performance
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
