// Vite environment variables configuration
// This file centralizes all environment variables for easy migration

// Resolve current mode from Vite's import.meta.env (preferred).
// Falls back to process.env.NODE_ENV for test runners (Vitest sets both).
const MODE: string =
  typeof import.meta !== 'undefined' && import.meta.env?.MODE
    ? import.meta.env.MODE
    : typeof process !== 'undefined' && process.env?.NODE_ENV
      ? process.env.NODE_ENV
      : 'development';

const IS_PRODUCTION = MODE === 'production';
const IS_DEVELOPMENT = MODE === 'development';
const IS_TEST = MODE === 'test';

export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Support both Vite and legacy process.env for gradual migration
  const viteKey = key.replace('REACT_APP_', 'VITE_');

  // Check Vite env first
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
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
  API_URL: getEnvVar(
    'REACT_APP_API_URL',
    IS_PRODUCTION ? 'https://api.emelmujiro.com/api' : 'http://localhost:8000/api'
  ),
  WS_URL: getEnvVar(
    'REACT_APP_WS_URL',
    IS_PRODUCTION ? 'wss://api.emelmujiro.com/ws' : 'ws://localhost:8000/ws'
  ),

  // Feature Flags
  ENABLE_ANALYTICS: getEnvVar('REACT_APP_ENABLE_ANALYTICS', 'false') === 'true',
  ENABLE_SENTRY: getEnvVar('REACT_APP_ENABLE_SENTRY', 'false') === 'true',
  // Third Party Keys
  SENTRY_DSN: getEnvVar('REACT_APP_SENTRY_DSN', ''),
  GA_TRACKING_ID: getEnvVar('REACT_APP_GA_TRACKING_ID', ''),

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
