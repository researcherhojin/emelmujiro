import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { useUI } from './UIContext';
import { ChatWebSocketService } from '../services/websocket';
import logger from '../utils/logger';
import env from '../config/env';
import i18n from '../i18n';

export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageSender = 'user' | 'agent' | 'system';
export type MessageStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  sender: MessageSender;
  timestamp: Date;
  status: MessageStatus;
  file?: File | { name: string; url: string; type: string; size: number };
  agentName?: string;
  agentAvatar?: string;
}

export interface BusinessHours {
  isOpen: boolean;
  hours: string;
  timezone: string;
  nextOpenTime?: Date;
}

export interface ChatSettings {
  welcomeMessage: string;
  quickReplies: string[];
  cannedResponses: string[];
  allowFileUpload: boolean;
  allowEmoji: boolean;
  soundEnabled: boolean;
  maxMessageLength: number;
}

interface ChatContextType {
  // State
  isOpen: boolean;
  isMinimized: boolean;
  isConnected: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  unreadCount: number;
  connectionId: string | null;

  // Agent info
  agentAvailable: boolean;
  agentName: string;
  agentAvatar?: string;
  businessHours: BusinessHours;

  // Settings
  settings: ChatSettings;

  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleMinimize: () => void;
  sendMessage: (
    message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>
  ) => Promise<void>;
  markAsRead: (messageId: string) => void;
  markAllAsRead: () => void;
  startTyping: () => void;
  stopTyping: () => void;
  clearHistory: () => void;
  exportHistory: () => string;

  // WebSocket
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

// Default business hours (9 AM to 6 PM KST, Monday to Friday)
const getDefaultBusinessHours = (): BusinessHours => {
  const now = new Date();
  const kstOffset = 9; // KST is UTC+9
  const currentHour = (now.getUTCHours() + kstOffset) % 24;
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  const isBusinessDay = currentDay >= 1 && currentDay <= 5; // Monday to Friday
  const isBusinessHour = currentHour >= 9 && currentHour < 18; // 9 AM to 6 PM

  return {
    isOpen: isBusinessDay && isBusinessHour,
    hours: i18n.t('chatContext.businessHours'),
    timezone: 'Asia/Seoul',
  };
};

const getDefaultSettings = (): ChatSettings => ({
  welcomeMessage: i18n.t('chatContext.welcomeMessage'),
  quickReplies: [
    i18n.t('chatContext.quickReplies.service'),
    i18n.t('chatContext.quickReplies.techSupport'),
    i18n.t('chatContext.quickReplies.pricing'),
    i18n.t('chatContext.quickReplies.reservation'),
    i18n.t('chatContext.quickReplies.other'),
  ],
  cannedResponses: [
    i18n.t('chatContext.cannedResponses.thanks'),
    i18n.t('chatContext.cannedResponses.agentConnecting'),
    i18n.t('chatContext.cannedResponses.needMoreInfo'),
    i18n.t('chatContext.cannedResponses.checkResolved'),
    i18n.t('chatContext.cannedResponses.anytimeHelp'),
  ],
  allowFileUpload: true,
  allowEmoji: true,
  soundEnabled: true,
  maxMessageLength: 1000,
});

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { showNotification } = useUI();

  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Agent Info
  const [agentAvailable] = useState(true);
  const [agentName] = useState(i18n.t('chatContext.agentName'));
  const [agentAvatar] = useState<string>();
  const [businessHours, setBusinessHours] = useState<BusinessHours>(
    getDefaultBusinessHours
  );

  // Settings
  const [settings] = useState<ChatSettings>(getDefaultSettings);

  // WebSocket connection
  const wsRef = useRef<ChatWebSocketService | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageQueueRef = useRef<ChatMessage[]>([]);

  // Load persisted data on mount
  useEffect(() => {
    loadPersistedData();
    updateBusinessHours();

    // Mark as not initial mount after a short delay
    const timer = setTimeout(() => {
      setIsInitialMount(false);
    }, 100);

    // Track user interaction
    const handleUserInteraction = () => {
      document.body.setAttribute('data-user-interacted', 'true');
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    // Update business hours every minute
    const interval = setInterval(updateBusinessHours, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Auto-connect when chat opens
  useEffect(() => {
    if (isOpen && !isConnected) {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isConnected]); // connect will be defined later

  // Play sound for new messages (except user messages)
  useEffect(() => {
    // Skip sound on initial mount and when no user interaction has occurred
    if (isInitialMount) {
      return;
    }

    if (messages.length === 0) return;

    // Only play sound for new messages after user has interacted with the page
    const hasUserInteracted =
      document.body.getAttribute('data-user-interacted') === 'true';
    if (!hasUserInteracted) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.sender !== 'user' &&
      settings.soundEnabled &&
      !isOpen && // Only play sound when chat is closed
      document.visibilityState === 'visible' // Only play when tab is visible
    ) {
      playNotificationSound();
    }
  }, [messages, settings.soundEnabled, isOpen, isInitialMount]);

  const loadPersistedData = () => {
    try {
      const saved = localStorage.getItem('chat-history');
      if (saved) {
        const data = JSON.parse(saved);
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      logger.error('Failed to load chat history:', error);
    }
  };

  const persistData = useCallback(() => {
    try {
      const data = {
        messages: messages.slice(-50), // Keep only last 50 messages
        unreadCount,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('chat-history', JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to persist chat data:', error);
    }
  }, [messages, unreadCount]);

  // Persist data when messages or unread count changes
  useEffect(() => {
    if (messages.length > 0) {
      persistData();
    }
  }, [messages, unreadCount, persistData]);

  const updateBusinessHours = () => {
    setBusinessHours(getDefaultBusinessHours());
  };

  const playNotificationSound = () => {
    try {
      // Only play sound if document is visible
      if (document.hidden) return;

      // Create a simple notification sound using Web Audio API
      interface WindowWithWebkit extends Window {
        webkitAudioContext?: typeof AudioContext;
      }
      const audioContext = new (
        window.AudioContext || (window as WindowWithWebkit).webkitAudioContext
      )();

      // Resume context if suspended (for autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Silently fail for autoplay restrictions
      if (error instanceof Error && !error.message.includes('user gesture')) {
        logger.warn('Could not play notification sound:', error);
      }
    }
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setIsInitialMount(false); // Reset initial mount flag when chat opens

    // Send welcome message if no messages exist
    if (messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: generateMessageId(),
        type: 'system',
        content: settings.welcomeMessage,
        sender: 'system',
        timestamp: new Date(),
        status: 'read',
      };
      setMessages([welcomeMsg]);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    stopTyping();
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const sendMessage = async (
    messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>
  ) => {
    const message: ChatMessage = {
      ...messageData,
      id: generateMessageId(),
      timestamp: new Date(),
      status: 'sending',
    };

    // Add message to local state immediately
    setMessages((prev) => [...prev, message]);

    try {
      if (isConnected && wsRef.current?.isConnected()) {
        // Send via WebSocket
        const success = wsRef.current.send({
          type: 'message',
          data: message,
        });

        if (success) {
          // Update status to sent
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === message.id ? { ...msg, status: 'sent' } : msg
            )
          );
        } else {
          throw new Error('Failed to send message via WebSocket');
        }
      } else {
        // Queue message for later sending
        messageQueueRef.current.push(message);

        // Simulate offline response
        setTimeout(() => {
          const autoReply: ChatMessage = {
            id: generateMessageId(),
            type: 'system',
            content: i18n.t('chatContext.offlineMessage'),
            sender: 'system',
            timestamp: new Date(),
            status: 'read',
          };
          setMessages((prev) => [...prev, autoReply]);
        }, 1000);
      }
    } catch (error) {
      // Update message status to failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'failed' } : msg
        )
      );
      throw error;
    }
  };

  const markAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.sender !== 'user'
          ? { ...msg, status: 'read' }
          : msg
      )
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.sender !== 'user' ? { ...msg, status: 'read' } : msg
      )
    );
    setUnreadCount(0);
  };

  const startTyping = () => {
    if (isConnected && wsRef.current?.isConnected()) {
      wsRef.current.send({
        type: 'typing_start',
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (isConnected && wsRef.current?.isConnected()) {
      wsRef.current.send({
        type: 'typing_stop',
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setUnreadCount(0);
    localStorage.removeItem('chat-history');
  };

  const exportHistory = (): string => {
    const exportData = {
      timestamp: new Date().toISOString(),
      messages: messages,
      agentInfo: {
        name: agentName,
        available: agentAvailable,
      },
      businessHours,
    };

    return JSON.stringify(exportData, null, 2);
  };

  const connect = () => {
    if (wsRef.current?.isConnected()) {
      return; // Already connected
    }

    try {
      wsRef.current = new ChatWebSocketService(
        {
          url: `${env.WS_URL}/chat/`,
          reconnectInterval: 3000,
          maxReconnectAttempts: 5,
          heartbeatInterval: 30000,
        },
        {
          onOpen: () => {
            setIsConnected(true);
            setConnectionId(`conn_${Date.now()}`);

            // Send queued messages
            if (messageQueueRef.current.length > 0) {
              messageQueueRef.current.forEach((message) => {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === message.id ? { ...msg, status: 'sent' } : msg
                  )
                );
              });
              messageQueueRef.current = [];
            }

            showNotification(
              'success',
              i18n.t('chatContext.notifications.connected')
            );
          },

          onClose: () => {
            setIsConnected(false);
            setConnectionId(null);
          },

          onError: (error: Event) => {
            logger.error('WebSocket error:', error);
            setIsConnected(false);
            showNotification(
              'error',
              i18n.t('chatContext.notifications.connectionFailed')
            );
          },

          onMessage: (data: {
            type: string;
            data?: unknown;
            messageId?: string;
          }) => {
            if (data.type === 'message' && data.data) {
              const messageData = data.data as Partial<ChatMessage> & {
                timestamp?: string | Date;
              };
              const message: ChatMessage = {
                ...messageData,
                id: messageData.id || generateMessageId(),
                type: messageData.type || 'text',
                content: messageData.content || '',
                sender: messageData.sender || 'agent',
                status: messageData.status || 'delivered',
                timestamp: messageData.timestamp
                  ? new Date(messageData.timestamp)
                  : new Date(),
              };

              setMessages((prev) => [...prev, message]);

              // Update unread count if chat is closed
              if (!isOpen && message.sender !== 'user') {
                setUnreadCount((prev) => prev + 1);
              }
            } else if (data.type === 'message_delivered' && data.messageId) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === data.messageId
                    ? { ...msg, status: 'delivered' }
                    : msg
                )
              );
            }
          },

          onTypingStart: () => {
            setIsTyping(true);
          },

          onTypingStop: () => {
            setIsTyping(false);
          },

          onReconnect: () => {
            showNotification(
              'info',
              i18n.t('chatContext.notifications.reconnecting')
            );
          },

          onReconnectFailed: () => {
            showNotification(
              'error',
              i18n.t('chatContext.notifications.reconnectFailed')
            );
          },
        }
      );

      wsRef.current!.connect().catch((error: unknown) => {
        logger.error('Connection failed:', error);
        setIsConnected(false);
      });
    } catch (error) {
      logger.error('WebSocket initialization failed:', error);
      setIsConnected(false);
      showNotification('error', i18n.t('chatContext.notifications.initFailed'));
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionId(null);
    setIsTyping(false);
  };

  const reconnect = () => {
    disconnect();
    setTimeout(connect, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const value = useMemo<ChatContextType>(
    () => ({
      // State
      isOpen,
      isMinimized,
      isConnected,
      isTyping,
      messages,
      unreadCount,
      connectionId,

      // Agent info
      agentAvailable,
      agentName,
      agentAvatar,
      businessHours,

      // Settings
      settings,

      // Actions
      openChat,
      closeChat,
      toggleMinimize,
      sendMessage,
      markAsRead,
      markAllAsRead,
      startTyping,
      stopTyping,
      clearHistory,
      exportHistory,

      // WebSocket
      connect,
      disconnect,
      reconnect,
    }),
    [
      isOpen,
      isMinimized,
      isConnected,
      isTyping,
      messages,
      unreadCount,
      connectionId,
      agentAvailable,
      agentName,
      agentAvatar,
      businessHours,
      settings,
      openChat,
      closeChat,
      toggleMinimize,
      sendMessage,
      markAsRead,
      markAllAsRead,
      startTyping,
      stopTyping,
      clearHistory,
      exportHistory,
      connect,
      disconnect,
      reconnect,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
