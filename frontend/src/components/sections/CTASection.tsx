import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL } from '../../utils/constants';

const CTASection: React.FC = memo(() => {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t('accessibility.ctaSection')}
      className="py-32 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 md:p-20 text-center shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-6">
            {t('cta.sectionLabel')}
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 break-keep">
            {t('cta.title')}
          </h3>

          <p className="text-base sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto break-keep">
            {t('cta.subtitle')}
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-5 text-base sm:text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-2xl"
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
