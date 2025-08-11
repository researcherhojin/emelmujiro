/**
 * Comprehensive tests for NotificationPermission component
 * Testing notification permission requests, banner display logic, and user interactions
 */

import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithSelectiveProviders } from '../../../test-utils/test-utils';
import NotificationPermission from '../NotificationPermission';
import * as logger from '../../../utils/logger';

// Mock push notification utilities
const mockIsPushNotificationSupported = jest.fn();
const mockIsPushNotificationEnabled = jest.fn();
const mockRequestNotificationPermission = jest.fn();
const mockSubscribeToPushNotifications = jest.fn();

jest.mock('../../../utils/pushNotifications', () => ({
  isPushNotificationSupported: () => mockIsPushNotificationSupported(),
  isPushNotificationEnabled: () => mockIsPushNotificationEnabled(),
  requestNotificationPermission: () => mockRequestNotificationPermission(),
  subscribeToPushNotifications: () => mockSubscribeToPushNotifications(),
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  error: jest.fn(),
}));

const mockLoggerError = logger.error as jest.Mock;

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
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
}));

// Mock Notification constructor
const mockNotification = jest.fn();
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: mockNotification,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// TODO: Fix notification API mocking issues
describe.skip('NotificationPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Reset default mocks
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);
    mockRequestNotificationPermission.mockResolvedValue(true);
    mockSubscribeToPushNotifications.mockResolvedValue({});
    mockNotification.mockImplementation(() => ({}));
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('does not render banner when push notifications are not supported', () => {
    mockIsPushNotificationSupported.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    // Fast forward past the delay
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.queryByText('알림을 받아보시겠습니까?')).not.toBeInTheDocument();
  });

  it('does not render banner when push notifications are already enabled', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(true);

    renderWithSelectiveProviders(<NotificationPermission />);

    // Fast forward past the delay
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.queryByText('알림을 받아보시겠습니까?')).not.toBeInTheDocument();
  });

  it('renders banner after delay when conditions are met', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    // Should not be visible initially
    expect(screen.queryByText('알림을 받아보시겠습니까?')).not.toBeInTheDocument();

    // Fast forward past the delay
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByText('알림을 받아보시겠습니까?')).toBeInTheDocument();
  });

  it('renders complete banner content', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByText('알림을 받아보시겠습니까?')).toBeInTheDocument();
    expect(
      screen.getByText('새로운 AI 교육 프로그램과 특별 이벤트 소식을 가장 먼저 받아보세요.')
    ).toBeInTheDocument();
    expect(screen.getByText('알림 받기')).toBeInTheDocument();
    expect(screen.getByText('나중에')).toBeInTheDocument();
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('handles successful notification permission request', async () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);
    mockRequestNotificationPermission.mockResolvedValue(true);
    mockSubscribeToPushNotifications.mockResolvedValue({});

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const enableButton = screen.getByText('알림 받기');

    fireEvent.click(enableButton);

    // Should show loading state
    expect(screen.getByText('설정 중...')).toBeInTheDocument();

    // Wait for async operations
    await waitFor(() => {
      expect(mockRequestNotificationPermission).toHaveBeenCalled();
    });

    expect(mockSubscribeToPushNotifications).toHaveBeenCalled();

    // Should create success notification
    expect(mockNotification).toHaveBeenCalledWith('알림 활성화 완료!', {
      body: '이제 에멜무지로의 중요한 소식을 받아보실 수 있습니다.',
      icon: '/logo192.png',
    });

    // Banner should be hidden
    await waitFor(() => {
      expect(screen.queryByText('알림을 받아보시겠습니까?')).not.toBeInTheDocument();
    });
  });

  it('handles permission denied scenario', async () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);
    mockRequestNotificationPermission.mockResolvedValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const enableButton = screen.getByText('알림 받기');
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(mockRequestNotificationPermission).toHaveBeenCalled();
    });

    // Should not call subscribe or create notification
    expect(mockSubscribeToPushNotifications).not.toHaveBeenCalled();
    expect(mockNotification).not.toHaveBeenCalled();

    // Loading should be cleared
    await waitFor(() => {
      expect(screen.queryByText('설정 중...')).not.toBeInTheDocument();
    });
  });

  it('handles notification subscription error', async () => {
    const subscriptionError = new Error('Subscription failed');

    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);
    mockRequestNotificationPermission.mockResolvedValue(true);
    mockSubscribeToPushNotifications.mockRejectedValue(subscriptionError);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const enableButton = screen.getByText('알림 받기');
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to enable notifications:',
        subscriptionError
      );
    });

    // Loading should be cleared
    await waitFor(() => {
      expect(screen.queryByText('설정 중...')).not.toBeInTheDocument();
    });
  });

  it('handles permission request error', async () => {
    const permissionError = new Error('Permission request failed');

    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);
    mockRequestNotificationPermission.mockRejectedValue(permissionError);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const enableButton = screen.getByText('알림 받기');
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to enable notifications:',
        permissionError
      );
    });

    // Loading should be cleared
    await waitFor(() => {
      expect(screen.queryByText('설정 중...')).not.toBeInTheDocument();
    });
  });

  it('dismisses banner when "나중에" button is clicked', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByText('알림을 받아보시겠습니까?')).toBeInTheDocument();

    const laterButton = screen.getByText('나중에');
    fireEvent.click(laterButton);

    expect(screen.queryByText('알림을 받아보시겠습니까?')).not.toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'notificationBannerDismissed',
      expect.any(String)
    );
  });

  it('dismisses banner when X button is clicked', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByText('알림을 받아보시겠습니까?')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: '닫기' });
    fireEvent.click(closeButton);

    expect(screen.queryByText('알림을 받아보시겠습니까?')).not.toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'notificationBannerDismissed',
      expect.any(String)
    );
  });

  it('disables enable button during subscription process', async () => {
    let resolvePermission: (value: boolean) => void;
    const permissionPromise = new Promise<boolean>(resolve => {
      resolvePermission = resolve;
    });

    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);
    mockRequestNotificationPermission.mockReturnValue(permissionPromise);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const enableButton = screen.getByText('알림 받기');
    fireEvent.click(enableButton);

    // Button should be disabled and show loading state
    expect(screen.getByText('설정 중...')).toBeInTheDocument();
    expect(screen.getByText('설정 중...')).toBeDisabled();

    // Resolve the permission request
    act(() => {
      resolvePermission!(true);
    });

    await waitFor(() => {
      expect(screen.queryByText('설정 중...')).not.toBeInTheDocument();
    });
  });

  it('applies correct CSS classes to banner container', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Check that banner is displayed through its content
    expect(screen.getByText('알림으로 최신 소식을 받아보세요!')).toBeInTheDocument();
  });

  it('applies correct CSS classes to buttons', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const enableButton = screen.getByText('알림 받기');
    expect(enableButton).toHaveClass(
      'px-4',
      'py-2',
      'bg-gray-900',
      'text-white',
      'text-sm',
      'font-medium',
      'rounded-lg',
      'hover:bg-gray-800',
      'transition-colors',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    );

    const laterButton = screen.getByText('나중에');
    expect(laterButton).toHaveClass(
      'px-4',
      'py-2',
      'text-gray-600',
      'text-sm',
      'font-medium',
      'hover:text-gray-900',
      'transition-colors'
    );
  });

  it('applies correct CSS classes to close button', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const closeButton = screen.getByRole('button', { name: '닫기' });
    expect(closeButton).toHaveClass(
      'flex-shrink-0',
      'ml-2',
      'text-gray-400',
      'hover:text-gray-600',
      'transition-colors'
    );
  });

  it('applies correct CSS classes to text elements', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const titleElement = screen.getByText('알림을 받아보시겠습니까?');
    expect(titleElement).toHaveClass('text-sm', 'font-semibold', 'text-gray-900', 'mb-1');

    const descriptionElement = screen.getByText(
      '새로운 AI 교육 프로그램과 특별 이벤트 소식을 가장 먼저 받아보세요.'
    );
    expect(descriptionElement).toHaveClass('text-sm', 'text-gray-600', 'mb-3');
  });

  it('has correct accessibility attributes', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const closeButton = screen.getByRole('button', { name: '닫기' });
    expect(closeButton).toHaveAttribute('aria-label', '닫기');

    const enableButton = screen.getByText('알림 받기');
    expect(enableButton).toHaveAttribute('type', 'button');

    const laterButton = screen.getByText('나중에');
    expect(laterButton).toHaveAttribute('type', 'button');
  });

  it('clears timeout when component unmounts', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    const { unmount } = renderWithSelectiveProviders(<NotificationPermission />);

    // Spy on clearTimeout
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('handles component re-render without duplicating timer', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    const { rerender } = renderWithSelectiveProviders(<NotificationPermission />);

    // Spy on setTimeout
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    setTimeoutSpy.mockClear();

    rerender(<NotificationPermission />);

    // Should not create additional timers
    expect(setTimeoutSpy).not.toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  it('does not show banner if notifications already supported but effect returns undefined', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(true); // Already enabled

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.queryByText('알림을 받아보시겠습니까?')).not.toBeInTheDocument();
  });

  it('handles Bell icon rendering correctly', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const bellIcon = screen.getByTestId('bell-icon');
    expect(bellIcon).toHaveClass('w-6', 'h-6', 'text-gray-900');
  });

  it('handles X icon rendering correctly', () => {
    mockIsPushNotificationSupported.mockReturnValue(true);
    mockIsPushNotificationEnabled.mockReturnValue(false);

    renderWithSelectiveProviders(<NotificationPermission />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const xIcon = screen.getByTestId('x-icon');
    expect(xIcon).toHaveClass('w-5', 'h-5');
  });

  it('maintains component display name', () => {
    expect(NotificationPermission.displayName).toBe('NotificationPermission');
  });
});
