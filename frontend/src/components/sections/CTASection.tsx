import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trackCtaClick } from '../../utils/analytics';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';

const CTASection: React.FC = memo(() => {
  const { t } = useTranslation();
  const { localizedPath } = useLocalizedPath();

  return (
    <section
      aria-label={t('accessibility.ctaSection')}
      className="py-16 sm:py-32 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-12 md:p-20 text-center shadow-sm border border-gray-200 dark:border-gray-800">
          <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-4 sm:mb-6 block">
            {t('cta.sectionLabel')}
          </span>
          <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6 break-keep">
            {t('cta.title')}
          </h2>

          <p className="text-xs sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto break-keep">
            {t('cta.subtitleLine1')}
            <br className="sm:hidden" /> {t('cta.subtitleLine2')}
          </p>

          <Link
            to={localizedPath('/contact')}
            onClick={() => trackCtaClick('cta')}
            className="inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-5 text-base sm:text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-2xl"
          >
            {t('common.inquireProject')}
          </Link>
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

export default CTASection;
