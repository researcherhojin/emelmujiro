import WebSocketService from '../websocket';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// WebSocket readyState constants
const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSING = 2;
const WS_CLOSED = 3;

// Mock WebSocket
class MockWebSocket {
  static readonly CONNECTING = WS_CONNECTING;
  static readonly OPEN = WS_OPEN;
  static readonly CLOSING = WS_CLOSING;
  static readonly CLOSED = WS_CLOSED;

  // Instance constants (WebSocket spec requires these on instances too)
  readonly CONNECTING = WS_CONNECTING;
  readonly OPEN = WS_OPEN;
  readonly CLOSING = WS_CLOSING;
  readonly CLOSED = WS_CLOSED;

  url: string;
  readyState: number;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    this.readyState = WS_CONNECTING;
    setTimeout(() => {
      this.readyState = WS_OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  send(_data: string | ArrayBuffer): void {
    if (this.readyState !== WS_OPEN) {
      throw new Error('WebSocket is not open');
    }
  }

  close(): void {
    this.readyState = WS_CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

(global as any).WebSocket = MockWebSocket;

describe('WebSocketService', () => {
  let wsService: WebSocketService;

  beforeEach(() => {
    vi.useFakeTimers();
    wsService = new WebSocketService();
  });

  afterEach(() => {
    wsService.disconnect();
    vi.useRealTimers();
  });

  describe('Connection Management', () => {
    it('should connect to WebSocket server', async () => {
      const onConnect = vi.fn();
      wsService.on('connect', onConnect);

      wsService.connect('ws://localhost:8000/ws/test/');

      await vi.advanceTimersByTimeAsync(10);
      expect(onConnect).toHaveBeenCalled();
    });

    it('should handle connection with authentication', async () => {
      const token = 'test-token';
      wsService.connect('ws://localhost:8000/ws/test/', { token });

      await vi.advanceTimersByTimeAsync(10);
      expect(wsService.isConnected()).toBe(true);
    });

    it('should disconnect from WebSocket server', () => {
      wsService.connect('ws://localhost:8000/ws/test/');
      wsService.disconnect();

      expect(wsService.isConnected()).toBe(false);
    });

    it('should handle reconnection', async () => {
      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      // Simulate disconnect
      wsService.disconnect();

      // Reconnect
      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      expect(wsService.isConnected()).toBe(true);
    });

    it('should auto-reconnect on unexpected disconnect', async () => {
      const onReconnect = vi.fn();
      wsService.on('reconnect', onReconnect);
      wsService.setAutoReconnect(true);
      wsService.connect('ws://localhost:8000/ws/test/');

      await vi.advanceTimersByTimeAsync(10);

      // Simulate unexpected disconnect by calling the service's onclose handler
      // directly (not wsService.disconnect(), which cleans up properly)
      const ws = (wsService as any).ws;
      if (ws && ws.onclose) {
        ws.onclose(new CloseEvent('close'));
      }

      // The reconnect event should have been emitted synchronously
      expect(onReconnect).toHaveBeenCalled();

      // Wait for auto-reconnect timer to fire and re-establish connection
      await vi.advanceTimersByTimeAsync(1100);

      // After reconnection, the service should be connected again
      expect(wsService.isConnected()).toBe(true);
    });

    it('should respect max reconnect attempts', async () => {
      wsService.setAutoReconnect(true, 2, 100);
      wsService.connect('ws://localhost:8000/ws/test/');

      await vi.advanceTimersByTimeAsync(10);

      // Simulate multiple disconnects
      for (let i = 0; i < 3; i++) {
        const ws = (wsService as any).ws;
        if (ws && ws.onclose) {
          ws.onclose(new CloseEvent('close'));
        }
        await vi.advanceTimersByTimeAsync(150);
      }

      expect(wsService.getReconnectAttempts()).toBeLessThanOrEqual(2);
    });
  });

  describe('Message Handling', () => {
    it('should send message when connected', async () => {
      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      const message = { type: 'chat', text: 'Hello' };
      const sent = wsService.send(message);

      expect(sent).toBe(true);
    });

    it('should queue messages when not connected', () => {
      const message = { type: 'chat', text: 'Hello' };
      const sent = wsService.send(message);

      expect(sent).toBe(false);
      expect(wsService.getQueueSize()).toBe(1);
    });

    it('should send queued messages on connection', async () => {
      const message1 = { type: 'chat', text: 'Message 1' };
      const message2 = { type: 'chat', text: 'Message 2' };

      wsService.send(message1);
      wsService.send(message2);

      expect(wsService.getQueueSize()).toBe(2);

      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      expect(wsService.getQueueSize()).toBe(0);
    });

    it('should handle incoming messages', async () => {
      const onMessage = vi.fn();
      wsService.on('message', onMessage);

      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      const ws = (wsService as any).ws;
      if (ws && ws.onmessage) {
        const event = new MessageEvent('message', {
          data: JSON.stringify({ type: 'chat', text: 'Hello' }),
        });
        ws.onmessage(event);
      }
      expect(onMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'chat', text: 'Hello' })
      );
    });

    it('should handle different message types', async () => {
      const onChat = vi.fn();
      const onNotification = vi.fn();

      wsService.on('chat', onChat);
      wsService.on('notification', onNotification);

      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      const ws = (wsService as any).ws;
      if (ws && ws.onmessage) {
        ws.onmessage(
          new MessageEvent('message', {
            data: JSON.stringify({ type: 'chat', text: 'Hello' }),
          })
        );

        ws.onmessage(
          new MessageEvent('message', {
            data: JSON.stringify({
              type: 'notification',
              message: 'Alert',
            }),
          })
        );
      }

      expect(onChat).toHaveBeenCalled();
      expect(onNotification).toHaveBeenCalled();
    });

    it('should handle malformed messages', async () => {
      const onError = vi.fn();
      wsService.on('error', onError);

      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      const ws = (wsService as any).ws;
      if (ws && ws.onmessage) {
        ws.onmessage(
          new MessageEvent('message', {
            data: 'invalid json',
          })
        );
      }

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Event System', () => {
    it('should register event listeners', () => {
      const handler = vi.fn();
      wsService.on('test', handler);

      wsService.emit('test', { data: 'test' });
      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should unregister event listeners', () => {
      const handler = vi.fn();
      wsService.on('test', handler);
      wsService.off('test', handler);

      wsService.emit('test', { data: 'test' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      wsService.on('test', handler1);
      wsService.on('test', handler2);

      wsService.emit('test', { data: 'test' });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should support once listeners', () => {
      const handler = vi.fn();
      wsService.once('test', handler);

      wsService.emit('test', { data: 'first' });
      wsService.emit('test', { data: 'second' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ data: 'first' });
    });
  });

  describe('Connection State', () => {
    it('should track connection state', async () => {
      expect(wsService.getState()).toBe('disconnected');

      wsService.connect('ws://localhost:8000/ws/test/');
      expect(wsService.getState()).toBe('connecting');

      await vi.advanceTimersByTimeAsync(10);
      expect(wsService.getState()).toBe('connected');

      wsService.disconnect();
      expect(wsService.getState()).toBe('disconnected');
    });

    it('should track connection URL', () => {
      const url = 'ws://localhost:8000/ws/test/';
      wsService.connect(url);

      expect(wsService.getUrl()).toBe(url);
    });

    it('should clear state on disconnect', () => {
      wsService.connect('ws://localhost:8000/ws/test/');
      wsService.disconnect();

      expect(wsService.getUrl()).toBeNull();
      expect(wsService.getState()).toBe('disconnected');
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      const onError = vi.fn();
      wsService.on('error', onError);

      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      const ws = (wsService as any).ws;
      if (ws && ws.onerror) {
        ws.onerror(new Event('error'));
      }

      expect(onError).toHaveBeenCalled();
    });

    it('should handle send errors', async () => {
      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      // Close connection to cause send error
      const ws = (wsService as any).ws;
      ws.readyState = WS_CLOSED;

      const sent = wsService.send({ type: 'test' });
      expect(sent).toBe(false);
    });

    it('should handle reconnection errors', async () => {
      // Save original MockWebSocket
      const originalWebSocket = (global as any).WebSocket;

      try {
        // Force connection to fail
        (global as any).WebSocket = class {
          constructor() {
            throw new Error('Connection failed');
          }
        };

        // The connect method does `new WebSocket(url)` without try-catch,
        // so it will throw when the constructor throws.
        expect(() => {
          wsService.connect('ws://localhost:8000/ws/test/');
        }).toThrow('Connection failed');
      } finally {
        // Always restore MockWebSocket
        (global as any).WebSocket = originalWebSocket;
      }
    });
  });

  describe('Heartbeat/Ping', () => {
    it('should send heartbeat messages', async () => {
      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      const sendSpy = vi.spyOn((wsService as any).ws, 'send');

      wsService.enableHeartbeat(100);

      await vi.advanceTimersByTimeAsync(150);

      expect(sendSpy).toHaveBeenCalledWith(expect.stringContaining('ping'));
    });

    it('should stop heartbeat on disconnect', async () => {
      wsService.enableHeartbeat(100);
      wsService.connect('ws://localhost:8000/ws/test/');

      await vi.advanceTimersByTimeAsync(10);

      wsService.disconnect();

      const sendSpy = vi.spyOn(MockWebSocket.prototype, 'send');

      await vi.advanceTimersByTimeAsync(150);

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should handle pong messages', async () => {
      const onPong = vi.fn();
      wsService.on('pong', onPong);

      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      const ws = (wsService as any).ws;
      if (ws && ws.onmessage) {
        ws.onmessage(
          new MessageEvent('message', {
            data: JSON.stringify({ type: 'pong' }),
          })
        );
      }

      expect(onPong).toHaveBeenCalled();
    });
  });

  describe('Message History', () => {
    it('should store message history', async () => {
      wsService.enableHistory(10);
      wsService.connect('ws://localhost:8000/ws/test/');

      await vi.advanceTimersByTimeAsync(10);

      const ws = (wsService as any).ws;
      for (let i = 0; i < 5; i++) {
        if (ws && ws.onmessage) {
          ws.onmessage(
            new MessageEvent('message', {
              data: JSON.stringify({ type: 'chat', text: `Message ${i}` }),
            })
          );
        }
      }

      const history = wsService.getHistory();
      expect(history).toHaveLength(5);
    });

    it('should limit history size', async () => {
      wsService.enableHistory(3);
      wsService.connect('ws://localhost:8000/ws/test/');

      await vi.advanceTimersByTimeAsync(10);

      const ws = (wsService as any).ws;
      for (let i = 0; i < 5; i++) {
        if (ws && ws.onmessage) {
          ws.onmessage(
            new MessageEvent('message', {
              data: JSON.stringify({ type: 'chat', text: `Message ${i}` }),
            })
          );
        }
      }

      const history = wsService.getHistory();
      expect(history).toHaveLength(3);
      expect((history[0] as any).text).toBe('Message 2');
    });

    it('should clear history', async () => {
      wsService.enableHistory(10);
      wsService.connect('ws://localhost:8000/ws/test/');

      await vi.advanceTimersByTimeAsync(10);

      const ws = (wsService as any).ws;
      if (ws && ws.onmessage) {
        ws.onmessage(
          new MessageEvent('message', {
            data: JSON.stringify({ type: 'chat', text: 'Message' }),
          })
        );
      }

      wsService.clearHistory();
      expect(wsService.getHistory()).toHaveLength(0);
    });
  });

  describe('Binary Data', () => {
    it('should send binary data', async () => {
      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      const buffer = new ArrayBuffer(8);
      const sent = wsService.sendBinary(buffer);

      expect(sent).toBe(true);
    });

    it('should return false for sendBinary when not connected (line 104)', () => {
      // Not connected, so sendBinary should return false
      const buffer = new ArrayBuffer(8);
      const sent = wsService.sendBinary(buffer);

      expect(sent).toBe(false);
    });
  });

  describe('Queue Eviction', () => {
    it('should evict oldest message when queue exceeds maxQueueSize (line 92)', () => {
      // Send 101 messages (exceeds default maxQueueSize of 100)
      for (let i = 0; i < 101; i++) {
        wsService.send({ type: 'chat', data: `msg-${i}` });
      }

      // Queue should be capped at 100
      expect(wsService.getQueueSize()).toBe(100);
    });
  });

  describe('off() Edge Cases', () => {
    it('should not throw when removing handler for event with no registered handlers (line 116)', () => {
      const handler = vi.fn();
      // Call off() for an event that was never registered — should not throw
      expect(() => {
        wsService.off('nonexistent_event', handler);
      }).not.toThrow();
    });
  });

  describe('Heartbeat Edge Cases', () => {
    it('should not send heartbeat when not connected (line 172)', async () => {
      // Enable heartbeat while disconnected — the interval fires but the guard
      // `this.state === 'connected'` prevents sending
      wsService.enableHeartbeat(100);

      // Advance past the interval
      await vi.advanceTimersByTimeAsync(150);

      // No WebSocket exists, so nothing should have been sent (and no error thrown)
      expect(wsService.isConnected()).toBe(false);
    });

    it('should clear existing heartbeat before enabling new one (line 168)', async () => {
      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      // Enable heartbeat twice to trigger the clear on line 168
      wsService.enableHeartbeat(500);
      wsService.enableHeartbeat(200);

      const sendSpy = vi.spyOn((wsService as any).ws, 'send');

      // Advance enough for the second heartbeat interval only
      await vi.advanceTimersByTimeAsync(250);

      // Should have sent at least one heartbeat from the new interval
      expect(sendSpy).toHaveBeenCalledWith(expect.stringContaining('ping'));
    });
  });

  describe('connect() when WebSocket is undefined', () => {
    it('does nothing when WebSocket global is not defined (line 33 false branch)', () => {
      const origWS = (global as any).WebSocket;
      delete (global as any).WebSocket;

      const service = new WebSocketService();
      service.connect('ws://localhost:8000/ws/test/');

      // State transitions to connecting but ws remains null — no WebSocket created
      expect(service.getState()).toBe('connecting');
      expect(service.isConnected()).toBe(false);

      service.disconnect();
      (global as any).WebSocket = origWS;
    });
  });

  describe('Message without type field', () => {
    it('emits message event but no type-specific event (line 63 false branch)', async () => {
      const onMessage = vi.fn();
      const onUndefined = vi.fn();

      wsService.on('message', onMessage);
      // Register a listener for 'undefined' to verify it is NOT called
      wsService.on('undefined', onUndefined);

      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      const ws = (wsService as any).ws;
      if (ws && ws.onmessage) {
        // Send a message with no `type` field
        ws.onmessage(
          new MessageEvent('message', {
            data: JSON.stringify({ payload: 'no-type-here' }),
          })
        );
      }

      // The generic message listener should fire
      expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ payload: 'no-type-here' }));
      // No type-specific event should be emitted
      expect(onUndefined).not.toHaveBeenCalled();
    });
  });

  describe('attemptReconnect()', () => {
    it('should reconnect after close when autoReconnect is enabled (lines 194-205)', async () => {
      const onReconnect = vi.fn();
      wsService.on('reconnect', onReconnect);
      wsService.setAutoReconnect(true, 3, 200);

      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);
      expect(wsService.isConnected()).toBe(true);

      // Simulate unexpected close via the raw WebSocket's onclose handler
      const ws = (wsService as any).ws;
      ws.onclose(new CloseEvent('close'));

      // reconnect event emitted synchronously
      expect(onReconnect).toHaveBeenCalledTimes(1);
      expect(wsService.getReconnectAttempts()).toBe(1);

      // Wait for reconnect delay + connection open
      await vi.advanceTimersByTimeAsync(250);

      // The service should have reconnected successfully
      expect(wsService.isConnected()).toBe(true);
    });

    it('should not call connect when url is null during reconnect timeout (line 205)', async () => {
      wsService.setAutoReconnect(true, 3, 200);
      wsService.connect('ws://localhost:8000/ws/test/');
      await vi.advanceTimersByTimeAsync(10);

      // Trigger close to schedule reconnect
      const ws = (wsService as any).ws;
      ws.onclose(new CloseEvent('close'));

      // Clear the url before the timeout fires to exercise the `if (this.url)` false branch
      (wsService as any).url = null;

      // Advance past the reconnect delay
      await vi.advanceTimersByTimeAsync(250);

      // Should remain disconnected since url was null when timeout fired
      expect(wsService.isConnected()).toBe(false);
    });
  });
});
