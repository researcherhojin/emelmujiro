import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import env from '../config/env';
import logger from '../utils/logger';
import type { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  wsConnected: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY = 1000;

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const closeWebSocket = useCallback(() => {
    clearReconnectTimer();
    reconnectAttemptsRef.current = 0;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setWsConnected(false);
  }, [clearReconnectTimer]);

  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `${env.WS_URL}/notifications/`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'notification') {
            const newNotification: Notification = {
              id: data.id,
              title: data.title,
              message: data.message,
              level: data.level || 'info',
              notification_type: 'system',
              url: data.url || '',
              is_read: false,
              read_at: null,
              created_at: data.timestamp,
            };
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          } else if (data.type === 'notification_update') {
            setUnreadCount(data.count);
          }
        } catch {
          logger.error('Failed to parse WebSocket message');
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        wsRef.current = null;

        if (isAuthenticated && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = () => {
        // onclose will fire after onerror, handling reconnect there
      };
    } catch {
      logger.error('Failed to create WebSocket connection');
    }
  }, [isAuthenticated]);

  // Fetch unread count on mount when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setCurrentPage(1);
      closeWebSocket();
      return;
    }

    const fetchInitialData = async () => {
      try {
        const response = await api.getUnreadCount();
        setUnreadCount(response.data.count);
      } catch {
        // Silently fail — user may not have notification permissions yet
      }
    };

    fetchInitialData();
    connectWebSocket();

    return () => {
      closeWebSocket();
    };
  }, [isAuthenticated, connectWebSocket, closeWebSocket]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await api.getNotifications(currentPage);
      const newNotifications = response.data.results;
      setNotifications((prev) =>
        currentPage === 1 ? newNotifications : [...prev, ...newNotifications]
      );
      if (response.data.next) {
        setCurrentPage((prev) => prev + 1);
      }
    } catch {
      logger.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentPage]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'mark_read', notification_id: id }));
      }
    } catch {
      logger.error('Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'mark_all_read' }));
      }
    } catch {
      logger.error('Failed to mark all notifications as read');
    }
  }, []);

  const value = useMemo<NotificationContextType>(
    () => ({
      notifications,
      unreadCount,
      loading,
      wsConnected,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      wsConnected,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
