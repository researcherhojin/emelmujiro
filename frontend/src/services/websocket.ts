// MessageSender type for WebSocket message sending functionality
export type MessageSenderFunction = (message: string, attachment?: File) => Promise<void>;

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface WebSocketCallbacks {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: { type: string; data?: unknown; messageId?: string }) => void;
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
  private listeners: Map<string, Set<Function>> = new Map();
  private messageQueue: any[] = [];
  private reconnectAttempts = 0;
  private autoReconnect = false;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: any = null;
  private historyEnabled = false;
  private historyLimit = 100;
  private history: any[] = [];
  private options: any = {};

  connect(url: string, options?: any): void {
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
        
        if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
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

  send(message: any): boolean {
    if (this.state === 'connected' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    } else {
      this.messageQueue.push(message);
      return false;
    }
  }

  sendBinary(data: ArrayBuffer): boolean {
    if (this.state === 'connected' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return true;
    }
    return false;
  }

  on(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  once(event: string, handler: Function): void {
    const onceHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
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

  setAutoReconnect(enabled: boolean, maxAttempts?: number, delay?: number): void {
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

  getHistory(): any[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.state === 'connected') {
      const message = this.messageQueue.shift();
      this.send(message);
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

  private addToHistory(message: any): void {
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
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.isManualClose = false;

    return new Promise((resolve, reject) => {
      try {
        // For demo purposes, we'll simulate WebSocket behavior
        // In production, replace with actual WebSocket URL
        if (process.env.NODE_ENV === 'development' || !this.config.url.startsWith('ws')) {
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

  private simulateConnection(resolve: () => void, _reject: (error: unknown) => void) {
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

  private createRealConnection(resolve: () => void, reject: (error: unknown) => void) {
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

    this.ws.onclose = _event => {
      this.isConnecting = false;

      if (this.callbacks.onClose) {
        this.callbacks.onClose();
      }

      this.stopHeartbeat();

      if (!this.isManualClose) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = event => {
      this.isConnecting = false;

      if (this.callbacks.onError) {
        this.callbacks.onError(event);
      }

      reject(event);
    };

    this.ws.onmessage = event => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: { type: string; data?: unknown; messageId?: string }) {
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
    // Simulate random incoming messages in development mode
    const messageTypes = ['chat', 'notification', 'typing_start', 'typing_stop', 'update'];
    const randomInterval = () => Math.random() * 10000 + 5000; // 5-15 seconds

    const sendRandomMessage = () => {
      if (!this.isManualClose) {
        const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
        const message = {
          type: messageType,
          data: {
            timestamp: new Date().toISOString(),
            content: `Simulated ${messageType} message`,
          },
          messageId: Math.random().toString(36).substr(2, 9),
        };

        this.handleMessage(message);

        // Schedule next message
        setTimeout(sendRandomMessage, randomInterval());
      }
    };

    // Start after initial delay
    setTimeout(sendRandomMessage, randomInterval());
  }

  send(message: { type: string; data?: unknown }): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }

    // In simulation mode, just pretend we sent it
    if (process.env.NODE_ENV === 'development') {
      console.log('Simulated send:', message);
      return true;
    }

    return false;
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

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
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