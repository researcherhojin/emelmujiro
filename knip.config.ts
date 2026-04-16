import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    frontend: {
      entry: ['src/App.tsx', 'scripts/*.{js,ts}'],
      project: ['src/**/*.{ts,tsx}'],
      ignore: [
        // Test helpers (renderWithProviders, etc.) — imported from test files only
        'src/test-utils/**',
      ],
      ignoreDependencies: [
        'playwright', // Provided transitively by @playwright/test
      ],
    },
  },
  ignoreBinaries: ['uv', 'run'],
  ignore: ['scripts/deploy-webhook.js'],
  rules: {
    duplicates: 'off', // env.ts intentionally has named + default export
  },
};

export default config;
