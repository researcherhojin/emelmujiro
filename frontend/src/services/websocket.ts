import { ChatMessage, MessageSender } from '../contexts/ChatContext';

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
  onMessage?: (message: any) => void;
  onReconnect?: () => void;
  onReconnectFailed?: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private callbacks: WebSocketCallbacks;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
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

  private simulateConnection(resolve: () => void, reject: (error: any) => void) {
    // Simulate connection delay
    setTimeout(() => {
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
    }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
  }

  private createRealConnection(resolve: () => void, reject: (error: any) => void) {
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
    
    this.ws.onclose = (event) => {
      this.isConnecting = false;
      this.stopHeartbeat();
      
      if (this.callbacks.onClose) {
        this.callbacks.onClose();
      }
      
      if (!this.isManualClose) {
        this.attemptReconnect();
      }
    };
    
    this.ws.onerror = (error) => {
      this.isConnecting = false;
      
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      
      reject(error);
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private simulateIncomingMessages() {
    // Simulate agent responses after user messages
    const responses = [
      '안녕하세요! 무엇을 도와드릴까요?',
      '네, 확인해보겠습니다.',
      '추가로 궁금한 점이 있으시면 언제든 문의해주세요.',
      '감사합니다. 더 도움이 필요하시면 말씀해주세요.',
    ];

    let responseIndex = 0;

    // Set up periodic simulated responses
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of agent message
        const response = responses[responseIndex % responses.length];
        responseIndex++;

        const simulatedMessage = {
          type: 'message',
          data: {
            id: `sim_${Date.now()}`,
            type: 'text',
            content: response,
            sender: 'agent' as MessageSender,
            timestamp: new Date(),
            status: 'read',
            agentName: '고객지원팀',
          }
        };

        if (this.callbacks.onMessage) {
          this.callbacks.onMessage(simulatedMessage);
        }
      }
    }, 30000 + Math.random() * 60000); // Random interval 30-90 seconds
  }

  disconnect() {
    this.isManualClose = true;
    this.stopHeartbeat();
    this.stopReconnect();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any): boolean {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, just simulate sending
      console.log('Simulated WebSocket send:', data);
      
      // Simulate message delivery confirmation
      setTimeout(() => {
        if (data.type === 'message' && this.callbacks.onMessage) {
          this.callbacks.onMessage({
            type: 'message_delivered',
            messageId: data.data?.id,
          });
        }
      }, 500 + Math.random() * 1000);
      
      return true;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'message':
        if (this.callbacks.onMessage) {
          this.callbacks.onMessage(data);
        }
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
        
      case 'pong':
        // Heartbeat response
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      } else if (process.env.NODE_ENV === 'development') {
        // Simulate heartbeat in development
        console.log('Simulated heartbeat');
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts || this.isManualClose) {
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
      this.connect().catch(() => {
        // Reconnection failed, will try again
      });
    }, this.config.reconnectInterval);
  }

  private stopReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  isConnected(): boolean {
    if (process.env.NODE_ENV === 'development') {
      return !this.isManualClose; // Simulate always connected in dev
    }
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false;
  }

  getState(): number {
    if (process.env.NODE_ENV === 'development') {
      return this.isManualClose ? WebSocket.CLOSED : WebSocket.OPEN;
    }
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }
}

export const createChatWebSocket = (callbacks: WebSocketCallbacks): ChatWebSocketService => {
  const config: WebSocketConfig = {
    url: process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8000/ws/chat/',
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000, // 30 seconds
  };

  return new ChatWebSocketService(config, callbacks);
};