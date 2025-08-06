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
    // Performance metrics logging - disabled by default
    // Enable for debugging performance issues
    if (process.env.NODE_ENV === 'development' && false) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    const metrics = {
                        dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
                        tcpConnection: perfData.connectEnd - perfData.connectStart,
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        totalLoadTime: perfData.loadEventEnd - perfData.fetchStart
                    };
                    // console.log('Performance Metrics:', metrics);
                }
            }, 0);
        });
    }
};