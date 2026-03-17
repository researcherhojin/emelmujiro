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
import logger from '../utils/logger';
import i18n from '../i18n';
import {
  ChatMessage,
  BusinessHours,
  ChatContextType,
  getDefaultBusinessHours,
  getDefaultSettings,
  generateMessageId,
  playNotificationSound,
} from './chatHelpers';
import { useChatConnection } from './useChatConnection';

// Re-export types for consumers
export type { ChatMessage, BusinessHours, ChatSettings, ChatContextType } from './chatHelpers';
export type { MessageType, MessageSender, MessageStatus } from './chatHelpers';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

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

  // Agent Info (static values — no state needed)
  const agentAvailable = true;
  const agentName = i18n.t('chatContext.agentName');
  const agentAvatar: string | undefined = undefined;
  const [businessHours, setBusinessHours] = useState<BusinessHours>(getDefaultBusinessHours);

  // Settings (static — no state needed)
  const settings = getDefaultSettings();
  const offlineReplyTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // WebSocket connection hook
  const ws = useChatConnection({
    setIsConnected,
    setConnectionId,
    setIsTyping,
    setMessages,
    setUnreadCount,
    isOpen,
    showNotification,
  });

  // Load persisted data on mount
  useEffect(() => {
    loadPersistedData();
    updateBusinessHours();

    const timer = setTimeout(() => setIsInitialMount(false), 100);

    const handleUserInteraction = () => {
      document.body.setAttribute('data-user-interacted', 'true');
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    const interval = setInterval(updateBusinessHours, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      if (offlineReplyTimerRef.current) clearTimeout(offlineReplyTimerRef.current);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Auto-connect when chat opens
  useEffect(() => {
    if (isOpen && !isConnected) {
      ws.connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isConnected]);

  // Play sound for new messages (except user messages)
  useEffect(() => {
    if (isInitialMount || messages.length === 0) return;

    const hasUserInteracted = document.body.getAttribute('data-user-interacted') === 'true';
    if (!hasUserInteracted) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.sender !== 'user' &&
      settings.soundEnabled &&
      !isOpen &&
      document.visibilityState === 'visible'
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
        messages: messages.slice(-50),
        unreadCount,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('chat-history', JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to persist chat data:', error);
    }
  }, [messages, unreadCount]);

  useEffect(() => {
    if (messages.length > 0) persistData();
  }, [messages, unreadCount, persistData]);

  const updateBusinessHours = () => {
    setBusinessHours(getDefaultBusinessHours());
  };

  const openChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    setIsInitialMount(false);

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
  }, [messages.length, settings.welcomeMessage]);

  const stopTyping = useCallback(() => {
    ws.sendTypingStop();

    if (ws.typingTimeoutRef.current) {
      clearTimeout(ws.typingTimeoutRef.current);
      ws.typingTimeoutRef.current = null;
    }
  }, [ws]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    stopTyping();
  }, [stopTyping]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const sendMessage = useCallback(
    async (messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>) => {
      const message: ChatMessage = {
        ...messageData,
        id: generateMessageId(),
        timestamp: new Date(),
        status: 'sending',
      };

      setMessages((prev) => [...prev, message]);

      try {
        if (isConnected && ws.isWsConnected()) {
          const success = ws.sendViaWebSocket(message);
          if (success) {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === message.id ? { ...msg, status: 'sent' } : msg))
            );
          } else {
            throw new Error('Failed to send message via WebSocket');
          }
        } else {
          ws.queueMessage(message);

          if (offlineReplyTimerRef.current) clearTimeout(offlineReplyTimerRef.current);
          offlineReplyTimerRef.current = setTimeout(() => {
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
        setMessages((prev) =>
          prev.map((msg) => (msg.id === message.id ? { ...msg, status: 'failed' } : msg))
        );
        throw error;
      }
    },
    [isConnected, ws, offlineReplyTimerRef]
  );

  const markAsRead = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.sender !== 'user' ? { ...msg, status: 'read' } : msg
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setMessages((prev) =>
      prev.map((msg) => (msg.sender !== 'user' ? { ...msg, status: 'read' } : msg))
    );
    setUnreadCount(0);
  }, []);

  const startTyping = useCallback(() => {
    ws.sendTypingStart();

    if (ws.typingTimeoutRef.current) {
      clearTimeout(ws.typingTimeoutRef.current);
    }

    ws.typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [ws, stopTyping]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setUnreadCount(0);
    localStorage.removeItem('chat-history');
  }, []);

  const exportHistory = useCallback((): string => {
    const exportData = {
      timestamp: new Date().toISOString(),
      messages,
      agentInfo: { name: agentName, available: agentAvailable },
      businessHours,
    };
    return JSON.stringify(exportData, null, 2);
  }, [messages, agentName, agentAvailable, businessHours]);

  // Cleanup on unmount
  useEffect(() => {
    return () => ws.cleanup();
  }, [ws]);

  const value = useMemo<ChatContextType>(
    () => ({
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
      connect: ws.connect,
      disconnect: ws.disconnect,
      reconnect: ws.reconnect,
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
      ws.connect,
      ws.disconnect,
      ws.reconnect,
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
