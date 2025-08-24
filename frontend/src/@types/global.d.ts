/// <reference types="node" />

declare global {
  // Ensure process is available globally
  const process: NodeJS.Process;

  // Ensure global is available
  const global: typeof globalThis;

  // Extend Window interface for test utilities
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }

  // Define NodeJS namespace for compatibility
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      [key: string]: string | undefined;
    }
  }
}

// Make this file a module
export {};
