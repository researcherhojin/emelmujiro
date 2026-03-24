import React, { memo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, MessageSquare } from 'lucide-react';

const FAQ_ITEM_KEYS = [
  'general1',
  'education1',
  'education3',
  'consulting2',
  'technical2',
] as const;

interface FAQItemProps {
  itemKey: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = memo(({ itemKey, isOpen, onToggle }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-4 p-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 rounded-2xl"
      >
        <span className="flex-grow text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-keep">
          {t(`faq.items.${itemKey}.question`)}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        role="region"
        aria-live="polite"
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed break-keep whitespace-pre-line">
            {t(`faq.items.${itemKey}.answer`)}
          </p>
        </div>
      </div>
    </div>
  );
});

FAQItem.displayName = 'FAQItem';

const FAQSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const handleToggle = useCallback((itemKey: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  }, []);

  return (
    <section
      aria-label={t('faq.title')}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mb-6">
            <MessageSquare
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
              FAQ
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            {t('faq.title')}
          </h2>
          <p className="mt-4 text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 max-w-2xl mx-auto break-keep">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEM_KEYS.map((key) => (
            <FAQItem
              key={key}
              itemKey={key}
              isOpen={openItems.has(key)}
              onToggle={() => handleToggle(key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

FAQSection.displayName = 'FAQSection';

export default FAQSection;
