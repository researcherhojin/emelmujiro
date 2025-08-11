import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, HelpCircle, Settings } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';
import { useTranslation } from 'react-i18next';

interface QuickRepliesProps {
  onSelect: (reply: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ onSelect }) => {
  const { t } = useTranslation();
  const { settings } = useChatContext();

  const quickReplies = [
    {
      id: 'service',
      text: t('chat.quickReplies.service', '서비스 문의'),
      icon: MessageSquare,
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    {
      id: 'technical',
      text: t('chat.quickReplies.technical', '기술 지원'),
      icon: Settings,
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    },
    {
      id: 'pricing',
      text: t('chat.quickReplies.pricing', '요금 문의'),
      icon: HelpCircle,
      color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    {
      id: 'contact',
      text: t('chat.quickReplies.contact', '연락처 문의'),
      icon: Phone,
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    },
  ];

  const handleQuickReply = (reply: string) => {
    onSelect(reply);
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('chat.quickReplies.title', '빠른 답변을 선택하세요')}
        </h4>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {quickReplies.map((reply, index) => {
          const IconComponent = reply.icon;
          
          return (
            <motion.button
              key={reply.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleQuickReply(reply.text)}
              className={`
                p-3 rounded-lg border text-left transition-all duration-200
                hover:shadow-sm hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
                ${reply.color}
              `}
            >
              <div className="flex items-center space-x-2">
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{reply.text}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Custom Quick Replies from Settings */}
      {settings.quickReplies.length > 4 && (
        <div className="mt-3 space-y-1">
          {settings.quickReplies.slice(4).map((reply, index) => (
            <motion.button
              key={`custom-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index + 4) * 0.1 }}
              onClick={() => handleQuickReply(reply)}
              className="
                w-full p-2 text-left text-sm 
                bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700 
                rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
              "
            >
              {reply}
            </motion.button>
          ))}
        </div>
      )}
      
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('chat.quickReplies.or', '또는 직접 메시지를 입력하세요')}
        </p>
      </div>
    </div>
  );
};

export default QuickReplies;