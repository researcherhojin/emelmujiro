import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /*
   * Serve the production build, not the dev server.
   *
   * `npm run dev` transforms modules on demand and drops lazy-chunk requests
   * under parallel load: the browser reports `TypeError: Importing a module
   * script failed`, React's lazy() rejects, and the ErrorBoundary's
   * `fixed inset-0 z-50` overlay then swallows clicks — so the visible failure
   * was a click timing out on "subtree intercepts pointer events", nowhere near
   * the cause. That capped useful parallelism at 2 workers. Static files remove
   * the failure class outright, which is why `workers` is back to Playwright's
   * default and local `retries` back to 0.
   *
   * It also means the suite exercises what users actually get, including the 10
   * SSG prerendered documents. `scripts/e2e-server.mjs` mirrors `nginx.conf`
   * (try_files, the dynamic-route SPA fallback, trailing-slash and /blog 301s,
   * `error_page 404 /index.html`) — `vite preview` cannot stand in for it,
   * because its SPA fallback answers /contact with the homepage snapshot.
   *
   * `reuseExistingServer` keeps the rebuild off the iteration loop: leave
   * `npm run serve:build` running in another shell and repeated `playwright
   * test` runs attach to it instead of rebuilding. Re-run `npm run build`
   * yourself after touching `src/`.
   */
  webServer: {
    command: 'npm run build && npm run serve:build',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000,
  },
});
