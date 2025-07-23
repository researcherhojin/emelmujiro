// Web Vitals measurement utility
export const measureWebVitals = (onPerfEntry) => {
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
export const logPerformanceMetrics = () => {
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('Performance Metrics:');
                    console.log(`DNS Lookup: ${perfData.domainLookupEnd - perfData.domainLookupStart}ms`);
                    console.log(`TCP Connection: ${perfData.connectEnd - perfData.connectStart}ms`);
                    console.log(`DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
                    console.log(`Total Load Time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
                }
            }, 0);
        });
    }
};

// Usage in index.js:
// import { measureWebVitals, logPerformanceMetrics } from './utils/webVitals';
// 
// measureWebVitals(console.log);
// logPerformanceMetrics();