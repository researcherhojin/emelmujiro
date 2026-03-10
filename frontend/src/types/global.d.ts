/// <reference types="vite/client" />

// Environment variable type definitions
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GA_TRACKING_ID: string;
  readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Window object extension
interface Window {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  __REDUX_DEVTOOLS_EXTENSION__?: () => unknown;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: unknown;
  __isKakaoInApp?: boolean;
  __isKakaoAndroid?: boolean;
  __appLoaded?: boolean;
  __legacyFailed?: boolean;
  performanceStart?: number;
}

// Module declarations
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: Record<string, unknown>;
  export default content;
}

// CSS module types
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Network Information API
interface NetworkInformation {
  readonly downlink: number;
  readonly effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  readonly rtt: number;
  readonly saveData: boolean;
  readonly type?:
    | 'bluetooth'
    | 'cellular'
    | 'ethernet'
    | 'mixed'
    | 'none'
    | 'other'
    | 'unknown'
    | 'wifi'
    | 'wimax';
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

interface Navigator {
  readonly connection?: NetworkInformation;
  readonly mozConnection?: NetworkInformation;
  readonly webkitConnection?: NetworkInformation;
}

// Web Vitals types
interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  navigationType:
    | 'navigate'
    | 'reload'
    | 'back-forward'
    | 'back-forward-cache'
    | 'prerender'
    | 'restore';
}

// Custom event types
interface CustomEventMap {
  languageChanged: CustomEvent<{ language: string }>;
  themeChanged: CustomEvent<{ theme: 'light' | 'dark' | 'system' }>;
  notificationReceived: CustomEvent<{ notification: Notification }>;
}

declare global {
  interface WindowEventMap extends CustomEventMap {}
}
