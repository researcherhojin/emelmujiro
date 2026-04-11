import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    'frontend': {
      entry: ['src/App.tsx', 'scripts/*.{js,ts}'],
      project: ['src/**/*.{ts,tsx}'],
      ignore: [
        // Test infrastructure — intentionally set up for MSW-based testing
        'src/test-utils/**',
      ],
      ignoreDependencies: [
        'sitemap', // Used by scripts/generate-sitemap.js (CLI, not import)
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
