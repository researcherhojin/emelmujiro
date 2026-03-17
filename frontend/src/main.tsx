import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import env from './config/env';
import { initSentry } from './utils/sentry';
import { initAnalytics } from './utils/analytics';
import { initPerformanceMonitoring, checkPerformanceBudget } from './utils/webVitals';

// Initialize Sentry error tracking (no-op unless VITE_ENABLE_SENTRY=true and VITE_SENTRY_DSN is set)
initSentry();

// Initialize Google Analytics (no-op unless VITE_ENABLE_ANALYTICS=true and VITE_GA_TRACKING_ID is set)
initAnalytics();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const appElement = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Always use createRoot. Prerendered HTML serves SEO (crawlers read static content),
// but Cloudflare Tunnel injects scripts into served HTML causing hydration mismatches.
// createRoot replaces the prerendered content with the live React app.
ReactDOM.createRoot(rootElement).render(appElement);

// Unregister any existing service workers from previous PWA setup.
// Wrapped in try-catch because some in-app browsers (KakaoTalk, Line, etc.)
// may report 'serviceWorker' in navigator but throw when accessing the API.
try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      })
      .catch(() => {});
    if ('caches' in window) {
      caches
        .keys()
        .then((names) => names.forEach((name) => caches.delete(name)))
        .catch(() => {});
    }
  }
} catch {
  // Silently ignore — SW cleanup is best-effort
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
