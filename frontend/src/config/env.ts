// Vite environment variables configuration
// This file centralizes all environment variables for easy migration

// Resolve current mode: Vite sets import.meta.env.MODE, Vitest sets process.env.NODE_ENV
const MODE: string = import.meta.env?.MODE ?? process.env?.NODE_ENV ?? 'development';

const IS_PRODUCTION = MODE === 'production';
const IS_DEVELOPMENT = MODE === 'development';
const IS_TEST = MODE === 'test';

export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Vite env uses VITE_ prefix; legacy code uses REACT_APP_ prefix
  const viteKey = key.replace('REACT_APP_', 'VITE_');

  // Check Vite env first (import.meta.env is always defined in Vite/Vitest)
  if (import.meta.env?.[viteKey]) {
    return import.meta.env[viteKey];
  }

  // Fallback to process.env for legacy REACT_APP_ compatibility
  if (process.env?.[key]) {
    return process.env[key]!;
  }

  return defaultValue;
};

export const env = {
  // API Configuration
  API_URL: getEnvVar(
    'REACT_APP_API_URL',
    IS_PRODUCTION ? 'https://api.emelmujiro.com/api' : '/api'
  ),
  // Feature Flags
  ENABLE_ANALYTICS: getEnvVar('REACT_APP_ENABLE_ANALYTICS', 'false') === 'true',
  ENABLE_SENTRY: getEnvVar('REACT_APP_ENABLE_SENTRY', 'false') === 'true',
  // Third Party Keys
  SENTRY_DSN: getEnvVar('REACT_APP_SENTRY_DSN', ''),
  UMAMI_HOST: getEnvVar('REACT_APP_UMAMI_HOST', ''),
  UMAMI_WEBSITE_ID: getEnvVar('REACT_APP_UMAMI_WEBSITE_ID', ''),

  // App Configuration
  APP_NAME: getEnvVar('REACT_APP_APP_NAME', 'Emelmujiro'),
  APP_VERSION: getEnvVar('REACT_APP_VERSION', '1.0.0'),
  PUBLIC_URL: getEnvVar('REACT_APP_PUBLIC_URL', ''),

  // Environment
  NODE_ENV: MODE,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_TEST,
};

export default env;
