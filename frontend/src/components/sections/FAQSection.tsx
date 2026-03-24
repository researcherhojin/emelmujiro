import React, { memo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, HelpCircle, BookOpen, MessageSquare, Code, Building2 } from 'lucide-react';

type Category = 'all' | 'general' | 'education' | 'consulting' | 'technical';

const FAQ_ITEM_KEYS = [
  'general1',
  'general2',
  'education1',
  'education2',
  'education3',
  'consulting1',
  'consulting2',
  'technical1',
  'technical2',
] as const;

const CATEGORIES: Category[] = ['all', 'general', 'education', 'consulting', 'technical'];

const CATEGORY_ICONS: Record<Exclude<Category, 'all'>, React.ElementType> = {
  general: HelpCircle,
  education: BookOpen,
  consulting: Building2,
  technical: Code,
};

interface FAQItemProps {
  itemKey: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = memo(({ itemKey, isOpen, onToggle }) => {
  const { t } = useTranslation();
  const category = t(`faq.items.${itemKey}.category`) as Exclude<Category, 'all'>;
  const Icon = CATEGORY_ICONS[category] || HelpCircle;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300">
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
        className="w-full flex items-start gap-4 p-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 rounded-2xl"
      >
        <Icon
          className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
        <span className="flex-grow text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-keep">
          {t(`faq.items.${itemKey}.question`)}
        </span>
        <ChevronDown
          className={`w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pl-15">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed break-keep">
            {t(`faq.items.${itemKey}.answer`)}
          </p>
        </div>
      </div>
    </div>
  );
});

FAQItem.displayName = 'FAQItem';

const CategoryTabs: React.FC<{
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}> = memo(({ activeCategory, onCategoryChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t(`faq.categories.${category}`)}
          </button>
        );
      })}
    </div>
  );
});

CategoryTabs.displayName = 'CategoryTabs';

const FAQSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const handleCategoryChange = useCallback((category: Category) => {
    setActiveCategory(category);
    setOpenItems(new Set());
  }, []);

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

  const filteredItems = FAQ_ITEM_KEYS.filter((key) => {
    if (activeCategory === 'all') return true;
    return t(`faq.items.${key}.category`) === activeCategory;
  });

  return (
    <section aria-label={t('faq.title')} className="py-20 px-4 sm:px-6 lg:px-8">
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

        <CategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

        <div className="space-y-3">
          {filteredItems.map((key) => (
            <FAQItem
              key={key}
              itemKey={key}
              isOpen={openItems.has(key)}
              onToggle={() => handleToggle(key)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle
              className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-gray-500 dark:text-gray-400">{t('faq.categories.all')}</p>
          </div>
        )}
      </div>
    </section>
  );
});

FAQSection.displayName = 'FAQSection';

export default FAQSection;
