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
        // Declared to pin the transitive resolution, never imported: the
        // `overrides` entry is what cleared CVE-2026-12143 (Gotcha #6). knip
        // only sees the unused direct dependency. Do NOT "clean up" either one.
        'form-data',
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
