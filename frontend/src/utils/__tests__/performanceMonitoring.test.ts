/**
 * @jest-environment jsdom
 */

import {
  initWebVitals,
  getMetrics,
  clearMetrics,
  getMetricsSummary,
  PerformanceMonitor,
} from '../performanceMonitoring';

// Type for web-vitals metric
type MetricCallback = (metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
}) => void | Promise<void>;

// Mock web-vitals library
const mockOnCLS = jest.fn();
const mockOnFCP = jest.fn();
const mockOnLCP = jest.fn();
const mockOnTTFB = jest.fn();
const mockOnINP = jest.fn();

jest.mock('web-vitals', () => ({
  onCLS: (callback: MetricCallback) => mockOnCLS(callback),
  onFCP: (callback: MetricCallback) => mockOnFCP(callback),
  onLCP: (callback: MetricCallback) => mockOnLCP(callback),
  onTTFB: (callback: MetricCallback) => mockOnTTFB(callback),
  onINP: (callback: MetricCallback) => mockOnINP(callback),
}));

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const mockConsoleError = jest.fn();
const mockConsoleWarn = jest.fn();

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock gtag
const mockGtag = jest.fn();

// Type for window with gtag
interface WindowWithGtag extends Window {
  gtag?: typeof mockGtag;
}

describe('performanceMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearMetrics();
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;

    // Reset window properties
    delete (window as WindowWithGtag).gtag;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('initWebVitals', () => {
    it('should initialize all web vitals metrics', () => {
      initWebVitals();

      expect(mockOnCLS).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnFCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnLCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnTTFB).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnINP).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('metric reporting', () => {
    beforeEach(() => {
      initWebVitals();
    });

    it('should handle LCP metric with good rating', async () => {
      const lcpCallback = mockOnLCP.mock.calls[0][0];
      const mockMetric = {
        name: 'LCP' as const,
        value: 1500,
        id: 'test-id',
        delta: 1500,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      };

      await lcpCallback(mockMetric);

      const metrics = getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: 'LCP',
        value: 1500,
        rating: 'good',
        timestamp: expect.any(Number),
      });
    });

    it('should handle CLS metric with needs-improvement rating', async () => {
      const clsCallback = mockOnCLS.mock.calls[0][0];
      const mockMetric = {
        name: 'CLS' as const,
        value: 0.15,
        id: 'test-id',
        delta: 0.15,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'needs-improvement' as const,
      };

      await clsCallback(mockMetric);

      const metrics = getMetrics();
      expect(metrics[0]).toMatchObject({
        name: 'CLS',
        value: 0.15,
        rating: 'needs-improvement',
      });
    });

    it('should handle INP metric with poor rating', async () => {
      const inpCallback = mockOnINP.mock.calls[0][0];
      const mockMetric = {
        name: 'INP' as const,
        value: 600,
        id: 'test-id',
        delta: 600,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'poor' as const,
      };

      await inpCallback(mockMetric);

      const metrics = getMetrics();
      expect(metrics[0]).toMatchObject({
        name: 'INP',
        value: 600,
        rating: 'poor',
      });
    });

    it('should handle FCP metric', async () => {
      const fcpCallback = mockOnFCP.mock.calls[0][0];
      const mockMetric = {
        name: 'FCP' as const,
        value: 1200,
        id: 'test-id',
        delta: 1200,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      };

      await fcpCallback(mockMetric);

      const metrics = getMetrics();
      expect(metrics[0]).toMatchObject({
        name: 'FCP',
        value: 1200,
        rating: 'good',
      });
    });

    it('should handle TTFB metric', async () => {
      const ttfbCallback = mockOnTTFB.mock.calls[0][0];
      const mockMetric = {
        name: 'TTFB' as const,
        value: 1200,
        id: 'test-id',
        delta: 1200,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'needs-improvement' as const,
      };

      await ttfbCallback(mockMetric);

      const metrics = getMetrics();
      expect(metrics[0]).toMatchObject({
        name: 'TTFB',
        value: 1200,
        rating: 'needs-improvement',
      });
    });

    it('should handle unknown metric name with good rating as fallback', async () => {
      const clsCallback = mockOnCLS.mock.calls[0][0];
      const mockMetric = {
        name: 'UNKNOWN_METRIC' as string,
        value: 1000,
        id: 'test-id',
        delta: 1000,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      };

      await clsCallback(mockMetric);

      const metrics = getMetrics();
      expect(metrics[0]).toMatchObject({
        name: 'UNKNOWN_METRIC',
        value: 1000,
        rating: 'good',
      });
    });
  });

  describe('analytics integration', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should send metrics to Google Analytics in production', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      (window as WindowWithGtag).gtag = mockGtag;

      initWebVitals();
      const lcpCallback = mockOnLCP.mock.calls[0][0];
      const mockMetric = {
        name: 'LCP' as const,
        value: 2000,
        id: 'test-id',
        delta: 2000,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      };

      await lcpCallback(mockMetric);

      expect(mockGtag).toHaveBeenCalledWith('event', 'LCP', {
        value: 2000,
        metric_rating: 'good',
        non_interaction: true,
      });
    });

    it('should not send to Google Analytics if gtag not available', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      initWebVitals();
      const lcpCallback = mockOnLCP.mock.calls[0][0];
      const mockMetric = {
        name: 'LCP' as const,
        value: 2000,
        id: 'test-id',
        delta: 2000,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      };

      await lcpCallback(mockMetric);

      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('should handle analytics errors gracefully', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      (window as WindowWithGtag).gtag = jest.fn(() => {
        throw new Error('Analytics error');
      });

      initWebVitals();
      const lcpCallback = mockOnLCP.mock.calls[0][0];
      const mockMetric = {
        name: 'LCP' as const,
        value: 2000,
        id: 'test-id',
        delta: 2000,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      };

      await lcpCallback(mockMetric);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to send metrics:',
        expect.any(Error)
      );
    });

    it('should not send analytics in development', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      (window as WindowWithGtag).gtag = mockGtag;

      initWebVitals();
      const lcpCallback = mockOnLCP.mock.calls[0][0];
      const mockMetric = {
        name: 'LCP' as const,
        value: 2000,
        id: 'test-id',
        delta: 2000,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      };

      await lcpCallback(mockMetric);

      expect(mockGtag).not.toHaveBeenCalled();
    });
  });

  describe('metrics management', () => {
    beforeEach(() => {
      initWebVitals();
    });

    it('should clear metrics', async () => {
      const lcpCallback = mockOnLCP.mock.calls[0][0];
      await lcpCallback({
        name: 'LCP' as const,
        value: 1500,
        id: 'test-id',
        delta: 1500,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      });

      expect(getMetrics()).toHaveLength(1);
      clearMetrics();
      expect(getMetrics()).toHaveLength(0);
    });

    it('should return copy of metrics array', async () => {
      const lcpCallback = mockOnLCP.mock.calls[0][0];
      await lcpCallback({
        name: 'LCP' as const,
        value: 1500,
        id: 'test-id',
        delta: 1500,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      });

      const metrics1 = getMetrics();
      const metrics2 = getMetrics();

      expect(metrics1).not.toBe(metrics2); // Different array references
      expect(metrics1).toEqual(metrics2); // Same content
    });
  });

  describe('metrics summary', () => {
    beforeEach(() => {
      initWebVitals();
    });

    it('should generate summary for single metric type', async () => {
      const lcpCallback = mockOnLCP.mock.calls[0][0];

      // Add multiple LCP metrics
      await lcpCallback({
        name: 'LCP' as const,
        value: 1500,
        id: '1',
        delta: 1500,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      });
      await lcpCallback({
        name: 'LCP' as const,
        value: 2000,
        id: '2',
        delta: 2000,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      });
      await lcpCallback({
        name: 'LCP' as const,
        value: 3000,
        id: '3',
        delta: 3000,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'needs-improvement' as const,
      });

      const summary = getMetricsSummary();

      expect(summary.LCP).toMatchObject({
        values: [1500, 2000, 3000],
        ratings: {
          good: 2,
          'needs-improvement': 1,
          poor: 0,
        },
        average: 2166.6666666666665,
        median: 2000,
        p75: 3000,
        p95: 3000,
      });
    });

    it('should generate summary for multiple metric types', async () => {
      const lcpCallback = mockOnLCP.mock.calls[0][0];
      const clsCallback = mockOnCLS.mock.calls[0][0];

      await lcpCallback({
        name: 'LCP' as const,
        value: 1500,
        id: '1',
        delta: 1500,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      });
      await clsCallback({
        name: 'CLS' as const,
        value: 0.05,
        id: '2',
        delta: 0.05,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'good' as const,
      });
      await clsCallback({
        name: 'CLS' as const,
        value: 0.2,
        id: '3',
        delta: 0.2,
        entries: [],
        navigationType: 'navigate' as const,
        rating: 'needs-improvement' as const,
      });

      const summary = getMetricsSummary();

      expect(summary).toHaveProperty('LCP');
      expect(summary).toHaveProperty('CLS');
      expect(summary.LCP.ratings.good).toBe(1);
      expect(summary.CLS.ratings.good).toBe(1);
      expect(summary.CLS.ratings['needs-improvement']).toBe(1);
    });

    it('should handle empty metrics', () => {
      const summary = getMetricsSummary();
      expect(summary).toEqual({});
    });
  });

  describe('PerformanceMonitor', () => {
    interface MockPerformanceEntry {
      duration: number;
      startTime: number;
      name: string;
      entryType: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toJSON: () => any;
    }

    interface MockPerformanceObserver {
      observe: jest.Mock;
      callback?: (list: { getEntries: () => MockPerformanceEntry[] }) => void;
    }

    interface MockPerformance {
      getEntriesByType: jest.Mock;
    }

    let mockPerformanceObserver: MockPerformanceObserver;
    let mockPerformance: MockPerformance;

    beforeEach(() => {
      // Mock PerformanceObserver
      mockPerformanceObserver = {
        observe: jest.fn(),
      };

      global.PerformanceObserver = jest
        .fn()
        .mockImplementation(
          (
            callback: (list: {
              getEntries: () => MockPerformanceEntry[];
            }) => void
          ) => {
            mockPerformanceObserver.callback = callback;
            return mockPerformanceObserver;
          }
        ) as unknown as typeof PerformanceObserver;
      (
        global.PerformanceObserver as typeof PerformanceObserver & {
          supportedEntryTypes: string[];
        }
      ).supportedEntryTypes = ['longtask', 'resource'];

      // Mock performance API
      mockPerformance = {
        getEntriesByType: jest.fn().mockReturnValue([]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).performance = mockPerformance;
    });

    afterEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = global as any;
      delete g.PerformanceObserver;
      delete g.performance;
    });

    it('should set up long task observer', () => {
      PerformanceMonitor();

      expect(global.PerformanceObserver).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockPerformanceObserver.observe).toHaveBeenCalledWith({
        entryTypes: ['longtask'],
      });
    });

    it('should warn about long tasks', () => {
      PerformanceMonitor();

      const mockEntry: MockPerformanceEntry = {
        duration: 100,
        startTime: 1000,
        name: 'long-task',
        entryType: 'longtask',
        toJSON: () => ({}),
      };

      // Simulate long task detection
      mockPerformanceObserver.callback?.({
        getEntries: () => [mockEntry],
      });

      expect(mockConsoleWarn).toHaveBeenCalledWith('Long task detected:', {
        duration: 100,
        startTime: 1000,
        name: 'long-task',
      });
    });

    it('should not warn about short tasks', () => {
      PerformanceMonitor();

      const mockEntry: MockPerformanceEntry = {
        duration: 30,
        startTime: 1000,
        name: 'short-task',
        entryType: 'longtask',
        toJSON: () => ({}),
      };

      mockPerformanceObserver.callback?.({
        getEntries: () => [mockEntry],
      });

      expect(mockConsoleWarn).not.toHaveBeenCalledWith(
        'Long task detected:',
        expect.anything()
      );
    });

    it('should monitor slow resources', () => {
      const slowResource = {
        name: 'slow-image.png',
        duration: 1500,
        startTime: 0,
        responseEnd: 1500,
      };

      const fastResource = {
        name: 'fast-script.js',
        duration: 200,
        startTime: 0,
        responseEnd: 200,
      };

      mockPerformance.getEntriesByType.mockReturnValue([
        slowResource,
        fastResource,
      ]);

      PerformanceMonitor();

      expect(mockConsoleWarn).toHaveBeenCalledWith('Slow resources detected:', [
        slowResource,
      ]);
    });

    it('should handle PerformanceObserver errors gracefully', () => {
      global.PerformanceObserver = jest.fn().mockImplementation(() => {
        throw new Error('PerformanceObserver error');
      }) as unknown as typeof PerformanceObserver;
      (
        global.PerformanceObserver as typeof PerformanceObserver & {
          supportedEntryTypes: string[];
        }
      ).supportedEntryTypes = ['longtask', 'resource'];

      expect(() => PerformanceMonitor()).not.toThrow();
    });

    it('should handle missing PerformanceObserver', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = global as any;
      delete g.PerformanceObserver;

      expect(() => PerformanceMonitor()).not.toThrow();
    });

    it('should handle missing performance API', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = global as any;
      delete g.performance;

      expect(() => PerformanceMonitor()).not.toThrow();
    });

    it('should handle performance API without getEntriesByType', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).performance = {};

      expect(() => PerformanceMonitor()).not.toThrow();
    });
  });
});
