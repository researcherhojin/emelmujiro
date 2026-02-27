import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import NotificationPrompt from '../NotificationPrompt';

// Mock push notification utilities
const mockIsPushNotificationSupported = vi.fn();
const mockRequestNotificationPermission = vi.fn();
const mockSubscribeToPushNotifications = vi.fn();

vi.mock('../../../utils/pushNotifications', () => ({
  isPushNotificationSupported: () => mockIsPushNotificationSupported(),
  requestNotificationPermission: () => mockRequestNotificationPermission(),
  subscribeToPushNotifications: () => mockSubscribeToPushNotifications(),
}));

// Mock logger
vi.mock('../../../utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Bell: ({ className }: { className?: string }) => (
    <div data-testid="bell-icon" className={className}>
      Bell
    </div>
  ),
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className}>
      X
    </div>
  ),
  Settings: ({ className }: { className?: string }) => (
    <div data-testid="settings-icon" className={className}>
      Settings
    </div>
  ),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock Notification
const mockNotificationPermission = { value: 'default' };
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: {
    get permission() {
      return mockNotificationPermission.value;
    },
  },
});

describe('NotificationPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockRequestNotificationPermission.mockResolvedValue(true);
    mockSubscribeToPushNotifications.mockResolvedValue({});
    mockNotificationPermission.value = 'default';
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when push notifications are not supported', () => {
    mockIsPushNotificationSupported.mockReturnValue(false);

    const { container } = render(<NotificationPrompt />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when permission is already granted', () => {
    mockNotificationPermission.value = 'granted';

    const { container } = render(<NotificationPrompt />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when permission is denied', () => {
    mockNotificationPermission.value = 'denied';

    const { container } = render(<NotificationPrompt />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the prompt when permission is default and not recently dismissed', () => {
    render(<NotificationPrompt />);

    expect(screen.getByText('notification.enableTitle')).toBeInTheDocument();
    expect(
      screen.getByText('notification.enableDescription')
    ).toBeInTheDocument();
    expect(screen.getByText('notification.allow')).toBeInTheDocument();
  });

  it('does not render prompt when recently dismissed (within 3 days)', () => {
    // Set dismissed time to 1 day ago
    const oneDayAgo = Date.now() - 1000 * 60 * 60 * 24;
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'notification-prompt-dismissed') return oneDayAgo.toString();
      return null;
    });

    const { container } = render(<NotificationPrompt />);
    expect(container.innerHTML).toBe('');
  });

  it('renders prompt when dismissed more than 3 days ago', () => {
    // Set dismissed time to 4 days ago
    const fourDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 4;
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'notification-prompt-dismissed')
        return fourDaysAgo.toString();
      return null;
    });

    render(<NotificationPrompt />);
    expect(screen.getByText('notification.enableTitle')).toBeInTheDocument();
  });

  it('calls onClose and hides prompt when dismissed', () => {
    const onClose = vi.fn();
    render(<NotificationPrompt onClose={onClose} />);

    const dismissButton = screen.getByLabelText('notification.later');
    fireEvent.click(dismissButton);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'notification-prompt-dismissed',
      expect.any(String)
    );
    expect(
      screen.queryByText('notification.enableTitle')
    ).not.toBeInTheDocument();
  });

  it('enables notifications when allow button is clicked', async () => {
    const onClose = vi.fn();
    render(<NotificationPrompt onClose={onClose} />);

    const allowButton = screen.getByText('notification.allow');
    fireEvent.click(allowButton);

    // Should show loading state
    expect(screen.getByText('notification.enabling')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockRequestNotificationPermission).toHaveBeenCalled();
      expect(mockSubscribeToPushNotifications).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('opens settings panel when settings button is clicked', () => {
    render(<NotificationPrompt />);

    const settingsButton = screen.getByLabelText('notification.settings');
    fireEvent.click(settingsButton);

    // Settings panel should be visible
    expect(screen.getByText('notification.blogUpdates')).toBeInTheDocument();
    expect(
      screen.getByText('notification.contactResponse')
    ).toBeInTheDocument();
    expect(screen.getByText('notification.systemAlerts')).toBeInTheDocument();
    expect(screen.getByText('notification.marketing')).toBeInTheDocument();
  });

  it('toggles notification settings checkboxes', () => {
    render(<NotificationPrompt />);

    // Open settings
    const settingsButton = screen.getByLabelText('notification.settings');
    fireEvent.click(settingsButton);

    // All checkboxes should be present
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);

    // Blog, contact, system should be checked; marketing should not
    expect(checkboxes[0]).toBeChecked(); // blog
    expect(checkboxes[1]).toBeChecked(); // contact
    expect(checkboxes[2]).toBeChecked(); // system
    expect(checkboxes[3]).not.toBeChecked(); // marketing

    // Toggle marketing on
    fireEvent.click(checkboxes[3]);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'notification-settings',
      expect.stringContaining('"marketing":true')
    );
  });

  it('closes settings panel when close button is clicked', () => {
    render(<NotificationPrompt />);

    // Open settings
    const settingsButton = screen.getByLabelText('notification.settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('notification.blogUpdates')).toBeInTheDocument();

    // Close settings via close button
    const closeButton = screen.getByLabelText('notification.closeSettings');
    fireEvent.click(closeButton);

    // Should return to the main prompt
    expect(screen.getByText('notification.enableTitle')).toBeInTheDocument();
  });

  it('closes settings panel when cancel button is clicked', () => {
    render(<NotificationPrompt />);

    // Open settings
    const settingsButton = screen.getByLabelText('notification.settings');
    fireEvent.click(settingsButton);

    // Click cancel
    const cancelButton = screen.getByText('notification.cancel');
    fireEvent.click(cancelButton);

    // Should return to the main prompt
    expect(screen.getByText('notification.enableTitle')).toBeInTheDocument();
  });

  it('loads saved notification settings from localStorage', () => {
    const savedSettings = JSON.stringify({
      blog: false,
      contact: true,
      system: false,
      marketing: true,
    });
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'notification-settings') return savedSettings;
      return null;
    });

    render(<NotificationPrompt />);

    // Open settings to check loaded values
    const settingsButton = screen.getByLabelText('notification.settings');
    fireEvent.click(settingsButton);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked(); // blog = false
    expect(checkboxes[1]).toBeChecked(); // contact = true
    expect(checkboxes[2]).not.toBeChecked(); // system = false
    expect(checkboxes[3]).toBeChecked(); // marketing = true
  });

  it('applies custom className', () => {
    const { container } = render(
      <NotificationPrompt className="custom-class" />
    );

    const promptDiv = container.firstChild as HTMLElement;
    expect(promptDiv).toHaveClass('custom-class');
  });
});
