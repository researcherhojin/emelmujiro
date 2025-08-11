import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import { useChatContext } from '../../contexts/ChatContext';
import MessageList from './MessageList';
import QuickReplies from './QuickReplies';
import TypingIndicator from './TypingIndicator';
// import FileUpload from './FileUpload'; // Commented out - not used
import EmojiPicker from './EmojiPicker';
import { useTranslation } from 'react-i18next';

const ChatWindow: React.FC = () => {
  const { t } = useTranslation();
  const { showNotification } = useUI();
  const {
    messages,
    isTyping,
    isConnected,
    agentAvailable,
    businessHours,
    sendMessage,
    startTyping,
    stopTyping,
  } = useChatContext();

  const [inputValue, setInputValue] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // const [showFileUpload, setShowFileUpload] = useState(false); // Commented out - not used
  const [isComposing, setIsComposing] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle input changes and typing indicators
  useEffect(() => {
    if (inputValue.trim() && !isComposing) {
      setIsComposing(true);
      startTyping();
    } else if (!inputValue.trim() && isComposing) {
      setIsComposing(false);
      stopTyping();
    }

    return () => {
      if (isComposing) {
        stopTyping();
      }
    };
  }, [inputValue, isComposing, startTyping, stopTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 100) + 'px';
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    const message = inputValue.trim();
    if (!message) return;

    setInputValue('');
    setShowQuickReplies(false);
    setIsComposing(false);
    stopTyping();

    try {
      await sendMessage({
        type: 'text',
        content: message,
        sender: 'user',
      });
    } catch (_error) {
      showNotification('error', t('chat.error.sendFailed', '메시지 전송에 실패했습니다.'));
      setInputValue(message); // Restore message on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB limit

    if (file.size > maxSize) {
      showNotification(
        'error',
        t('chat.error.fileTooLarge', '파일 크기가 너무 큽니다. (최대 10MB)')
      );
      return;
    }

    try {
      await sendMessage({
        type: 'file',
        content: file.name,
        file: file,
        sender: 'user',
      });
    } catch (_error) {
      showNotification('error', t('chat.error.uploadFailed', '파일 업로드에 실패했습니다.'));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportChat = async () => {
    try {
      const chatData = {
        timestamp: new Date().toISOString(),
        messages: messages,
        participantInfo: {
          user: 'Customer',
          agent: agentAvailable ? 'Support Agent' : 'Chatbot',
        },
      };

      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-transcript-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification('success', t('chat.exportSuccess', '채팅 기록을 다운로드했습니다.'));
    } catch (_error) {
      showNotification('error', t('chat.error.exportFailed', '채팅 기록 내보내기에 실패했습니다.'));
    }
  };

  const canSendMessage = isConnected && inputValue.trim().length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">
              {t('chat.connectionStatus.reconnecting', '연결 중... 메시지는 연결 후 전송됩니다.')}
            </span>
          </div>
        </div>
      )}

      {/* Business Hours Notice */}
      {isConnected && !businessHours.isOpen && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
            <Clock className="w-4 h-4" />
            <div className="text-xs">
              <div>{t('chat.afterHours.title', '운영시간 외입니다')}</div>
              <div className="text-blue-600 dark:text-blue-400">
                {t('chat.afterHours.message', `운영시간: ${businessHours.hours}`)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
        <MessageList />

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-2"
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Replies */}
      <AnimatePresence>
        {showQuickReplies && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <QuickReplies onSelect={handleQuickReply} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-end space-x-2">
          {/* File Upload Button */}
          <button
            onClick={handleFileSelect}
            disabled={!isConnected}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('chat.attachFile', '파일 첨부')}
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isConnected
                  ? t('chat.placeholder.connected', '메시지를 입력하세요...')
                  : t('chat.placeholder.disconnected', '연결 중...')
              }
              disabled={!isConnected}
              className="
                w-full px-3 py-2 pr-12 
                border border-gray-300 dark:border-gray-600 
                rounded-lg resize-none 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                bg-white dark:bg-gray-700 
                text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                disabled:bg-gray-100 dark:disabled:bg-gray-800 
                disabled:cursor-not-allowed
                transition-colors
              "
              rows={1}
              maxLength={1000}
            />

            {/* Character Count */}
            {inputValue.length > 800 && (
              <div className="absolute -top-6 right-0 text-xs text-gray-500">
                {inputValue.length}/1000
              </div>
            )}

            {/* Emoji Button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title={t('chat.addEmoji', '이모지 추가')}
            >
              <Smile className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!canSendMessage}
            className="
              p-2 rounded-full 
              bg-blue-500 hover:bg-blue-600 
              disabled:bg-gray-300 dark:disabled:bg-gray-600
              disabled:cursor-not-allowed 
              transition-colors
            "
            title={t('chat.send', '전송')}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Additional Options */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>
              {isConnected ? (
                <>
                  <CheckCircle className="w-3 h-3 inline mr-1 text-green-500" />
                  {t('chat.status.connected', '연결됨')}
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 inline mr-1 text-yellow-500" />
                  {t('chat.status.connecting', '연결 중...')}
                </>
              )}
            </span>
          </div>

          <button
            onClick={handleExportChat}
            disabled={messages.length === 0}
            className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('chat.exportTranscript', '대화 내용 내보내기')}
          >
            <Download className="w-3 h-3" />
            <span>{t('chat.export', '내보내기')}</span>
          </button>
        </div>
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default ChatWindow;
