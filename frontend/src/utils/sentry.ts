// Sentry configuration - Enhanced Error Tracking for 2025
import * as Sentry from '@sentry/react';
import env from '../config/env';
import logger from './logger';

// Type definitions for better type safety
interface WindowWithDevTools extends Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
}

interface ErrorInfo {
  componentStack?: string;
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

// Set user context
export function setSentryUser(
  user: {
    id?: string;
    email?: string;
    username?: string;
  } | null
): void {
  if (env.ENABLE_SENTRY) {
    Sentry.setUser(user);
  }
}

// Set additional context
export function setSentryContext(
  key: string,
  context: Record<string, unknown>
): void {
  if (env.ENABLE_SENTRY) {
    Sentry.setContext(key, context);
  }
}

// Capture exception
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
): void {
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

// Capture message
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): void {
  if (env.ENABLE_SENTRY) {
    if (context) {
      Sentry.withScope((scope) => {
        Object.keys(context).forEach((key) => {
          scope.setExtra(key, context[key]);
        });
        Sentry.captureMessage(message, level);
      });
    } else {
      Sentry.captureMessage(message, level);
    }
  } else {
    // Log to console in development

    logger.info(`[${level.toUpperCase()}] ${message}`, context);
  }
}

// Add breadcrumb
export function addBreadcrumb(breadcrumb: {
  message?: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
  timestamp?: number;
}): void {
  if (env.ENABLE_SENTRY) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

// Start a traced span — wraps the callback so Sentry measures its duration
export function startTransaction(
  name: string,
  op: string,
  callback?: () => void | Promise<void>
): string | null {
  if (env.ENABLE_SENTRY) {
    try {
      Sentry.startSpan({ name, op }, async () => {
        if (callback) await callback();
      });
      return name;
    } catch (error) {
      logger.warn('Failed to start transaction:', error);
      return null;
    }
  }
  if (callback) {
    Promise.resolve(callback()).catch((error) => {
      logger.error(`Transaction ${name} failed:`, error);
    });
  }
  return null;
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

// Performance monitoring
export function measurePerformance(
  name: string,
  callback: () => void | Promise<void>
): void {
  if (env.ENABLE_SENTRY) {
    Sentry.startSpan({ name, op: 'custom' }, async () => {
      try {
        await callback();
      } catch (error) {
        captureException(error, { operation: name });
        throw error;
      }
    });
  } else {
    // Execute callback even when Sentry is disabled
    Promise.resolve(callback()).catch((error) => {
      logger.error(`Performance measurement failed for ${name}:`, error);
    });
  }
}

// Default export
const sentryUtils = {
  initSentry,
  setSentryUser,
  setSentryContext,
  captureException,
  captureMessage,
  addBreadcrumb,
  startTransaction,
  reportErrorBoundary,
  measurePerformance,
};

export default sentryUtils;
