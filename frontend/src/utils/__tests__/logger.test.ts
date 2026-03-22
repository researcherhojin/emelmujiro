import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock sentry before importing logger
vi.mock('../sentry', () => ({
  captureException: vi.fn(),
}));

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

    it('should log info messages', () => {
      Logger.info('Info message');
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'), '');
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

      // Should not have been called in production
      expect(consoleLogSpy).not.toHaveBeenCalled();

      // Reset modules to restore normal Logger
      vi.doUnmock('../../config/env');
      vi.resetModules();
    });

    it('should not crash when error method is called in non-dev mode', () => {
      // Temporarily set isDevelopment to false and enableInProduction to true
      // so shouldLog('error') returns true and reportToErrorService (lines 71-78) runs
      const instance = Logger as unknown as {
        isDevelopment: boolean;
        config: { enableInProduction: boolean; logLevel: string };
      };
      const originalIsDev = instance.isDevelopment;
      const originalEnable = instance.config.enableInProduction;
      instance.isDevelopment = false;
      instance.config.enableInProduction = true;

      // Should not throw — triggers reportToErrorService with Error instance (line 78 branch 1)
      expect(() => Logger.error('Production error', new Error('test'))).not.toThrow();
      // Triggers reportToErrorService with non-Error (line 78 branch 2: new Error(message))
      expect(() => Logger.error('String error', 'not an Error' as unknown)).not.toThrow();

      // Restore
      instance.isDevelopment = originalIsDev;
      instance.config.enableInProduction = originalEnable;
    });
  });
});
