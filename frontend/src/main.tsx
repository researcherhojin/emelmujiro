import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import {
  initPerformanceMonitoring,
  checkPerformanceBudget,
} from './utils/webVitals';
import { initializeCacheOptimization } from './utils/cacheOptimization';
import logger from './utils/logger';

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

// Service Worker - 프로덕션 환경에서만 등록
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({
    onUpdate: (registration: ServiceWorkerRegistration) => {
      // 새 버전이 있을 때 처리
      // AppUpdateNotification 컴포넌트를 사용하거나
      // 사용자가 다음에 방문할 때 업데이트되도록 함
      logger.info('New service worker available:', registration);
      // 자동 새로고침 대신 조용히 업데이트
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    },
    onSuccess: (_registration: ServiceWorkerRegistration) => {
      logger.info('Service Worker registered successfully');
    },
  });
} else {
  // 개발 환경에서는 기존 Service Worker 완전 제거
  serviceWorkerRegistration.unregister().then(() => {
    // 캐시도 모두 삭제
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
  });
}

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
