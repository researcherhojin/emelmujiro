// WebSocket service for real-time communication (notifications)

interface WebSocketMessage {
  type: string;
  data?: unknown;
  messageId?: string;
  timestamp?: string;
}

// Main WebSocketService class for tests
export default class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string | null = null;
  private state: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private readonly maxQueueSize = 100;
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

  send(message: WebSocketMessage): boolean {
    if (this.state === 'connected' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    } else {
      if (this.messageQueue.length >= this.maxQueueSize) {
        this.messageQueue.shift(); // FIFO eviction
      }
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

  getHistory(): WebSocketMessage[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.state === 'connected') {
      const message = this.messageQueue.shift();
      /* v8 ignore next */
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
