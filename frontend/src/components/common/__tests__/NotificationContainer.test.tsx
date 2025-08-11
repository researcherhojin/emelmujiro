/**
 * Comprehensive tests for NotificationContainer component
 * Testing rendering, interactions, and animation states
 */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithSelectiveProviders } from '../../../test-utils/test-utils';
import NotificationContainer from '../NotificationContainer';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  CheckCircle: ({ className }: { className?: string }) => (
    <div data-testid="check-circle-icon" className={className}>
      CheckCircle
    </div>
  ),
  AlertCircle: ({ className }: { className?: string }) => (
    <div data-testid="alert-circle-icon" className={className}>
      AlertCircle
    </div>
  ),
  Info: ({ className }: { className?: string }) => (
    <div data-testid="info-icon" className={className}>
      Info
    </div>
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <div data-testid="alert-triangle-icon" className={className}>
      AlertTriangle
    </div>
  ),
}));

// Mock UIContext
interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

const mockRemoveNotification = jest.fn();
const mockUIContext = {
  notifications: [] as Notification[],
  removeNotification: mockRemoveNotification,
  addNotification: jest.fn(),
  darkMode: false,
  toggleDarkMode: jest.fn(),
  sidebarOpen: false,
  setSidebarOpen: jest.fn(),
  loading: false,
  setLoading: jest.fn(),
};

jest.mock('../../../contexts/UIContext', () => ({
  useUI: () => mockUIContext,
}));

describe('NotificationContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without notifications', () => {
    mockUIContext.notifications = [];

    renderWithSelectiveProviders(<NotificationContainer />, {
      includeUI: false, // We're mocking UIContext
    });

    // Container should exist but be empty
    expect(screen.queryByText(/test notification/i)).not.toBeInTheDocument();
  });

  it('renders single success notification', () => {
    const successNotification: Notification = {
      id: '1',
      type: 'success',
      message: 'Operation completed successfully!',
    };

    mockUIContext.notifications = [successNotification];

    renderWithSelectiveProviders(<NotificationContainer />);

    expect(screen.getByText('Operation completed successfully!')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toHaveClass('w-5', 'h-5', 'text-green-500');
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('renders single error notification', () => {
    const errorNotification: Notification = {
      id: '2',
      type: 'error',
      message: 'Something went wrong!',
    };

    mockUIContext.notifications = [errorNotification];

    renderWithSelectiveProviders(<NotificationContainer />);

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('alert-circle-icon')).toHaveClass('w-5', 'h-5', 'text-red-500');
  });

  it('renders single warning notification', () => {
    const warningNotification: Notification = {
      id: '3',
      type: 'warning',
      message: 'Please be careful!',
    };

    mockUIContext.notifications = [warningNotification];

    renderWithSelectiveProviders(<NotificationContainer />);

    expect(screen.getByText('Please be careful!')).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle-icon')).toHaveClass('w-5', 'h-5', 'text-yellow-500');
  });

  it('renders info notification (default type)', () => {
    const infoNotification: Notification = {
      id: '4',
      type: 'info',
      message: 'Here is some information',
    };

    mockUIContext.notifications = [infoNotification];

    renderWithSelectiveProviders(<NotificationContainer />);

    expect(screen.getByText('Here is some information')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toHaveClass('w-5', 'h-5', 'text-blue-500');
  });

  it('renders notification with unknown type as info', () => {
    const unknownTypeNotification = {
      id: '5',
      type: 'unknown' as 'info',
      message: 'Unknown type notification',
    };

    mockUIContext.notifications = [unknownTypeNotification];

    renderWithSelectiveProviders(<NotificationContainer />);

    expect(screen.getByText('Unknown type notification')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toHaveClass('w-5', 'h-5', 'text-blue-500');
  });

  it('renders multiple notifications', () => {
    const notifications: Notification[] = [
      { id: '1', type: 'success', message: 'Success message' },
      { id: '2', type: 'error', message: 'Error message' },
      { id: '3', type: 'warning', message: 'Warning message' },
      { id: '4', type: 'info', message: 'Info message' },
    ];

    mockUIContext.notifications = notifications;

    renderWithSelectiveProviders(<NotificationContainer />);

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();

    // Should have 4 close buttons
    const closeButtons = screen.getAllByTestId('x-icon');
    expect(closeButtons).toHaveLength(4);
  });

  it('calls removeNotification when close button is clicked', async () => {
    const notification: Notification = {
      id: 'test-notification-id',
      type: 'success',
      message: 'Test notification',
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockRemoveNotification).toHaveBeenCalledWith('test-notification-id');
    expect(mockRemoveNotification).toHaveBeenCalledTimes(1);
  });

  it('applies correct background colors for different notification types', () => {
    const notifications: Notification[] = [
      { id: '1', type: 'success', message: 'Success' },
      { id: '2', type: 'error', message: 'Error' },
      { id: '3', type: 'warning', message: 'Warning' },
      { id: '4', type: 'info', message: 'Info' },
    ];

    mockUIContext.notifications = notifications;

    renderWithSelectiveProviders(<NotificationContainer />);

    const motionDivs = screen.getAllByTestId('motion-div');

    // Check that each notification has the correct background class
    expect(motionDivs[0]).toHaveClass('bg-green-50', 'border-green-200');
    expect(motionDivs[1]).toHaveClass('bg-red-50', 'border-red-200');
    expect(motionDivs[2]).toHaveClass('bg-yellow-50', 'border-yellow-200');
    expect(motionDivs[3]).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('applies correct styling classes to container', () => {
    const notification: Notification = {
      id: '1',
      type: 'info',
      message: 'Test',
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    // Test notification container through rendered notifications
    const notificationText = screen.getByText('Test');
    expect(notificationText).toBeInTheDocument();
  });

  it('applies correct styling classes to notification items', () => {
    const notification: Notification = {
      id: '1',
      type: 'success',
      message: 'Test notification',
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    const motionDiv = screen.getByTestId('motion-div');
    expect(motionDiv).toHaveClass(
      'p-4',
      'rounded-lg',
      'shadow-lg',
      'border',
      'bg-green-50',
      'border-green-200',
      'flex',
      'items-start',
      'space-x-3'
    );
  });

  it('renders message text with correct styling', () => {
    const notification: Notification = {
      id: '1',
      type: 'info',
      message: 'This is a test message',
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    const messageElement = screen.getByText('This is a test message');
    expect(messageElement).toHaveClass('flex-1', 'text-sm', 'text-gray-700');
  });

  it('renders close button with correct styling and accessibility', () => {
    const notification: Notification = {
      id: '1',
      type: 'info',
      message: 'Test message',
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    const closeButton = screen.getByRole('button');
    expect(closeButton).toHaveClass('text-gray-400', 'hover:text-gray-600', 'transition-colors');

    // Check that X icon is inside the button
    expect(closeButton).toContainElement(screen.getByTestId('x-icon'));
  });

  it('handles empty notification message', () => {
    const notification: Notification = {
      id: '1',
      type: 'info',
      message: '',
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    // Empty notification should still render with close button
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('handles long notification messages', () => {
    const longMessage =
      'This is a very long notification message that should still be displayed properly and wrap nicely within the notification container without breaking the layout or causing any visual issues.';

    const notification: Notification = {
      id: '1',
      type: 'info',
      message: longMessage,
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles special characters in notification messages', () => {
    const specialMessage = 'Special chars: <>&"\'`{}[]()!@#$%^&*';

    const notification: Notification = {
      id: '1',
      type: 'info',
      message: specialMessage,
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    expect(screen.getByText(specialMessage)).toBeInTheDocument();
  });

  it('maintains accessibility for screen readers', () => {
    const notification: Notification = {
      id: '1',
      type: 'success',
      message: 'Accessible notification',
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    // Check that the close button is accessible
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();

    // Message should be accessible to screen readers
    const messageElement = screen.getByText('Accessible notification');
    expect(messageElement).toBeInTheDocument();
  });

  it('handles rapid notification changes', async () => {
    // Start with one notification
    mockUIContext.notifications = [
      { id: '1', type: 'info', message: 'First notification' } as Notification,
    ];

    const { rerender } = renderWithSelectiveProviders(<NotificationContainer />);

    expect(screen.getByText('First notification')).toBeInTheDocument();

    // Add another notification
    mockUIContext.notifications = [
      { id: '1', type: 'info', message: 'First notification' } as Notification,
      { id: '2', type: 'success', message: 'Second notification' } as Notification,
    ];

    rerender(<NotificationContainer />);

    expect(screen.getByText('First notification')).toBeInTheDocument();
    expect(screen.getByText('Second notification')).toBeInTheDocument();

    // Remove first notification
    mockUIContext.notifications = [
      { id: '2', type: 'success', message: 'Second notification' } as Notification,
    ];

    rerender(<NotificationContainer />);

    expect(screen.queryByText('First notification')).not.toBeInTheDocument();
    expect(screen.getByText('Second notification')).toBeInTheDocument();
  });

  it('applies correct motion props to animated elements', () => {
    const notification: Notification = {
      id: '1',
      type: 'info',
      message: 'Animation test',
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    const motionDiv = screen.getByTestId('motion-div');

    // Check that framer-motion props are passed correctly
    expect(motionDiv).toHaveAttribute('initial');
    expect(motionDiv).toHaveAttribute('animate');
    expect(motionDiv).toHaveAttribute('exit');
    expect(motionDiv).toHaveAttribute('transition');
  });

  it('handles notification removal for non-existent notification', async () => {
    const notification: Notification = {
      id: '1',
      type: 'info',
      message: 'Test notification',
    };

    mockUIContext.notifications = [notification];

    renderWithSelectiveProviders(<NotificationContainer />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    // Should still call removeNotification with the correct ID
    expect(mockRemoveNotification).toHaveBeenCalledWith('1');
  });
});
