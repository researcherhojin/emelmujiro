import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock i18n
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

// Mock API
const mockGetUnreadCount = vi.fn(() => Promise.resolve({ data: { count: 3 } }));
const mockGetNotifications = vi.fn(() =>
  Promise.resolve({
    data: {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          title: 'Test Notification',
          message: 'Test message',
          level: 'info',
          notification_type: 'system',
          url: '',
          is_read: false,
          read_at: null,
          created_at: '2026-03-18T10:00:00Z',
        },
      ],
    },
  })
);
const mockMarkNotificationRead = vi.fn(() => Promise.resolve({ data: { id: 1, is_read: true } }));
const mockMarkAllNotificationsRead = vi.fn(() => Promise.resolve({ data: { status: 'ok' } }));

vi.mock('../../services/api', () => ({
  api: {
    getUnreadCount: (...args: unknown[]) => mockGetUnreadCount(...args),
    getNotifications: (...args: unknown[]) => mockGetNotifications(...args),
    markNotificationRead: (...args: unknown[]) => mockMarkNotificationRead(...args),
    markAllNotificationsRead: (...args: unknown[]) => mockMarkAllNotificationsRead(...args),
    getUser: vi.fn(() =>
      Promise.resolve({ data: { id: 1, email: 'test@test.com', name: 'Test' } })
    ),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    getBlogPosts: vi.fn(() =>
      Promise.resolve({ data: { count: 0, next: null, previous: null, results: [] } })
    ),
    getBlogPost: vi.fn(),
    searchBlogPosts: vi.fn(),
    getBlogCategories: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  readyState = 1;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn();

  constructor() {
    setTimeout(() => this.onopen?.(), 0);
  }
}

vi.stubGlobal('WebSocket', MockWebSocket);

// Mock sentry
vi.mock('../../utils/sentry', () => ({
  setUserContext: vi.fn(),
  clearUserContext: vi.fn(),
}));

import { useNotification, NotificationProvider } from '../NotificationContext';
import { AuthProvider } from '../AuthContext';

// Test component that exposes context values
const TestConsumer: React.FC = () => {
  const { unreadCount, notifications, loading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotification();

  return (
    <div>
      <span data-testid="unread-count">{unreadCount}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="notifications-count">{notifications.length}</span>
      <button data-testid="fetch" onClick={fetchNotifications}>
        fetch
      </button>
      <button data-testid="mark-read" onClick={() => markAsRead(1)}>
        mark read
      </button>
      <button data-testid="mark-all" onClick={markAllAsRead}>
        mark all
      </button>
    </div>
  );
};

const renderWithNotification = () => {
  // Set auth_hint so AuthContext fetches user
  localStorage.setItem('auth_hint', '1');

  return renderWithProviders(
    <AuthProvider>
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>
    </AuthProvider>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('auth_hint', '1');
  });

  it('fetches unread count on mount when authenticated', async () => {
    renderWithNotification();

    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });
  });

  it('fetches notifications when fetchNotifications is called', async () => {
    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    await act(async () => {
      screen.getByTestId('fetch').click();
    });

    await waitFor(() => {
      expect(mockGetNotifications).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count').textContent).toBe('1');
    });
  });

  it('marks a notification as read', async () => {
    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    await act(async () => {
      screen.getByTestId('mark-read').click();
    });

    await waitFor(() => {
      expect(mockMarkNotificationRead).toHaveBeenCalledWith(1);
    });
  });

  it('marks all notifications as read', async () => {
    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    await act(async () => {
      screen.getByTestId('mark-all').click();
    });

    await waitFor(() => {
      expect(mockMarkAllNotificationsRead).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('0');
    });
  });

  it('does not fetch when not authenticated', async () => {
    localStorage.removeItem('auth_hint');
    mockGetUnreadCount.mockClear();

    renderWithProviders(
      <AuthProvider>
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      </AuthProvider>
    );

    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('0');
    });
  });
});
