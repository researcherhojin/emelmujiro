import React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  RefreshCw,
  Bot,
  Info,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MessageContent from './MessageContent';

interface ChatMessage {
  id: string;
  type: string;
  content: string;
  sender: string;
  status: string;
  timestamp: Date;
  agentName?: string;
  file?: File | { url: string };
  quickReplies?: string[];
}

interface MessageBubbleProps {
  message: ChatMessage;
  formatMessageTime: (date: Date) => string;
  onRetry: (messageId: string) => void;
  onSendQuickReply: (content: string) => void;
  onFileDownload: (
    file: File | { url: string } | undefined,
    filename: string
  ) => void;
  onImagePreview: (
    file: File | { url: string } | undefined,
    filename: string
  ) => void;
  onMarkAsRead: (messageId: string) => void;
}

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

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  formatMessageTime,
  onRetry,
  onSendQuickReply,
  onFileDownload,
  onImagePreview,
  onMarkAsRead,
}) => {
  const { t } = useTranslation();
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const showAvatar = !isUser && !isSystem;

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
          onMarkAsRead(message.id);
        }
      }}
    >
      <div
        className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {showAvatar && (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold mr-3">
            {message.agentName ? (
              message.agentName[0]
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
        )}

        <div className="flex flex-col">
          {showAvatar && message.agentName && (
            <div className="text-xs text-gray-500 mb-1 px-2">
              {message.agentName}
            </div>
          )}

          <div
            className={`
              px-4 py-2 rounded-2xl relative
              ${
                isUser
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md'
              }
              ${message.status === 'failed' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
            `}
          >
            <MessageContent
              type={message.type}
              content={message.content}
              file={message.file}
              onFileDownload={onFileDownload}
              onImagePreview={onImagePreview}
            />

            {message.status === 'failed' && (
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={() => onRetry(message.id)}
                  className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{t('chat.retry')}</span>
                </button>
              </div>
            )}
          </div>

          <div
            className={`flex items-center mt-1 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <span className="mr-1">{formatMessageTime(message.timestamp)}</span>
            {isUser && getStatusIcon(message.status)}
          </div>

          {!isUser &&
            message.quickReplies &&
            message.quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {message.quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => onSendQuickReply(reply)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
