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
});
