/// <reference types="node" />

declare global {
  // Extend Window interface for test utilities
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

// Make this file a module
export {};
