// Sentry lazy-loading shim — defers the 77 kB @sentry/react chunk until
// an error, login, or breadcrumb actually fires.
//
// Why a shim: Lighthouse reports ~72 kB of the Sentry chunk as unused on
// the home page. The bytes are module-eval overhead from init()'s default
// integrations, not tree-shakable dead exports. Two prior approaches failed:
//   1. namespace → named imports: zero size delta (Vite already tree-shook).
//   2. await import('@sentry/react'): barrel dynamic import defeated
//      tree-shaking entirely (77 kB → 438 kB).
//
// This shim dynamically imports ./sentry-impl (a local file with static
// named imports), so Rollup tree-shakes across the dynamic boundary.
// Trade-off: errors during the first ~200 ms before the chunk loads won't
// reach Sentry. ErrorBoundary still renders fallback UI regardless.
import env from '../config/env';
import logger from './logger';

// Types
interface WindowWithDevTools extends Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
}

interface ErrorInfo {
  componentStack?: string | null;
  digest?: string;
}

// Lazy loader — single shared promise, resolved once
type SentryImpl = typeof import('./sentry-impl');
let implPromise: Promise<SentryImpl> | null = null;

function loadImpl(): Promise<SentryImpl> {
  if (!implPromise) {
    implPromise = import('./sentry-impl');
  }
  return implPromise;
}

// Initialize Sentry (fire-and-forget from main.tsx — no await needed)
export function initSentry(): void {
  if (!env.ENABLE_SENTRY || !env.SENTRY_DSN) return;

  loadImpl()
    .then((sentry) => {
      sentry.init({
        dsn: env.SENTRY_DSN,
        environment: env.NODE_ENV,
        tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,

        beforeSend(event, _hint) {
          if ((window as WindowWithDevTools).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            return null;
          }
          if (event.exception?.values?.[0]?.type === 'NetworkError') {
            return null;
          }
          if (
            event.exception?.values?.[0]?.value?.includes('cancelled') ||
            event.exception?.values?.[0]?.value?.includes('aborted')
          ) {
            return null;
          }
          if (
            event.exception?.values?.[0]?.value?.includes('extension://') ||
            event.exception?.values?.[0]?.value?.includes('chrome-extension://')
          ) {
            return null;
          }
          return event;
        },

        ignoreErrors: [
          'Network request failed',
          'NetworkError',
          'Failed to fetch',
          'Load failed',
          'The request timed out',
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
          'Non-Error promise rejection captured',
          'extension://',
          'chrome-extension://',
          'moz-extension://',
          'top.GLOBALS',
          'grecaptcha',
          'fb_xd_fragment',
          '__tcfapi',
        ],

        denyUrls: [
          /extensions\//i,
          /^chrome:\/\//i,
          /^chrome-extension:\/\//i,
          /^moz-extension:\/\//i,
          /graph\.facebook\.com/i,
          /connect\.facebook\.net/i,
          /google-analytics\.com/i,
          /googletagmanager\.com/i,
          /doubleclick\.net/i,
        ],
      });
    })
    .catch((error) => {
      logger.error('Failed to initialize Sentry:', error);
    });
}

// Capture exception
export function captureException(error: Error | unknown, context?: Record<string, unknown>): void {
  if (env.ENABLE_SENTRY) {
    loadImpl().then((sentry) => {
      if (context) {
        sentry.withScope((scope) => {
          Object.keys(context).forEach((key) => {
            scope.setExtra(key, context[key]);
          });
          sentry.captureException(error);
        });
      } else {
        sentry.captureException(error);
      }
    });
  } else {
    logger.error('Error captured:', { error, context });
  }
}

// Error reporter for use with React Error Boundary
export function reportErrorBoundary(error: Error, errorInfo: ErrorInfo): void {
  if (env.ENABLE_SENTRY) {
    loadImpl().then((sentry) => {
      sentry.withScope((scope) => {
        scope.setContext('errorBoundary', {
          componentStack: errorInfo.componentStack,
          digest: errorInfo.digest,
        });
        sentry.captureException(error);
      });
    });
  } else {
    logger.error('Error Boundary:', { error, errorInfo });
  }
}

// Set user context for error tracking (call on login)
export function setUserContext(user: { id: number; email: string }): void {
  if (env.ENABLE_SENTRY) {
    loadImpl().then((sentry) => {
      sentry.setUser({ id: String(user.id), email: user.email });
    });
  }
}

// Clear user context (call on logout)
export function clearUserContext(): void {
  if (env.ENABLE_SENTRY) {
    loadImpl().then((sentry) => {
      sentry.setUser(null);
    });
  }
}

// Add breadcrumb for key user actions
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (env.ENABLE_SENTRY) {
    loadImpl().then((sentry) => {
      sentry.addBreadcrumb({ category, message, data, level: 'info' });
    });
  }
}

// Default export
const sentryUtils = {
  initSentry,
  captureException,
  reportErrorBoundary,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
};

export default sentryUtils;
