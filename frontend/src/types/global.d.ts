/// <reference types="vite/client" />

// 환경 변수 타입 정의
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_USE_MOCK_API: string;
  readonly VITE_GA_TRACKING_ID: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Window 객체 확장
interface Window {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  __REDUX_DEVTOOLS_EXTENSION__?: () => unknown;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: unknown;
  workbox?: unknown;
}

// 모듈 선언
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

// CSS 모듈 타입
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Service Worker 타입
interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

// PWA 이벤트 타입
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// 네트워크 정보 API
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

// Web Vitals 타입
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

// 커스텀 이벤트 타입
interface CustomEventMap {
  languageChanged: CustomEvent<{ language: string }>;
  themeChanged: CustomEvent<{ theme: 'light' | 'dark' | 'system' }>;
  notificationReceived: CustomEvent<{ notification: Notification }>;
}

declare global {
  interface WindowEventMap extends CustomEventMap {}
}
