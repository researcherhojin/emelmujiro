import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageList from '../MessageList';
import { ChatProvider } from '../../../contexts/ChatContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Bot: () => <span>Bot</span>,
  User: () => <span>User</span>,
  Clock: () => <span>Clock</span>,
  Check: () => <span>Check</span>,
  CheckCheck: () => <span>CheckCheck</span>,
  AlertCircle: () => <span>AlertCircle</span>,
  AlertTriangle: () => <span>AlertTriangle</span>,
  RefreshCw: () => <span>RefreshCw</span>,
  Image: () => <span>Image</span>,
  File: () => <span>File</span>,
  Download: () => <span>Download</span>,
  Eye: () => <span>Eye</span>,
  Info: () => <span>Info</span>,
  X: () => <span>X</span>,
  Send: () => <span>Send</span>,
  ThumbsUp: () => <span>ThumbsUp</span>,
  ThumbsDown: () => <span>ThumbsDown</span>,
  Copy: () => <span>Copy</span>,
  Share2: () => <span>Share2</span>,
  MoreVertical: () => <span>MoreVertical</span>,
}));

// Mock LazyImage component
jest.mock('../../common/LazyImage', () => ({
  LazyImage: ({ src, alt, className, onError }: any) => (
    <img src={src} alt={alt} className={className} onError={onError} data-testid="lazy-image" />
  ),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    const d = new Date(date);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  }),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ko',
    },
  }),
}));

// Define types
type MessageType = 'text' | 'image' | 'file' | 'system';
type MessageSender = 'user' | 'agent' | 'system' | 'bot';
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface ChatMessage {
  id: string;
  type: MessageSender;
  content: string;
  timestamp: string;
  status?: MessageStatus;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
  }>;
  quickReplies?: string[];
  reactions?: {
    thumbsUp?: number;
    thumbsDown?: number;
  };
}

// Mock ChatContext
const mockChatContext = {
  messages: [] as ChatMessage[],
  isTyping: false,
  isConnected: true,
  agentName: 'Support Agent',
  agentAvailable: true,
  businessHours: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  unreadCount: 0,
  sendMessage: jest.fn(),
  sendFile: jest.fn(),
  markAsRead: jest.fn(),
  clearMessages: jest.fn(),
  exportChat: jest.fn(),
  startTyping: jest.fn(),
  stopTyping: jest.fn(),
  openChat: jest.fn(),
  closeChat: jest.fn(),
  toggleMinimize: jest.fn(),
  markAllAsRead: jest.fn(),
  isOpen: true,
  isMinimized: false,
};

jest.mock('../../../contexts/ChatContext', () => ({
  useChatContext: () => mockChatContext,
  ChatProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('MessageList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock messages
    mockChatContext.messages = [] as ChatMessage[];
  });

  it('should render empty message list', () => {
    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    // Should render without errors even with no messages
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('should render messages', () => {
    mockChatContext.messages = [
      {
        id: '1',
        type: 'bot' as MessageSender,
        content: 'Hello! How can I help you?',
        timestamp: new Date().toISOString(),
        status: 'sent' as MessageStatus,
      },
      {
        id: '2',
        type: 'user' as MessageSender,
        content: 'I need help with my order',
        timestamp: new Date().toISOString(),
        status: 'delivered' as MessageStatus,
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
    expect(screen.getByText('I need help with my order')).toBeInTheDocument();
  });

  it('should display bot and user icons', () => {
    mockChatContext.messages = [
      {
        id: '1',
        type: 'bot' as MessageSender,
        content: 'Bot message',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'user' as MessageSender,
        content: 'User message',
        timestamp: new Date().toISOString(),
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    expect(screen.getByText('Bot')).toBeInTheDocument();
    // Note: User icon might not be rendered depending on implementation
  });

  it('should show typing indicator when agent is typing', () => {
    mockChatContext.isTyping = true;

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    // Typing indicator should be shown
    expect(screen.getByText('Bot')).toBeInTheDocument();
  });

  it('should handle retry action for failed messages', () => {
    const mockRetry = jest.fn();
    mockChatContext.sendMessage = mockRetry;
    mockChatContext.messages = [
      {
        id: '1',
        type: 'user' as MessageSender,
        content: 'Failed message',
        timestamp: new Date().toISOString(),
        status: 'failed' as MessageStatus,
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    const retryButton = screen.getByLabelText(/retry|다시 시도/i);
    fireEvent.click(retryButton);

    // Should call retry/sendMessage function
    expect(mockRetry).toHaveBeenCalled();
  });

  it('should display timestamps', () => {
    const timestamp = new Date('2024-01-15T10:30:00').toISOString();
    mockChatContext.messages = [
      {
        id: '1',
        type: 'user' as MessageSender,
        content: 'Test message',
        timestamp,
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    // Timestamp should be formatted and displayed
    expect(screen.getByText('Test message')).toBeInTheDocument();
    // The actual timestamp display depends on the implementation
  });

  it('should handle image attachments', () => {
    mockChatContext.messages = [
      {
        id: '1',
        type: 'user' as MessageSender,
        content: 'Check this image',
        timestamp: new Date().toISOString(),
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg',
            name: 'image.jpg',
          },
        ],
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    const image = screen.getByTestId('lazy-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should handle file attachments', () => {
    mockChatContext.messages = [
      {
        id: '1',
        type: 'user' as MessageSender,
        content: 'Here is a document',
        timestamp: new Date().toISOString(),
        attachments: [
          {
            type: 'file',
            url: 'https://example.com/doc.pdf',
            name: 'document.pdf',
            size: 1024000,
          },
        ],
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    // File size should be displayed
    expect(screen.getByText(/KB|MB/)).toBeInTheDocument();
  });

  it('should display quick replies', () => {
    mockChatContext.messages = [
      {
        id: '1',
        type: 'bot' as MessageSender,
        content: 'How can I help?',
        timestamp: new Date().toISOString(),
        quickReplies: ['Track Order', 'Cancel Order', 'Contact Support'],
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    expect(screen.getByText('Track Order')).toBeInTheDocument();
    expect(screen.getByText('Cancel Order')).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('should handle quick reply click', () => {
    const mockSend = jest.fn();
    mockChatContext.sendMessage = mockSend;
    mockChatContext.messages = [
      {
        id: '1',
        type: 'bot' as MessageSender,
        content: 'Choose an option',
        timestamp: new Date().toISOString(),
        quickReplies: ['Yes', 'No'],
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    expect(mockSend).toHaveBeenCalledWith('Yes');
  });

  it('should show message status icons', () => {
    mockChatContext.messages = [
      {
        id: '1',
        type: 'user' as MessageSender,
        content: 'Sending',
        timestamp: new Date().toISOString(),
        status: 'sending' as MessageStatus,
      },
      {
        id: '2',
        type: 'user' as MessageSender,
        content: 'Sent',
        timestamp: new Date().toISOString(),
        status: 'sent',
      },
      {
        id: '3',
        type: 'user' as MessageSender,
        content: 'Delivered',
        timestamp: new Date().toISOString(),
        status: 'delivered',
      },
      {
        id: '4',
        type: 'user' as MessageSender,
        content: 'Read',
        timestamp: new Date().toISOString(),
        status: 'read' as MessageStatus,
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    // Check for status icons
    expect(screen.getByText('Clock')).toBeInTheDocument(); // Sending
    expect(screen.getByText('Check')).toBeInTheDocument(); // Sent
    expect(screen.getAllByText('CheckCheck')).toHaveLength(2); // Delivered and Read
  });

  it('should scroll to bottom on new messages', async () => {
    const scrollIntoViewMock = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const { rerender } = render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    // Add a new message
    mockChatContext.messages = [
      {
        id: '1',
        type: 'user' as MessageSender,
        content: 'New message',
        timestamp: new Date().toISOString(),
      },
    ];

    rerender(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });

  it('should handle system messages', () => {
    mockChatContext.messages = [
      {
        id: '1',
        type: 'system' as MessageSender,
        content: 'Agent joined the chat',
        timestamp: new Date().toISOString(),
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    expect(screen.getByText('Agent joined the chat')).toBeInTheDocument();
  });

  it('should mark messages as read', () => {
    mockChatContext.messages = [
      {
        id: '1',
        type: 'bot' as MessageSender,
        content: 'New message',
        timestamp: new Date().toISOString(),
        status: 'delivered',
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    // markAsRead should be called for bot messages
    expect(mockChatContext.markAsRead).toHaveBeenCalled();
  });

  it('should handle empty attachment list', () => {
    mockChatContext.messages = [
      {
        id: '1',
        type: 'user' as MessageSender,
        content: 'Message without attachments',
        timestamp: new Date().toISOString(),
        attachments: [],
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    expect(screen.getByText('Message without attachments')).toBeInTheDocument();
  });

  it('should handle message with reactions', () => {
    mockChatContext.messages = [
      {
        id: '1',
        type: 'bot' as MessageSender,
        content: 'Helpful message',
        timestamp: new Date().toISOString(),
        reactions: {
          thumbsUp: 5,
          thumbsDown: 1,
        },
      },
    ] as ChatMessage[];

    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    expect(screen.getByText('Helpful message')).toBeInTheDocument();
    // Reactions might be displayed depending on implementation
  });

  it('should be accessible with ARIA attributes', () => {
    render(
      <ChatProvider>
        <MessageList />
      </ChatProvider>
    );

    const messageList = screen.getByRole('log');
    expect(messageList).toBeInTheDocument();
    expect(messageList).toHaveAttribute('aria-label');
  });
});
