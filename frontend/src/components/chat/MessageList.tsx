import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  Download,
  Eye,
  Bot,
  Info
} from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';
import { useUI } from '../../contexts/UIContext';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const MessageList: React.FC = () => {
  const { t } = useTranslation();
  const { } = useUI();
  const { messages, markAsRead, sendMessage } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  // Check if user has scrolled up to disable auto-scroll
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      await sendMessage({
        type: message.type,
        content: message.content,
        sender: message.sender,
        file: message.file,
      });
    } catch (error) {
      console.error('Failed to retry message:', error);
    }
  };

  const handleFileDownload = (file: any, filename: string) => {
    if (file instanceof File) {
      // Create blob URL for local file
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (file?.url) {
      // Direct download from URL
      const a = document.createElement('a');
      a.href = file.url;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleImagePreview = (file: any, filename: string) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>${filename}</title></head>
              <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;">
                <img src="${url}" style="max-width:100%;max-height:100%;object-fit:contain;" />
              </body>
            </html>
          `);
        }
      };
    } else if (file?.url) {
      window.open(file.url, '_blank');
    }
  };

  const renderMessageContent = (message: any) => {
    switch (message.type) {
      case 'text':
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <div 
              className="cursor-pointer relative group rounded-lg overflow-hidden max-w-xs"
              onClick={() => handleImagePreview(message.file, message.content)}
            >
              {message.file instanceof File ? (
                <img
                  src={URL.createObjectURL(message.file)}
                  alt={message.content}
                  className="w-full h-auto max-h-48 object-cover group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                  <Eye className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <button
              onClick={() => handleFileDownload(message.file, message.content)}
              className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Download className="w-4 h-4" />
              <span>{message.content}</span>
            </button>
          </div>
        );
      
      case 'file':
        return (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-w-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {message.content}
                </div>
                {message.file?.size && (
                  <div className="text-xs text-gray-500">
                    {(message.file.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
              <button
                onClick={() => handleFileDownload(message.file, message.content)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title={t('chat.downloadFile', '파일 다운로드')}
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        );
      
      case 'system':
        return (
          <div className="text-center text-gray-600 dark:text-gray-400 italic">
            {message.content}
          </div>
        );
      
      default:
        return <div>{message.content}</div>;
    }
  };

  const renderMessage = (message: any, index: number) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';
    const showAvatar = !isUser && !isSystem;
    const showTimestamp = index === 0 || 
      (new Date(message.timestamp).getTime() - new Date(messages[index - 1]?.timestamp).getTime()) > 300000; // 5 minutes

    if (isSystem) {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center my-4"
        >
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
            <Info className="w-4 h-4" />
            <span>{message.content}</span>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        onViewportEnter={() => {
          if (!isUser && message.status !== 'read') {
            markAsRead(message.id);
          }
        }}
      >
        <div className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          {showAvatar && (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold mr-3">
              {message.agentName ? message.agentName[0] : <Bot className="w-4 h-4" />}
            </div>
          )}
          
          {/* Message Content */}
          <div className="flex flex-col">
            {/* Agent Name */}
            {showAvatar && message.agentName && (
              <div className="text-xs text-gray-500 mb-1 px-2">
                {message.agentName}
              </div>
            )}
            
            {/* Message Bubble */}
            <div
              className={`
                px-4 py-2 rounded-2xl relative
                ${isUser 
                  ? 'bg-blue-500 text-white rounded-br-md' 
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md'
                }
                ${message.status === 'failed' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
              `}
            >
              {renderMessageContent(message)}
              
              {/* Failed Message Actions */}
              {message.status === 'failed' && (
                <div className="mt-2 flex items-center space-x-2">
                  <button
                    onClick={() => handleRetryMessage(message.id)}
                    className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t('chat.retry', '다시 시도')}</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Timestamp and Status */}
            <div className={`flex items-center mt-1 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <span className="mr-1">{formatMessageTime(message.timestamp)}</span>
              {isUser && getStatusIcon(message.status)}
            </div>
          </div>
        </div>
      </motion.div>
    );
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
            {t('chat.emptyState.subtitle', '궁금한 것이 있으시면 언제든 물어보세요!')}
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
        {messages.map((message, index) => renderMessage(message, index))}
      </AnimatePresence>
      
      {/* Auto-scroll trigger */}
      <div ref={messagesEndRef} />
      
      {/* Scroll to bottom button */}
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;