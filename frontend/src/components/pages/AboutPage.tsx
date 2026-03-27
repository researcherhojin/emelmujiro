import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';
import { SITE_URL } from '../../utils/constants';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';

interface TimelineItem {
  year: string;
  titleKey: string;
  descriptionKey: string;
}

const timeline: TimelineItem[] = [
  {
    year: '2022',
    titleKey: 'about.timeline.2022.title',
    descriptionKey: 'about.timeline.2022.description',
  },
  {
    year: '2023',
    titleKey: 'about.timeline.2023.title',
    descriptionKey: 'about.timeline.2023.description',
  },
  {
    year: '2024',
    titleKey: 'about.timeline.2024.title',
    descriptionKey: 'about.timeline.2024.description',
  },
  {
    year: '2025',
    titleKey: 'about.timeline.2025.title',
    descriptionKey: 'about.timeline.2025.description',
  },
  {
    year: '2026',
    titleKey: 'about.timeline.2026.title',
    descriptionKey: 'about.timeline.2026.description',
  },
];

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section
      aria-label={t('accessibility.aboutHeroSection')}
      className="pt-32 pb-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto text-center">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
          {t('about.sectionLabel')}
        </span>
        <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
          {t('about.title')}
        </h1>
        <p className="mt-6 text-base sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto break-keep whitespace-pre-line">
          {t('about.mission.description')}
        </p>
      </div>
    </section>
  );
};

const TimelineSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section
      aria-label={t('accessibility.timelineSection')}
      className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
            {t('about.journey.sectionLabel')}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white">
            {t('about.journey.title')}
          </h2>
          <p className="mt-6 text-base sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto break-keep">
            {t('about.journey.subtitle')}
          </p>
        </div>

        <div className="space-y-5">
          {timeline.map((item) => (
            <div key={item.year} className="group flex items-start gap-6 md:gap-10">
              {/* Year */}
              <div className="flex-shrink-0 w-16 md:w-24 pt-6 text-right">
                <span className="text-xl md:text-3xl font-black text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {item.year}
                </span>
              </div>

              {/* Content Card */}
              <div className="flex-grow bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-gray-900 dark:group-hover:border-white transition-all">
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t(item.titleKey)}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed break-keep">
                  {t(item.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection: React.FC = () => {
  const { t } = useTranslation();
  const { localizedPath } = useLocalizedPath();
  return (
    <section
      aria-label={t('accessibility.aboutCtaSection')}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
          {t('about.cta.sectionLabel')}
        </span>
        <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 break-keep">
          {t('about.ctaTitle')}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 break-keep">
          {t('about.ctaSubtitle')}
        </p>
        <Link
          to={localizedPath('/contact')}
          className="inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-2xl"
        >
          {t('common.inquireProject')}
        </Link>
      </div>
    </section>
  );
};

const AboutPage: React.FC = memo(() => {
  const { t } = useTranslation();

  return (
    <>
      <SEOHelmet
        title={t('about.seo.title')}
        description={t('about.seo.description')}
        url={`${SITE_URL}/about`}
      />
      <StructuredData type="Organization" />
      <StructuredData type="Breadcrumb" />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <HeroSection />
        <TimelineSection />
        <CTASection />
      </div>
    </>
  );
});

AboutPage.displayName = 'AboutPage';

export default AboutPage;
