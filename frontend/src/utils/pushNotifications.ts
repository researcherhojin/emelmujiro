// Push Notification utilities
import logger from './logger';

const PUBLIC_VAPID_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'YOUR_PUBLIC_VAPID_KEY';

interface NotificationOptions {
  icon?: string;
  badge?: string;
  vibrate?: number[];
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  body?: string;
  data?: any;
}

// URL-safe base64 decode
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Check if user has granted permission
export function isPushNotificationEnabled(): boolean {
  if (!isPushNotificationSupported()) return false;
  return Notification.permission === 'granted';
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    logger.info('Push notifications are not supported in this browser');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(): Promise<PushSubscription> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported');
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY) as any,
      });
    }

    return subscription;
  } catch (error) {
    logger.error('Failed to subscribe to push notifications:', error);
    throw error;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Failed to unsubscribe from push notifications:', error);
    throw error;
  }
}

// Send subscription to server
export async function sendSubscriptionToServer(subscription: PushSubscription): Promise<any> {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }

    return await response.json();
  } catch (error) {
    logger.error('Failed to send subscription to server:', error);
    throw error;
  }
}

// Show local notification
export async function showNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<void> {
  if (!isPushNotificationEnabled()) {
    logger.info('Push notifications are not enabled');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const defaultOptions: NotificationOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      tag: 'emelmujiro-notification',
      renotify: true,
      requireInteraction: false,
      ...options,
    };

    await registration.showNotification(title, defaultOptions);
  } catch (error) {
    logger.error('Failed to show notification:', error);
    throw error;
  }
}
