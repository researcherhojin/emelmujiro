import React, { useEffect, useState, memo } from 'react';
import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitalsData {
  CLS: VitalMetric | null;
  FCP: VitalMetric | null;
  FID: VitalMetric | null;
  LCP: VitalMetric | null;
  TTFB: VitalMetric | null;
  INP: VitalMetric | null;
}

const getMetricRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    FID: { good: 100, poor: 300 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[name];
  if (!threshold) return 'needs-improvement';

  if (value <= threshold.good) return 'good';
  if (value >= threshold.poor) return 'poor';
  return 'needs-improvement';
};

const formatMetricValue = (name: string, value: number): string => {
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
};

const getMetricDescription = (name: string): string => {
  const descriptions: Record<string, string> = {
    CLS: 'Cumulative Layout Shift - Visual stability',
    FCP: 'First Contentful Paint - First render time',
    FID: 'First Input Delay - Interactivity',
    LCP: 'Largest Contentful Paint - Loading performance',
    TTFB: 'Time to First Byte - Server response time',
    INP: 'Interaction to Next Paint - Overall responsiveness',
  };
  return descriptions[name] || '';
};

const MetricCard: React.FC<{ metric: VitalMetric }> = memo(({ metric }) => {
  const ratingColors = {
    good: 'bg-green-100 text-green-800 border-green-300',
    'needs-improvement': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    poor: 'bg-red-100 text-red-800 border-red-300',
  };

  const ratingIcons = {
    good: '✅',
    'needs-improvement': '⚠️',
    poor: '❌',
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
        ratingColors[metric.rating]
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{metric.name}</h3>
        <span className="text-2xl">{ratingIcons[metric.rating]}</span>
      </div>
      <div className="text-2xl font-bold mb-2">{formatMetricValue(metric.name, metric.value)}</div>
      <p className="text-sm opacity-75">{getMetricDescription(metric.name)}</p>
      <div className="mt-2 text-xs opacity-50">
        Measured at: {new Date(metric.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

const WebVitalsDashboard: React.FC = memo(() => {
  const [metrics, setMetrics] = useState<WebVitalsData>({
    CLS: null,
    FCP: null,
    FID: null,
    LCP: null,
    TTFB: null,
    INP: null,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      const vitalMetric: VitalMetric = {
        name: metric.name,
        value: metric.value,
        rating: getMetricRating(metric.name, metric.value),
        timestamp: Date.now(),
      };

      setMetrics(prev => ({
        ...prev,
        [metric.name]: vitalMetric,
      }));

      // Log to console for debugging (development only)
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development' && console.log) {
        // eslint-disable-next-line no-console
        console.log(`Web Vital [${metric.name}]:`, {
          value: formatMetricValue(metric.name, metric.value),
          rating: vitalMetric.rating,
          raw: metric,
        });
      }

      // Send to analytics (if configured)
      if (window.gtag) {
        window.gtag('event', 'web_vital', {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: vitalMetric.rating,
        });
      }
    };

    // Register Web Vitals observers
    onCLS(handleMetric);
    onFCP(handleMetric);
    onFID(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);

    // Show dashboard in development mode with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        setIsVisible(prev => !prev);
      }
    };

    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }

    return undefined;
  }, []);

  // Only show in development or if explicitly enabled
  if (!isVisible && process.env.NODE_ENV !== 'development') {
    return null;
  }

  const hasMetrics = Object.values(metrics).some(metric => metric !== null);

  return (
    <>
      {/* Toggle Button (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Toggle Web Vitals Dashboard"
        >
          📊
        </button>
      )}

      {/* Dashboard */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-40 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl max-w-4xl max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Web Vitals Dashboard
            </h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close dashboard"
            >
              ✕
            </button>
          </div>

          {hasMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(metrics).map(
                ([key, metric]) => metric && <MetricCard key={key} metric={metric} />
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-2">Collecting metrics...</p>
              <p className="text-sm">Navigate around the site to generate metrics</p>
              <p className="text-xs mt-4 opacity-50">Press Ctrl+Shift+V to toggle this dashboard</p>
            </div>
          )}

          {/* Summary Statistics */}
          {hasMetrics && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Performance Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Good: </span>
                  {Object.values(metrics).filter(m => m?.rating === 'good').length}
                </div>
                <div>
                  <span className="text-yellow-600">Needs Improvement: </span>
                  {Object.values(metrics).filter(m => m?.rating === 'needs-improvement').length}
                </div>
                <div>
                  <span className="text-red-600">Poor: </span>
                  {Object.values(metrics).filter(m => m?.rating === 'poor').length}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>💡 Tip: Metrics are collected as you interact with the page.</p>
            <p>📈 Data is sent to analytics if configured.</p>
            <p>⌨️ Press Ctrl+Shift+V to toggle this dashboard.</p>
          </div>
        </div>
      )}
    </>
  );
});

WebVitalsDashboard.displayName = 'WebVitalsDashboard';

export default WebVitalsDashboard;

// Type declarations for gtag (if using Google Analytics)
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      parameters: {
        metric_name: string;
        metric_value: number;
        metric_rating: string;
      }
    ) => void;
  }
}
