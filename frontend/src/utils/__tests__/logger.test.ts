import Logger from '../logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleGroupSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;
  let consoleTableSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
    consoleTableSpy = jest.spyOn(console, 'table').mockImplementation();
  });

  afterEach(() => {
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
      Logger.time('operation');
      // Simulate some operation
      Logger.timeEnd('operation');

      // timeEnd logs the elapsed time
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle missing time labels', () => {
      // Should not throw when ending a non-existent timer
      expect(() => Logger.timeEnd('non-existent')).not.toThrow();
    });
  });
});
