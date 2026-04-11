// Sentry configuration - Enhanced Error Tracking for 2025
//
// Note on bundle size: attempted lazy-import via `await import('@sentry/react')`
// to skip the ~77 kB chunk when Sentry is disabled. Vite couldn't tree-shake
// the dynamic import as aggressively as the static one, and the resulting
// chunk ballooned to 438 kB. Reverted to static import — the 77 kB chunk
// always ships, but it's at least tree-shaken to only the used methods.
// Savings from lazy-init on disabled deployments (~25 kB unused-js) are not
// worth the ~360 kB regression when Sentry is enabled.
import * as Sentry from '@sentry/react';
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
      Sentry.init({
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
      Sentry.withScope((scope) => {
        Object.keys(context).forEach((key) => {
          scope.setExtra(key, context[key]);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } else {
    // Log to console in development
    logger.error('Error captured:', { error, context });
  }
}

// Error reporter for use with React Error Boundary
export function reportErrorBoundary(error: Error, errorInfo: ErrorInfo): void {
  if (env.ENABLE_SENTRY) {
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', {
        componentStack: errorInfo.componentStack,
        digest: errorInfo.digest,
      });
      Sentry.captureException(error);
    });
  } else {
    logger.error('Error Boundary:', { error, errorInfo });
  }
}

// Set user context for error tracking (call on login)
export function setUserContext(user: { id: number; email: string }): void {
  if (env.ENABLE_SENTRY) {
    Sentry.setUser({ id: String(user.id), email: user.email });
  }
}

// Clear user context (call on logout)
export function clearUserContext(): void {
  if (env.ENABLE_SENTRY) {
    Sentry.setUser(null);
  }
}

// Add breadcrumb for key user actions
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (env.ENABLE_SENTRY) {
    Sentry.addBreadcrumb({ category, message, data, level: 'info' });
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
