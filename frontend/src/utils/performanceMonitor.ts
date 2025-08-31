import logger from './logger';
// import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  TTI?: number; // Time to Interactive
  TBT?: number; // Total Blocking Time
  INP?: number; // Interaction to Next Paint (Core Web Vital 2024+)
}

interface PerformanceReport {
  metrics: PerformanceMetrics;
  resourceTimings: PerformanceResourceTiming[];
  navigationTiming: PerformanceNavigationTiming | null;
  marks: Map<string, number>;
  measures: Map<string, number>;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: Map<string, PerformanceObserver> = new Map();
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();
  private subscribers: Set<(report: PerformanceReport) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      this.initializeObservers();
      this.measureNavigationTiming();
    }
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    // Observe paint timing
    this.observePaintTiming();

    // Observe largest contentful paint
    this.observeLCP();

    // Observe first input delay (legacy metric)
    this.observeFID();

    // Observe cumulative layout shift
    this.observeCLS();

    // Observe Interaction to Next Paint
    this.observeINP();

    // Log metrics on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.reportMetrics();
      });
    }
  }

  /**
   * Observe paint timing (FCP)
   */
  private observePaintTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = Math.round(entry.startTime);
            logger.info('FCP:', this.metrics.FCP);
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', observer);
    } catch (error) {
      logger.error('Failed to observe paint timing:', error);
    }
  }

  /**
   * Observe Largest Contentful Paint
   */
  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.LCP = Math.round(lastEntry.startTime);
          logger.info('LCP:', this.metrics.LCP);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', observer);
    } catch (error) {
      logger.error('Failed to observe LCP:', error);
    }
  }

  /**
   * Observe First Input Delay (deprecated - using INP instead)
   * FID is now calculated from first-input performance entries
   */
  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            this.metrics.FID = Math.round(
              fidEntry.processingStart - fidEntry.startTime
            );
            logger.info('FID:', this.metrics.FID);
          }
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    } catch (error) {
      logger.error('Failed to observe FID:', error);
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS(): void {
    try {
      let clsValue = 0;
      const clsEntries: PerformanceEntry[] = [];

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only count layout shifts without recent user input
          const layoutShiftEntry = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
            clsValue += layoutShiftEntry.value;
            clsEntries.push(entry);
          }
        }

        this.metrics.CLS = Math.round(clsValue * 1000) / 1000;
        logger.info('CLS:', this.metrics.CLS);
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', observer);
    } catch (error) {
      logger.error('Failed to observe CLS:', error);
    }
  }

  /**
   * Observe Interaction to Next Paint (INP)
   */
  private observeINP(): void {
    try {
      let maxINP = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const eventEntry = entry as PerformanceEventTiming;
          if (eventEntry.duration > maxINP) {
            maxINP = eventEntry.duration;
            this.metrics.INP = Math.round(maxINP);
            logger.info('INP:', this.metrics.INP);
          }
        }
      });

      observer.observe({ entryTypes: ['event'] });
      this.observers.set('inp', observer);
    } catch (error) {
      logger.error('Failed to observe INP:', error);
    }
  }

  /**
   * Measure navigation timing
   */
  private measureNavigationTiming(): void {
    try {
      if (!performance.getEntriesByType) {
        return;
      }
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        // Time to First Byte
        this.metrics.TTFB = Math.round(
          navigation.responseStart - navigation.requestStart
        );

        // Time to Interactive (approximation)
        this.metrics.TTI = Math.round(
          navigation.loadEventEnd - navigation.fetchStart
        );

        logger.info('TTFB:', this.metrics.TTFB);
        logger.info('TTI:', this.metrics.TTI);
      }
    } catch (error) {
      logger.error('Failed to measure navigation timing:', error);
    }
  }

  /**
   * Track custom performance marks
   */
  public mark(name: string): void {
    try {
      performance.mark(name);
    } catch (error) {
      logger.error(`Failed to mark ${name}:`, error);
    }
  }

  /**
   * Measure between two marks
   */
  public measure(
    name: string,
    startMark: string,
    endMark?: string
  ): number | null {
    try {
      const measureName = `measure-${name}`;

      if (endMark) {
        performance.measure(measureName, startMark, endMark);
      } else {
        performance.measure(measureName, startMark);
      }

      const measures = performance.getEntriesByName(measureName);
      if (measures.length > 0) {
        const duration = Math.round(measures[0].duration);
        logger.info(`${name} duration:`, duration);
        return duration;
      }
    } catch (error) {
      logger.error(`Failed to measure ${name}:`, error);
    }

    return null;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Report metrics to analytics or monitoring service
   */
  public reportMetrics(): void {
    const metrics = this.getMetrics();

    // Log metrics
    logger.info('Performance Metrics:', metrics);

    // Send to analytics (if available)
    if (typeof window !== 'undefined' && window.gtag) {
      Object.entries(metrics).forEach(([key, value]) => {
        if (value !== undefined && window.gtag) {
          window.gtag('event', 'performance', {
            metric_name: key,
            value: Math.round(value),
            metric_value: value,
          });
        }
      });
    }

    // Could also send to custom monitoring endpoint
    // this.sendToMonitoringService(metrics);
  }

  /**
   * Check if metrics meet performance budgets
   */
  public checkPerformanceBudgets(): {
    passed: boolean;
    violations: string[];
  } {
    const budgets = {
      FCP: 1800, // 1.8s
      LCP: 2500, // 2.5s
      FID: 100, // 100ms
      CLS: 0.1, // 0.1
      TTFB: 800, // 800ms
      TTI: 3800, // 3.8s
      INP: 200, // 200ms (Good INP threshold)
    };

    const violations: string[] = [];

    Object.entries(budgets).forEach(([metric, budget]) => {
      const value = this.metrics[metric as keyof PerformanceMetrics];
      if (value !== undefined && value > budget) {
        violations.push(`${metric}: ${value} (budget: ${budget})`);
      }
    });

    if (violations.length > 0) {
      logger.warn('Performance budget violations:', violations);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Clean up observers
   */
  public disconnect(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export functions for easier use
export const markPerformance = (name: string) => performanceMonitor.mark(name);
export const measurePerformance = (
  name: string,
  startMark: string,
  endMark?: string
) => performanceMonitor.measure(name, startMark, endMark);
export const getPerformanceMetrics = () => performanceMonitor.getMetrics();
export const reportPerformanceMetrics = () =>
  performanceMonitor.reportMetrics();
export const checkPerformanceBudgets = () =>
  performanceMonitor.checkPerformanceBudgets();

export default performanceMonitor;
