// Web Vitals measurement utility
import { Metric } from 'web-vitals';

interface PerformanceMetrics {
  dnsLookup: number;
  tcpConnection: number;
  domContentLoaded: number;
  totalLoadTime: number;
}

export const measureWebVitals = (onPerfEntry?: (metric: Metric) => void): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Custom performance monitoring
export const logPerformanceMetrics = (): void => {
  // Performance metrics logging - disabled by default
  // Enable for debugging performance issues
  const enablePerformanceLogging = false;
  if (process.env.NODE_ENV === 'development' && enablePerformanceLogging) {
    window.addEventListener('load', () => {
      setTimeout(() => {
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
          // Store metrics for potential future use
          window.localStorage.setItem('performanceMetrics', JSON.stringify(metrics));
        }
      }, 0);
    });
  }
};
