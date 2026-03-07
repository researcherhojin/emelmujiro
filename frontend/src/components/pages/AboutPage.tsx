import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';
import { CONTACT_EMAIL, SITE_URL } from '../../utils/constants';
import {
  Target,
  Users,
  Lightbulb,
  TrendingUp,
  Trophy,
  Medal,
  Building2,
} from 'lucide-react';

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

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section
      aria-label={t('accessibility.aboutHeroSection')}
      className="pt-32 pb-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto text-center">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
          {t('about.sectionLabel')}
        </span>
        <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
          {t('about.title')}
        </h1>
        <p className="mt-6 text-base sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto break-keep">
          {t('about.subtitle')}
        </p>
      </div>
    </section>
  );
};

const MissionSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section
      aria-label={t('about.mission.title')}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-5xl mx-auto text-center">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
          {t('about.mission.sectionLabel')}
        </span>
        <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 break-keep">
          {t('about.mission.title')}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto whitespace-pre-line break-keep">
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
      className="py-20 px-4 sm:px-6 lg:px-8"
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
            <div
              key={item.year}
              className="group flex items-start gap-6 md:gap-10"
            >
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

const CoreValuesSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section
      aria-label={t('accessibility.coreValuesSection')}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
            {t('about.values.sectionLabel')}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white">
            {t('about.values.title')}
          </h2>
          <p className="mt-6 text-base sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto break-keep">
            {t('about.values.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {companyValues.map((value, index) => {
            const Icon = value.icon;
            const displayNumber = String(index + 1).padStart(2, '0');
            return (
              <div
                key={value.titleKey}
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

                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400 break-keep">
                  {t(value.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const AchievementSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section
      aria-label={t('accessibility.achievementsSection')}
      className="py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
            {t('achievements.sectionLabel')}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white break-keep">
            {t('about.achievements.title')}
          </h2>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
              1,000+
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t('hero.stats.students')}
            </p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
              50+
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t('hero.stats.projects')}
            </p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
              30+
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t('hero.stats.partners')}
            </p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
              4.8+
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t('hero.stats.satisfaction')}
            </p>
          </div>
        </div>

        {/* Achievement highlights row */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="flex flex-col items-center text-center gap-1">
            <Trophy
              className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1"
              aria-hidden="true"
            />
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {t('achievements.items.championAward.highlight')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('achievements.items.championAward.description')}
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <Medal
              className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1"
              aria-hidden="true"
            />
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {t('achievements.items.daconWin.highlight')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('achievements.items.daconWin.description')}
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <Building2
              className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1"
              aria-hidden="true"
            />
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {t('achievements.items.corporateTraining.highlight')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('achievements.items.corporateTraining.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTASection: React.FC = () => {
  const { t } = useTranslation();
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
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-2xl"
        >
          {t('common.inquireByEmail')}
        </a>
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
        url={`${SITE_URL}/#/about`}
      />
      <StructuredData type="Organization" />
      <StructuredData type="Breadcrumb" />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <HeroSection />
        <MissionSection />
        <TimelineSection />
        <CoreValuesSection />
        <AchievementSection />
        <CTASection />
      </div>
    </>
  );
});

AboutPage.displayName = 'AboutPage';

export default AboutPage;
