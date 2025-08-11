import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { initPerformanceMonitoring, checkPerformanceBudget } from './utils/webVitals';
import { initializeCacheOptimization } from './utils/cacheOptimization';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// PWA로 작동하도록 서비스 워커 등록
serviceWorkerRegistration.register({
  onUpdate: (_registration: ServiceWorkerRegistration) => {
    // 새 버전이 있을 때 사용자에게 알림
    if (window.confirm('새로운 버전이 있습니다. 페이지를 새로고침하시겠습니까?')) {
      window.location.reload();
    }
  },
  onSuccess: (_registration: ServiceWorkerRegistration) => {
    // PWA offline mode ready
    // Service Worker registered successfully
  },
});

// Initialize cache optimization
initializeCacheOptimization();

// Initialize enhanced performance monitoring
initPerformanceMonitoring({
  enableLogging: process.env.NODE_ENV === 'development',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1, // 10% sampling in production
});

// Check performance budgets
if (process.env.NODE_ENV === 'development') {
  checkPerformanceBudget();
}
