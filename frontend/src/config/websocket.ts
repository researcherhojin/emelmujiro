/**
 * WebSocket configuration
 */

const getWebSocketBaseUrl = () => {
  // In development, connect to local Django server
  if (process.env.NODE_ENV === 'development') {
    return 'ws://localhost:8000';
  }

  // In production, derive from current location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
};

export const WS_BASE_URL = getWebSocketBaseUrl();

export const WS_ENDPOINTS = {
  CHAT: '/ws/chat/',
  CHAT_ROOM: (roomName: string) => `/ws/chat/${roomName}/`,
  NOTIFICATIONS: '/ws/notifications/',
} as const;

export const WS_CONFIG = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
} as const;

export const getWebSocketUrl = (endpoint: string): string => {
  return `${WS_BASE_URL}${endpoint}`;
};
