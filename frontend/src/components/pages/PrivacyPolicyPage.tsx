import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';

const sections = [
  'overview',
  'dataCollection',
  'usage',
  'sharing',
  'cookies',
  'retention',
  'rights',
  'children',
  'changes',
  'contact',
] as const;

const PrivacyPolicyPage: React.FC = memo(() => {
  const { t } = useTranslation();

  return (
    <>
      <SEOHelmet title={t('privacy.title')} description={t('privacy.subtitle')} />
      <StructuredData type="LocalBusiness" />
      <StructuredData type="Breadcrumb" />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero */}
        <section className="pt-28 pb-12 sm:pt-32 sm:pb-20 px-5 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
              {t('privacy.sectionLabel')}
            </span>
            <h1 className="mt-3 text-4xl sm:mt-4 sm:text-5xl md:text-7xl font-black text-gray-900 dark:text-white">
              {t('privacy.title')}
            </h1>
            <p className="mt-4 text-base sm:mt-6 sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto break-keep">
              {t('privacy.subtitle')}
            </p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              {t('privacy.lastUpdated')}: 2026-04-05
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="pb-16 sm:pb-32 px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-12">
            {sections.map((section, idx) => (
              <article key={section}>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {idx + 1}. {t(`privacy.${section}.title`)}
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line break-keep">
                  {t(`privacy.${section}.content`)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
});

PrivacyPolicyPage.displayName = 'PrivacyPolicyPage';

export default PrivacyPolicyPage;
