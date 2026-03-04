import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {
  initPerformanceMonitoring,
  checkPerformanceBudget,
} from './utils/webVitals';
import { initializeCacheOptimization } from './utils/cacheOptimization';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Unregister any existing service workers from previous PWA setup
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  if ('caches' in window) {
    caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
  }
}

// Initialize cache optimization
initializeCacheOptimization();

// Initialize enhanced performance monitoring
initPerformanceMonitoring({
  enableLogging: process.env.NODE_ENV === 'development',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
});

// Check performance budgets
if (process.env.NODE_ENV === 'development') {
  checkPerformanceBudget();
}
