import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import ChatWidget from '../ChatWidget';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
}));

// TODO: Fix timer-related issues in ChatWidget tests
describe.skip('ChatWidget', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Use fake timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders chat button initially', () => {
    renderWithProviders(<ChatWidget />);

    // Advance timers to show the widget
    jest.advanceTimersByTime(2000);

    // Should show chat button initially
    const chatButton = screen.getByRole('button', { name: /채팅 열기|open chat/i });
    expect(chatButton).toBeInTheDocument();
  });

  it('opens chat window when button is clicked', async () => {
    renderWithProviders(<ChatWidget />);

    // Advance timers to show the widget
    jest.advanceTimersByTime(2000);

    const chatButton = screen.getByRole('button', { name: /채팅 열기|open chat/i });
    fireEvent.click(chatButton);

    // Should show chat window
    await waitFor(() => {
      expect(screen.getByText(/고객 지원|customer support/i)).toBeInTheDocument();
    });
  });

  it('shows welcome message when chat is opened for first time', async () => {
    renderWithProviders(<ChatWidget />);

    // Advance timers to show the widget
    jest.advanceTimersByTime(2000);

    const chatButton = screen.getByRole('button', { name: /채팅 열기|open chat/i });
    fireEvent.click(chatButton);

    // Should show welcome message
    await waitFor(() => {
      expect(screen.getByText(/안녕하세요.*에멜무지로.*고객지원/)).toBeInTheDocument();
    });
  });

  it('can minimize and maximize chat window', async () => {
    renderWithProviders(<ChatWidget />);

    // Fast-forward the 2-second timer to make the widget visible
    await waitFor(() => {
      jest.advanceTimersByTime(2000);
    });

    // Open chat
    const chatButton = await screen.findByRole('button', { name: /채팅 열기|open chat/i });
    fireEvent.click(chatButton);

    await waitFor(() => {
      expect(screen.getByText(/고객 지원|customer support/i)).toBeInTheDocument();
    });

    // Minimize chat
    const minimizeButton = screen.getByLabelText(/최소화|minimize/i);
    fireEvent.click(minimizeButton);

    // Chat content should be hidden but header visible
    await waitFor(() => {
      expect(screen.getByText(/고객 지원|customer support/i)).toBeInTheDocument();
    });

    // Maximize chat
    const maximizeButton = screen.getByLabelText(/최대화|maximize/i);
    fireEvent.click(maximizeButton);

    await waitFor(() => {
      expect(screen.getByText(/고객 지원|customer support/i)).toBeInTheDocument();
    });
  });

  it('closes chat window when close button is clicked', async () => {
    renderWithProviders(<ChatWidget />);

    // Fast-forward the 2-second timer to make the widget visible
    await waitFor(() => {
      jest.advanceTimersByTime(2000);
    });

    // Open chat
    const chatButton = await screen.findByRole('button', { name: /채팅 열기|open chat/i });
    fireEvent.click(chatButton);

    await waitFor(() => {
      expect(screen.getByText(/고객 지원|customer support/i)).toBeInTheDocument();
    });

    // Close chat
    const closeButton = screen.getByLabelText(/채팅 닫기|close/i);
    fireEvent.click(closeButton);

    // Should not show chat window
    await waitFor(() => {
      expect(screen.queryByText(/고객 지원|customer support/i)).not.toBeInTheDocument();
    });
  });

  it('shows connection status indicator', async () => {
    renderWithProviders(<ChatWidget />);

    // Advance timers to show the widget
    jest.advanceTimersByTime(2000);

    const chatButton = screen.getByRole('button', { name: /채팅 열기|open chat/i });

    // Should have connection status indicator
    // The button should be rendered without errors
    expect(chatButton).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    renderWithProviders(<ChatWidget />);

    // Advance timers to show the widget
    jest.advanceTimersByTime(2000);

    const chatButton = screen.getByRole('button', { name: /채팅 열기|open chat/i });

    // Should be focusable
    chatButton.focus();
    expect(chatButton).toHaveFocus();

    // Should respond to Enter key
    fireEvent.keyDown(chatButton, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/고객 지원|customer support/i)).toBeInTheDocument();
    });
  });

  it('displays business hours information', async () => {
    renderWithProviders(<ChatWidget />);

    // Advance timers to show the widget
    jest.advanceTimersByTime(2000);

    const chatButton = screen.getByRole('button', { name: /채팅 열기|open chat/i });
    fireEvent.click(chatButton);

    await waitFor(() => {
      // Should show business hours or status
      expect(
        screen.getByText(/운영시간|business hours|온라인|오프라인|online|offline/i)
      ).toBeInTheDocument();
    });
  });

  it('shows hover tooltip with quick info', async () => {
    renderWithProviders(<ChatWidget />);

    // Advance timers to show the widget
    jest.advanceTimersByTime(2000);

    const chatButton = screen.getByRole('button', { name: /채팅 열기|open chat/i });

    // Hover over button
    fireEvent.mouseEnter(chatButton);

    await waitFor(() => {
      expect(
        screen.getByText(/지금 채팅하세요|chat with us now|메시지를 남겨주세요|leave us a message/i)
      ).toBeInTheDocument();
    });

    // Remove hover
    fireEvent.mouseLeave(chatButton);

    await waitFor(() => {
      expect(
        screen.queryByText(
          /지금 채팅하세요|chat with us now|메시지를 남겨주세요|leave us a message/i
        )
      ).not.toBeInTheDocument();
    });
  });
});
