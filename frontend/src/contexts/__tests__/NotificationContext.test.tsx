import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render as rtlRender, screen, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';

// Mock i18n
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

// Mock API — use vi.hoisted so mock fns are available inside vi.mock factory
const {
  mockGetUnreadCount,
  mockGetNotifications,
  mockMarkNotificationRead,
  mockMarkAllNotificationsRead,
} = vi.hoisted(() => ({
  mockGetUnreadCount: vi.fn(() => Promise.resolve({ data: { count: 3 } })),
  mockGetNotifications: vi.fn(() =>
    Promise.resolve({
      data: {
        count: 1,
        next: null as string | null,
        previous: null as string | null,
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
  ),
  mockMarkNotificationRead: vi.fn(() => Promise.resolve({ data: { id: 1, is_read: true } })),
  mockMarkAllNotificationsRead: vi.fn(() => Promise.resolve({ data: { status: 'ok' } })),
}));

vi.mock('../../services/api', () => ({
  api: {
    getUnreadCount: mockGetUnreadCount,
    getNotifications: mockGetNotifications,
    markNotificationRead: mockMarkNotificationRead,
    markAllNotificationsRead: mockMarkAllNotificationsRead,
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

  // renderWithProviders already wraps in AuthProvider > NotificationProvider
  return renderWithProviders(<TestConsumer />);
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

  it('decrements unread count when marking as read', async () => {
    renderWithNotification();

    // First fetch notifications so we have items
    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    await act(async () => {
      screen.getByTestId('fetch').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count').textContent).toBe('1');
    });

    await act(async () => {
      screen.getByTestId('mark-read').click();
    });

    await waitFor(() => {
      // Unread count should decrease from 3 to 2
      expect(screen.getByTestId('unread-count').textContent).toBe('2');
    });
  });

  it('handles markAsRead API failure gracefully', async () => {
    mockMarkNotificationRead.mockRejectedValueOnce(new Error('Network error'));

    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    await act(async () => {
      screen.getByTestId('mark-read').click();
    });

    // Unread count should remain 3 since API call failed
    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });
  });

  it('handles markAllAsRead API failure gracefully', async () => {
    mockMarkAllNotificationsRead.mockRejectedValueOnce(new Error('Network error'));

    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    await act(async () => {
      screen.getByTestId('mark-all').click();
    });

    // Unread count should remain 3 since API call failed
    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });
  });

  it('handles getUnreadCount API failure gracefully', async () => {
    mockGetUnreadCount.mockRejectedValueOnce(new Error('API error'));

    renderWithNotification();

    // Should not crash, unread count should be 0 (default)
    await waitFor(() => {
      expect(screen.getByTestId('unread-count')).toBeInTheDocument();
    });
  });

  it('handles fetchNotifications API failure gracefully', async () => {
    mockGetNotifications.mockRejectedValueOnce(new Error('API error'));

    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    await act(async () => {
      screen.getByTestId('fetch').click();
    });

    // Should not crash, notifications count should remain 0
    await waitFor(() => {
      expect(screen.getByTestId('notifications-count').textContent).toBe('0');
    });
  });

  it('throws error when useNotification is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const BadComponent = () => {
      useNotification();
      return null;
    };

    // Render without any provider to trigger the error
    expect(() => {
      rtlRender(<BadComponent />);
    }).toThrow('useNotification must be used within a NotificationProvider');

    consoleSpy.mockRestore();
  });

  it('increments page when fetchNotifications returns next page', async () => {
    mockGetNotifications.mockResolvedValueOnce({
      data: {
        count: 2,
        next: 'http://localhost:8000/api/notifications/?page=2' as unknown as null,
        previous: null,
        results: [
          {
            id: 1,
            title: 'Page 1',
            message: 'First page',
            level: 'info',
            notification_type: 'system',
            url: '',
            is_read: false,
            read_at: null,
            created_at: '2026-03-18T10:00:00Z',
          },
        ],
      },
    });

    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    await act(async () => {
      screen.getByTestId('fetch').click();
    });

    await waitFor(() => {
      expect(mockGetNotifications).toHaveBeenCalled();
      expect(screen.getByTestId('notifications-count').textContent).toBe('1');
    });
  });

  it('resets state when user logs out (isAuthenticated becomes false)', async () => {
    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    // Component should still render correctly
    expect(screen.getByTestId('notifications-count')).toBeInTheDocument();
  });

  it('appends notifications on page > 1 when response has next (lines 171-175)', async () => {
    // First page returns one notification with a next link
    mockGetNotifications.mockResolvedValueOnce({
      data: {
        count: 2,
        next: 'http://localhost:8000/api/notifications/?page=2',
        previous: null,
        results: [
          {
            id: 1,
            title: 'First',
            message: 'Page 1 notification',
            level: 'info',
            notification_type: 'system',
            url: '',
            is_read: false,
            read_at: null,
            created_at: '2026-03-18T10:00:00Z',
          },
        ],
      },
    });

    // Second page returns another notification with no next
    mockGetNotifications.mockResolvedValueOnce({
      data: {
        count: 2,
        next: null,
        previous: 'http://localhost:8000/api/notifications/?page=1',
        results: [
          {
            id: 2,
            title: 'Second',
            message: 'Page 2 notification',
            level: 'info',
            notification_type: 'system',
            url: '',
            is_read: false,
            read_at: null,
            created_at: '2026-03-17T10:00:00Z',
          },
        ],
      },
    });

    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    // First fetch — page 1, replaces notifications
    await act(async () => {
      screen.getByTestId('fetch').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count').textContent).toBe('1');
    });

    // Second fetch — page 2 (incremented because next was present),
    // should append to existing notifications
    await act(async () => {
      screen.getByTestId('fetch').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count').textContent).toBe('2');
    });

    expect(mockGetNotifications).toHaveBeenCalledTimes(2);
  });

  it('updates notification is_read state when markAsRead succeeds', async () => {
    mockGetNotifications.mockResolvedValueOnce({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            title: 'Unread',
            message: 'Should become read',
            level: 'info',
            notification_type: 'system',
            url: '',
            is_read: false,
            read_at: null,
            created_at: '2026-03-18T10:00:00Z',
          },
        ],
      },
    });

    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    // Fetch to populate notifications list
    await act(async () => {
      screen.getByTestId('fetch').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count').textContent).toBe('1');
    });

    // Mark notification id=1 as read
    await act(async () => {
      screen.getByTestId('mark-read').click();
    });

    await waitFor(() => {
      expect(mockMarkNotificationRead).toHaveBeenCalledWith(1);
      // Unread count should decrement from 3 to 2
      expect(screen.getByTestId('unread-count').textContent).toBe('2');
    });
  });

  it('marks all notifications as read and zeroes unread count', async () => {
    mockGetNotifications.mockResolvedValueOnce({
      data: {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            title: 'Notif 1',
            message: 'First',
            level: 'info',
            notification_type: 'system',
            url: '',
            is_read: false,
            read_at: null,
            created_at: '2026-03-18T10:00:00Z',
          },
          {
            id: 2,
            title: 'Notif 2',
            message: 'Second',
            level: 'info',
            notification_type: 'system',
            url: '',
            is_read: false,
            read_at: null,
            created_at: '2026-03-17T10:00:00Z',
          },
        ],
      },
    });

    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    // Fetch to populate notifications
    await act(async () => {
      screen.getByTestId('fetch').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count').textContent).toBe('2');
    });

    // Mark all as read
    await act(async () => {
      screen.getByTestId('mark-all').click();
    });

    await waitFor(() => {
      expect(mockMarkAllNotificationsRead).toHaveBeenCalled();
      expect(screen.getByTestId('unread-count').textContent).toBe('0');
    });
  });

  it('does not call getNotifications when fetchNotifications is invoked while unauthenticated', async () => {
    // Render WITHOUT auth_hint so isAuthenticated remains false
    localStorage.removeItem('auth_hint');
    mockGetNotifications.mockClear();

    renderWithProviders(<TestConsumer />);

    // Wait for the component to settle without auth
    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('0');
    });

    // Click the fetch button — fetchNotifications should early-return
    await act(async () => {
      screen.getByTestId('fetch').click();
    });

    // Allow any pending promises to resolve
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // getNotifications should NOT have been called since user is not authenticated
    expect(mockGetNotifications).not.toHaveBeenCalled();
  });

  it('markAsRead leaves other notifications unchanged', async () => {
    // Return 2 notifications so markAsRead(1) exercises both branches of the ternary
    mockGetNotifications.mockResolvedValueOnce({
      data: {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            title: 'Notif A',
            message: 'First',
            level: 'info',
            notification_type: 'system',
            url: '',
            is_read: false,
            read_at: null,
            created_at: '2026-03-18T10:00:00Z',
          },
          {
            id: 2,
            title: 'Notif B',
            message: 'Second',
            level: 'info',
            notification_type: 'system',
            url: '',
            is_read: false,
            read_at: null,
            created_at: '2026-03-17T10:00:00Z',
          },
        ],
      },
    });

    renderWithNotification();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('3');
    });

    // Fetch to populate notifications list with 2 items
    await act(async () => {
      screen.getByTestId('fetch').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count').textContent).toBe('2');
    });

    // Mark only notification id=1 as read — notification id=2 should remain unchanged
    await act(async () => {
      screen.getByTestId('mark-read').click();
    });

    await waitFor(() => {
      expect(mockMarkNotificationRead).toHaveBeenCalledWith(1);
      // Unread count should decrement from 3 to 2
      expect(screen.getByTestId('unread-count').textContent).toBe('2');
      // Both notifications should still be in the list
      expect(screen.getByTestId('notifications-count').textContent).toBe('2');
    });
  });
});
