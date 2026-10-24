import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      // verify.sh sends this entry to an isolated container through stdin.
      entry: ['docker/umami/verify.mjs'],
      // Resolved inside that container, from docker/umami/runner/package.json.
      ignoreDependencies: ['next'],
    },
    scripts: {
      entry: ['deploy-webhook.js', '*.ts', 'tests/*.test.ts'],
      project: ['**/*.ts'],
    },
    frontend: {
      entry: ['src/App.tsx', 'scripts/*.{ts,cjs}'],
      project: ['src/**/*.{ts,tsx}'],
      ignore: [
        // Test helpers (renderWithProviders, etc.) — imported from test files only
        'src/test-utils/**',
      ],
      ignoreDependencies: [
        'playwright', // Provided transitively by @playwright/test
        // Declared as a floor, never imported: CVE-2026-12143 (Gotcha #6) is
        // fixed in 4.0.6, and axios 1.20.0 now requires ^4.0.6 itself, so the
        // root `overrides` entry was dropped on 2026-10-18 as a no-op. This
        // direct dependency keeps the floor if axios ever relaxes its range.
        'form-data',
      ],
    },
  },
  ignoreBinaries: ['uv'],
  // .claude/ holds per-machine, gitignored skills next to the tracked ones;
  // their files are not part of either workspace.
  ignore: ['.claude/**'],
  rules: {
    duplicates: 'off', // env.ts intentionally has named + default export
  },
};

export default config;
