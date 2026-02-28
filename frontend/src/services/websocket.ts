// MessageSender type for WebSocket message sending functionality
import logger from '../utils/logger';
import env from '../config/env';

// Use mock WebSocket if in test environment or in production (GitHub Pages has no backend)
const USE_MOCK_WS = env.IS_TEST || env.IS_PRODUCTION;

export type MessageSenderFunction = (
  message: string,
  attachment?: File
) => Promise<void>;

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface WebSocketMessage {
  type: string;
  data?: unknown;
  messageId?: string;
  timestamp?: string;
}

export interface WebSocketCallbacks {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onReconnect?: () => void;
  onReconnectFailed?: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

// Main WebSocketService class for tests
export default class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string | null = null;
  private state: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private reconnectAttempts = 0;
  private autoReconnect = false;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private historyEnabled = false;
  private historyLimit = 100;
  private history: WebSocketMessage[] = [];
  private options: Record<string, unknown> = {};

  connect(url: string, options?: Record<string, unknown>): void {
    this.url = url;
    this.options = options || {};
    this.state = 'connecting';

    if (typeof WebSocket !== 'undefined') {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.state = 'connected';
        this.reconnectAttempts = 0;
        this.emit('connect');
        this.flushMessageQueue();
      };

      this.ws.onclose = (event) => {
        this.state = 'disconnected';
        this.emit('disconnect', event);

        if (
          this.autoReconnect &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        this.emit('error', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.historyEnabled) {
            this.addToHistory(data);
          }
          this.emit('message', data);
          if (data.type) {
            this.emit(data.type, data);
          }
        } catch (error) {
          this.emit('error', error);
        }
      };
    }
  }

  disconnect(): void {
    this.state = 'disconnected';
    this.url = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  send(message: WebSocketMessage): boolean {
    if (
      this.state === 'connected' &&
      this.ws &&
      this.ws.readyState === WebSocket.OPEN
    ) {
      this.ws.send(JSON.stringify(message));
      return true;
    } else {
      this.messageQueue.push(message);
      return false;
    }
  }

  sendBinary(data: ArrayBuffer): boolean {
    if (
      this.state === 'connected' &&
      this.ws &&
      this.ws.readyState === WebSocket.OPEN
    ) {
      this.ws.send(data);
      return true;
    }
    return false;
  }

  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: (...args: unknown[]) => void): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  once(event: string, handler: (...args: unknown[]) => void): void {
    const onceHandler = (...args: unknown[]) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  emit(event: string, ...args: unknown[]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
    }
  }

  isConnected(): boolean {
    return this.state === 'connected';
  }

  getState(): string {
    return this.state;
  }

  getUrl(): string | null {
    return this.url;
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  setAutoReconnect(
    enabled: boolean,
    maxAttempts?: number,
    delay?: number
  ): void {
    this.autoReconnect = enabled;
    if (maxAttempts !== undefined) {
      this.maxReconnectAttempts = maxAttempts;
    }
    if (delay !== undefined) {
      this.reconnectDelay = delay;
    }
  }

  enableHeartbeat(interval: number): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.state === 'connected' && this.ws) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, interval);
  }

  enableHistory(limit: number): void {
    this.historyEnabled = true;
    this.historyLimit = limit;
  }

  getHistory(): WebSocketMessage[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.state === 'connected') {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private attemptReconnect(): void {
    this.reconnectAttempts++;
    this.emit('reconnect');

    setTimeout(() => {
      if (this.url) {
        this.connect(this.url, this.options);
      }
    }, this.reconnectDelay);
  }

  private addToHistory(message: WebSocketMessage): void {
    this.history.push(message);
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }
  }
}

// Original ChatWebSocketService class
export class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private callbacks: WebSocketCallbacks;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private isManualClose = false;

  constructor(config: WebSocketConfig, callbacks: WebSocketCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  connect(): Promise<void> {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.isManualClose = false;

    return new Promise((resolve, reject) => {
      try {
        // Simulate WebSocket in dev/test/production (GitHub Pages has no backend)
        // Only use real WebSocket when USE_MOCK_WS is false
        if (USE_MOCK_WS || !this.config.url.startsWith('ws')) {
          this.simulateConnection(resolve, reject);
        } else {
          this.createRealConnection(resolve, reject);
        }
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private simulateConnection(
    resolve: () => void,
    _reject: (error: unknown) => void
  ) {
    // Simulate connection delay
    setTimeout(
      () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Simulate successful connection
        if (this.callbacks.onOpen) {
          this.callbacks.onOpen();
        }

        // Start simulated heartbeat
        this.startHeartbeat();

        resolve();

        // Simulate receiving messages
        this.simulateIncomingMessages();
      },
      1000 + Math.random() * 2000
    ); // Random delay 1-3 seconds
  }

  private createRealConnection(
    resolve: () => void,
    reject: (error: unknown) => void
  ) {
    this.ws = new WebSocket(this.config.url);

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      if (this.callbacks.onOpen) {
        this.callbacks.onOpen();
      }

      this.startHeartbeat();
      resolve();
    };

    this.ws.onclose = (_event) => {
      this.isConnecting = false;

      if (this.callbacks.onClose) {
        this.callbacks.onClose();
      }

      this.stopHeartbeat();

      if (!this.isManualClose) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (event) => {
      this.isConnecting = false;

      if (this.callbacks.onError) {
        this.callbacks.onError(event);
      }

      reject(event);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        logger.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: {
    type: string;
    data?: unknown;
    messageId?: string;
  }) {
    // Handle different message types
    switch (message.type) {
      case 'pong':
        // Heartbeat response
        break;
      case 'typing_start':
        if (this.callbacks.onTypingStart) {
          this.callbacks.onTypingStart();
        }
        break;
      case 'typing_stop':
        if (this.callbacks.onTypingStop) {
          this.callbacks.onTypingStop();
        }
        break;
      default:
        if (this.callbacks.onMessage) {
          this.callbacks.onMessage(message);
        }
    }
  }

  private simulateIncomingMessages() {
    // No automatic random messages — responses are triggered by user sends
  }

  send(message: { type: string; data?: unknown }): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }

    // In simulation mode, simulate agent response
    if (USE_MOCK_WS) {
      if (message.type === 'message') {
        this.simulateAgentResponse();
      }
      return true;
    }

    return false;
  }

  private simulateAgentResponse() {
    // Show typing indicator
    setTimeout(() => {
      if (this.isManualClose) return;
      this.handleMessage({ type: 'typing_start' });
    }, 500);

    // Send agent reply after delay
    setTimeout(
      () => {
        if (this.isManualClose) return;
        this.handleMessage({ type: 'typing_stop' });

        const replies = [
          '감사합니다. 문의 내용을 확인하고 있습니다.',
          '네, 도와드리겠습니다. 잠시만 기다려주세요.',
          '해당 문의는 담당자에게 전달되었습니다. 빠른 시일 내에 답변 드리겠습니다.',
          '추가 정보가 필요하시면 언제든 말씀해주세요.',
          '확인했습니다. 자세한 안내를 드리겠습니다.',
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];

        this.handleMessage({
          type: 'message',
          data: {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            type: 'text',
            content: reply,
            sender: 'agent',
            timestamp: new Date().toISOString(),
          },
          messageId: `msg_${Date.now()}`,
        });
      },
      1500 + Math.random() * 2000
    );
  }

  sendTypingIndicator(isTyping: boolean) {
    this.send({
      type: isTyping ? 'typing_start' : 'typing_stop',
    });
  }

  disconnect() {
    this.isManualClose = true;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      if (this.callbacks.onReconnectFailed) {
        this.callbacks.onReconnectFailed();
      }
      return;
    }

    this.reconnectAttempts++;

    if (this.callbacks.onReconnect) {
      this.callbacks.onReconnect();
    }

    this.reconnectTimer = setTimeout(
      () => {
        this.connect();
      },
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)
    ); // Exponential backoff
  }

  private startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  getReadyState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Factory function to create a message sender using WebSocket
export function createWebSocketMessageSender(
  wsService: ChatWebSocketService
): MessageSenderFunction {
  return async (message: string, attachment?: File) => {
    const messageData = {
      type: 'chat',
      data: {
        text: message,
        attachment: attachment ? attachment.name : undefined,
        timestamp: new Date().toISOString(),
      },
    };

    const success = wsService.send(messageData);

    if (!success) {
      throw new Error('Failed to send message');
    }
  };
}
