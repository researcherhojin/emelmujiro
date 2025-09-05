import { vi } from 'vitest';
import Logger from '../logger';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;
  let consoleTableSpy: ReturnType<typeof vi.spyOn>;
  let consoleTimeSpy: ReturnType<typeof vi.spyOn>;
  let consoleTimeEndSpy: ReturnType<typeof vi.spyOn>;
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
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    consoleGroupEndSpy = vi
      .spyOn(console, 'groupEnd')
      .mockImplementation(() => {});
    consoleTableSpy = vi.spyOn(console, 'table').mockImplementation(() => {});
    consoleTimeSpy = vi.spyOn(console, 'time').mockImplementation(() => {});
    consoleTimeEndSpy = vi
      .spyOn(console, 'timeEnd')
      .mockImplementation(() => {});
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
    it.skip('should log debug messages', () => {
      Logger.debug('Debug message', { data: 'test' });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        {
          data: 'test',
        }
      );
    });

    it.skip('should log info messages', () => {
      Logger.info('Info message');
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        ''
      );
    });

    it.skip('should log warning messages', () => {
      Logger.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        ''
      );
    });

    it.skip('should log error messages', () => {
      const error = new Error('Test error');
      Logger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        error
      );
    });
  });

  describe('special logging methods', () => {
    it.skip('should create log groups', () => {
      // Force isDevelopment to true for this test
      // @ts-ignore
      Logger.isDevelopment = true;

      Logger.group('Group Title');
      Logger.info('Inside group');
      Logger.groupEnd();

      expect(consoleGroupSpy).toHaveBeenCalledWith('Group Title');
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it.skip('should log tables', () => {
      // Force isDevelopment to true for this test
      // @ts-ignore
      Logger.isDevelopment = true;

      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
      Logger.table(data);
      expect(consoleTableSpy).toHaveBeenCalledWith(data);
    });
  });

  describe('performance measurement', () => {
    it.skip('should measure time between operations', () => {
      // Force isDevelopment to true for this test
      // @ts-ignore
      Logger.isDevelopment = true;

      Logger.time('operation');
      // Simulate some operation
      Logger.timeEnd('operation');

      // time and timeEnd should have been called
      expect(consoleTimeSpy).toHaveBeenCalledWith('operation');
      expect(consoleTimeEndSpy).toHaveBeenCalledWith('operation');
    });

    it.skip('should handle missing time labels', () => {
      // Force isDevelopment to true for this test
      // @ts-ignore
      Logger.isDevelopment = true;

      // Should not throw when ending a non-existent timer
      expect(() => Logger.timeEnd('non-existent')).not.toThrow();
      expect(consoleTimeEndSpy).toHaveBeenCalledWith('non-existent');
    });

    it.skip('should not call console methods in production', async () => {
      // Save original env
      const originalEnv = process.env.NODE_ENV;

      // Temporarily set to production
      (process.env as any).NODE_ENV = 'production';

      // Clear previous calls
      consoleTimeSpy.mockClear();
      consoleTimeEndSpy.mockClear();

      // Import Logger dynamically to ensure it reads the production environment
      vi.resetModules();
      const { default: ProdLogger } = await import('../logger');

      ProdLogger.time('prod-operation');
      ProdLogger.timeEnd('prod-operation');

      // Should not have been called in production
      expect(consoleTimeSpy).not.toHaveBeenCalled();
      expect(consoleTimeEndSpy).not.toHaveBeenCalled();

      // Restore env
      (process.env as any).NODE_ENV = originalEnv;

      // Reset modules to restore normal Logger
      vi.resetModules();
    });
  });
});
