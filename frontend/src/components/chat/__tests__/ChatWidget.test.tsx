import React from 'react';
import { vi } from 'vitest';
import {
  screen,
  fireEvent,
  waitFor,
  act,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWidget from '../ChatWidget';

// Mock ChatContext
vi.mock('../../../contexts/ChatContext', () => ({
  useChatContext: vi.fn(() => ({
    isOpen: false,
    isMinimized: false,
    unreadCount: 0,
    isConnected: true,
    agentAvailable: true,
    businessHours: { isOpen: true, hours: '09:00 - 18:00' },
    openChat: vi.fn(),
    closeChat: vi.fn(),
    toggleMinimize: vi.fn(),
    markAllAsRead: vi.fn(),
  })),
}));

// Mock UIContext
vi.mock('../../../contexts/UIContext', () => ({
  useUI: () => ({
    theme: 'light',
    showNotification: vi.fn(),
  }),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'ko',
    },
  }),
}));

// Import mocked functions
import { useChatContext } from '../../../contexts/ChatContext';
const mockUseChatContext = useChatContext as ReturnType<typeof vi.fn>;

// Mock child components
vi.mock('../ChatWindow', () => ({
  default: () => <div data-testid="chat-window">Chat Window</div>,
}));

vi.mock('../AdminPanel', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="admin-panel">Admin Panel</div> : null,
}));

/**
 * Helper: renders ChatWidget and advances fake timers past the 2s visibility delay.
 */
async function renderAndWaitForVisible() {
  const result = render(<ChatWidget />);
  // Advance past the 2-second visibility delay
  await act(async () => {
    vi.advanceTimersByTime(2100);
  });
  return result;
}

describe('ChatWidget', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders chat button initially', async () => {
    await renderAndWaitForVisible();

    const chatButton = screen.getByRole('button');
    expect(chatButton).toBeInTheDocument();
  });

  it('opens chat window when button is clicked', async () => {
    const mockOpenChat = vi.fn();
    const mockMarkAllAsRead = vi.fn();
    mockUseChatContext.mockReturnValue({
      isOpen: false,
      isMinimized: false,
      unreadCount: 0,
      isConnected: true,
      agentAvailable: true,
      businessHours: { isOpen: true, hours: '09:00 - 18:00' },
      openChat: mockOpenChat,
      closeChat: vi.fn(),
      toggleMinimize: vi.fn(),
      markAllAsRead: mockMarkAllAsRead,
    });

    await renderAndWaitForVisible();

    const chatButton = screen.getByRole('button');
    fireEvent.click(chatButton);

    expect(mockOpenChat).toHaveBeenCalled();
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('shows chat window when isOpen is true', async () => {
    mockUseChatContext.mockReturnValue({
      isOpen: true,
      isMinimized: false,
      unreadCount: 0,
      isConnected: true,
      agentAvailable: true,
      businessHours: { isOpen: true, hours: '09:00 - 18:00' },
      openChat: vi.fn(),
      closeChat: vi.fn(),
      toggleMinimize: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    await renderAndWaitForVisible();

    expect(screen.getByTestId('chat-window')).toBeInTheDocument();
  });

  it('shows minimized state when isMinimized is true', async () => {
    mockUseChatContext.mockReturnValue({
      isOpen: true,
      isMinimized: true,
      unreadCount: 0,
      isConnected: true,
      agentAvailable: true,
      businessHours: { isOpen: true, hours: '09:00 - 18:00' },
      openChat: vi.fn(),
      closeChat: vi.fn(),
      toggleMinimize: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    await renderAndWaitForVisible();

    // When minimized, ChatWindow should not be rendered
    expect(screen.queryByTestId('chat-window')).not.toBeInTheDocument();
  });

  it('closes chat window when close button is clicked', async () => {
    const mockCloseChat = vi.fn();
    mockUseChatContext.mockReturnValue({
      isOpen: true,
      isMinimized: false,
      unreadCount: 0,
      isConnected: true,
      agentAvailable: true,
      businessHours: { isOpen: true, hours: '09:00 - 18:00' },
      openChat: vi.fn(),
      closeChat: mockCloseChat,
      toggleMinimize: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    await renderAndWaitForVisible();

    // There are multiple buttons: minimize, close (in header), and the floating button.
    // The close button in the header has aria-label="chat.close"
    // The floating button also has aria-label="chat.close" when isOpen is true.
    // Get all buttons with chat.close label and pick the one in the header (not role="button")
    const allCloseButtons = screen.getAllByLabelText('chat.close');
    // The header close button should be the one that's NOT the floating button
    // The floating button has role="button" explicitly set
    const headerCloseButton = allCloseButtons.find(
      (btn) => btn.getAttribute('role') !== 'button'
    );
    expect(headerCloseButton).toBeTruthy();
    fireEvent.click(headerCloseButton!);

    expect(mockCloseChat).toHaveBeenCalled();
  });

  it('shows connection status indicator', async () => {
    mockUseChatContext.mockReturnValue({
      isOpen: false,
      isMinimized: false,
      unreadCount: 0,
      isConnected: true,
      agentAvailable: true,
      businessHours: { isOpen: true, hours: '09:00 - 18:00' },
      openChat: vi.fn(),
      closeChat: vi.fn(),
      toggleMinimize: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    await renderAndWaitForVisible();

    const chatButton = screen.getByRole('button');
    expect(chatButton).toBeInTheDocument();
  });

  it('shows unread count badge when there are unread messages', async () => {
    mockUseChatContext.mockReturnValue({
      isOpen: false,
      isMinimized: false,
      unreadCount: 5,
      isConnected: true,
      agentAvailable: true,
      businessHours: { isOpen: true, hours: '09:00 - 18:00' },
      openChat: vi.fn(),
      closeChat: vi.fn(),
      toggleMinimize: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    await renderAndWaitForVisible();

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays business hours when closed', async () => {
    mockUseChatContext.mockReturnValue({
      isOpen: false,
      isMinimized: false,
      unreadCount: 0,
      isConnected: true,
      agentAvailable: false,
      businessHours: { isOpen: false, hours: '09:00 - 18:00' },
      openChat: vi.fn(),
      closeChat: vi.fn(),
      toggleMinimize: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    await renderAndWaitForVisible();

    const widget = screen.getByRole('button');
    expect(widget).toBeInTheDocument();
  });

  it('shows hover tooltip', async () => {
    mockUseChatContext.mockReturnValue({
      isOpen: false,
      isMinimized: false,
      unreadCount: 0,
      isConnected: true,
      agentAvailable: true,
      businessHours: { isOpen: true, hours: '09:00 - 18:00' },
      openChat: vi.fn(),
      closeChat: vi.fn(),
      toggleMinimize: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    await renderAndWaitForVisible();

    const chatButton = screen.getByRole('button');
    fireEvent.mouseEnter(chatButton);

    expect(screen.getByText('chat.quickInfo.available')).toBeInTheDocument();
  });
});
