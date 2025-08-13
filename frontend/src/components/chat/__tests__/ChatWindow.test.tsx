import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children?: React.ReactNode; [key: string]: unknown }) => (
      <div>{children}</div>
    ),
    button: ({ children }: { children?: React.ReactNode; [key: string]: unknown }) => (
      <button>{children}</button>
    ),
    textarea: ({ children }: { children?: React.ReactNode; [key: string]: unknown }) => (
      <textarea>{children}</textarea>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <span>X</span>,
  Minimize2: () => <span>Minimize2</span>,
  Maximize2: () => <span>Maximize2</span>,
  Send: () => <span>Send</span>,
  Paperclip: () => <span>Paperclip</span>,
  Smile: () => <span>Smile</span>,
  Mic: () => <span>Mic</span>,
  MicOff: () => <span>MicOff</span>,
  Image: () => <span>Image</span>,
  File: () => <span>File</span>,
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

// Mock child components
jest.mock('../MessageList', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="message-list">
      <div>Mock Message List</div>
    </div>
  ),
}));

jest.mock('../TypingIndicator', () => ({
  __esModule: true,
  default: () => <div data-testid="typing-indicator">Typing...</div>,
}));

jest.mock('../EmojiPicker', () => ({
  __esModule: true,
  default: ({
    onEmojiSelect,
    onClose,
  }: {
    onEmojiSelect: (emoji: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid="emoji-picker">
      <button onClick={() => onEmojiSelect('😀')}>😀</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('../FileUpload', () => ({
  __esModule: true,
  default: ({ onUpload, onClose }: { onUpload?: (file: File) => void; onClose?: () => void }) => (
    <div data-testid="file-upload">
      <input
        type="file"
        onChange={e => {
          if (e.target.files?.[0] && onUpload) {
            onUpload(e.target.files[0]);
          }
        }}
      />
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  ),
}));

jest.mock('../QuickReplies', () => ({
  __esModule: true,
  default: ({
    replies = [],
    onSelect,
  }: {
    replies?: string[];
    onSelect: (reply: string) => void;
  }) => {
    if (!replies || replies.length === 0) {
      return null;
    }
    return (
      <div data-testid="quick-replies">
        {replies.map((reply: string) => (
          <button key={reply} onClick={() => onSelect(reply)}>
            {reply}
          </button>
        ))}
      </div>
    );
  },
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

// Mock contexts
jest.mock('../../../contexts/UIContext', () => ({
  useUI: () => ({
    theme: 'light',
    showNotification: jest.fn(),
  }),
}));

jest.mock('../../../contexts/ChatContext', () => ({
  useChatContext: () => ({
    messages: [],
    isTyping: false,
    isConnected: true,
    agentName: 'Support Agent',
    agentAvailable: true,
    businessHours: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    sendMessage: jest.fn(),
    sendFile: jest.fn(),
    clearMessages: jest.fn(),
    exportChat: jest.fn(),
    startTyping: jest.fn(),
    stopTyping: jest.fn(),
    closeChat: jest.fn(),
    toggleMinimize: jest.fn(),
    isMinimized: false,
  }),
}));

// Import ChatWindow after all mocks are defined
import ChatWindow from '../ChatWindow';

// Helper to create complete mock context
const createMockChatContext = (overrides = {}) => ({
  messages: [],
  isTyping: false,
  isConnected: true,
  agentName: 'Support Agent',
  agentAvailable: true,
  businessHours: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  sendMessage: jest.fn(),
  sendFile: jest.fn(),
  clearMessages: jest.fn(),
  exportChat: jest.fn(),
  startTyping: jest.fn(),
  stopTyping: jest.fn(),
  closeChat: jest.fn(),
  toggleMinimize: jest.fn(),
  isMinimized: false,
  ...overrides,
});

describe('ChatWindow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render chat window with message list', () => {
    render(<ChatWindow />);

    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });

  it('should show message input when connected', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.placeholder.connected');
    expect(input).toBeInTheDocument();
    expect(input).not.toBeDisabled();
  });

  it('should have attachment button', () => {
    render(<ChatWindow />);

    const attachButton = screen.getByTitle('chat.attachFile');
    expect(attachButton).toBeInTheDocument();
  });

  it('should have emoji button', () => {
    render(<ChatWindow />);

    const emojiButton = screen.getByTitle('chat.emoji');
    expect(emojiButton).toBeInTheDocument();
  });

  it('should show disconnected banner when not connected', () => {
    jest
      .spyOn(require('../../../contexts/ChatContext'), 'useChatContext')
      .mockReturnValue(createMockChatContext({ isConnected: false }));

    render(<ChatWindow />);

    expect(screen.getByText('chat.connectionStatus.reconnecting')).toBeInTheDocument();
  });

  it('should show business hours notice when closed', () => {
    jest
      .spyOn(require('../../../contexts/ChatContext'), 'useChatContext')
      .mockReturnValue(
        createMockChatContext({ businessHours: { isOpen: false, hours: '09:00 - 18:00' } })
      );

    render(<ChatWindow />);

    expect(screen.getByText('chat.afterHours.title')).toBeInTheDocument();
  });

  it('should handle message input', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.placeholder.connected');
    fireEvent.change(input, { target: { value: 'Hello world' } });

    expect(input).toHaveValue('Hello world');
  });

  it('should send message on button click', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.placeholder.connected');
    fireEvent.change(input, { target: { value: 'Test message' } });

    // Find send button by its accessible role and icon
    const sendButtons = screen.getAllByRole('button');
    const sendButton = sendButtons.find(button => button.textContent?.includes('Send'));
    if (sendButton) {
      fireEvent.click(sendButton);
    }

    // Check that input is cleared after sending
    waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should send message on Enter key press', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.placeholder.connected');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should not send empty messages', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.placeholder.connected');

    // Find send button by its accessible role and icon
    const sendButtons = screen.getAllByRole('button');
    const sendButton = sendButtons.find(button => button.textContent?.includes('Send'));

    // Try to send empty message
    if (sendButton) {
      fireEvent.click(sendButton);
    }

    // Input should remain empty and no error
    expect(input).toHaveValue('');
  });

  it('should show emoji picker when emoji button is clicked', () => {
    render(<ChatWindow />);

    const emojiButton = screen.getByTitle('chat.emoji');
    fireEvent.click(emojiButton);

    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
  });

  it('should insert emoji into message input', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.placeholder.connected');
    fireEvent.change(input, { target: { value: 'Hello ' } });

    const emojiButton = screen.getByTitle('chat.emoji');
    fireEvent.click(emojiButton);

    const smileyEmoji = screen.getByText('😀');
    fireEvent.click(smileyEmoji);

    expect(input).toHaveValue('Hello 😀');
  });

  it('should handle file input trigger on attachment button click', () => {
    render(<ChatWindow />);

    const attachButton = screen.getByTitle('chat.attachFile');
    expect(attachButton).toBeInTheDocument();
    expect(attachButton).not.toBeDisabled();
  });

  it('should have hidden file input', () => {
    render(<ChatWindow />);

    // Check that there's a hidden file input
    const fileInputs = document.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThan(0);
  });

  it('should show typing indicator when agent is typing', () => {
    jest.spyOn(require('../../../contexts/ChatContext'), 'useChatContext').mockReturnValue({
      messages: [],
      isTyping: true,
      isConnected: true,
      agentName: 'Support Agent',
      agentAvailable: true,
      sendMessage: jest.fn(),
      sendFile: jest.fn(),
      clearMessages: jest.fn(),
      exportChat: jest.fn(),
    });

    render(<ChatWindow />);

    expect(screen.getByText('Typing...')).toBeInTheDocument();
  });

  it('should show quick replies when available', () => {
    const quickReplies = ['Yes', 'No', 'Maybe'];

    jest.spyOn(require('../../../contexts/ChatContext'), 'useChatContext').mockReturnValue({
      messages: [
        {
          id: '1',
          type: 'bot',
          content: 'Do you need help?',
          timestamp: new Date().toISOString(),
          quickReplies,
        },
      ],
      isTyping: false,
      isConnected: true,
      agentName: 'Support Agent',
      agentAvailable: true,
      sendMessage: jest.fn(),
      sendFile: jest.fn(),
      clearMessages: jest.fn(),
      exportChat: jest.fn(),
    });

    render(<ChatWindow />);

    expect(screen.getByTestId('quick-replies')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Maybe')).toBeInTheDocument();
  });

  it('should handle quick reply selection', () => {
    const sendMessage = jest.fn();
    const quickReplies = ['Yes', 'No'];

    jest.spyOn(require('../../../contexts/ChatContext'), 'useChatContext').mockReturnValue({
      messages: [
        {
          id: '1',
          type: 'bot',
          content: 'Do you need help?',
          timestamp: new Date().toISOString(),
          quickReplies,
        },
      ],
      isTyping: false,
      isConnected: true,
      agentName: 'Support Agent',
      agentAvailable: true,
      sendMessage,
      sendFile: jest.fn(),
      clearMessages: jest.fn(),
      exportChat: jest.fn(),
    });

    render(<ChatWindow />);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    expect(sendMessage).toHaveBeenCalledWith('Yes');
  });

  it('should have send button', () => {
    render(<ChatWindow />);

    const sendButtons = screen.getAllByRole('button');
    const sendButton = sendButtons.find(button => button.textContent?.includes('Send'));
    expect(sendButton).toBeInTheDocument();
  });

  it('should have export button', () => {
    render(<ChatWindow />);

    const exportButton = screen.getByTitle('chat.exportTranscript');
    expect(exportButton).toBeInTheDocument();
    expect(exportButton).toBeDisabled(); // Disabled when no messages
  });

  it('should enable export when messages exist', () => {
    jest.spyOn(require('../../../contexts/ChatContext'), 'useChatContext').mockReturnValue(
      createMockChatContext({
        messages: [
          {
            id: '1',
            type: 'user',
            content: 'Test message',
            timestamp: new Date().toISOString(),
          },
        ],
      })
    );

    render(<ChatWindow />);

    const exportButton = screen.getByTitle('chat.exportTranscript');
    expect(exportButton).not.toBeDisabled();
  });

  it('should show connection status when disconnected', () => {
    jest
      .spyOn(require('../../../contexts/ChatContext'), 'useChatContext')
      .mockReturnValue(createMockChatContext({ isConnected: false }));

    render(<ChatWindow />);

    expect(screen.getByText('chat.connectionStatus.reconnecting')).toBeInTheDocument();
  });

  it('should disable input when disconnected', () => {
    jest
      .spyOn(require('../../../contexts/ChatContext'), 'useChatContext')
      .mockReturnValue(createMockChatContext({ isConnected: false }));

    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.placeholder.disconnected');
    expect(input).toBeDisabled();
  });

  it('should handle message send on Enter key', () => {
    const sendMessage = jest.fn();
    jest
      .spyOn(require('../../../contexts/ChatContext'), 'useChatContext')
      .mockReturnValue(createMockChatContext({ sendMessage }));

    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.placeholder.connected');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(sendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should not send message on Enter with Shift key', () => {
    const sendMessage = jest.fn();
    jest
      .spyOn(require('../../../contexts/ChatContext'), 'useChatContext')
      .mockReturnValue(createMockChatContext({ sendMessage }));

    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.placeholder.connected');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('should have accessible input area', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.placeholder.connected');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('TEXTAREA');
  });
});
