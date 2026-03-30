import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trackCtaClick } from '../../utils/analytics';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';

const HeroSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const { localizedPath } = useLocalizedPath();

  return (
    <section
      aria-label={t('accessibility.heroSection')}
      className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-950"
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight mb-6 sm:mb-8">
          <span className="block text-gray-900 dark:text-white break-keep">
            {t('hero.titleLine1')}
          </span>
          <span className="block text-gray-900 dark:text-white mt-1 sm:mt-3">
            {t('hero.titleLine2')}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-sm sm:text-xl text-gray-500 dark:text-gray-400 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto font-medium break-keep">
          {t('hero.descriptionLine1')}
          <br className="hidden sm:block" />
          <span className="block sm:inline">{t('hero.descriptionLine2')}</span>
        </p>

        {/* Stats */}
        <div
          className="flex justify-center gap-6 sm:gap-16 mb-8 sm:mb-12"
          role="region"
          aria-label={t('accessibility.statsSection')}
        >
          <div className="text-center">
            <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-1">
              5,000+
            </div>
            <div className="text-[10px] sm:text-sm font-semibold text-gray-400 dark:text-gray-500">
              {t('hero.stats.hours')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-1">
              50+
            </div>
            <div className="text-[10px] sm:text-sm font-semibold text-gray-400 dark:text-gray-500">
              {t('hero.stats.projects')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-1">
              4.8+
            </div>
            <div className="text-[10px] sm:text-sm font-semibold text-gray-400 dark:text-gray-500">
              {t('hero.stats.satisfaction')}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={localizedPath('/contact')}
          onClick={() => trackCtaClick('hero')}
          className="inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 text-sm sm:text-lg font-bold text-white dark:text-gray-900 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-2xl"
        >
          {t('common.inquireProject')}
        </Link>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
