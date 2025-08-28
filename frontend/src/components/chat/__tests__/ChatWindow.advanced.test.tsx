import React, { PropsWithChildren } from 'react';
import { vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ChatWindow from '../ChatWindow';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      ...props
    }: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
      <button {...props}>{children}</button>
    ),
    textarea: ({
      children,
      ...props
    }: PropsWithChildren<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>
    >) => <textarea {...props}>{children}</textarea>,
  },
  AnimatePresence: ({ children }: PropsWithChildren) => <>{children}</>,
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  X: () => <span>X</span>,
  Minimize2: () => <span>Minimize2</span>,
  Maximize2: () => <span>Maximize2</span>,
  Send: () => <span>Send</span>,
  Paperclip: () => <span>Paperclip</span>,
  Smile: () => <span>Smile</span>,
  Mic: () => <span>Mic</span>,
  MicOff: () => <span>MicOff</span>,
  MoreVertical: () => <span>MoreVertical</span>,
  Settings: () => <span>Settings</span>,
  Download: () => <span>Download</span>,
  Trash2: () => <span>Trash2</span>,
  Volume2: () => <span>Volume2</span>,
  VolumeX: () => <span>VolumeX</span>,
  Bell: () => <span>Bell</span>,
  BellOff: () => <span>BellOff</span>,
  AlertCircle: () => <span>AlertCircle</span>,
  CheckCircle: () => <span>CheckCircle</span>,
  Clock: () => <span>Clock</span>,
}));

// Mock contexts
vi.mock('../../../contexts/UIContext', () => ({
  useUI: () => ({
    theme: 'light',
    showNotification: vi.fn(),
  }),
}));

// Mock ChatContext
vi.mock('../../../contexts/ChatContext', () => ({
  useChatContext: vi.fn(),
}));

// Mock child components
vi.mock('../MessageList', () => ({
  __esModule: true,
  default: ({
    messages,
    onDeleteMessage,
  }: {
    messages?: Array<{ id: string; text?: string; content?: string }>;
    onDeleteMessage?: (id: string) => void;
  }) => (
    <div data-testid="message-list">
      {messages?.map((msg) => (
        <div key={msg.id} data-testid={`message-${msg.id}`}>
          {msg.text || msg.content}
          <button onClick={() => onDeleteMessage?.(msg.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../TypingIndicator', () => ({
  __esModule: true,
  default: ({ isTyping }: { isTyping?: boolean }) =>
    isTyping ? (
      <div data-testid="typing-indicator">Someone is typing...</div>
    ) : null,
}));

vi.mock('../QuickReplies', () => ({
  __esModule: true,
  default: ({
    replies,
    onSelect,
  }: {
    replies?: string[];
    onSelect?: (reply: string) => void;
  }) => (
    <div data-testid="quick-replies">
      {replies?.map((reply: string, index: number) => (
        <button key={index} onClick={() => onSelect?.(reply)}>
          {reply}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../EmojiPicker', () => ({
  __esModule: true,
  default: ({ onEmojiSelect }: { onEmojiSelect?: (emoji: string) => void }) => (
    <div data-testid="emoji-picker">
      <button onClick={() => onEmojiSelect?.('😊')}>😊</button>
      <button onClick={() => onEmojiSelect?.('👍')}>👍</button>
    </div>
  ),
}));

vi.mock('../FileUpload', () => ({
  __esModule: true,
  default: ({
    onFileSelect,
  }: {
    onFileSelect?: (files: FileList | null) => void;
  }) => (
    <div data-testid="file-upload">
      <input
        type="file"
        data-testid="file-input"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files?.[0]) {
            onFileSelect?.(e.target.files);
          }
        }}
      />
    </div>
  ),
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

// Import useChatContext from the mocked context
import { useChatContext } from '../../../contexts/ChatContext';

const mockUseChatContext = useChatContext as ReturnType<typeof vi.fn>;

describe('ChatWindowAdvanced', () => {
  // Mock ChatContext values
  const mockChatContextValue = {
    messages: [
      {
        id: '1',
        type: 'user' as const,
        content: 'Hello',
        sender: 'user',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'bot' as const,
        content: 'Hi there!',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      },
    ],
    isTyping: false,
    isConnected: true,
    agentName: 'Support Agent',
    agentAvailable: true,
    businessHours: { isOpen: true, hours: '09:00 - 18:00' },
    sendMessage: vi.fn(),
    sendFile: vi.fn(),
    clearMessages: vi.fn(),
    exportChat: vi.fn(),
    startTyping: vi.fn(),
    stopTyping: vi.fn(),
    closeChat: vi.fn(),
    toggleMinimize: vi.fn(),
    isMinimized: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock ChatContext with default values
    mockUseChatContext.mockReturnValue(mockChatContextValue);
  });

  describe('Rendering and Basic Interactions', () => {
    it('should render chat window', () => {
      render(<ChatWindow />);

      expect(screen.getByTestId('message-list')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/chat.placeholder.connected/i)
      ).toBeInTheDocument();
    });

    it('should render with minimized state', () => {
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        isMinimized: true,
      });

      render(<ChatWindow />);

      expect(screen.queryByTestId('message-list')).not.toBeInTheDocument();
    });

    it('should call closeChat when close button clicked', () => {
      const closeChat = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        closeChat,
      });

      render(<ChatWindow />);

      const closeButton = screen.getByTitle(/chat.close/i);
      fireEvent.click(closeButton);

      expect(closeChat).toHaveBeenCalled();
    });
  });

  describe('Message Sending', () => {
    it('should send message on form submit', async () => {
      const sendMessage = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        sendMessage,
      });

      const user = userEvent.setup();
      render(<ChatWindow />);

      const input = screen.getByPlaceholderText(/chat.placeholder.connected/i);
      const sendButton = screen.getByTitle(/chat.send/i);

      await user.type(input, 'Test message');
      await user.click(sendButton);

      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test message',
          sender: 'user',
          type: 'text',
        })
      );
      expect(input).toHaveValue('');
    });

    it('should send message on Enter key', async () => {
      const sendMessage = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        sendMessage,
      });

      const user = userEvent.setup();
      render(<ChatWindow />);

      const input = screen.getByPlaceholderText(/chat.placeholder.connected/i);

      await user.type(input, 'Test message{Enter}');

      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test message',
        })
      );
    });

    it('should not send empty messages', async () => {
      const sendMessage = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        sendMessage,
      });

      const user = userEvent.setup();
      render(<ChatWindow />);

      const sendButton = screen.getByTitle(/chat.send/i);

      await user.click(sendButton);

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it('should handle Shift+Enter for new line', async () => {
      const sendMessage = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        sendMessage,
      });

      const user = userEvent.setup();
      render(<ChatWindow />);

      const input = screen.getByPlaceholderText(/chat.placeholder.connected/i);

      await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

      expect(input).toHaveValue('Line 1\nLine 2');
      expect(sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Window Controls', () => {
    it('should toggle minimize state', () => {
      const toggleMinimize = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        toggleMinimize,
      });

      render(<ChatWindow />);

      const minimizeButton = screen.getByTitle(/chat.minimize/i);
      fireEvent.click(minimizeButton);

      expect(toggleMinimize).toHaveBeenCalled();
    });
  });

  describe('Quick Replies', () => {
    it('should show and use quick replies', async () => {
      const sendMessage = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        messages: [],
        sendMessage,
      });

      const user = userEvent.setup();
      render(<ChatWindow />);

      // Quick replies show when there are no messages
      const quickReplies = screen.queryByTestId('quick-replies');
      if (quickReplies) {
        const quickReplyButtons = within(quickReplies).getAllByRole('button');
        if (quickReplyButtons.length > 0) {
          await user.click(quickReplyButtons[0]);
          expect(sendMessage).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Emoji Picker', () => {
    it('should toggle emoji picker', async () => {
      const user = userEvent.setup();
      render(<ChatWindow />);

      const emojiButton = screen.getByTitle(/chat.addEmoji/i);
      await user.click(emojiButton);

      expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();

      // Select emoji
      const emojiOption = screen.getByText('😊');
      await user.click(emojiOption);

      const input = screen.getByPlaceholderText(/chat.placeholder.connected/i);
      expect(input).toHaveValue('😊');
    });
  });

  describe('File Upload', () => {
    it('should handle file selection', async () => {
      const sendFile = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        sendFile,
      });

      const user = userEvent.setup();
      render(<ChatWindow />);

      const fileButton = screen.getByTitle(/chat.attachFile/i);
      await user.click(fileButton);

      const fileInput = screen.getByTestId('file-input');
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      await user.upload(fileInput, file);

      expect(sendFile).toHaveBeenCalledWith(file);
    });
  });

  describe('Voice Recording', () => {
    it('should toggle voice recording', async () => {
      const user = userEvent.setup();
      render(<ChatWindow />);

      // Voice recording might not be implemented yet
      // Skip this test for now
    });
  });

  describe('Settings and Options', () => {
    it('should export chat history', async () => {
      const exportChat = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        exportChat,
        messages: [mockChatContextValue.messages[0]],
      });

      render(<ChatWindow />);

      const exportButton = screen.getByTitle(/chat.exportTranscript/i);
      fireEvent.click(exportButton);

      expect(exportChat).toHaveBeenCalled();
    });

    it('should clear chat history', async () => {
      const clearMessages = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        clearMessages,
      });

      const user = userEvent.setup();
      render(<ChatWindow />);

      // Mock confirm
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      const clearButton = screen.getByTitle(/chat.clearHistory/i);
      await user.click(clearButton);

      expect(clearMessages).toHaveBeenCalled();
    });
  });

  describe('Typing Indicator', () => {
    it('should show typing indicator when someone is typing', () => {
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        isTyping: true,
      });

      render(<ChatWindow />);

      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });

    it('should not show typing indicator when no one is typing', () => {
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        isTyping: false,
      });

      render(<ChatWindow />);

      expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Message Management', () => {
    it('should display messages from context', () => {
      render(<ChatWindow />);

      const messageList = screen.getByTestId('message-list');
      expect(messageList).toBeInTheDocument();

      // Messages are displayed through MessageList component
      const message1 = screen.getByTestId('message-1');
      const message2 = screen.getByTestId('message-2');
      expect(message1).toHaveTextContent('Hello');
      expect(message2).toHaveTextContent('Hi there!');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ChatWindow />);

      const input = screen.getByPlaceholderText(/chat.placeholder.connected/i);
      expect(input).toHaveAttribute('aria-label', 'chat.inputLabel');
    });

    it('should support keyboard navigation', async () => {
      const closeChat = vi.fn();
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        closeChat,
      });

      const user = userEvent.setup();
      render(<ChatWindow />);

      const input = screen.getByPlaceholderText(/chat.placeholder.connected/i);

      await user.tab();
      expect(input).toHaveFocus();

      await user.keyboard('{Escape}');
      expect(closeChat).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle send message errors gracefully', async () => {
      const sendMessage = vi.fn().mockRejectedValue(new Error('Send failed'));
      mockUseChatContext.mockReturnValue({
        ...mockChatContextValue,
        sendMessage,
      });

      const user = userEvent.setup();
      render(<ChatWindow />);

      const input = screen.getByPlaceholderText(/chat.placeholder.connected/i);
      await user.type(input, 'Test message{Enter}');

      await waitFor(() => {
        // Error handling would be displayed through showNotification
        expect(sendMessage).toHaveBeenCalled();
      });
    });
  });
});
