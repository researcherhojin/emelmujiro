import { describe, it, expect, vi, beforeEach } from 'vitest';

// The env module evaluates getEnvVar() at import time, so we need to
// re-import it dynamically for each group of tests to control import.meta.env.

describe('env config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('default env object (test environment)', () => {
    it('should export an env object with expected keys', async () => {
      const { env } = await import('../env');

      expect(env).toBeDefined();
      expect(env).toHaveProperty('API_URL');
      expect(env).toHaveProperty('WS_URL');
      expect(env).toHaveProperty('ENABLE_ANALYTICS');
      expect(env).toHaveProperty('ENABLE_SENTRY');
      expect(env).toHaveProperty('ENABLE_PWA');
      expect(env).toHaveProperty('SENTRY_DSN');
      expect(env).toHaveProperty('GA_TRACKING_ID');
      expect(env).toHaveProperty('VAPID_PUBLIC_KEY');
      expect(env).toHaveProperty('APP_NAME');
      expect(env).toHaveProperty('APP_VERSION');
      expect(env).toHaveProperty('PUBLIC_URL');
      expect(env).toHaveProperty('NODE_ENV');
      expect(env).toHaveProperty('IS_PRODUCTION');
      expect(env).toHaveProperty('IS_DEVELOPMENT');
      expect(env).toHaveProperty('IS_TEST');
    });

    it('should detect test environment', async () => {
      const { env } = await import('../env');

      expect(env.IS_TEST).toBe(true);
    });

    it('should have correct default values when no env vars are set', async () => {
      const { env } = await import('../env');

      expect(env.APP_NAME).toBe('Emelmujiro');
      expect(env.APP_VERSION).toBe('1.0.0');
      expect(env.PUBLIC_URL).toBe('/emelmujiro');
      expect(env.SENTRY_DSN).toBe('');
      expect(env.GA_TRACKING_ID).toBe('');
      expect(env.VAPID_PUBLIC_KEY).toBe('');
    });

    it('should have feature flags as booleans', async () => {
      const { env } = await import('../env');

      expect(typeof env.ENABLE_ANALYTICS).toBe('boolean');
      expect(typeof env.ENABLE_SENTRY).toBe('boolean');
      expect(typeof env.ENABLE_PWA).toBe('boolean');
    });

    it('should default ENABLE_ANALYTICS and ENABLE_SENTRY to false', async () => {
      const { env } = await import('../env');

      expect(env.ENABLE_ANALYTICS).toBe(false);
      expect(env.ENABLE_SENTRY).toBe(false);
    });

    it('should default ENABLE_PWA to true', async () => {
      const { env } = await import('../env');

      expect(env.ENABLE_PWA).toBe(true);
    });

    it('should have API_URL as a string containing /api', async () => {
      const { env } = await import('../env');

      expect(typeof env.API_URL).toBe('string');
      expect(env.API_URL).toContain('/api');
    });

    it('should have WS_URL as a string containing /ws', async () => {
      const { env } = await import('../env');

      expect(typeof env.WS_URL).toBe('string');
      expect(env.WS_URL).toContain('/ws');
    });
  });

  describe('getEnvVar with VITE_ prefix (via import.meta.env)', () => {
    it('should use VITE_ prefixed env var when available', async () => {
      vi.stubEnv('VITE_APP_NAME', 'TestApp');

      const { env } = await import('../env');

      expect(env.APP_NAME).toBe('TestApp');
    });

    it('should use VITE_ prefixed var for API URL', async () => {
      vi.stubEnv('VITE_API_URL', 'https://custom-api.example.com/api');

      const { env } = await import('../env');

      expect(env.API_URL).toBe('https://custom-api.example.com/api');
    });

    it('should use VITE_ prefixed var for feature flags', async () => {
      vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
      vi.stubEnv('VITE_ENABLE_SENTRY', 'true');

      const { env } = await import('../env');

      expect(env.ENABLE_ANALYTICS).toBe(true);
      expect(env.ENABLE_SENTRY).toBe(true);
    });

    it('should use VITE_ prefixed var for SENTRY_DSN', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://sentry.example.com/123');

      const { env } = await import('../env');

      expect(env.SENTRY_DSN).toBe('https://sentry.example.com/123');
    });
  });

  describe('getEnvVar with REACT_APP_ fallback (via process.env)', () => {
    it('should fall back to REACT_APP_ prefixed process.env when VITE_ is not set', async () => {
      process.env.REACT_APP_APP_NAME = 'LegacyApp';

      const { env } = await import('../env');

      expect(env.APP_NAME).toBe('LegacyApp');

      delete process.env.REACT_APP_APP_NAME;
    });

    it('should prefer VITE_ over REACT_APP_ when both are set', async () => {
      vi.stubEnv('VITE_APP_NAME', 'ViteApp');
      process.env.REACT_APP_APP_NAME = 'ReactApp';

      const { env } = await import('../env');

      expect(env.APP_NAME).toBe('ViteApp');

      delete process.env.REACT_APP_APP_NAME;
    });
  });

  describe('environment detection', () => {
    it('should have NODE_ENV as a string', async () => {
      const { env } = await import('../env');

      expect(typeof env.NODE_ENV).toBe('string');
      expect(env.NODE_ENV.length).toBeGreaterThan(0);
    });

    it('should have IS_PRODUCTION, IS_DEVELOPMENT, IS_TEST as booleans', async () => {
      const { env } = await import('../env');

      expect(typeof env.IS_PRODUCTION).toBe('boolean');
      expect(typeof env.IS_DEVELOPMENT).toBe('boolean');
      expect(typeof env.IS_TEST).toBe('boolean');
    });

    it('should detect test environment correctly (IS_TEST based on process.env.NODE_ENV)', async () => {
      // In test runner, NODE_ENV is 'test'
      const { env } = await import('../env');

      expect(env.IS_TEST).toBe(true);
    });
  });

  describe('default export', () => {
    it('should export env as both named and default', async () => {
      const module = await import('../env');

      expect(module.env).toBeDefined();
      expect(module.default).toBeDefined();
      expect(module.default).toBe(module.env);
    });
  });
});
