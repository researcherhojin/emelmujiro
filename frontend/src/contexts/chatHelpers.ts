import i18n from '../i18n';

export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageSender = 'user' | 'agent' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

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

export interface ChatContextType {
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
  sendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>) => Promise<void>;
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

// Default business hours (9 AM to 6 PM KST, Monday to Friday)
export const getDefaultBusinessHours = (): BusinessHours => {
  const now = new Date();
  const kstOffset = 9; // KST is UTC+9
  const currentHour = (now.getUTCHours() + kstOffset) % 24;
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  const isBusinessDay = currentDay >= 1 && currentDay <= 5;
  const isBusinessHour = currentHour >= 9 && currentHour < 18;

  return {
    isOpen: isBusinessDay && isBusinessHour,
    hours: i18n.t('chatContext.businessHours'),
    timezone: 'Asia/Seoul',
  };
};

export const getDefaultSettings = (): ChatSettings => ({
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

export const generateMessageId = () => {
  return `msg_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
};

export const playNotificationSound = () => {
  try {
    if (document.hidden) return;

    interface WindowWithWebkit extends Window {
      webkitAudioContext?: typeof AudioContext;
    }
    const audioContext = new (
      window.AudioContext || (window as WindowWithWebkit).webkitAudioContext
    )();

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
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Release AudioContext after sound finishes
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    // Silently fail for autoplay restrictions
    if (error instanceof Error && !error.message.includes('user gesture')) {
      // Intentionally silent — browser autoplay policy
    }
  }
};
