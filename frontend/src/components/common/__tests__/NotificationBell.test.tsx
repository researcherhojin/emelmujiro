import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts?.count !== undefined ? `${key}:${opts.count}` : key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock i18n
vi.mock('../../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

// Mock NotificationContext
const mockFetchNotifications = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();

let mockUnreadCount = 5;
let mockNotifications: Array<{
  id: number;
  title: string;
  message: string;
  level: string;
  notification_type: string;
  url: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}> = [];

vi.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({
    notifications: mockNotifications,
    unreadCount: mockUnreadCount,
    loading: false,
    wsConnected: true,
    fetchNotifications: mockFetchNotifications,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
  }),
  NotificationProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import NotificationBell from '../NotificationBell';

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnreadCount = 5;
    mockNotifications = [];
  });

  it('renders bell icon', () => {
    renderWithProviders(<NotificationBell />);
    expect(screen.getByTestId('icon-Bell')).toBeInTheDocument();
  });

  it('shows unread count badge when count > 0', () => {
    renderWithProviders(<NotificationBell />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides badge when count is 0', () => {
    mockUnreadCount = 0;
    renderWithProviders(<NotificationBell />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows 99+ when count exceeds 99', () => {
    mockUnreadCount = 150;
    renderWithProviders(<NotificationBell />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('opens notification panel on click', () => {
    renderWithProviders(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    expect(screen.getByText('notifications.title')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    mockNotifications = [];
    renderWithProviders(<NotificationBell />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('notifications.empty')).toBeInTheDocument();
  });

  it('shows mark all read button when unread > 0', () => {
    renderWithProviders(<NotificationBell />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('notifications.markAllRead')).toBeInTheDocument();
  });

  it('calls markAllAsRead when button is clicked', () => {
    renderWithProviders(<NotificationBell />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('notifications.markAllRead'));

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('renders notification items', () => {
    mockNotifications = [
      {
        id: 1,
        title: 'Test Title',
        message: 'Test message',
        level: 'info',
        notification_type: 'system',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('calls markAsRead when clicking an unread notification', () => {
    mockNotifications = [
      {
        id: 42,
        title: 'Unread Item',
        message: 'Click me',
        level: 'success',
        notification_type: 'blog',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Unread Item'));

    expect(mockMarkAsRead).toHaveBeenCalledWith(42);
  });

  it('has correct aria-label with count', () => {
    renderWithProviders(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    expect(bellButton).toHaveAttribute('aria-label', 'notifications.bell:5');
  });

  it('renders type-specific icon for system notification', () => {
    mockNotifications = [
      {
        id: 1,
        title: 'System Alert',
        message: 'System message',
        level: 'info',
        notification_type: 'system',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    // System type uses Bell icon (rendered as 2 Bell icons: main bell + notification icon)
    const bellIcons = screen.getAllByTestId('icon-Bell');
    expect(bellIcons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders type-specific icon for blog notification', () => {
    mockNotifications = [
      {
        id: 2,
        title: 'New Blog Post',
        message: 'Blog message',
        level: 'info',
        notification_type: 'blog',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('icon-FileText')).toBeInTheDocument();
  });

  it('renders type-specific icon for contact notification', () => {
    mockNotifications = [
      {
        id: 3,
        title: 'New Contact',
        message: 'Contact message',
        level: 'info',
        notification_type: 'contact',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('icon-Mail')).toBeInTheDocument();
  });

  it('renders type-specific icon for admin notification', () => {
    mockNotifications = [
      {
        id: 4,
        title: 'Admin Alert',
        message: 'Admin message',
        level: 'warning',
        notification_type: 'admin',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('icon-ShieldAlert')).toBeInTheDocument();
  });

  // --- New tests for uncovered lines ---

  it('toggles panel closed when bell is clicked again', () => {
    renderWithProviders(<NotificationBell />);

    const bellButton = screen.getByRole('button');

    // Open panel
    fireEvent.click(bellButton);
    expect(screen.getByText('notifications.title')).toBeInTheDocument();

    // Close panel by clicking bell again
    fireEvent.click(bellButton);
    expect(screen.queryByText('notifications.title')).not.toBeInTheDocument();
  });

  it('closes panel on outside click', () => {
    renderWithProviders(<NotificationBell />);

    const bellButton = screen.getByRole('button');

    // Open panel
    fireEvent.click(bellButton);
    expect(screen.getByText('notifications.title')).toBeInTheDocument();

    // Click outside the container
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('notifications.title')).not.toBeInTheDocument();
  });

  it('does not close panel when clicking inside the panel', () => {
    mockNotifications = [
      {
        id: 1,
        title: 'Stay Open',
        message: 'Message',
        level: 'info',
        notification_type: 'system',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);

    // Open panel
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('notifications.title')).toBeInTheDocument();

    // Click inside the panel (on the title)
    fireEvent.mouseDown(screen.getByText('notifications.title'));

    // Panel should still be open
    expect(screen.getByText('notifications.title')).toBeInTheDocument();
  });

  it('does not call markAsRead when clicking an already-read notification', () => {
    mockNotifications = [
      {
        id: 10,
        title: 'Read Item',
        message: 'Already read',
        level: 'info',
        notification_type: 'system',
        url: '',
        is_read: true,
        read_at: '2026-03-20T10:00:00Z',
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Read Item'));

    expect(mockMarkAsRead).not.toHaveBeenCalled();
  });

  it('shows "just now" relative time for recent notifications', () => {
    mockNotifications = [
      {
        id: 1,
        title: 'Recent',
        message: 'Just happened',
        level: 'info',
        notification_type: 'system',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    // t('notifications.justNow') returns 'notifications.justNow'
    expect(screen.getByText('notifications.justNow')).toBeInTheDocument();
  });

  it('shows minutes ago for notification older than 1 minute', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    mockNotifications = [
      {
        id: 1,
        title: 'Minutes Ago',
        message: 'A few minutes old',
        level: 'info',
        notification_type: 'system',
        url: '',
        is_read: false,
        read_at: null,
        created_at: fiveMinAgo,
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    // t('notifications.minutesAgo', { count: 5 }) returns 'notifications.minutesAgo:5'
    expect(screen.getByText('notifications.minutesAgo:5')).toBeInTheDocument();
  });

  it('shows hours ago for notification older than 1 hour', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    mockNotifications = [
      {
        id: 1,
        title: 'Hours Ago',
        message: 'A couple hours old',
        level: 'info',
        notification_type: 'system',
        url: '',
        is_read: false,
        read_at: null,
        created_at: twoHoursAgo,
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('notifications.hoursAgo:2')).toBeInTheDocument();
  });

  it('shows days ago for notification older than 1 day', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    mockNotifications = [
      {
        id: 1,
        title: 'Days Ago',
        message: 'Several days old',
        level: 'info',
        notification_type: 'system',
        url: '',
        is_read: false,
        read_at: null,
        created_at: threeDaysAgo,
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('notifications.daysAgo:3')).toBeInTheDocument();
  });

  it('does not show markAllRead button when unreadCount is 0', () => {
    mockUnreadCount = 0;
    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.queryByText('notifications.markAllRead')).not.toBeInTheDocument();
  });

  it('uses fallback icon for unknown notification type', () => {
    mockNotifications = [
      {
        id: 1,
        title: 'Unknown Type',
        message: 'Unknown',
        level: 'info',
        notification_type: 'unknown_type' as 'system',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    // Falls back to Bell icon (system default) — there should be at least 2 Bell icons
    const bellIcons = screen.getAllByTestId('icon-Bell');
    expect(bellIcons.length).toBeGreaterThanOrEqual(2);
  });

  it('uses fallback level color for unknown level', () => {
    mockNotifications = [
      {
        id: 1,
        title: 'Unknown Level',
        message: 'Unknown level',
        level: 'unknown' as 'info',
        notification_type: 'system',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    // Should render without crashing
    expect(screen.getByText('Unknown Level')).toBeInTheDocument();
  });

  it('has correct aria-label without count when unreadCount is 0', () => {
    mockUnreadCount = 0;
    renderWithProviders(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    expect(bellButton).toHaveAttribute('aria-label', 'notifications.title');
  });

  it('fetches notifications when panel opens', () => {
    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));

    expect(mockFetchNotifications).toHaveBeenCalled();
  });

  it('navigates to notification URL and closes panel when clicking notification with url (lines 72, 149-150)', () => {
    mockNotifications = [
      {
        id: 50,
        title: 'Navigate Me',
        message: 'Has URL',
        level: 'info',
        notification_type: 'blog',
        url: '/blog/42',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);

    // Open panel
    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    // Click the notification with URL
    fireEvent.click(screen.getByText('Navigate Me'));

    // Should mark as read
    expect(mockMarkAsRead).toHaveBeenCalledWith(50);
    // Panel should close (no longer showing notifications.title header)
    expect(screen.queryByText('notifications.title')).not.toBeInTheDocument();
  });

  it('does not navigate when notification has no URL (line 72)', () => {
    mockNotifications = [
      {
        id: 60,
        title: 'No URL Item',
        message: 'No URL',
        level: 'info',
        notification_type: 'system',
        url: '',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    renderWithProviders(<NotificationBell />);

    // Open panel
    fireEvent.click(screen.getByRole('button'));
    // Click the notification without URL
    fireEvent.click(screen.getByText('No URL Item'));

    // Should still mark as read but not crash
    expect(mockMarkAsRead).toHaveBeenCalledWith(60);
  });
});
