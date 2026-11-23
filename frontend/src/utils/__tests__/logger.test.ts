import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import Logger from '../logger';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let originalEnv: string | undefined;

  beforeEach(() => {
    // Save original NODE_ENV
    originalEnv = process.env.NODE_ENV;
    // Set to development for tests
    (process.env as any).NODE_ENV = 'development';

    // Force Logger to re-evaluate isDevelopment and config
    // @ts-ignore
    Logger.isDevelopment = process.env.NODE_ENV === 'development';
    // @ts-ignore
    Logger.config = {
      enableInProduction: false,
      logLevel: 'debug', // Allow all log levels in tests
    };

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original NODE_ENV
    if (originalEnv !== undefined) {
      (process.env as any).NODE_ENV = originalEnv;
    } else {
      delete (process.env as any).NODE_ENV;
    }
    vi.restoreAllMocks();
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      Logger.debug('Debug message', { data: 'test' });
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'), {
        data: 'test',
      });
    });

    it('should log debug messages without data (covers || "" fallback)', () => {
      Logger.debug('Debug no data');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'), '');
    });

    it('should log info messages', () => {
      Logger.info('Info message');
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'), '');
    });

    it('should log info messages with data (covers data || "" fallback)', () => {
      Logger.info('Info with data', { key: 'value' });
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'), {
        key: 'value',
      });
    });

    it('should log warning messages', () => {
      Logger.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'), '');
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      Logger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), error);
    });

    it('should log error messages without error arg (covers || "" fallback)', () => {
      Logger.error('Error no arg');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), '');
    });
  });

  describe('production mode', () => {
    it('should not call console methods in production', async () => {
      // Clear previous calls
      consoleLogSpy.mockClear();

      // Mock env module to simulate production
      vi.resetModules();
      vi.doMock('../../config/env', () => ({
        default: { IS_DEVELOPMENT: false },
        getEnvVar: () => undefined,
      }));

      const { default: ProdLogger } = await import('../logger');

      ProdLogger.debug('prod-debug');
      ProdLogger.info('prod-info');

      // Should not have been called in production
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      // Reset modules to restore normal Logger
      vi.doUnmock('../../config/env');
      vi.resetModules();
    });

    it('logs errors in production when logging is enabled', async () => {
      vi.resetModules();
      vi.doMock('../../config/env', () => ({
        default: { IS_DEVELOPMENT: false },
        getEnvVar: (key: string) => (key === 'ENABLE_LOGGING' ? 'true' : undefined),
      }));

      try {
        const { default: prodLogger } = await import('../logger');
        const error = new Error('test');
        prodLogger.error('Production error', error);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ERROR] Production error'),
          error
        );
      } finally {
        vi.doUnmock('../../config/env');
        vi.resetModules();
      }
    });
  });
});
