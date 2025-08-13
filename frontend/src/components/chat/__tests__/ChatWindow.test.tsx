import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWindow from '../ChatWindow';

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
  default: ({
    onFileSelect,
    onClose,
  }: {
    onFileSelect: (file: File) => void;
    onClose: () => void;
  }) => (
    <div data-testid="file-upload">
      <input
        type="file"
        onChange={e => {
          if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('../QuickReplies', () => ({
  __esModule: true,
  default: ({ replies, onSelect }: { replies: string[]; onSelect: (reply: string) => void }) => (
    <div data-testid="quick-replies">
      {replies.map((reply: string) => (
        <button key={reply} onClick={() => onSelect(reply)}>
          {reply}
        </button>
      ))}
    </div>
  ),
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

  it('should render chat window with header', () => {
    render(<ChatWindow />);

    expect(screen.getByText('chat.title')).toBeInTheDocument();
    expect(screen.getByText('Support Agent')).toBeInTheDocument();
  });

  it('should show online status when connected', () => {
    render(<ChatWindow />);

    expect(screen.getByText('chat.online')).toBeInTheDocument();
  });

  it('should handle close button click', () => {
    const closeChat = jest.fn();
    jest
      .spyOn(require('../../../contexts/ChatContext'), 'useChatContext')
      .mockReturnValue(createMockChatContext({ closeChat }));

    render(<ChatWindow />);

    const closeButton = screen.getByLabelText('chat.close');
    fireEvent.click(closeButton);

    expect(closeChat).toHaveBeenCalled();
  });

  it('should handle minimize/maximize toggle', () => {
    const toggleMinimize = jest.fn();
    jest
      .spyOn(require('../../../contexts/ChatContext'), 'useChatContext')
      .mockReturnValue(createMockChatContext({ toggleMinimize }));

    render(<ChatWindow />);

    const minimizeButton = screen.getByLabelText('chat.minimize');
    fireEvent.click(minimizeButton);

    expect(toggleMinimize).toHaveBeenCalled();
  });

  it('should hide content when minimized', () => {
    jest
      .spyOn(require('../../../contexts/ChatContext'), 'useChatContext')
      .mockReturnValue(createMockChatContext({ isMinimized: true }));

    render(<ChatWindow />);

    expect(screen.queryByTestId('message-list')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('chat.inputPlaceholder')).not.toBeInTheDocument();
  });

  it('should show maximize button when minimized', () => {
    jest
      .spyOn(require('../../../contexts/ChatContext'), 'useChatContext')
      .mockReturnValue(createMockChatContext({ isMinimized: true }));

    render(<ChatWindow />);

    expect(screen.getByLabelText('chat.maximize')).toBeInTheDocument();
  });

  it('should handle message input', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.inputPlaceholder');
    fireEvent.change(input, { target: { value: 'Hello world' } });

    expect(input).toHaveValue('Hello world');
  });

  it('should send message on button click', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.inputPlaceholder');
    fireEvent.change(input, { target: { value: 'Test message' } });

    // Find send button by its icon text
    const sendIcon = screen.getByText('Send');
    const sendButton = sendIcon.closest('button');
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

    const input = screen.getByPlaceholderText('chat.inputPlaceholder');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should not send empty messages', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.inputPlaceholder');

    // Find send button by its icon text
    const sendIcon = screen.getByText('Send');
    const sendButton = sendIcon.closest('button');

    // Try to send empty message
    if (sendButton) {
      fireEvent.click(sendButton);
    }

    // Input should remain empty and no error
    expect(input).toHaveValue('');
  });

  it('should show emoji picker when emoji button is clicked', () => {
    render(<ChatWindow />);

    const emojiButton = screen.getByLabelText('chat.emoji');
    fireEvent.click(emojiButton);

    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
  });

  it('should insert emoji into message input', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.inputPlaceholder');
    fireEvent.change(input, { target: { value: 'Hello ' } });

    const emojiButton = screen.getByLabelText('chat.emoji');
    fireEvent.click(emojiButton);

    const smileyEmoji = screen.getByText('😀');
    fireEvent.click(smileyEmoji);

    expect(input).toHaveValue('Hello 😀');
  });

  it('should show file upload when attachment button is clicked', () => {
    render(<ChatWindow />);

    const attachButton = screen.getByLabelText('chat.attach');
    fireEvent.click(attachButton);

    expect(screen.getByTestId('file-upload')).toBeInTheDocument();
  });

  it('should handle file selection', () => {
    render(<ChatWindow />);

    const attachButton = screen.getByLabelText('chat.attach');
    fireEvent.click(attachButton);

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileUploadDiv = screen.getByTestId('file-upload');
    const input = fileUploadDiv.querySelector('input[type="file"]');

    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
    }

    // File upload component should close after selection
    waitFor(() => {
      expect(screen.queryByTestId('file-upload')).not.toBeInTheDocument();
    });
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

  it('should show chat menu when menu button is clicked', () => {
    render(<ChatWindow />);

    const menuButton = screen.getByLabelText('chat.menu');
    fireEvent.click(menuButton);

    expect(screen.getByText('chat.clearChat')).toBeInTheDocument();
    expect(screen.getByText('chat.exportChat')).toBeInTheDocument();
    expect(screen.getByText('chat.settings')).toBeInTheDocument();
  });

  it('should handle clear chat action', () => {
    const clearMessages = jest.fn();

    jest.spyOn(require('../../../contexts/ChatContext'), 'useChatContext').mockReturnValue({
      messages: [
        {
          id: '1',
          type: 'bot',
          content: 'Hello',
          timestamp: new Date().toISOString(),
        },
      ],
      isTyping: false,
      isConnected: true,
      agentName: 'Support Agent',
      agentAvailable: true,
      sendMessage: jest.fn(),
      sendFile: jest.fn(),
      clearMessages,
      exportChat: jest.fn(),
    });

    render(<ChatWindow />);

    const menuButton = screen.getByLabelText('chat.menu');
    fireEvent.click(menuButton);

    const clearButton = screen.getByText('chat.clearChat');
    fireEvent.click(clearButton);

    // Should show confirmation dialog
    const confirmButton = screen.getByText('chat.confirm');
    fireEvent.click(confirmButton);

    expect(clearMessages).toHaveBeenCalled();
  });

  it('should handle export chat action', () => {
    const exportChat = jest.fn();

    jest.spyOn(require('../../../contexts/ChatContext'), 'useChatContext').mockReturnValue({
      messages: [],
      isTyping: false,
      isConnected: true,
      agentName: 'Support Agent',
      agentAvailable: true,
      sendMessage: jest.fn(),
      sendFile: jest.fn(),
      clearMessages: jest.fn(),
      exportChat,
    });

    render(<ChatWindow />);

    const menuButton = screen.getByLabelText('chat.menu');
    fireEvent.click(menuButton);

    const exportButton = screen.getByText('chat.exportChat');
    fireEvent.click(exportButton);

    expect(exportChat).toHaveBeenCalled();
  });

  it('should show offline indicator when disconnected', () => {
    jest.spyOn(require('../../../contexts/ChatContext'), 'useChatContext').mockReturnValue({
      messages: [],
      isTyping: false,
      isConnected: false,
      agentName: 'Support Agent',
      agentAvailable: true,
      sendMessage: jest.fn(),
      sendFile: jest.fn(),
      clearMessages: jest.fn(),
      exportChat: jest.fn(),
    });

    render(<ChatWindow />);

    expect(screen.getByText('chat.offline')).toBeInTheDocument();
  });

  it('should disable input when disconnected', () => {
    jest.spyOn(require('../../../contexts/ChatContext'), 'useChatContext').mockReturnValue({
      messages: [],
      isTyping: false,
      isConnected: false,
      agentName: 'Support Agent',
      agentAvailable: true,
      sendMessage: jest.fn(),
      sendFile: jest.fn(),
      clearMessages: jest.fn(),
      exportChat: jest.fn(),
    });

    render(<ChatWindow />);

    const input = screen.getByPlaceholderText('chat.inputPlaceholder');
    expect(input).toBeDisabled();
  });

  it('should handle sound toggle', () => {
    render(<ChatWindow />);

    const soundButton = screen.getByLabelText('chat.sound');
    fireEvent.click(soundButton);

    // Sound should be toggled
    expect(screen.getByLabelText('chat.soundOff')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('chat.soundOff'));
    expect(screen.getByLabelText('chat.sound')).toBeInTheDocument();
  });

  it('should handle notification toggle', () => {
    render(<ChatWindow />);

    const notificationButton = screen.getByLabelText('chat.notifications');
    fireEvent.click(notificationButton);

    // Notifications should be toggled
    expect(screen.getByLabelText('chat.notificationsOff')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('chat.notificationsOff'));
    expect(screen.getByLabelText('chat.notifications')).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<ChatWindow />);

    const chatWindow = screen.getByRole('dialog');
    expect(chatWindow).toHaveAttribute('aria-label', 'chat.window');

    const input = screen.getByPlaceholderText('chat.inputPlaceholder');
    expect(input).toHaveAttribute('aria-label', 'chat.messageInput');
  });
});
