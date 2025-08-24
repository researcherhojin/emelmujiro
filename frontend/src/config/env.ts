// Vite environment variables configuration
// This file centralizes all environment variables for easy migration

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Support both Vite and legacy process.env for gradual migration
  const viteKey = key.replace('REACT_APP_', 'VITE_');

  // Check Vite env first
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env[viteKey]
  ) {
    return import.meta.env[viteKey];
  }

  // Fallback to process.env for compatibility
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  return defaultValue;
};

export const env = {
  // API Configuration
  API_URL: getEnvVar('REACT_APP_API_URL', 'http://localhost:8000/api'),
  WS_URL: getEnvVar('REACT_APP_WS_URL', 'ws://localhost:8000/ws'),

  // Feature Flags
  ENABLE_ANALYTICS: getEnvVar('REACT_APP_ENABLE_ANALYTICS', 'false') === 'true',
  ENABLE_SENTRY: getEnvVar('REACT_APP_ENABLE_SENTRY', 'false') === 'true',
  ENABLE_PWA: getEnvVar('REACT_APP_ENABLE_PWA', 'true') === 'true',

  // Third Party Keys
  SENTRY_DSN: getEnvVar('REACT_APP_SENTRY_DSN', ''),
  GA_TRACKING_ID: getEnvVar('REACT_APP_GA_TRACKING_ID', ''),
  VAPID_PUBLIC_KEY: getEnvVar('REACT_APP_VAPID_PUBLIC_KEY', ''),

  // App Configuration
  APP_NAME: getEnvVar('REACT_APP_APP_NAME', '에멜무지로'),
  APP_VERSION: getEnvVar('REACT_APP_VERSION', '1.0.0'),
  PUBLIC_URL: getEnvVar('REACT_APP_PUBLIC_URL', '/emelmujiro'),

  // Environment
  NODE_ENV: import.meta?.env?.MODE || process.env.NODE_ENV || 'development',
  IS_PRODUCTION:
    (import.meta?.env?.PROD ?? process.env.NODE_ENV === 'production') || false,
  IS_DEVELOPMENT:
    (import.meta?.env?.DEV ?? process.env.NODE_ENV === 'development') || false,
  IS_TEST: process.env.NODE_ENV === 'test',
};

export default env;
