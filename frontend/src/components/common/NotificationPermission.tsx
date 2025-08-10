import React, { useState, useEffect, memo, useCallback } from 'react';
import { Bell, X } from 'lucide-react';
import {
  isPushNotificationSupported,
  isPushNotificationEnabled,
  requestNotificationPermission,
  subscribeToPushNotifications,
} from '../../utils/pushNotifications';
import logger from '../../utils/logger';

const NotificationPermission: React.FC = memo(() => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);

  useEffect(() => {
    // Check if we should show the notification permission banner
    if (isPushNotificationSupported() && !isPushNotificationEnabled()) {
      // Show banner after 10 seconds on the page
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
    // Return undefined when condition is not met
    return undefined;
  }, []);

  const handleEnableNotifications = useCallback(async () => {
    setIsSubscribing(true);

    try {
      // Request permission
      const granted = await requestNotificationPermission();

      if (granted) {
        // Subscribe to push notifications
        await subscribeToPushNotifications();

        // Send subscription to server (implement this endpoint)
        // await sendSubscriptionToServer(subscription);

        // Push notifications enabled
        setShowBanner(false);

        // Show success notification
        new Notification('알림 활성화 완료!', {
          body: '이제 에멜무지로의 중요한 소식을 받아보실 수 있습니다.',
          icon: '/logo192.png',
        });
      } else {
        // Notification permission denied
      }
    } catch (error) {
      logger.error('Failed to enable notifications:', error);
    } finally {
      setIsSubscribing(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('notificationBannerDismissed', Date.now().toString());
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 
      bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-fade-in"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Bell className="w-6 h-6 text-gray-900" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">알림을 받아보시겠습니까?</h3>
            <p className="text-sm text-gray-600 mb-3">
              새로운 AI 교육 프로그램과 특별 이벤트 소식을 가장 먼저 받아보세요.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleEnableNotifications}
                disabled={isSubscribing}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg
                  hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? '설정 중...' : '알림 받기'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900
                  transition-colors"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

NotificationPermission.displayName = 'NotificationPermission';

export default NotificationPermission;
