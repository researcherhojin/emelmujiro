// Web Vitals measurement utility
import { Metric } from 'web-vitals';
import logger from './logger';
import env from '../config/env';

interface WebVitalsConfig {
  enableLogging?: boolean;
  sampleRate?: number;
}

// Measure Web Vitals with optional sampling and logging
export const measureWebVitals = (
  onPerfEntry?: (metric: Metric) => void,
  config: WebVitalsConfig = {}
): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    if (config.sampleRate && Math.random() > config.sampleRate) {
      return;
    }

    import('web-vitals')
      .then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        try {
          const wrappedCallback = (metric: Metric) => {
            if (config.enableLogging) {
              logger.warn('Web Vital:', { name: metric.name, value: metric.value });
            }
            onPerfEntry(metric);
          };

          onCLS(wrappedCallback);
          onFCP(wrappedCallback);
          onLCP(wrappedCallback);
          onTTFB(wrappedCallback);
          onINP(wrappedCallback);
        } catch (error) {
          logger.warn('Web Vitals measurement failed:', error);
        }
      })
      .catch((error) => {
        logger.warn('Failed to load web-vitals library:', error);
      });
  }
};

// Log navigation performance metrics on page load
export const logPerformanceMetrics = (config: WebVitalsConfig = {}): void => {
  const enablePerformanceLogging = config.enableLogging ?? env.IS_DEVELOPMENT;

  if (enablePerformanceLogging) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          const perfData = window.performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;

          if (perfData) {
            const metrics = {
              dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
              tcpConnection: perfData.connectEnd - perfData.connectStart,
              domContentLoaded:
                perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              totalLoadTime: perfData.loadEventEnd - perfData.fetchStart,
              firstContentfulPaint: undefined as number | undefined,
            };

            const paintEntries = window.performance.getEntriesByType('paint');
            for (const entry of paintEntries) {
              if (entry.name === 'first-contentful-paint') {
                metrics.firstContentfulPaint = entry.startTime;
              }
            }

            logger.warn('Performance Metrics:', metrics);
          }
        } catch (error) {
          logger.warn('Performance metrics logging failed:', error);
        }
      }, 0);
    });
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = (config: WebVitalsConfig = {}): void => {
  logPerformanceMetrics(config);
};

// Check performance budgets (development only)
export const checkPerformanceBudget = (): void => {
  const isDevelopment = env.IS_DEVELOPMENT;
  const budgets = {
    FCP: isDevelopment ? 3000 : 1800,
    LCP: isDevelopment ? 4000 : 2500,
    FID: 100,
    CLS: 0.1,
    TTFB: isDevelopment ? 2000 : 600,
  };

  measureWebVitals((metric) => {
    const budget = budgets[metric.name as keyof typeof budgets];
    if (budget && metric.value > budget) {
      if (isDevelopment) {
        logger.warn(`Performance budget exceeded for ${metric.name}: ${metric.value} > ${budget}`);
      } else {
        logger.error(`Performance budget exceeded for ${metric.name}: ${metric.value} > ${budget}`);
      }
    }
  });
};
