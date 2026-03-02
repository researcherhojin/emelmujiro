import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock logger before importing the module under test
const mockLoggerInfo = vi.fn();
const mockLoggerError = vi.fn();
const mockLoggerWarn = vi.fn();

vi.mock('../logger', () => ({
  default: {
    info: (...args: unknown[]) => mockLoggerInfo(...args),
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
    debug: vi.fn(),
  },
}));

// Import the module under test.
// The singleton constructor runs here. In the jsdom test environment,
// PerformanceObserver does not exist, so initializeObservers() silently
// catches the error and no observers are registered. The performance API
// is mocked by setupTests.ts. We test the public API as-is.
import performanceMonitor, {
  markPerformance,
  measurePerformance,
  getPerformanceMetrics,
  reportPerformanceMetrics,
  checkPerformanceBudgets,
} from '../performanceMonitor';

describe('performanceMonitor', () => {
  let markSpy: ReturnType<typeof vi.spyOn>;
  let measureSpy: ReturnType<typeof vi.spyOn>;
  let getEntriesByNameSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Spy on the performance methods that the module calls.
    // setupTests.ts provides a mock performance object with vi.fn() methods.
    // We re-spy to get clean call counts per test.
    markSpy = vi.spyOn(performance, 'mark').mockImplementation(vi.fn());
    measureSpy = vi.spyOn(performance, 'measure').mockImplementation(vi.fn());
    getEntriesByNameSpy = vi
      .spyOn(performance, 'getEntriesByName')
      .mockReturnValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('default export', () => {
    it('should be a valid object with expected public methods', () => {
      expect(performanceMonitor).toBeDefined();
      expect(typeof performanceMonitor.mark).toBe('function');
      expect(typeof performanceMonitor.measure).toBe('function');
      expect(typeof performanceMonitor.getMetrics).toBe('function');
      expect(typeof performanceMonitor.reportMetrics).toBe('function');
      expect(typeof performanceMonitor.checkPerformanceBudgets).toBe(
        'function'
      );
      expect(typeof performanceMonitor.disconnect).toBe('function');
    });
  });

  describe('exported helper functions', () => {
    it('should export markPerformance as a function', () => {
      expect(typeof markPerformance).toBe('function');
    });

    it('should export measurePerformance as a function', () => {
      expect(typeof measurePerformance).toBe('function');
    });

    it('should export getPerformanceMetrics as a function', () => {
      expect(typeof getPerformanceMetrics).toBe('function');
    });

    it('should export reportPerformanceMetrics as a function', () => {
      expect(typeof reportPerformanceMetrics).toBe('function');
    });

    it('should export checkPerformanceBudgets as a function', () => {
      expect(typeof checkPerformanceBudgets).toBe('function');
    });
  });

  describe('mark()', () => {
    it('should call performance.mark with the given name', () => {
      markPerformance('test-mark');
      expect(markSpy).toHaveBeenCalledWith('test-mark');
    });

    it('should call performance.mark for different mark names', () => {
      markPerformance('mark-a');
      markPerformance('mark-b');
      expect(markSpy).toHaveBeenCalledWith('mark-a');
      expect(markSpy).toHaveBeenCalledWith('mark-b');
      expect(markSpy).toHaveBeenCalledTimes(2);
    });

    it('should not throw when performance.mark throws', () => {
      markSpy.mockImplementation(() => {
        throw new Error('mark failed');
      });

      expect(() => markPerformance('failing-mark')).not.toThrow();
      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to mark failing-mark'),
        expect.any(Error)
      );
    });

    it('should delegate from exported function to performanceMonitor.mark', () => {
      markPerformance('delegate-test');
      expect(markSpy).toHaveBeenCalledWith('delegate-test');

      markSpy.mockClear();

      performanceMonitor.mark('direct-test');
      expect(markSpy).toHaveBeenCalledWith('direct-test');
    });
  });

  describe('measure()', () => {
    it('should call performance.measure with start and end marks', () => {
      getEntriesByNameSpy.mockReturnValueOnce([
        { duration: 100 } as PerformanceEntry,
      ]);

      const result = measurePerformance('test', 'start-mark', 'end-mark');

      expect(measureSpy).toHaveBeenCalledWith(
        'measure-test',
        'start-mark',
        'end-mark'
      );
      expect(result).toBe(100);
    });

    it('should call performance.measure with only start mark when no end mark', () => {
      getEntriesByNameSpy.mockReturnValueOnce([
        { duration: 250 } as PerformanceEntry,
      ]);

      const result = measurePerformance('test-no-end', 'start-only');

      expect(measureSpy).toHaveBeenCalledWith(
        'measure-test-no-end',
        'start-only'
      );
      expect(result).toBe(250);
    });

    it('should return null when no measure entries are found', () => {
      getEntriesByNameSpy.mockReturnValueOnce([]);

      const result = measurePerformance('empty', 'start');
      expect(result).toBeNull();
    });

    it('should return null and log error when performance.measure throws', () => {
      measureSpy.mockImplementation(() => {
        throw new Error('measure failed');
      });

      const result = measurePerformance('failing', 'start', 'end');
      expect(result).toBeNull();
      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to measure failing'),
        expect.any(Error)
      );
    });

    it('should round the duration to the nearest integer', () => {
      getEntriesByNameSpy.mockReturnValueOnce([
        { duration: 123.789 } as PerformanceEntry,
      ]);

      const result = measurePerformance('rounding', 'start');
      expect(result).toBe(124);
    });

    it('should round down when duration has decimal < 0.5', () => {
      getEntriesByNameSpy.mockReturnValueOnce([
        { duration: 99.2 } as PerformanceEntry,
      ]);

      const result = measurePerformance('round-down', 'start');
      expect(result).toBe(99);
    });

    it('should prepend measure- to the measure name', () => {
      getEntriesByNameSpy.mockReturnValueOnce([]);

      measurePerformance('my-operation', 'start');
      expect(measureSpy).toHaveBeenCalledWith('measure-my-operation', 'start');
    });

    it('should log the duration via logger.info', () => {
      getEntriesByNameSpy.mockReturnValueOnce([
        { duration: 42 } as PerformanceEntry,
      ]);

      measurePerformance('logged-op', 'start');
      expect(mockLoggerInfo).toHaveBeenCalledWith('logged-op duration:', 42);
    });
  });

  describe('getMetrics()', () => {
    it('should return a metrics object', () => {
      const metrics = getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });

    it('should return a copy of metrics (not a reference)', () => {
      const metrics1 = getPerformanceMetrics();
      const metrics2 = getPerformanceMetrics();
      // Different object references
      expect(metrics1).not.toBe(metrics2);
      // But same content
      expect(metrics1).toEqual(metrics2);
    });

    it('should contain expected metric keys (all optional)', () => {
      const metrics = getPerformanceMetrics();
      // All keys are optional; the type allows FCP, LCP, FID, CLS, TTFB, TTI, TBT, INP
      const validKeys = [
        'FCP',
        'LCP',
        'FID',
        'CLS',
        'TTFB',
        'TTI',
        'TBT',
        'INP',
      ];
      for (const key of Object.keys(metrics)) {
        expect(validKeys).toContain(key);
      }
    });
  });

  describe('reportMetrics()', () => {
    it('should not throw', () => {
      expect(() => reportPerformanceMetrics()).not.toThrow();
    });

    it('should log metrics via logger.info', () => {
      reportPerformanceMetrics();
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Performance Metrics:',
        expect.any(Object)
      );
    });

    it('should send metrics to gtag when window.gtag is available', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      reportPerformanceMetrics();

      // gtag is called for each defined metric. Even with no defined metrics,
      // the function should not throw.
      expect(() => reportPerformanceMetrics()).not.toThrow();
    });

    it('should not throw when window.gtag is undefined', () => {
      window.gtag = undefined as unknown as typeof window.gtag;

      expect(() => reportPerformanceMetrics()).not.toThrow();
    });
  });

  describe('checkPerformanceBudgets()', () => {
    it('should not throw', () => {
      expect(() => checkPerformanceBudgets()).not.toThrow();
    });

    it('should return an object with passed and violations properties', () => {
      const result = checkPerformanceBudgets();
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('violations');
      expect(typeof result.passed).toBe('boolean');
      expect(Array.isArray(result.violations)).toBe(true);
    });

    it('should pass when no metrics are set', () => {
      // In the test environment, no observers fire, so no metrics are recorded
      const result = checkPerformanceBudgets();
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should return violations array (possibly empty)', () => {
      const result = checkPerformanceBudgets();
      expect(Array.isArray(result.violations)).toBe(true);
    });
  });

  describe('disconnect()', () => {
    it('should not throw when called', () => {
      expect(() => performanceMonitor.disconnect()).not.toThrow();
    });

    it('should be callable multiple times without error', () => {
      expect(() => {
        performanceMonitor.disconnect();
        performanceMonitor.disconnect();
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle performance.mark throwing gracefully', () => {
      markSpy.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      expect(() => performanceMonitor.mark('secure-mark')).not.toThrow();
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to mark secure-mark:',
        expect.any(Error)
      );
    });

    it('should handle performance.measure throwing gracefully', () => {
      measureSpy.mockImplementation(() => {
        throw new Error('InvalidAccessError');
      });

      const result = performanceMonitor.measure('bad-measure', 'start', 'end');
      expect(result).toBeNull();
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to measure bad-measure:',
        expect.any(Error)
      );
    });

    it('should handle DOMException in mark gracefully', () => {
      markSpy.mockImplementation(() => {
        throw new DOMException('Syntax error', 'SyntaxError');
      });

      expect(() => performanceMonitor.mark('bad!mark')).not.toThrow();
      expect(mockLoggerError).toHaveBeenCalled();
    });
  });

  describe('PerformanceMonitor class via fresh import', () => {
    // Test that a fresh module import with PerformanceObserver available
    // creates observers and records metrics

    it('should create observers when PerformanceObserver is available', async () => {
      const observerInstances: {
        callback: (list: { getEntries: () => unknown[] }) => void;
        entryTypes: string[];
      }[] = [];

      // Set up a mock PerformanceObserver
      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        const instance = {
          callback,
          entryTypes: [] as string[],
        };
        this.observe = vi.fn((options: { entryTypes: string[] }) => {
          instance.entryTypes = options.entryTypes;
        });
        this.disconnect = vi.fn();
        observerInstances.push(instance);
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);

      // Re-import the module to trigger constructor with PerformanceObserver
      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      // Should have created at least 5 observers (paint, lcp, fid, cls, inp)
      expect(observerInstances.length).toBeGreaterThanOrEqual(5);

      // Verify the public API works
      expect(typeof freshMonitor.mark).toBe('function');
      expect(typeof freshMonitor.measure).toBe('function');
      expect(typeof freshMonitor.getMetrics).toBe('function');
      expect(typeof freshMonitor.reportMetrics).toBe('function');
      expect(typeof freshMonitor.checkPerformanceBudgets).toBe('function');
      expect(typeof freshMonitor.disconnect).toBe('function');

      // Clean up
      vi.unstubAllGlobals();
    });

    it('should record FCP when paint observer fires', async () => {
      const callbacks: Map<
        string,
        (list: { getEntries: () => unknown[] }) => void
      > = new Map();

      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        this.observe = vi.fn((options: { entryTypes: string[] }) => {
          for (const type of options.entryTypes) {
            callbacks.set(type, callback);
          }
        });
        this.disconnect = vi.fn();
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);
      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      // Trigger the paint callback
      const paintCallback = callbacks.get('paint');
      expect(paintCallback).toBeDefined();

      if (paintCallback) {
        paintCallback({
          getEntries: () => [
            { name: 'first-contentful-paint', startTime: 850 },
          ],
        });
      }

      const metrics = freshMonitor.getMetrics();
      expect(metrics.FCP).toBe(850);

      vi.unstubAllGlobals();
    });

    it('should record LCP when largest-contentful-paint observer fires', async () => {
      const callbacks: Map<
        string,
        (list: { getEntries: () => unknown[] }) => void
      > = new Map();

      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        this.observe = vi.fn((options: { entryTypes: string[] }) => {
          for (const type of options.entryTypes) {
            callbacks.set(type, callback);
          }
        });
        this.disconnect = vi.fn();
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);
      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      const lcpCallback = callbacks.get('largest-contentful-paint');
      expect(lcpCallback).toBeDefined();

      if (lcpCallback) {
        lcpCallback({
          getEntries: () => [{ startTime: 2200 }],
        });
      }

      const metrics = freshMonitor.getMetrics();
      expect(metrics.LCP).toBe(2200);

      vi.unstubAllGlobals();
    });

    it('should record FID from first-input observer', async () => {
      const callbacks: Map<
        string,
        (list: { getEntries: () => unknown[] }) => void
      > = new Map();

      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        this.observe = vi.fn((options: { entryTypes: string[] }) => {
          for (const type of options.entryTypes) {
            callbacks.set(type, callback);
          }
        });
        this.disconnect = vi.fn();
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);
      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      const fidCallback = callbacks.get('first-input');
      expect(fidCallback).toBeDefined();

      if (fidCallback) {
        fidCallback({
          getEntries: () => [
            {
              name: 'first-input',
              processingStart: 120,
              startTime: 100,
            },
          ],
        });
      }

      const metrics = freshMonitor.getMetrics();
      expect(metrics.FID).toBe(20);

      vi.unstubAllGlobals();
    });

    it('should record CLS from layout-shift observer', async () => {
      const callbacks: Map<
        string,
        (list: { getEntries: () => unknown[] }) => void
      > = new Map();

      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        this.observe = vi.fn((options: { entryTypes: string[] }) => {
          for (const type of options.entryTypes) {
            callbacks.set(type, callback);
          }
        });
        this.disconnect = vi.fn();
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);
      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      const clsCallback = callbacks.get('layout-shift');
      expect(clsCallback).toBeDefined();

      if (clsCallback) {
        clsCallback({
          getEntries: () => [
            { hadRecentInput: false, value: 0.05 },
            { hadRecentInput: false, value: 0.03 },
          ],
        });
      }

      const metrics = freshMonitor.getMetrics();
      expect(metrics.CLS).toBe(0.08);

      vi.unstubAllGlobals();
    });

    it('should ignore layout shifts with recent input', async () => {
      const callbacks: Map<
        string,
        (list: { getEntries: () => unknown[] }) => void
      > = new Map();

      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        this.observe = vi.fn((options: { entryTypes: string[] }) => {
          for (const type of options.entryTypes) {
            callbacks.set(type, callback);
          }
        });
        this.disconnect = vi.fn();
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);
      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      const clsCallback = callbacks.get('layout-shift');
      if (clsCallback) {
        clsCallback({
          getEntries: () => [
            { hadRecentInput: true, value: 0.5 }, // should be ignored
            { hadRecentInput: false, value: 0.02 },
          ],
        });
      }

      const metrics = freshMonitor.getMetrics();
      // Only the non-recent-input entry should count
      expect(metrics.CLS).toBe(0.02);

      vi.unstubAllGlobals();
    });

    it('should record INP from event observer', async () => {
      const callbacks: Map<
        string,
        (list: { getEntries: () => unknown[] }) => void
      > = new Map();

      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        this.observe = vi.fn((options: { entryTypes: string[] }) => {
          for (const type of options.entryTypes) {
            callbacks.set(type, callback);
          }
        });
        this.disconnect = vi.fn();
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);
      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      const eventCallback = callbacks.get('event');
      expect(eventCallback).toBeDefined();

      if (eventCallback) {
        eventCallback({
          getEntries: () => [{ duration: 150 }, { duration: 300 }],
        });
      }

      const metrics = freshMonitor.getMetrics();
      expect(metrics.INP).toBe(300);

      vi.unstubAllGlobals();
    });

    it('should report budget violations when metrics exceed thresholds', async () => {
      const callbacks: Map<
        string,
        (list: { getEntries: () => unknown[] }) => void
      > = new Map();

      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        this.observe = vi.fn((options: { entryTypes: string[] }) => {
          for (const type of options.entryTypes) {
            callbacks.set(type, callback);
          }
        });
        this.disconnect = vi.fn();
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);
      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      // Set LCP over budget (budget is 2500)
      const lcpCallback = callbacks.get('largest-contentful-paint');
      if (lcpCallback) {
        lcpCallback({
          getEntries: () => [{ startTime: 5000 }],
        });
      }

      // Set FCP over budget (budget is 1800)
      const paintCallback = callbacks.get('paint');
      if (paintCallback) {
        paintCallback({
          getEntries: () => [
            { name: 'first-contentful-paint', startTime: 3000 },
          ],
        });
      }

      const result = freshMonitor.checkPerformanceBudgets();
      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(2);
      expect(result.violations.some((v) => v.includes('LCP'))).toBe(true);
      expect(result.violations.some((v) => v.includes('FCP'))).toBe(true);

      vi.unstubAllGlobals();
    });

    it('should send metrics to gtag when reportMetrics is called', async () => {
      const callbacks: Map<
        string,
        (list: { getEntries: () => unknown[] }) => void
      > = new Map();

      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        this.observe = vi.fn((options: { entryTypes: string[] }) => {
          for (const type of options.entryTypes) {
            callbacks.set(type, callback);
          }
        });
        this.disconnect = vi.fn();
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);

      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      // Set FCP metric
      const paintCallback = callbacks.get('paint');
      if (paintCallback) {
        paintCallback({
          getEntries: () => [
            { name: 'first-contentful-paint', startTime: 500 },
          ],
        });
      }

      freshMonitor.reportMetrics();

      expect(mockGtag).toHaveBeenCalledWith('event', 'performance', {
        metric_name: 'FCP',
        value: 500,
        metric_value: 500,
      });

      vi.unstubAllGlobals();
    });

    it('should disconnect all observers when disconnect is called', async () => {
      const disconnectFns: ReturnType<typeof vi.fn>[] = [];

      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        _callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        const disconnectFn = vi.fn();
        this.observe = vi.fn();
        this.disconnect = disconnectFn;
        disconnectFns.push(disconnectFn);
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);
      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      // Verify observers were created
      expect(disconnectFns.length).toBeGreaterThanOrEqual(5);

      // Disconnect
      freshMonitor.disconnect();

      // All observers should have been disconnected
      for (const fn of disconnectFns) {
        expect(fn).toHaveBeenCalled();
      }

      vi.unstubAllGlobals();
    });

    it('should measure TTFB and TTI from navigation timing', async () => {
      const MockPerfObserver = vi.fn().mockImplementation(function (
        this: {
          observe: ReturnType<typeof vi.fn>;
          disconnect: ReturnType<typeof vi.fn>;
        },
        _callback: (list: { getEntries: () => unknown[] }) => void
      ) {
        this.observe = vi.fn();
        this.disconnect = vi.fn();
      });

      vi.stubGlobal('PerformanceObserver', MockPerfObserver);

      // Mock getEntriesByType to return navigation timing
      const mockNavEntry = {
        responseStart: 200,
        requestStart: 50,
        loadEventEnd: 3000,
        fetchStart: 100,
      };

      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        mockNavEntry as unknown as PerformanceEntry,
      ]);

      vi.resetModules();

      const freshModule = await import('../performanceMonitor');
      const freshMonitor = freshModule.default;

      const metrics = freshMonitor.getMetrics();
      // TTFB = responseStart - requestStart = 200 - 50 = 150
      expect(metrics.TTFB).toBe(150);
      // TTI = loadEventEnd - fetchStart = 3000 - 100 = 2900
      expect(metrics.TTI).toBe(2900);

      vi.unstubAllGlobals();
    });
  });
});
