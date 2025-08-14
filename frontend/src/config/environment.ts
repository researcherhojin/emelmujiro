// Environment configuration with type safety
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // API Configuration
  API_URL: process.env.REACT_APP_API_URL || 'https://api.emelmujiro.com',
  USE_MOCK_API: process.env.REACT_APP_USE_MOCK_API === 'true',
  API_TIMEOUT: Number(process.env.REACT_APP_API_TIMEOUT) || 30000,

  // Public URL for assets
  PUBLIC_URL: process.env.PUBLIC_URL || '',

  // Feature flags
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_PWA: process.env.REACT_APP_ENABLE_PWA !== 'false',
  ENABLE_CHAT: process.env.REACT_APP_ENABLE_CHAT !== 'false',

  // Build info
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  BUILD_DATE: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
} as const;

// Type-safe environment getter
export function getEnvVar<K extends keyof typeof ENV>(key: K): (typeof ENV)[K] {
  return ENV[key];
}

// Validate required environment variables
export function validateEnv(): void {
  const required = ['API_URL'];
  const missing = required.filter((key) => !ENV[key as keyof typeof ENV]);

  if (missing.length > 0 && !ENV.isTest) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
}

// Initialize on module load
if (!ENV.isTest) {
  validateEnv();
}
