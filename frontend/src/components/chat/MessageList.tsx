import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import logger from '../../utils/logger';
import MessageBubble from './MessageBubble';

const MessageList: React.FC = () => {
  const { t } = useTranslation();
  const { messages, markAsRead, sendMessage } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }

    return undefined;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const isToday = now.toDateString() === messageDate.toDateString();

    if (isToday) {
      return format(messageDate, 'HH:mm');
    }
    return format(messageDate, 'MM/dd HH:mm');
  };

  const handleRetryMessage = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    try {
      await sendMessage({
        type: message.type,
        content: message.content,
        sender: message.sender,
        file: message.file,
      });
    } catch (error) {
      logger.error('Failed to retry message:', error);
    }
  };

  const handleFileDownload = (
    file: File | { url: string } | undefined,
    filename: string
  ) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (file?.url) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleImagePreview = (
    file: File | { url: string } | undefined,
    filename: string
  ) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          const doc = newWindow.document;
          doc.title = filename.replace(/[<>]/g, '');

          const html = doc.documentElement;
          html.style.height = '100%';

          const body = doc.body;
          body.style.margin = '0';
          body.style.backgroundColor = '#000';
          body.style.display = 'flex';
          body.style.alignItems = 'center';
          body.style.justifyContent = 'center';
          body.style.height = '100%';

          const imgElement = doc.createElement('img');
          imgElement.src = url;
          imgElement.style.maxWidth = '100%';
          imgElement.style.maxHeight = '100%';
          imgElement.style.objectFit = 'contain';

          body.innerHTML = '';
          body.appendChild(imgElement);
        }
      };
    } else if (file?.url) {
      window.open(file.url, '_blank');
    }
  };

  const handleSendQuickReply = (content: string) => {
    sendMessage({
      type: 'text',
      content,
      sender: 'user',
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">
            {t('chat.emptyState.title', '대화를 시작해보세요')}
          </p>
          <p className="text-sm">
            {t(
              'chat.emptyState.subtitle',
              '궁금한 것이 있으시면 언제든 물어보세요!'
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto px-4 py-2 scroll-smooth"
      style={{ scrollBehavior: 'smooth' }}
    >
      <AnimatePresence>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            formatMessageTime={formatMessageTime}
            onRetry={handleRetryMessage}
            onSendQuickReply={handleSendQuickReply}
            onFileDownload={handleFileDownload}
            onImagePreview={handleImagePreview}
            onMarkAsRead={markAsRead}
          />
        ))}
      </AnimatePresence>

      <div ref={messagesEndRef} />

      <AnimatePresence>
        {!shouldAutoScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="fixed bottom-20 right-8 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            title={t('chat.scrollToBottom', '최신 메시지로 이동')}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;
