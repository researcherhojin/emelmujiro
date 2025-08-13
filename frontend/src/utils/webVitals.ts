// Enhanced Web Vitals measurement utility
import { Metric } from 'web-vitals';

interface PerformanceMetrics {
  dnsLookup: number;
  tcpConnection: number;
  domContentLoaded: number;
  totalLoadTime: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  interactionToNextPaint?: number;
}

interface WebVitalsConfig {
  enableLogging?: boolean;
  enableReporting?: boolean;
  reportingEndpoint?: string;
  sampleRate?: number;
}

// Enhanced Web Vitals measurement with better error handling
export const measureWebVitals = (
  onPerfEntry?: (metric: Metric) => void,
  config: WebVitalsConfig = {}
): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Sample rate for performance reporting
    if (config.sampleRate && Math.random() > config.sampleRate) {
      return;
    }

    import('web-vitals')
      .then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        try {
          const wrappedCallback = (metric: Metric) => {
            // Add timestamp and additional context
            const enhancedMetric = {
              ...metric,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
              connection:
                (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
                  ?.effectiveType || 'unknown',
            };

            if (config.enableLogging) {
              console.warn('Web Vital:', enhancedMetric);
            }

            onPerfEntry(enhancedMetric);

            // Send to reporting endpoint if configured
            if (config.enableReporting && config.reportingEndpoint) {
              sendToAnalytics(enhancedMetric, config.reportingEndpoint);
            }
          };

          onCLS(wrappedCallback);
          onFCP(wrappedCallback);
          onLCP(wrappedCallback);
          onTTFB(wrappedCallback);
          onINP(wrappedCallback);
        } catch (error) {
          console.warn('Web Vitals measurement failed:', error);
        }
      })
      .catch(error => {
        console.warn('Failed to load web-vitals library:', error);
      });
  }
};

// Send metrics to analytics endpoint
const sendToAnalytics = async (
  metric: Record<string, unknown>,
  endpoint: string
): Promise<void> => {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    });
  } catch (error) {
    console.warn('Failed to send metric to analytics:', error);
  }
};

// Enhanced performance monitoring
export const logPerformanceMetrics = (config: WebVitalsConfig = {}): void => {
  const enablePerformanceLogging = config.enableLogging ?? process.env.NODE_ENV === 'development';

  if (enablePerformanceLogging) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          const perfData = window.performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;

          if (perfData) {
            const metrics: PerformanceMetrics = {
              dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
              tcpConnection: perfData.connectEnd - perfData.connectStart,
              domContentLoaded:
                perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              totalLoadTime: perfData.loadEventEnd - perfData.fetchStart,
            };

            // Get paint timings
            const paintEntries = window.performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
              if (entry.name === 'first-contentful-paint') {
                metrics.firstContentfulPaint = entry.startTime;
              }
            });

            console.warn('Performance Metrics:', metrics);

            // Store metrics with timestamp
            const metricsWithTimestamp = {
              ...metrics,
              timestamp: Date.now(),
              url: window.location.href,
            };

            window.localStorage.setItem('performanceMetrics', JSON.stringify(metricsWithTimestamp));

            // Report to analytics if configured
            if (config.enableReporting && config.reportingEndpoint) {
              sendToAnalytics(metricsWithTimestamp, config.reportingEndpoint);
            }
          }
        } catch (error) {
          console.warn('Performance metrics logging failed:', error);
        }
      }, 0);
    });
  }
};

// Initialize comprehensive performance monitoring
export const initPerformanceMonitoring = (config: WebVitalsConfig = {}): void => {
  // Start Web Vitals monitoring
  measureWebVitals(undefined, config);

  // Start performance metrics logging
  logPerformanceMetrics(config);

  // Monitor long tasks
  if ('PerformanceObserver' in window && config.enableLogging) {
    try {
      const longTaskObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Clean up after 30 seconds
      setTimeout(() => {
        longTaskObserver.disconnect();
      }, 30000);
    } catch (error) {
      console.warn('Long task monitoring failed:', error);
    }
  }
};

// Get performance budget alerts
export const checkPerformanceBudget = (): void => {
  // Different budgets for development and production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const budgets = {
    FCP: isDevelopment ? 3000 : 1800, // First Contentful Paint: 3s dev / 1.8s prod
    LCP: isDevelopment ? 4000 : 2500, // Largest Contentful Paint: 4s dev / 2.5s prod
    FID: 100, // First Input Delay should be under 100ms
    CLS: 0.1, // Cumulative Layout Shift should be under 0.1
    TTFB: isDevelopment ? 2000 : 600, // Time to First Byte: 2s dev / 600ms prod
  };

  measureWebVitals(metric => {
    const budget = budgets[metric.name as keyof typeof budgets];
    if (budget && metric.value > budget) {
      // Only log as warning in development, error in production
      const logMethod = isDevelopment ? 'warn' : 'error';
      console[logMethod](
        `Performance budget exceeded for ${metric.name}: ${metric.value} > ${budget}`
      );
    }
  });
};
