import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import env from './config/env';
import { initSentry } from './utils/sentry';
import {
  initPerformanceMonitoring,
  checkPerformanceBudget,
} from './utils/webVitals';

// Initialize Sentry error tracking (no-op unless VITE_ENABLE_SENTRY=true and VITE_SENTRY_DSN is set)
initSentry();

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

// Initialize enhanced performance monitoring
initPerformanceMonitoring({
  enableLogging: env.IS_DEVELOPMENT,
  sampleRate: env.IS_PRODUCTION ? 0.1 : 1,
});

// Check performance budgets
if (env.IS_DEVELOPMENT) {
  checkPerformanceBudget();
}
