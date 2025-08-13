/**
 * @jest-environment jsdom
 */

import { measureWebVitals, logPerformanceMetrics } from '../webVitals';

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
  onCLS: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
  onINP: jest.fn(),
};

// Mock the web-vitals module
jest.mock('web-vitals', () => {
  return {
    onCLS: jest.fn((callback) => {
      mockCallbacks.onCLS(callback);
      // Simulate async metric reporting
      setTimeout(() => {
        callback(createMockMetric('CLS', 0.1));
      }, 0);
    }),
    onFCP: jest.fn((callback) => {
      mockCallbacks.onFCP(callback);
      setTimeout(() => {
        callback(createMockMetric('FCP', 1000));
      }, 0);
    }),
    onLCP: jest.fn((callback) => {
      mockCallbacks.onLCP(callback);
      setTimeout(() => {
        callback(createMockMetric('LCP', 2500));
      }, 0);
    }),
    onTTFB: jest.fn((callback) => {
      mockCallbacks.onTTFB(callback);
      setTimeout(() => {
        callback(createMockMetric('TTFB', 800));
      }, 0);
    }),
    onINP: jest.fn((callback) => {
      mockCallbacks.onINP(callback);
      setTimeout(() => {
        callback(createMockMetric('INP', 200));
      }, 0);
    }),
  };
});

// Web vitals tests
describe('webVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Clear localStorage
    window.localStorage.clear();

    // Reset performance mock
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: {
        getEntriesByType: jest.fn(),
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('measureWebVitals', () => {
    it('should call all web vitals functions when callback provided', async () => {
      const mockCallback = jest.fn();

      measureWebVitals(mockCallback);

      // Wait for dynamic import to resolve
      await new Promise(resolve => setTimeout(resolve, 10));

      // Wait for all callbacks to be called
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify the callback was called with metrics
      expect(mockCallback).toHaveBeenCalledTimes(5);
      
      // Check that each metric type was reported
      const calls = mockCallback.mock.calls;
      const metricNames = calls.map(call => call[0].name);
      expect(metricNames).toContain('CLS');
      expect(metricNames).toContain('FCP');
      expect(metricNames).toContain('LCP');
      expect(metricNames).toContain('TTFB');
      expect(metricNames).toContain('INP');
    });

    it('should not call web vitals functions when callback is null', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      measureWebVitals(null as any);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCallbacks.onCLS).not.toHaveBeenCalled();
      expect(mockCallbacks.onFCP).not.toHaveBeenCalled();
    });

    it('should not call web vitals functions when callback is not a function', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      measureWebVitals('not a function' as any);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCallbacks.onCLS).not.toHaveBeenCalled();
    });

    it('should handle sample rate configuration', async () => {
      const mockCallback = jest.fn();
      Math.random = jest.fn().mockReturnValue(0.8);

      measureWebVitals(mockCallback, { sampleRate: 0.5 });

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should include sample rate when below threshold', async () => {
      const mockCallback = jest.fn();
      Math.random = jest.fn().mockReturnValue(0.3);

      measureWebVitals(mockCallback, { sampleRate: 0.5 });

      await new Promise(resolve => setTimeout(resolve, 10));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should enable logging when configured', async () => {
      const mockCallback = jest.fn();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      measureWebVitals(mockCallback, { enableLogging: true });

      await new Promise(resolve => setTimeout(resolve, 10));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should work with function expression callback', async () => {
      const mockCallback = function(metric: any) {
        console.log(metric);
      };
      const spy = jest.spyOn(console, 'log').mockImplementation();

      measureWebVitals(mockCallback);

      await new Promise(resolve => setTimeout(resolve, 10));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('logPerformanceMetrics', () => {
    it('should get performance metrics when enabled', () => {
      const mockNavigationTiming = {
        domainLookupEnd: 100,
        domainLookupStart: 50,
        connectEnd: 200,
        connectStart: 100,
        domContentLoadedEventEnd: 1000,
        navigationStart: 0,
        loadEventEnd: 2000,
      };

      const mockPaintTiming = [
        { name: 'first-contentful-paint', startTime: 500 },
        { name: 'largest-contentful-paint', startTime: 1500 },
      ];

      const performanceMock = {
        getEntriesByType: jest.fn((type: string) => {
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

      expect(performanceMock.getEntriesByType).toHaveBeenCalledWith('navigation');
      expect(performanceMock.getEntriesByType).toHaveBeenCalledWith('paint');
    });

    it('should not log when disabled', () => {
      const performanceMock = {
        getEntriesByType: jest.fn(),
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

      expect(() => logPerformanceMetrics({ enableLogging: true })).not.toThrow();
    });

    it('should handle missing performance entries', () => {
      const performanceMock = {
        getEntriesByType: jest.fn().mockReturnValue([]),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      expect(() => logPerformanceMetrics({ enableLogging: true })).not.toThrow();
    });

    it('should store metrics in localStorage when configured', () => {
      const mockNavigationTiming = {
        domainLookupEnd: 100,
        domainLookupStart: 50,
        connectEnd: 200,
        connectStart: 100,
        domContentLoadedEventEnd: 1000,
        navigationStart: 0,
        loadEventEnd: 2000,
      };

      const performanceMock = {
        getEntriesByType: jest.fn(() => [mockNavigationTiming]),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

      logPerformanceMetrics({ enableLogging: true, enableReporting: true });

      expect(setItemSpy).toHaveBeenCalledWith(
        'performanceMetrics',
        expect.any(String)
      );

      setItemSpy.mockRestore();
    });

    it('should log metrics to console', () => {
      const mockNavigationTiming = {
        domainLookupEnd: 100,
        domainLookupStart: 50,
        connectEnd: 200,
        connectStart: 100,
        domContentLoadedEventEnd: 1000,
        navigationStart: 0,
        loadEventEnd: 2000,
      };

      const performanceMock = {
        getEntriesByType: jest.fn(() => [mockNavigationTiming]),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      logPerformanceMetrics({ enableLogging: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Performance Metrics:',
        expect.any(Object)
      );

      consoleLogSpy.mockRestore();
    });

    it('should calculate correct timing values', () => {
      const mockNavigationTiming = {
        domainLookupEnd: 150,
        domainLookupStart: 50,
        connectEnd: 250,
        connectStart: 150,
        domContentLoadedEventEnd: 1500,
        navigationStart: 0,
        loadEventEnd: 3000,
      };

      const performanceMock = {
        getEntriesByType: jest.fn(() => [mockNavigationTiming]),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      logPerformanceMetrics({ enableLogging: true });

      const loggedMetrics = consoleLogSpy.mock.calls[0][1];
      expect(loggedMetrics.dnsLookup).toBe(100); // 150 - 50
      expect(loggedMetrics.tcpConnection).toBe(100); // 250 - 150
      expect(loggedMetrics.domContentLoaded).toBe(1500); // 1500 - 0
      expect(loggedMetrics.totalLoadTime).toBe(3000); // 3000 - 0

      consoleLogSpy.mockRestore();
    });

    it('should handle paint timing entries', () => {
      const mockNavigationTiming = {
        domainLookupEnd: 100,
        domainLookupStart: 50,
        connectEnd: 200,
        connectStart: 100,
        domContentLoadedEventEnd: 1000,
        navigationStart: 0,
        loadEventEnd: 2000,
      };

      const mockPaintTiming = [
        { name: 'first-contentful-paint', startTime: 800 },
      ];

      const performanceMock = {
        getEntriesByType: jest.fn((type: string) => {
          if (type === 'navigation') return [mockNavigationTiming];
          if (type === 'paint') return mockPaintTiming;
          return [];
        }),
      };

      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceMock,
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      logPerformanceMetrics({ enableLogging: true });

      const loggedMetrics = consoleLogSpy.mock.calls[0][1];
      expect(loggedMetrics.firstContentfulPaint).toBe(800);

      consoleLogSpy.mockRestore();
    });
  });

  describe('integration scenarios', () => {
    it('should work with both functions called together', async () => {
      const mockCallback = jest.fn();

      measureWebVitals(mockCallback);
      logPerformanceMetrics({ enableLogging: false }); // disabled so it doesn't interfere

      await new Promise(resolve => setTimeout(resolve, 10));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should handle multiple callback registrations', async () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      measureWebVitals(mockCallback1);
      measureWebVitals(mockCallback2);

      await new Promise(resolve => setTimeout(resolve, 10));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCallback1).toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalled();
    });

    it('should handle errors in callback gracefully', async () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });

      expect(() => measureWebVitals(errorCallback)).not.toThrow();

      await new Promise(resolve => setTimeout(resolve, 10));
      await new Promise(resolve => setTimeout(resolve, 10));
    });
  });
});