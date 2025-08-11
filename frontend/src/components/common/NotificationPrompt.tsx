import React, { useState, useEffect } from 'react';
import { Bell, X, Settings } from 'lucide-react';
import {
  isPushNotificationSupported,
  requestNotificationPermission,
  subscribeToPushNotifications,
} from '../../utils/pushNotifications';

// Type for notification permission (removed - unused)

interface NotificationPromptProps {
  onClose?: () => void;
  className?: string;
}

interface NotificationSettings {
  blog: boolean;
  contact: boolean;
  system: boolean;
  marketing: boolean;
}

const NotificationPrompt: React.FC<NotificationPromptProps> = ({ onClose, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Permission state tracking removed - using Notification.permission directly
  const [settings, setSettings] = useState<NotificationSettings>({
    blog: true,
    contact: true,
    system: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if notifications are supported and not yet requested
    if (isPushNotificationSupported()) {
      // Permission state is checked directly from Notification.permission

      // Show prompt if permission is default and user hasn't dismissed it recently
      const dismissed = localStorage.getItem('notification-prompt-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      if (Notification.permission === 'default' && daysSinceDismissed > 3) {
        setIsVisible(true);
      }
    }

    // Load saved settings
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      const granted = await requestNotificationPermission();
      // Permission state is checked directly from Notification.permission

      if (granted) {
        // Subscribe to push notifications
        await subscribeToPushNotifications();

        // Save settings to localStorage (server implementation pending)
        localStorage.setItem('notification-settings', JSON.stringify(settings));

        // Show success message
        setIsVisible(false);
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    // Remember that user dismissed the prompt
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Save to localStorage immediately
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
  };

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    try {
      // This would send settings to your backend
      const response = await fetch('/api/notifications/preferences/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification settings');
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      // Still allow local storage to work even if server fails
    }
  };

  if (!isPushNotificationSupported() || !isVisible) {
    return null;
  }

  if (showSettings) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 ${className}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">알림 설정</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="설정 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    블로그 업데이트
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">새 글이 게시될 때 알림</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.blog}
                  onChange={e => handleSettingChange('blog', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    문의 응답
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">문의에 대한 응답 알림</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.contact}
                  onChange={e => handleSettingChange('contact', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    시스템 알림
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">중요한 시스템 업데이트</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.system}
                  onChange={e => handleSettingChange('system', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    마케팅 정보
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    프로모션 및 이벤트 정보
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.marketing}
                  onChange={e => handleSettingChange('marketing', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  saveNotificationSettings(settings);
                  setShowSettings(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg 
                           font-medium transition-colors duration-200"
              >
                저장
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 
                           dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 
                           py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl 
                     p-6 max-w-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            알림 허용하기
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
            새 블로그 글과 중요한 업데이트를 놓치지 마세요. 언제든지 설정에서 변경할 수 있습니다.
          </p>

          <div className="flex space-x-2">
            <button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                         text-white py-2 px-3 rounded text-xs font-medium 
                         transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? '설정 중...' : '허용'}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 transition-colors duration-200"
              aria-label="알림 설정"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={handleDismiss}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 transition-colors duration-200"
              aria-label="나중에"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
