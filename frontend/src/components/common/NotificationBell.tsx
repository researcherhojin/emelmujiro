import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import type { Notification } from '../../types';

// Static Tailwind class maps (no dynamic interpolation — pitfall 15)
const levelColorClasses: Record<string, string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

const levelBgClasses: Record<string, string> = {
  info: 'border-l-blue-500',
  success: 'border-l-green-500',
  warning: 'border-l-yellow-500',
  error: 'border-l-red-500',
};

// Relative time formatting
function getRelativeTime(
  dateString: string,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t('notifications.justNow');
  if (diffMin < 60) return t('notifications.minutesAgo', { count: diffMin });
  if (diffHrs < 24) return t('notifications.hoursAgo', { count: diffHrs });
  return t('notifications.daysAgo', { count: diffDays });
}

// --- Sub-components (same file per component extraction pattern) ---

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
  onNavigate: (url: string) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = memo(
  ({ notification, onRead, onNavigate, t }) => {
    const handleClick = () => {
      if (!notification.is_read) {
        onRead(notification.id);
      }
      if (notification.url) {
        onNavigate(notification.url);
      }
    };

    return (
      <button
        onClick={handleClick}
        className={`w-full text-left px-4 py-3 border-l-4 transition-colors duration-150 focus:outline-none ${
          levelBgClasses[notification.level] || levelBgClasses.info
        } ${
          notification.is_read ? 'bg-white dark:bg-gray-900' : 'bg-blue-50 dark:bg-gray-800'
        } hover:bg-gray-50 dark:hover:bg-gray-800`}
      >
        <div className="flex items-start gap-2">
          <span
            className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
              notification.is_read
                ? 'bg-transparent'
                : levelColorClasses[notification.level] || levelColorClasses.info
            }`}
          />
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm truncate ${
                notification.is_read
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-900 dark:text-white font-medium'
              }`}
            >
              {notification.title}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
              {notification.message}
            </p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
              {getRelativeTime(notification.created_at, t)}
            </p>
          </div>
        </div>
      </button>
    );
  }
);

NotificationItem.displayName = 'NotificationItem';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = memo(({ onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotification();

  const handleRead = useCallback(
    (id: number) => {
      markAsRead(id);
    },
    [markAsRead]
  );

  const handleNavigate = useCallback(
    (url: string) => {
      onClose();
      navigate(url);
    },
    [onClose, navigate]
  );

  // Fetch notifications on panel open
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('notifications.title')}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium focus:outline-none"
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {notifications.length === 0 && !loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            {t('notifications.empty')}
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={handleRead}
              onNavigate={handleNavigate}
              t={t}
            />
          ))
        )}
        {loading && <div className="px-4 py-3 text-center text-xs text-gray-400">...</div>}
      </div>
    </div>
  );
});

NotificationPanel.displayName = 'NotificationPanel';

// --- Main Component ---

const NotificationBell: React.FC = memo(() => {
  const { t } = useTranslation();
  const { unreadCount } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={togglePanel}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
        aria-label={
          unreadCount > 0
            ? t('notifications.bell', { count: unreadCount })
            : t('notifications.title')
        }
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationPanel onClose={closePanel} />}
    </div>
  );
});

NotificationBell.displayName = 'NotificationBell';

export default NotificationBell;
