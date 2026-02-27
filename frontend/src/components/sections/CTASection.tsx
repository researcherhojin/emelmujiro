import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

const CTASection: React.FC = memo(() => {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 md:p-20 text-center shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-6">
            {t('cta.sectionLabel')}
          </h2>
          <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-8">
            {t('cta.title')}
          </h3>

          <p className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>

          <a
            href="mailto:researcherhojin@gmail.com"
            className="inline-flex items-center justify-center px-12 py-6 text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-2xl"
            aria-label={t('cta.emailAriaLabel')}
          >
            {t('common.inquireByEmail')}
          </a>
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

export default CTASection;
