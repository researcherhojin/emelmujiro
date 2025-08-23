import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TypingIndicator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
        <Bot className="w-4 h-4" />
      </div>

      {/* Typing Animation */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center space-x-1">
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: index * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          {t('chat.typing', '입력 중...')}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
