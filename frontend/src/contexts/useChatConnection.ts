import { useRef, useCallback } from 'react';
import { ChatWebSocketService } from '../services/websocket';
import { ChatMessage, generateMessageId } from './chatHelpers';
import logger from '../utils/logger';
import env from '../config/env';
import i18n from '../i18n';

interface ConnectionState {
  setIsConnected: (v: boolean) => void;
  setConnectionId: (v: string | null) => void;
  setIsTyping: (v: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  isOpen: boolean;
  showNotification: (type: string, message: string) => void;
}

export function useChatConnection(state: ConnectionState) {
  const wsRef = useRef<ChatWebSocketService | null>(null);
  const messageQueueRef = useRef<ChatMessage[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.isConnected()) return;

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
            state.setIsConnected(true);
            state.setConnectionId(`conn_${Date.now()}`);

            if (messageQueueRef.current.length > 0) {
              messageQueueRef.current.forEach((message) => {
                state.setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === message.id ? { ...msg, status: 'sent' } : msg
                  )
                );
              });
              messageQueueRef.current = [];
            }

            state.showNotification(
              'success',
              i18n.t('chatContext.notifications.connected')
            );
          },

          onClose: () => {
            state.setIsConnected(false);
            state.setConnectionId(null);
          },

          onError: (error: Event) => {
            logger.error('WebSocket error:', error);
            state.setIsConnected(false);
            state.showNotification(
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

              state.setMessages((prev) => [...prev, message]);

              if (!state.isOpen && message.sender !== 'user') {
                state.setUnreadCount((prev) => prev + 1);
              }
            } else if (data.type === 'message_delivered' && data.messageId) {
              state.setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === data.messageId
                    ? { ...msg, status: 'delivered' }
                    : msg
                )
              );
            }
          },

          onTypingStart: () => state.setIsTyping(true),
          onTypingStop: () => state.setIsTyping(false),

          onReconnect: () => {
            state.showNotification(
              'info',
              i18n.t('chatContext.notifications.reconnecting')
            );
          },

          onReconnectFailed: () => {
            state.showNotification(
              'error',
              i18n.t('chatContext.notifications.reconnectFailed')
            );
          },
        }
      );

      wsRef.current!.connect().catch((error: unknown) => {
        logger.error('Connection failed:', error);
        state.setIsConnected(false);
      });
    } catch (error) {
      logger.error('WebSocket initialization failed:', error);
      state.setIsConnected(false);
      state.showNotification(
        'error',
        i18n.t('chatContext.notifications.initFailed')
      );
    }
  }, [state]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    state.setIsConnected(false);
    state.setConnectionId(null);
    state.setIsTyping(false);
  }, [state]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectTimerRef.current = setTimeout(connect, 1000);
  }, [connect, disconnect]);

  const sendViaWebSocket = useCallback((message: ChatMessage): boolean => {
    if (wsRef.current?.isConnected()) {
      return wsRef.current.send({ type: 'message', data: message });
    }
    return false;
  }, []);

  const queueMessage = useCallback((message: ChatMessage) => {
    messageQueueRef.current.push(message);
  }, []);

  const sendTypingStart = useCallback(() => {
    if (wsRef.current?.isConnected()) {
      wsRef.current.send({ type: 'typing_start' });
    }
  }, []);

  const sendTypingStop = useCallback(() => {
    if (wsRef.current?.isConnected()) {
      wsRef.current.send({ type: 'typing_stop' });
    }
  }, []);

  const isWsConnected = useCallback(
    () => wsRef.current?.isConnected() ?? false,
    []
  );

  const cleanup = useCallback(() => {
    disconnect();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
  }, [disconnect]);

  return {
    connect,
    disconnect,
    reconnect,
    sendViaWebSocket,
    queueMessage,
    sendTypingStart,
    sendTypingStop,
    isWsConnected,
    cleanup,
    typingTimeoutRef,
  };
}
