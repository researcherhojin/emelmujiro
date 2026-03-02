import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('smileys');

  const emojiCategories = {
    smileys: {
      name: t('chat.emoji.smileys', '표정'),
      emojis: [
        '😀',
        '😃',
        '😄',
        '😁',
        '😆',
        '😅',
        '🤣',
        '😂',
        '🙂',
        '🙃',
        '😉',
        '😊',
        '😇',
        '🥰',
        '😍',
        '🤩',
        '😘',
        '😗',
        '😚',
        '😙',
        '😋',
        '😛',
        '😜',
        '🤪',
        '😝',
        '🤑',
        '🤗',
        '🤭',
        '🤫',
        '🤔',
        '😐',
        '😑',
        '😶',
        '😏',
        '😒',
        '🙄',
        '😬',
        '🤐',
        '😷',
        '🤒',
        '🤕',
        '🤢',
        '🤮',
        '🤧',
        '🥵',
        '🥶',
        '🥴',
        '😵',
        '🤯',
        '🤠',
      ],
    },
    gestures: {
      name: t('chat.emoji.gestures', '제스처'),
      emojis: [
        '👍',
        '👎',
        '👌',
        '🤌',
        '🤏',
        '✌️',
        '🤞',
        '🤟',
        '🤘',
        '🤙',
        '👈',
        '👉',
        '👆',
        '🖕',
        '👇',
        '☝️',
        '👋',
        '🤚',
        '🖐️',
        '✋',
        '🖖',
        '👏',
        '🙌',
        '🤝',
        '👐',
        '🤲',
        '🤜',
        '🤛',
        '✊',
        '👊',
        '🙏',
        '✍️',
        '💪',
        '🦾',
        '🦵',
        '🦿',
        '💄',
        '💋',
        '👄',
        '👅',
      ],
    },
    objects: {
      name: t('chat.emoji.objects', '사물'),
      emojis: [
        '💻',
        '🖥️',
        '🖨️',
        '⌨️',
        '🖱️',
        '🖲️',
        '💽',
        '💾',
        '💿',
        '📀',
        '📱',
        '☎️',
        '📞',
        '📟',
        '📠',
        '📺',
        '📻',
        '🎵',
        '🎶',
        '🎤',
        '🎧',
        '📢',
        '📣',
        '📯',
        '🔔',
        '🔕',
        '📪',
        '📫',
        '📬',
        '📭',
        '📮',
        '🗳️',
        '✏️',
        '✒️',
        '🖋️',
        '🖊️',
        '🖌️',
        '🔍',
        '🔎',
        '💡',
      ],
    },
    symbols: {
      name: t('chat.emoji.symbols', '기호'),
      emojis: [
        '❤️',
        '🧡',
        '💛',
        '💚',
        '💙',
        '💜',
        '🖤',
        '🤍',
        '🤎',
        '💔',
        '❣️',
        '💕',
        '💞',
        '💓',
        '💗',
        '💖',
        '💘',
        '💝',
        '💟',
        '☮️',
        '✝️',
        '☪️',
        '🕉️',
        '☸️',
        '✡️',
        '🔯',
        '🕎',
        '☯️',
        '☦️',
        '🛐',
        '⛎',
        '♈',
        '♉',
        '♊',
        '♋',
        '♌',
        '♍',
        '♎',
        '♏',
        '♐',
      ],
    },
  };

  const filteredEmojis = searchTerm
    ? Object.values(emojiCategories)
        .flatMap((category) => category.emojis)
        .filter((emoji) => emoji.includes(searchTerm))
    : emojiCategories[activeCategory as keyof typeof emojiCategories].emojis;

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-full left-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 mb-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('chat.emoji.title', '이모지 선택')}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('common.close', '닫기')}
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('chat.emoji.search', '이모지 검색...')}
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label={t('common.clear', '지우기')}
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      {!searchTerm && (
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {Object.entries(emojiCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeCategory === key
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="p-3 max-h-64 overflow-y-auto">
        {filteredEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <motion.button
                key={`${emoji}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEmojiSelect(emoji)}
                className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                aria-label={t('chat.emoji.select', { emoji })}
                title={emoji}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('chat.emoji.noResults', '검색 결과가 없습니다')}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('chat.emoji.tip', '이모지를 클릭하여 추가하세요')}
        </p>
      </div>
    </motion.div>
  );
};

export default EmojiPicker;
