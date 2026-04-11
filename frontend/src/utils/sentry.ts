// Sentry configuration - Enhanced Error Tracking for 2025
//
// Bundle note: the chunk is 77 kB (26 kB gz) and Lighthouse reports ~72 kB
// of it as unused on the home page. The unused bytes are NOT tree-shakable
// dead exports — they're module-eval overhead that Sentry's `init()` pulls
// in transitively (default integrations, transports, scope manager, error
// classifier). Two prior reduction attempts both failed:
//   1. `import * as Sentry` → named imports: Vite was already tree-shaking
//      the namespace import, named imports gave zero size delta.
//   2. `await import('@sentry/react')`: dynamic import of a barrel package
//      defeats tree-shaking entirely — chunk ballooned 77 kB → 438 kB.
// Realistic next step is switching to `@sentry/browser` directly (smaller
// surface, no React HOC bits we don't use) or moving to a re-export shim
// pattern for true lazy loading. Both deferred — see TODO §1.x.
import {
  init as sentryInit,
  captureException as sentryCaptureException,
  withScope as sentryWithScope,
  setUser as sentrySetUser,
  addBreadcrumb as sentryAddBreadcrumb,
} from '@sentry/react';
import env from '../config/env';
import logger from './logger';

// Type definitions for better type safety
interface WindowWithDevTools extends Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
}

interface ErrorInfo {
  componentStack?: string | null;
  digest?: string;
}

// Initialize Sentry
export function initSentry(): void {
  if (env.ENABLE_SENTRY && env.SENTRY_DSN) {
    try {
      sentryInit({
        dsn: env.SENTRY_DSN,
        environment: env.NODE_ENV,
        tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Error filtering
        beforeSend(event, _hint) {
          // Ignore errors when DevTools is open
          if ((window as WindowWithDevTools).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            return null;
          }

          // Filter network errors
          if (event.exception?.values?.[0]?.type === 'NetworkError') {
            return null;
          }

          // Filter user cancellation errors
          if (
            event.exception?.values?.[0]?.value?.includes('cancelled') ||
            event.exception?.values?.[0]?.value?.includes('aborted')
          ) {
            return null;
          }

          // Filter browser extension errors
          if (
            event.exception?.values?.[0]?.value?.includes('extension://') ||
            event.exception?.values?.[0]?.value?.includes('chrome-extension://')
          ) {
            return null;
          }

          return event;
        },

        // Errors to ignore
        ignoreErrors: [
          // Network-related
          'Network request failed',
          'NetworkError',
          'Failed to fetch',
          'Load failed',
          'The request timed out',

          // User actions
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
          'Non-Error promise rejection captured',

          // Browser extensions
          'extension://',
          'chrome-extension://',
          'moz-extension://',

          // Known third-party errors
          'top.GLOBALS',
          'grecaptcha',
          'fb_xd_fragment',
          '__tcfapi',
        ],

        // Deny-listed URLs
        denyUrls: [
          // Browser extensions
          /extensions\//i,
          /^chrome:\/\//i,
          /^chrome-extension:\/\//i,
          /^moz-extension:\/\//i,

          // Third-party scripts
          /graph\.facebook\.com/i,
          /connect\.facebook\.net/i,
          /google-analytics\.com/i,
          /googletagmanager\.com/i,
          /doubleclick\.net/i,
        ],
      });

      // Sentry initialized successfully
    } catch (error) {
      logger.error('Failed to initialize Sentry:', error);
    }
  }
}

// Capture exception
export function captureException(error: Error | unknown, context?: Record<string, unknown>): void {
  if (env.ENABLE_SENTRY) {
    if (context) {
      sentryWithScope((scope) => {
        Object.keys(context).forEach((key) => {
          scope.setExtra(key, context[key]);
        });
        sentryCaptureException(error);
      });
    } else {
      sentryCaptureException(error);
    }
  } else {
    // Log to console in development
    logger.error('Error captured:', { error, context });
  }
}

// Error reporter for use with React Error Boundary
export function reportErrorBoundary(error: Error, errorInfo: ErrorInfo): void {
  if (env.ENABLE_SENTRY) {
    sentryWithScope((scope) => {
      scope.setContext('errorBoundary', {
        componentStack: errorInfo.componentStack,
        digest: errorInfo.digest,
      });
      sentryCaptureException(error);
    });
  } else {
    logger.error('Error Boundary:', { error, errorInfo });
  }
}

// Set user context for error tracking (call on login)
export function setUserContext(user: { id: number; email: string }): void {
  if (env.ENABLE_SENTRY) {
    sentrySetUser({ id: String(user.id), email: user.email });
  }
}

// Clear user context (call on logout)
export function clearUserContext(): void {
  if (env.ENABLE_SENTRY) {
    sentrySetUser(null);
  }
}

// Add breadcrumb for key user actions
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (env.ENABLE_SENTRY) {
    sentryAddBreadcrumb({ category, message, data, level: 'info' });
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
