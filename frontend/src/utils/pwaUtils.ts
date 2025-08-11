// PWA utilities for enhanced features
import logger from './logger';

// App Badge API
export interface BadgeAPI {
  setAppBadge?: (count?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
}

// Check if App Badge API is supported
export function isAppBadgeSupported(): boolean {
  return 'setAppBadge' in navigator;
}

// Set app badge count
export async function setAppBadge(count?: number): Promise<boolean> {
  if (!isAppBadgeSupported()) {
    logger.info('App Badge API not supported');
    return false;
  }

  try {
    const nav = navigator as Navigator & BadgeAPI;
    await nav.setAppBadge!(count);
    logger.info(`App badge set to: ${count || 'flag'}`);
    return true;
  } catch (error) {
    logger.error('Failed to set app badge:', error);
    return false;
  }
}

// Clear app badge
export async function clearAppBadge(): Promise<boolean> {
  if (!isAppBadgeSupported()) {
    return false;
  }

  try {
    const nav = navigator as Navigator & BadgeAPI;
    await nav.clearAppBadge!();
    logger.info('App badge cleared');
    return true;
  } catch (error) {
    logger.error('Failed to clear app badge:', error);
    return false;
  }
}

// Share API
export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

// Check if Web Share API is supported
export function isWebShareSupported(): boolean {
  return 'share' in navigator;
}

// Share content using Web Share API
export async function shareContent(data: ShareData): Promise<boolean> {
  if (!isWebShareSupported()) {
    // Fallback to clipboard or other sharing methods
    return await fallbackShare(data);
  }

  try {
    await navigator.share(data);
    logger.info('Content shared successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logger.info('Share cancelled by user');
    } else {
      logger.error('Failed to share content:', error);
    }
    return false;
  }
}

// Fallback sharing method
async function fallbackShare(data: ShareData): Promise<boolean> {
  try {
    let shareText = '';

    if (data.title) shareText += data.title;
    if (data.text) shareText += (shareText ? '\n' : '') + data.text;
    if (data.url) shareText += (shareText ? '\n' : '') + data.url;

    if ('clipboard' in navigator && 'writeText' in navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      // You could show a toast notification here
      logger.info('Content copied to clipboard');
      return true;
    }

    // Final fallback - try to select text
    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    document.body.appendChild(textArea);
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      logger.info('Content copied to clipboard (fallback)');
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Fallback share failed:', error);
    return false;
  }
}

// Install related utilities
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Check if app is installed (PWA)
export function isPWAInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Check if install prompt is available
export function isInstallPromptAvailable(): boolean {
  return deferredPrompt !== null;
}

// Initialize PWA install prompt
export function initializeInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;

    // Dispatch custom event to notify components
    window.dispatchEvent(
      new CustomEvent('pwa-install-available', {
        detail: { prompt: deferredPrompt },
      })
    );
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    logger.info('PWA installed successfully');

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

// Trigger install prompt
export async function triggerInstallPrompt(): Promise<'accepted' | 'dismissed' | 'not-available'> {
  if (!deferredPrompt) {
    return 'not-available';
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    deferredPrompt = null;

    logger.info(`Install prompt result: ${outcome}`);
    return outcome;
  } catch (error) {
    logger.error('Install prompt error:', error);
    return 'dismissed';
  }
}

// Screen Wake Lock API
export interface WakeLockSentinel {
  release: () => Promise<void>;
  released: boolean;
  type: 'screen';
}

let wakeLock: WakeLockSentinel | null = null;

// Check if Screen Wake Lock API is supported
export function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator;
}

// Request screen wake lock
export async function requestWakeLock(): Promise<boolean> {
  if (!isWakeLockSupported()) {
    logger.info('Screen Wake Lock API not supported');
    return false;
  }

  try {
    type NavigatorWithWakeLock = Navigator & {
      wakeLock?: {
        request: (type: string) => Promise<WakeLockSentinel>;
      };
    };
    wakeLock = (await (navigator as NavigatorWithWakeLock).wakeLock?.request('screen')) || null;

    if (wakeLock) {
      // WakeLockSentinel has onrelease event handler, not addEventListener
      (wakeLock as WakeLockSentinel & { onrelease?: () => void }).onrelease = () => {
        logger.info('Screen wake lock released');
      };

      logger.info('Screen wake lock acquired');
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Failed to acquire screen wake lock:', error);
    return false;
  }
}

// Release screen wake lock
export async function releaseWakeLock(): Promise<boolean> {
  if (!wakeLock) {
    return false;
  }

  try {
    await wakeLock.release();
    wakeLock = null;
    return true;
  } catch (error) {
    logger.error('Failed to release screen wake lock:', error);
    return false;
  }
}

// Device capabilities detection
export interface DeviceCapabilities {
  supportsAppBadge: boolean;
  supportsWebShare: boolean;
  supportsWakeLock: boolean;
  supportsNotifications: boolean;
  supportsBackgroundSync: boolean;
  isInstalled: boolean;
  installPromptAvailable: boolean;
  isOnline: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  platform: string;
}

// Get device capabilities
export function getDeviceCapabilities(): DeviceCapabilities {
  const userAgent = navigator.userAgent.toLowerCase();

  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (/mobile|android|iphone|ipod|phone/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    deviceType = 'tablet';
  }

  return {
    supportsAppBadge: isAppBadgeSupported(),
    supportsWebShare: isWebShareSupported(),
    supportsWakeLock: isWakeLockSupported(),
    supportsNotifications: 'Notification' in window,
    supportsBackgroundSync: 'serviceWorker' in navigator && 'SyncManager' in window,
    isInstalled: isPWAInstalled(),
    installPromptAvailable: isInstallPromptAvailable(),
    isOnline: navigator.onLine,
    deviceType,
    platform: navigator.platform,
  };
}

// Utility to check if running in PWA mode
export function isPWAMode(): boolean {
  return isPWAInstalled();
}

// Initialize all PWA features
export function initializePWA(): void {
  logger.info('Initializing PWA features...');

  // Initialize install prompt
  initializeInstallPrompt();

  // Log device capabilities
  const capabilities = getDeviceCapabilities();
  logger.info('Device capabilities:', capabilities);

  // Clear any stale app badges on startup
  if (capabilities.supportsAppBadge) {
    clearAppBadge();
  }
}

// Performance utilities
export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

// Get performance metrics
export function getPerformanceMetrics(): PerformanceMetrics {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  const firstPaint = paint.find(entry => entry.name === 'first-paint');
  const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint');

  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    firstPaint: firstPaint?.startTime,
    firstContentfulPaint: firstContentfulPaint?.startTime,
    // LCP would be tracked separately via PerformanceObserver
  };
}

const pwaUtils = {
  // Badge API
  isAppBadgeSupported,
  setAppBadge,
  clearAppBadge,

  // Share API
  isWebShareSupported,
  shareContent,

  // Install utilities
  isPWAInstalled,
  isInstallPromptAvailable,
  triggerInstallPrompt,

  // Wake Lock
  isWakeLockSupported,
  requestWakeLock,
  releaseWakeLock,

  // Device capabilities
  getDeviceCapabilities,
  isPWAMode,

  // Initialization
  initializePWA,

  // Performance
  getPerformanceMetrics,
};

export default pwaUtils;
