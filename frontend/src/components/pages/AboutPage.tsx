import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHelmet from '../common/SEOHelmet';
import { Target, Users, Lightbulb, TrendingUp } from 'lucide-react';

interface TimelineItem {
  year: string;
  titleKey: string;
  descriptionKey: string;
}

interface CompanyValue {
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
}

const AboutPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
  ];

  const companyValues: CompanyValue[] = [
    {
      titleKey: 'about.values.practical.title',
      descriptionKey: 'about.values.practical.description',
      icon: Target,
    },
    {
      titleKey: 'about.values.custom.title',
      descriptionKey: 'about.values.custom.description',
      icon: Users,
    },
    {
      titleKey: 'about.values.latest.title',
      descriptionKey: 'about.values.latest.description',
      icon: Lightbulb,
    },
    {
      titleKey: 'about.values.growth.title',
      descriptionKey: 'about.values.growth.description',
      icon: TrendingUp,
    },
  ];

  return (
    <>
      <SEOHelmet
        title={t('about.seo.title')}
        description={t('about.seo.description')}
        url="https://researcherhojin.github.io/emelmujiro/about"
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section
          aria-label={t('accessibility.aboutHeroSection')}
          className="pt-32 pb-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
                {t('about.sectionLabel')}
              </span>
              <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
                {t('about.title')}
              </h1>
              <p className="mt-6 text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t('about.subtitle')}
              </p>
            </div>

            {/* Mission Statement */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-12 md:p-16 text-center mb-20">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6">
                {t('about.mission.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto whitespace-pre-line">
                {t('about.mission.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section
          aria-label={t('accessibility.timelineSection')}
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
                {t('about.journey.sectionLabel')}
              </span>
              <h2 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
                {t('about.journey.title')}
              </h2>
              <p className="mt-6 text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t('about.journey.subtitle')}
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[50px] md:left-[120px] top-0 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-700"></div>

              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-8 md:gap-12 items-start group relative"
                  >
                    {/* Year */}
                    <div className="flex-shrink-0 w-[100px] md:w-[100px] text-right">
                      <div className="text-2xl md:text-3xl font-black text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {item.year}
                      </div>
                    </div>

                    {/* Timeline Dot */}
                    <div className="absolute left-[44px] md:left-[114px] top-2 w-3 h-3 bg-gray-400 dark:bg-gray-600 group-hover:bg-gray-900 dark:group-hover:bg-white rounded-full ring-4 ring-white dark:ring-gray-950 shadow-lg z-10 transition-colors"></div>

                    {/* Content Card */}
                    <div className="flex-grow bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-gray-900 dark:group-hover:border-white transition-all">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {t(item.titleKey)}
                      </h3>
                      <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {t(item.descriptionKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section
          aria-label={t('accessibility.coreValuesSection')}
          className="py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
                {t('about.values.sectionLabel')}
              </span>
              <h2 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
                {t('about.values.title')}
              </h2>
              <p className="mt-6 text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t('about.values.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => {
                const Icon = value.icon;
                const displayNumber = String(index + 1).padStart(2, '0');
                return (
                  <div
                    key={index}
                    className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <Icon
                        className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                        aria-hidden="true"
                      />
                      <span className="text-4xl font-black text-gray-200 dark:text-gray-700 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                        {displayNumber}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t(value.titleKey)}
                    </h3>

                    <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                      {t(value.descriptionKey)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Achievement Section */}
        <section
          aria-label={t('accessibility.achievementsSection')}
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-12 text-center">
              {t('about.achievements.title')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  1,000+
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('hero.stats.students')}
                </p>
              </div>
              <div>
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  50+
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('hero.stats.projects')}
                </p>
              </div>
              <div>
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  30+
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('hero.stats.partners')}
                </p>
              </div>
              <div>
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  4.8+
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('hero.stats.satisfaction')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          aria-label={t('accessibility.aboutCtaSection')}
          className="py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6">
              {t('about.ctaTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t('about.ctaSubtitle')}
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center px-10 py-5 text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-2xl"
            >
              {t('common.inquireProject')}
            </button>
          </div>
        </section>
      </div>
    </>
  );
});

AboutPage.displayName = 'AboutPage';

export default AboutPage;
