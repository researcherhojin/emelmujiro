import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export interface WebVitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

// Thresholds based on Web Vitals recommendations
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

// Store metrics in memory for analysis
const metricsStore: WebVitalsData[] = [];

// Send metrics to analytics service
const sendToAnalytics = async (metric: WebVitalsData) => {
  // In production, send to your analytics service
  if (process.env.NODE_ENV === 'production') {
    try {
      // Example: Send to Google Analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as { gtag?: Function }).gtag;
        if (gtag) {
          gtag('event', metric.name, {
            value: Math.round(metric.value),
            metric_rating: metric.rating,
            non_interaction: true,
          });
        }
      }

      // Example: Send to custom analytics endpoint
      // await fetch('/api/analytics/vitals', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metric),
      // });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }
  // Development logging is handled by the caller if needed
};

// Get rating based on thresholds
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// Report handler
interface WebVitalMetric {
  name: string;
  value: number;
  id?: string;
  delta?: number;
}

const reportWebVital = (metric: WebVitalMetric) => {
  const data: WebVitalsData = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    timestamp: Date.now(),
  };

  metricsStore.push(data);
  sendToAnalytics(data);
};

// Initialize Web Vitals tracking
export const initWebVitals = () => {
  getCLS(reportWebVital);
  getFID(reportWebVital);
  getFCP(reportWebVital);
  getLCP(reportWebVital);
  getTTFB(reportWebVital);
};

// Get current metrics
export const getMetrics = () => [...metricsStore];

// Clear metrics
export const clearMetrics = () => {
  metricsStore.length = 0;
};

// Get summary of metrics
interface MetricSummary {
  values: number[];
  ratings: {
    good: number;
    'needs-improvement': number;
    poor: number;
  };
  average?: number;
  median?: number;
  p75?: number;
  p95?: number;
}

export const getMetricsSummary = () => {
  const summary: Record<string, MetricSummary> = {};

  metricsStore.forEach(metric => {
    if (!summary[metric.name]) {
      summary[metric.name] = {
        values: [],
        ratings: { good: 0, 'needs-improvement': 0, poor: 0 },
      };
    }

    summary[metric.name].values.push(metric.value);
    summary[metric.name].ratings[metric.rating]++;
  });

  // Calculate averages and percentiles
  Object.keys(summary).forEach(key => {
    const values = summary[key].values.sort((a: number, b: number) => a - b);
    summary[key].average = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    summary[key].median = values[Math.floor(values.length / 2)];
    summary[key].p75 = values[Math.floor(values.length * 0.75)];
    summary[key].p95 = values[Math.floor(values.length * 0.95)];
  });

  return summary;
};

// Performance monitoring component
export const PerformanceMonitor = () => {
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          // Long task detected
          if (entry.duration > 50) {
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // PerformanceObserver not supported
    }
  }

  // Monitor resource timing
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const slowResources = resources.filter(r => r.duration > 1000);

    if (slowResources.length > 0) {
      console.warn('Slow resources detected:', slowResources);
    }
  }
};

// Export for use in index.tsx
export default initWebVitals;
