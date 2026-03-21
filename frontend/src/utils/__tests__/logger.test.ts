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

    it('should call reportToErrorService (captureException) in production when error is logged', async () => {
      consoleErrorSpy.mockClear();

      vi.resetModules();
      const mockCaptureException = vi.fn();
      vi.doMock('../../config/env', () => ({
        default: { IS_DEVELOPMENT: false },
        getEnvVar: (key: string) => {
          if (key === 'ENABLE_LOGGING') return 'true';
          if (key === 'LOG_LEVEL') return 'error';
          return undefined;
        },
      }));
      vi.doMock('../sentry', () => ({
        captureException: mockCaptureException,
      }));

      const { default: ProdLogger } = await import('../logger');

      // Test with Error instance - should pass it directly
      const testError = new Error('Production error');
      ProdLogger.error('Something failed', testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), testError);
      expect(mockCaptureException).toHaveBeenCalledWith(testError, {
        message: 'Something failed',
      });

      // Test with non-Error value - should wrap in new Error(message)
      mockCaptureException.mockClear();
      ProdLogger.error('String error', 'not an Error object' as unknown);

      expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error), {
        message: 'String error',
      });
      const capturedError = mockCaptureException.mock.calls[0][0];
      expect(capturedError.message).toBe('String error');

      vi.doUnmock('../../config/env');
      vi.doUnmock('../sentry');
      vi.resetModules();
    });
  });
});
