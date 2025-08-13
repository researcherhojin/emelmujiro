// Clear module cache before importing to ensure fresh instance
jest.resetModules();

// Set NODE_ENV before importing Logger
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'development',
  writable: true,
  configurable: true,
});

import Logger from '../logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleGroupSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;
  let consoleTableSpy: jest.SpyInstance;
  let consoleTimeSpy: jest.SpyInstance;
  let consoleTimeEndSpy: jest.SpyInstance;
  let originalEnv: string | undefined;

  beforeEach(() => {
    // Save original NODE_ENV
    originalEnv = process.env.NODE_ENV;
    // Set to development for tests
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true,
    });

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
    consoleTableSpy = jest.spyOn(console, 'table').mockImplementation();
    consoleTimeSpy = jest.spyOn(console, 'time').mockImplementation();
    consoleTimeEndSpy = jest.spyOn(console, 'timeEnd').mockImplementation();
  });

  afterEach(() => {
    // Restore original NODE_ENV
    if (originalEnv !== undefined) {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    }
    jest.restoreAllMocks();
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

  describe('special logging methods', () => {
    it('should create log groups', () => {
      Logger.group('Group Title');
      Logger.info('Inside group');
      Logger.groupEnd();

      expect(consoleGroupSpy).toHaveBeenCalledWith('Group Title');
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it('should log tables', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
      Logger.table(data);
      expect(consoleTableSpy).toHaveBeenCalledWith(data);
    });
  });

  describe('performance measurement', () => {
    it('should measure time between operations', () => {
      // Ensure NODE_ENV is development
      expect(process.env.NODE_ENV).toBe('development');

      Logger.time('operation');
      // Simulate some operation
      Logger.timeEnd('operation');

      // time and timeEnd should have been called
      expect(consoleTimeSpy).toHaveBeenCalledWith('operation');
      expect(consoleTimeEndSpy).toHaveBeenCalledWith('operation');
    });

    it('should handle missing time labels', () => {
      // Should not throw when ending a non-existent timer
      expect(() => Logger.timeEnd('non-existent')).not.toThrow();
      expect(consoleTimeEndSpy).toHaveBeenCalledWith('non-existent');
    });

    it('should not call console methods in production', () => {
      // Save original env
      const originalEnv = process.env.NODE_ENV;

      // Temporarily set to production
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      // Clear previous calls
      consoleTimeSpy.mockClear();
      consoleTimeEndSpy.mockClear();

      // Create new Logger instance for production
      const ProdLogger = new (require('../logger').default.constructor)();

      ProdLogger.time('prod-operation');
      ProdLogger.timeEnd('prod-operation');

      // Should not have been called in production
      expect(consoleTimeSpy).not.toHaveBeenCalled();
      expect(consoleTimeEndSpy).not.toHaveBeenCalled();

      // Restore env
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });
  });
});
