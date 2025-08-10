import logger from '../logger';

describe('Logger Utility', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
    info: jest.SpyInstance;
    group: jest.SpyInstance;
    groupEnd: jest.SpyInstance;
    table: jest.SpyInstance;
    time: jest.SpyInstance;
    timeEnd: jest.SpyInstance;
  };

  beforeEach(() => {
    // Mock console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      group: jest.spyOn(console, 'group').mockImplementation(),
      groupEnd: jest.spyOn(console, 'groupEnd').mockImplementation(),
      table: jest.spyOn(console, 'table').mockImplementation(),
      time: jest.spyOn(console, 'time').mockImplementation(),
      timeEnd: jest.spyOn(console, 'timeEnd').mockImplementation(),
    };
  });

  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });

  describe('Test mode behavior', () => {
    it('should not log debug/info/warn messages in test mode', () => {
      // The logger checks NODE_ENV at initialization time, which is 'test' when running tests
      // In test mode, the logger doesn't log by default

      const message = 'Test message';
      logger.debug(message);
      logger.info(message);
      logger.warn(message);

      // In test mode, these shouldn't be called
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('should not log errors in test mode', () => {
      const message = 'Test error';
      const error = new Error('Test error');

      logger.error(message, error);

      // In test mode, errors are not logged either
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should not log groups in test mode', () => {
      logger.group('Test Group');
      logger.groupEnd();

      expect(consoleSpy.group).not.toHaveBeenCalled();
      expect(consoleSpy.groupEnd).not.toHaveBeenCalled();
    });

    it('should not log tables in test mode', () => {
      const data = [{ name: 'Test', value: 123 }];
      logger.table(data);

      expect(consoleSpy.table).not.toHaveBeenCalled();
    });

    it('should not log time methods in test mode', () => {
      logger.time('performance');
      logger.timeEnd('performance');

      expect(consoleSpy.time).not.toHaveBeenCalled();
      expect(consoleSpy.timeEnd).not.toHaveBeenCalled();
    });

    it('should not log network methods in test mode', () => {
      logger.logRequest('GET', '/api/test', { id: 1 });
      logger.logResponse('GET', '/api/test', 200, { success: true });

      expect(consoleSpy.group).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.groupEnd).not.toHaveBeenCalled();
    });
  });

  describe('Logger methods existence', () => {
    it('should have all expected methods', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.group).toBe('function');
      expect(typeof logger.groupEnd).toBe('function');
      expect(typeof logger.table).toBe('function');
      expect(typeof logger.time).toBe('function');
      expect(typeof logger.timeEnd).toBe('function');
      expect(typeof logger.logRequest).toBe('function');
      expect(typeof logger.logResponse).toBe('function');
    });
  });

  describe('Edge cases', () => {
    it('should handle null and undefined values without throwing', () => {
      // These calls should not throw errors
      expect(() => logger.debug('null value', null)).not.toThrow();
      expect(() => logger.debug('undefined value', undefined)).not.toThrow();
      expect(() => logger.info('both', null)).not.toThrow();
    });

    it('should handle empty message calls without throwing', () => {
      // These calls should not throw errors
      expect(() => logger.debug('')).not.toThrow();
      expect(() => logger.info('')).not.toThrow();
      expect(() => logger.warn('')).not.toThrow();
      expect(() => logger.error('')).not.toThrow();
    });

    it('should handle complex data types', () => {
      const complexData = {
        array: [1, 2, 3],
        nested: { deep: { value: 'test' } },
        func: () => 'test',
        date: new Date(),
      };

      // Should not throw with complex data
      expect(() => logger.debug('Complex data', complexData)).not.toThrow();
    });
  });
});
