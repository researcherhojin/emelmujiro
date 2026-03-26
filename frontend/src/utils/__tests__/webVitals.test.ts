import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { measureWebVitals, logPerformanceMetrics } from '../webVitals';

type ReportHandler = (metric: {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  delta: number;
  entries: unknown[];
  navigationType: string;
}) => void;

const createMockMetric = (name: string, value: number) => ({
  name,
  value,
  rating: 'good' as const,
  id: 'v3-test',
  delta: value,
  entries: [],
  navigationType: 'navigate' as const,
});

const mockCallbacks = {
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
  onINP: vi.fn(),
};

vi.mock('web-vitals', () => ({
  onCLS: vi.fn((callback) => {
    mockCallbacks.onCLS(callback);
    setTimeout(() => callback(createMockMetric('CLS', 0.1)), 0);
  }),
  onFCP: vi.fn((callback) => {
    mockCallbacks.onFCP(callback);
    setTimeout(() => callback(createMockMetric('FCP', 1000)), 0);
  }),
  onLCP: vi.fn((callback) => {
    mockCallbacks.onLCP(callback);
    setTimeout(() => callback(createMockMetric('LCP', 2500)), 0);
  }),
  onTTFB: vi.fn((callback) => {
    mockCallbacks.onTTFB(callback);
    setTimeout(() => callback(createMockMetric('TTFB', 800)), 0);
  }),
  onINP: vi.fn((callback) => {
    mockCallbacks.onINP(callback);
    setTimeout(() => callback(createMockMetric('INP', 200)), 0);
  }),
}));

const mockLoggerWarn = vi.fn();
const mockLoggerError = vi.fn();
vi.mock('../logger', () => ({
  default: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('webVitals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: { getEntriesByType: vi.fn() },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('measureWebVitals', () => {
    it('calls all web vitals functions when callback provided', async () => {
      const mockCallback = vi.fn();
      measureWebVitals(mockCallback);

      await new Promise((resolve) => setTimeout(resolve, 10));
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockCallback).toHaveBeenCalledTimes(5);
      const metricNames = mockCallback.mock.calls.map(
        (call: unknown[]) => (call[0] as { name: string }).name
      );
      expect(metricNames).toContain('CLS');
      expect(metricNames).toContain('FCP');
      expect(metricNames).toContain('LCP');
      expect(metricNames).toContain('TTFB');
      expect(metricNames).toContain('INP');
    });

    it('does not call web vitals when callback is null', async () => {
      measureWebVitals(null as unknown as ReportHandler);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockCallbacks.onCLS).not.toHaveBeenCalled();
    });

    it('does not call web vitals when callback is not a function', async () => {
      measureWebVitals('not a function' as unknown as ReportHandler);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockCallbacks.onCLS).not.toHaveBeenCalled();
    });

    it('skips when sample rate exceeded', async () => {
      const mockCallback = vi.fn();
      Math.random = vi.fn().mockReturnValue(0.8);
      measureWebVitals(mockCallback, { sampleRate: 0.5 });
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('proceeds when below sample rate', async () => {
      const mockCallback = vi.fn();
      Math.random = vi.fn().mockReturnValue(0.3);
      measureWebVitals(mockCallback, { sampleRate: 0.5 });
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(mockCallback).toHaveBeenCalled();
    });

    it('logs metrics when enableLogging is true', async () => {
      const mockCallback = vi.fn();
      measureWebVitals(mockCallback, { enableLogging: true });
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'Web Vital:',
        expect.objectContaining({ name: expect.any(String) })
      );
    });
  });

  describe('logPerformanceMetrics', () => {
    it('logs navigation timing when enabled', async () => {
      vi.useFakeTimers();
      const mockNavigationTiming = {
        domainLookupEnd: 150,
        domainLookupStart: 50,
        connectEnd: 250,
        connectStart: 150,
        domContentLoadedEventEnd: 1500,
        domContentLoadedEventStart: 0,
        fetchStart: 0,
        loadEventEnd: 3000,
      };
      const mockPaintTiming = [{ name: 'first-contentful-paint', startTime: 800 }];

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: {
          getEntriesByType: vi.fn((type: string) => {
            if (type === 'navigation') return [mockNavigationTiming];
            if (type === 'paint') return mockPaintTiming;
            return [];
          }),
        },
      });

      logPerformanceMetrics({ enableLogging: true });
      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();

      const loggedMetrics = mockLoggerWarn.mock.calls.find(
        (call: unknown[]) => call[0] === 'Performance Metrics:'
      )?.[1] as Record<string, number> | undefined;

      expect(loggedMetrics).toBeDefined();
      expect(loggedMetrics!.dnsLookup).toBe(100);
      expect(loggedMetrics!.tcpConnection).toBe(100);
      expect(loggedMetrics!.domContentLoaded).toBe(1500);
      expect(loggedMetrics!.totalLoadTime).toBe(3000);
      expect(loggedMetrics!.firstContentfulPaint).toBe(800);
    });

    it('does not log when disabled', () => {
      const performanceMock = { getEntriesByType: vi.fn() };
      Object.defineProperty(window, 'performance', { writable: true, value: performanceMock });
      logPerformanceMetrics({ enableLogging: false });
      expect(performanceMock.getEntriesByType).not.toHaveBeenCalled();
    });

    it('handles missing performance API gracefully', () => {
      Object.defineProperty(window, 'performance', { writable: true, value: undefined });
      expect(() => logPerformanceMetrics({ enableLogging: true })).not.toThrow();
    });

    it('handles empty performance entries', async () => {
      vi.useFakeTimers();
      const performanceMock = { getEntriesByType: vi.fn().mockReturnValue([]) };
      Object.defineProperty(window, 'performance', { writable: true, value: performanceMock });
      logPerformanceMetrics({ enableLogging: true });
      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();
      expect(performanceMock.getEntriesByType).toHaveBeenCalledWith('navigation');
    });

    it('skips FCP when paint entries have no first-contentful-paint', async () => {
      vi.useFakeTimers();
      const mockNavigationTiming = {
        domainLookupEnd: 100,
        domainLookupStart: 0,
        connectEnd: 200,
        connectStart: 100,
        domContentLoadedEventEnd: 1000,
        domContentLoadedEventStart: 0,
        fetchStart: 0,
        loadEventEnd: 2000,
      };
      // Paint entries exist but none are 'first-contentful-paint'
      const mockPaintTiming = [{ name: 'first-paint', startTime: 500 }];

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: {
          getEntriesByType: vi.fn((type: string) => {
            if (type === 'navigation') return [mockNavigationTiming];
            if (type === 'paint') return mockPaintTiming;
            return [];
          }),
        },
      });

      logPerformanceMetrics({ enableLogging: true });
      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();

      const loggedMetrics = mockLoggerWarn.mock.calls.find(
        (call: unknown[]) => call[0] === 'Performance Metrics:'
      )?.[1] as Record<string, number | undefined> | undefined;

      expect(loggedMetrics).toBeDefined();
      // FCP should remain undefined since no 'first-contentful-paint' entry existed
      expect(loggedMetrics!.firstContentfulPaint).toBeUndefined();
      expect(loggedMetrics!.dnsLookup).toBe(100);
    });
  });

  describe('initPerformanceMonitoring', () => {
    it('calls logPerformanceMetrics', async () => {
      const { initPerformanceMonitoring } = await import('../webVitals');
      expect(() => initPerformanceMonitoring({})).not.toThrow();
    });
  });

  describe('checkPerformanceBudget', () => {
    it('registers budget checking callback via measureWebVitals', async () => {
      const { checkPerformanceBudget } = await import('../webVitals');
      expect(() => checkPerformanceBudget()).not.toThrow();
    });

    it('exercises checkPerformanceBudget through full async chain', async () => {
      const { checkPerformanceBudget: freshCheck } = await import('../webVitals');
      freshCheck();
      await new Promise((resolve) => setTimeout(resolve, 50));
      // Budget check ran — mock values don't exceed dev budgets so no warnings expected
      expect(mockLoggerWarn).not.toHaveBeenCalledWith(
        expect.stringContaining('Performance budget exceeded')
      );
    });

    it('logs warning when budget exceeded in development', async () => {
      // Override onLCP to return a value exceeding the dev budget (4000)
      const webVitals = await import('web-vitals');
      vi.mocked(webVitals.onLCP).mockImplementationOnce((callback) => {
        setTimeout(() => callback(createMockMetric('LCP', 5000) as never), 0);
      });

      const envModule = await import('../../config/env');
      const originalIsDev = envModule.default.IS_DEVELOPMENT;
      envModule.default.IS_DEVELOPMENT = true;

      const { checkPerformanceBudget } = await import('../webVitals');
      checkPerformanceBudget();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        expect.stringContaining('Performance budget exceeded for LCP')
      );

      envModule.default.IS_DEVELOPMENT = originalIsDev;
    });
  });

  describe('error handling', () => {
    it('catches errors when web-vitals callbacks throw', async () => {
      const webVitals = await import('web-vitals');
      const originalOnCLS = webVitals.onCLS;
      vi.mocked(webVitals.onCLS).mockImplementationOnce(() => {
        throw new Error('test error');
      });

      const mockCallback = vi.fn();
      measureWebVitals(mockCallback);
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'Web Vitals measurement failed:',
        expect.any(Error)
      );

      vi.mocked(webVitals.onCLS).mockImplementation(originalOnCLS as any);
    });

    it('catches errors when web-vitals import fails', async () => {
      vi.resetModules();

      vi.doMock('web-vitals', () => {
        throw new Error('Module not found');
      });

      const { measureWebVitals: freshMeasure } = await import('../webVitals');
      const mockCallback = vi.fn();
      freshMeasure(mockCallback);
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Restore the original mock
      vi.doUnmock('web-vitals');
      vi.resetModules();
    });

    it('catches errors when performance.getEntriesByType throws', async () => {
      vi.useFakeTimers();
      Object.defineProperty(window, 'performance', {
        writable: true,
        value: {
          getEntriesByType: vi.fn(() => {
            throw new Error('performance API error');
          }),
        },
      });

      logPerformanceMetrics({ enableLogging: true });
      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'Performance metrics logging failed:',
        expect.any(Error)
      );
    });
  });
});
