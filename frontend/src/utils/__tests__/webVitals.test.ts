/**
 * @jest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { measureWebVitals, logPerformanceMetrics } from '../webVitals';

// Define ReportHandler type locally since it's not exported from web-vitals
type ReportHandler = (metric: {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  delta: number;
  entries: any[];
  navigationType: string;
}) => void;

// Create a proper mock for web-vitals
const createMockMetric = (name: string, value: number) => ({
  name,
  value,
  rating: 'good' as const,
  id: 'v3-test',
  delta: value,
  entries: [],
  navigationType: 'navigate' as const,
});

// Mock functions to track calls
const mockCallbacks = {
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
  onINP: vi.fn(),
};

// Mock the web-vitals module
vi.mock('web-vitals', () => {
  return {
    onCLS: vi.fn((callback) => {
      mockCallbacks.onCLS(callback);
      // Simulate async metric reporting
      setTimeout(() => {
        callback(createMockMetric('CLS', 0.1));
      }, 0);
    }),
    onFCP: vi.fn((callback) => {
      mockCallbacks.onFCP(callback);
      setTimeout(() => {
        callback(createMockMetric('FCP', 1000));
      }, 0);
    }),
    onLCP: vi.fn((callback) => {
      mockCallbacks.onLCP(callback);
      setTimeout(() => {
        callback(createMockMetric('LCP', 2500));
      }, 0);
    }),
    onTTFB: vi.fn((callback) => {
      mockCallbacks.onTTFB(callback);
      setTimeout(() => {
        callback(createMockMetric('TTFB', 800));
      }, 0);
    }),
    onINP: vi.fn((callback) => {
      mockCallbacks.onINP(callback);
      setTimeout(() => {
        callback(createMockMetric('INP', 200));
      }, 0);
    }),
  };
});

// Mock the logger module so logging calls work regardless of NODE_ENV
const mockLoggerWarn = vi.fn();
vi.mock('../logger', () => ({
  default: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Web vitals tests
describe('webVitals', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Clear localStorage
    window.localStorage.clear();

    // Reset performance mock
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: {
        getEntriesByType: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('measureWebVitals', () => {
    it('should call all web vitals functions when callback provided', async () => {
      const mockCallback = vi.fn();

      measureWebVitals(mockCallback);

      // Wait for dynamic import to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Wait for all callbacks to be called
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify the callback was called with metrics
      expect(mockCallback).toHaveBeenCalledTimes(5);

      // Check that each metric type was reported
      const calls = mockCallback.mock.calls;
      const metricNames = calls.map((call) => call[0].name);
      expect(metricNames).toContain('CLS');
      expect(metricNames).toContain('FCP');
      expect(metricNames).toContain('LCP');
      expect(metricNames).toContain('TTFB');
      expect(metricNames).toContain('INP');
    });

    it('should not call web vitals functions when callback is null', async () => {
      measureWebVitals(null as unknown as ReportHandler);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockCallbacks.onCLS).not.toHaveBeenCalled();
      expect(mockCallbacks.onFCP).not.toHaveBeenCalled();
    });

    it('should not call web vitals functions when callback is not a function', async () => {
      measureWebVitals('not a function' as unknown as ReportHandler);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockCallbacks.onCLS).not.toHaveBeenCalled();
    });

    it('should handle sample rate configuration', async () => {
      const mockCallback = vi.fn();
      Math.random = vi.fn().mockReturnValue(0.8);

      measureWebVitals(mockCallback, { sampleRate: 0.5 });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should include sample rate when below threshold', async () => {
      const mockCallback = vi.fn();
      Math.random = vi.fn().mockReturnValue(0.3);

      measureWebVitals(mockCallback, { sampleRate: 0.5 });

      await new Promise((resolve) => setTimeout(resolve, 10));
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should enable logging when configured', async () => {
      const mockCallback = vi.fn();

      measureWebVitals(mockCallback, { enableLogging: true });

      await new Promise((resolve) => setTimeout(resolve, 10));
      await new Promise((resolve) => setTimeout(resolve, 10));

      // The source calls logger.warn('Web Vital:', enhancedMetric) when enableLogging is true
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'Web Vital:',
        expect.objectContaining({ name: expect.any(String) })
      );
    });

    it('should work with function expression callback', async () => {
      const results: any[] = [];
      const mockCallback = function (metric: { name: string; value: number }) {
        results.push(metric);
      };

      measureWebVitals(mockCallback);

      await new Promise((resolve) => setTimeout(resolve, 10));
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('logPerformanceMetrics', () => {
    it('should get performance metrics when enabled', async () => {
      vi.useFakeTimers();

      const mockNavigationTiming = {
        domainLookupEnd: 100,
        domainLookupStart: 50,
        connectEnd: 200,
        connectStart: 100,
        domContentLoadedEventEnd: 1000,
        domContentLoadedEventStart: 0,
        fetchStart: 0,
        navigationStart: 0,
        loadEventEnd: 2000,
      } as any;
      const mockPaintTiming = [
        { name: 'first-contentful-paint', startTime: 500 },
        { name: 'largest-contentful-paint', startTime: 1500 },
      ];

      const performanceMock = {
        getEntriesByType: vi.fn((type: string) => {
          if (type === 'navigation') return [mockNavigationTiming];
          if (type === 'paint') return mockPaintTiming;
          return [];
        }),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      logPerformanceMetrics({ enableLogging: true });

      // Fire the load event and flush the setTimeout inside it
      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();

      expect(performanceMock.getEntriesByType).toHaveBeenCalledWith(
        'navigation'
      );
      expect(performanceMock.getEntriesByType).toHaveBeenCalledWith('paint');
    });

    it('should not log when disabled', () => {
      const performanceMock = {
        getEntriesByType: vi.fn(),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      logPerformanceMetrics({ enableLogging: false });

      expect(performanceMock.getEntriesByType).not.toHaveBeenCalled();
    });

    it('should handle missing performance API', () => {
      Object.defineProperty(window, 'performance', {
        writable: true,
        value: undefined,
      });

      expect(() =>
        logPerformanceMetrics({ enableLogging: true })
      ).not.toThrow();
    });

    it('should handle missing performance entries', async () => {
      vi.useFakeTimers();

      const performanceMock = {
        getEntriesByType: vi.fn().mockReturnValue([]),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      logPerformanceMetrics({ enableLogging: true });

      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();

      // Should not throw even with empty entries
      expect(performanceMock.getEntriesByType).toHaveBeenCalledWith(
        'navigation'
      );
    });

    it('should store metrics in localStorage when configured', async () => {
      vi.useFakeTimers();

      const mockNavigationTiming = {
        domainLookupEnd: 100,
        domainLookupStart: 50,
        connectEnd: 200,
        connectStart: 100,
        domContentLoadedEventEnd: 1000,
        domContentLoadedEventStart: 0,
        fetchStart: 0,
        navigationStart: 0,
        loadEventEnd: 2000,
      };
      const performanceMock = {
        getEntriesByType: vi.fn(() => [mockNavigationTiming]),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      const setItemSpy = vi.spyOn(window.localStorage, 'setItem');

      logPerformanceMetrics({ enableLogging: true });

      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();

      expect(setItemSpy).toHaveBeenCalledWith(
        'performanceMetrics',
        expect.any(String)
      );

      setItemSpy.mockRestore();
    });

    it('should log metrics via logger.warn', async () => {
      vi.useFakeTimers();

      const mockNavigationTiming = {
        domainLookupEnd: 100,
        domainLookupStart: 50,
        connectEnd: 200,
        connectStart: 100,
        domContentLoadedEventEnd: 1000,
        domContentLoadedEventStart: 0,
        fetchStart: 0,
        navigationStart: 0,
        loadEventEnd: 2000,
      };
      const performanceMock = {
        getEntriesByType: vi.fn(() => [mockNavigationTiming]),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      logPerformanceMetrics({ enableLogging: true });

      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();

      // The source uses logger.warn('Performance Metrics:', metrics)
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'Performance Metrics:',
        expect.any(Object)
      );
    });

    it('should calculate correct timing values', async () => {
      vi.useFakeTimers();

      const mockNavigationTiming = {
        domainLookupEnd: 150,
        domainLookupStart: 50,
        connectEnd: 250,
        connectStart: 150,
        domContentLoadedEventEnd: 1500,
        domContentLoadedEventStart: 0,
        fetchStart: 0,
        navigationStart: 0,
        loadEventEnd: 3000,
      };
      const performanceMock = {
        getEntriesByType: vi.fn(() => [mockNavigationTiming]),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      logPerformanceMetrics({ enableLogging: true });

      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();

      // logger.warn is called with ('Performance Metrics:', metricsObject)
      const loggedMetrics = mockLoggerWarn.mock.calls.find(
        (call: unknown[]) => call[0] === 'Performance Metrics:'
      )?.[1];

      expect(loggedMetrics).toBeDefined();
      // Source: domainLookupEnd - domainLookupStart = 150 - 50 = 100
      expect(loggedMetrics.dnsLookup).toBe(100);
      // Source: connectEnd - connectStart = 250 - 150 = 100
      expect(loggedMetrics.tcpConnection).toBe(100);
      // Source: domContentLoadedEventEnd - domContentLoadedEventStart = 1500 - 0 = 1500
      expect(loggedMetrics.domContentLoaded).toBe(1500);
      // Source: loadEventEnd - fetchStart = 3000 - 0 = 3000
      expect(loggedMetrics.totalLoadTime).toBe(3000);
    });

    it('should handle paint timing entries', async () => {
      vi.useFakeTimers();

      const mockNavigationTiming = {
        domainLookupEnd: 100,
        domainLookupStart: 50,
        connectEnd: 200,
        connectStart: 100,
        domContentLoadedEventEnd: 1000,
        domContentLoadedEventStart: 0,
        fetchStart: 0,
        navigationStart: 0,
        loadEventEnd: 2000,
      };
      const mockPaintTiming = [
        { name: 'first-contentful-paint', startTime: 800 },
      ];

      const performanceMock = {
        getEntriesByType: vi.fn((type: string) => {
          if (type === 'navigation') return [mockNavigationTiming];
          if (type === 'paint') return mockPaintTiming;
          return [];
        }),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      logPerformanceMetrics({ enableLogging: true });

      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();

      const loggedMetrics = mockLoggerWarn.mock.calls.find(
        (call: unknown[]) => call[0] === 'Performance Metrics:'
      )?.[1];

      expect(loggedMetrics).toBeDefined();
      expect(loggedMetrics.firstContentfulPaint).toBe(800);
    });
  });

  describe('integration scenarios', () => {
    it('should work with both functions called together', async () => {
      const mockCallback = vi.fn();

      measureWebVitals(mockCallback);
      logPerformanceMetrics({ enableLogging: false }); // disabled so it doesn't interfere

      await new Promise((resolve) => setTimeout(resolve, 10));
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should handle multiple callback registrations', async () => {
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();

      measureWebVitals(mockCallback1);

      // Wait for the first registration's dynamic import and callbacks
      await new Promise((resolve) => setTimeout(resolve, 10));
      await new Promise((resolve) => setTimeout(resolve, 10));

      measureWebVitals(mockCallback2);

      // Wait for the second registration's dynamic import and callbacks
      await new Promise((resolve) => setTimeout(resolve, 10));
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockCallback1).toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalled();
    });
  });
});
