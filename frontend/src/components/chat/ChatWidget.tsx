import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Clock,
  Users,
} from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import { useChatContext } from '../../contexts/ChatContext';
import ChatWindow from './ChatWindow';
import AdminPanel from './AdminPanel';
import { useTranslation } from 'react-i18next';

interface ChatWidgetProps {
  className?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = memo(({ className }) => {
  const { t } = useTranslation();
  const { theme } = useUI();
  const {
    isOpen,
    isMinimized,
    unreadCount,
    isConnected,
    agentAvailable,
    businessHours,
    openChat,
    closeChat,
    toggleMinimize,
    markAllAsRead,
  } = useChatContext();

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Show widget after a delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Admin panel keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setShowAdminPanel(true);
      }
      // ESC to close admin panel
      if (event.key === 'Escape' && showAdminPanel) {
        setShowAdminPanel(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAdminPanel]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        if (isOpen && !isMinimized) {
          // Don't auto-close, just minimize instead
          toggleMinimize();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }

    // Return undefined for the case when isOpen is false
    return undefined;
  }, [isOpen, isMinimized, toggleMinimize]);

  // Keyboard accessibility
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen) {
        openChat();
        markAllAsRead();
      } else if (isMinimized) {
        toggleMinimize();
        markAllAsRead();
      }
    }
  };

  const handleToggleChat = () => {
    if (!isOpen) {
      openChat();
      markAllAsRead();
    } else if (isMinimized) {
      toggleMinimize();
      markAllAsRead();
    } else {
      toggleMinimize();
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return theme === 'dark' ? '#ef4444' : '#dc2626'; // Red for disconnected
    if (agentAvailable && businessHours.isOpen) return '#10b981'; // Green for available
    return '#f59e0b'; // Amber for unavailable
  };

  const getStatusText = () => {
    if (!isConnected) return t('chat.status.offline');
    if (agentAvailable && businessHours.isOpen) return t('chat.status.online');
    if (!businessHours.isOpen) return t('chat.status.afterHours');
    return t('chat.status.busy');
  };

  if (!isVisible) return null;

  return (
    <div
      ref={widgetRef}
      className={`fixed bottom-4 right-4 z-50 font-sans ${className}`}
      style={{
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={`mb-4 ${isMinimized ? 'pointer-events-none' : ''}`}
          >
            <div
              className={`
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-2xl
              w-80 h-96
              flex flex-col
              ${isMinimized ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
              transition-all duration-300
            `}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full"
                      style={{ backgroundColor: getStatusColor() }}
                    />
                  </div>
                  <div className="text-white">
                    <h3 className="font-semibold text-sm">
                      {t('chat.title', '고객 지원')}
                    </h3>
                    <p className="text-xs opacity-90">{getStatusText()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMinimize}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                    aria-label={
                      isMinimized ? t('chat.maximize') : t('chat.minimize')
                    }
                  >
                    {isMinimized ? (
                      <Maximize2 className="w-4 h-4 text-white" />
                    ) : (
                      <Minimize2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <button
                    onClick={closeChat}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                    aria-label={t('chat.close')}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              {!isMinimized && <ChatWindow />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.button
        onClick={handleToggleChat}
        onKeyDown={handleKeyPress}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative w-14 h-14 rounded-full shadow-lg
          bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
          text-white flex items-center justify-center
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-4 focus:ring-blue-500/30
          ${isOpen ? 'rotate-0' : 'rotate-0 hover:rotate-3'}
        `}
        aria-label={isOpen ? t('chat.close') : t('chat.open')}
        role="button"
        tabIndex={0}
      >
        {/* Connection Status Indicator */}
        <div
          className="absolute -top-1 -right-1 w-4 h-4 border-2 border-white rounded-full animate-pulse"
          style={{ backgroundColor: getStatusColor() }}
        />

        {/* Unread Messages Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}

        {/* Icon with animation */}
        <motion.div
          animate={{
            rotate: isOpen ? 45 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </motion.div>

        {/* Ripple effect on hover */}
        {isHovered && !isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Quick Info Tooltip */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>
                {agentAvailable && businessHours.isOpen
                  ? t('chat.quickInfo.available', '지금 채팅하세요!')
                  : t('chat.quickInfo.unavailable', '메시지를 남겨주세요')}
              </span>
            </div>
            {!businessHours.isOpen && (
              <div className="flex items-center space-x-2 mt-1 text-xs opacity-80">
                <Clock className="w-3 h-3" />
                <span>
                  {t('chat.businessHours', `운영시간: ${businessHours.hours}`)}
                </span>
              </div>
            )}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 dark:border-l-gray-100 border-y-4 border-y-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel */}
      <AnimatePresence>
        {showAdminPanel && (
          <AdminPanel
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

ChatWidget.displayName = 'ChatWidget';

export default ChatWidget;
