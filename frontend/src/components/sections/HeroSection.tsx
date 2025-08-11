import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { STATISTICS } from '../../constants';
import { Button } from '../common';

interface StatItemProps {
  value: string | number;
  label: string;
}

const StatItem: React.FC<StatItemProps> = memo(({ value, label }) => (
  <div>
    <div className="text-4xl sm:text-5xl font-black text-black dark:text-white mb-2 tracking-tight">{value}</div>
    <div className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">{label}</div>
  </div>
));

StatItem.displayName = 'StatItem';

const HeroSection: React.FC = memo(() => {
  const { t } = useTranslation('home');
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-dark-950">
      {/* Clean geometric background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gray-50 dark:bg-dark-900"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white dark:bg-dark-950"></div>
        {/* Subtle accent line */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-200 dark:bg-dark-700"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            {/* Simple text badge */}
            <div className="inline-block mb-6">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                AI Education & Consulting
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 text-gray-900 dark:text-white leading-[1.1] relative">
              {t('hero.title')}
              <div className="absolute -bottom-2 left-0 w-20 h-1.5 bg-gray-900 dark:bg-gray-100 rounded-full"></div>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 sm:mb-10 leading-relaxed max-w-2xl">
              {t('hero.subtitle')}
              <br />
              {t('hero.description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                to="/contact"
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {t('hero.cta.primary')}
              </Button>

              <Button to="/about" variant="secondary" size="lg">
                {t('hero.cta.secondary')}
              </Button>
            </div>

            {/* 빈 공간으로 균형 조정 */}
            <div className="mt-12"></div>
          </motion.div>

          {/* Right content - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 sm:p-8 lg:p-12 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <StatItem value={STATISTICS.education.totalStudentsText} label={t('statistics.clients')} />
                <StatItem value={STATISTICS.projects.totalProjectsText} label={t('statistics.projects')} />
                <StatItem
                  value={`${STATISTICS.experience.totalCompaniesWorkedWith}+`}
                  label={t('statistics.experience')}
                />
                <StatItem value={`${STATISTICS.education.satisfactionRate}%`} label={t('statistics.technologies')} />
              </div>

              {/* Achievement badge */}
              <div className="mt-8 pt-6 border-t border-gray-300/50">
                <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">3년간의 AI 교육 전문성</span>
                  <span className="text-xs text-gray-500 ml-2">(2022-Present)</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
