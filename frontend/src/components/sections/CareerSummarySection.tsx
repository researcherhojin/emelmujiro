import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Building,
  Award,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface Highlight {
  year: string;
  titleKey: string;
  descriptionKey: string;
}

interface StatCardProps {
  stat: StatItem;
  index: number;
}

const StatCard: React.FC<StatCardProps> = memo(({ stat, index }) => {
  const IconComponent = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <IconComponent className="w-8 h-8 text-gray-700 mx-auto mb-3" />
      <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
      <div className="text-gray-600">{stat.label}</div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

interface HighlightCardProps {
  item: Highlight;
  index: number;
}

const HighlightCard: React.FC<HighlightCardProps> = memo(({ item, index }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-gray-900">
            {item.year.slice(-2)}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t(item.titleKey)}
          </h3>
          <p className="text-gray-600">{t(item.descriptionKey)}</p>
        </div>
      </div>
    </motion.div>
  );
});

HighlightCard.displayName = 'HighlightCard';

const CareerSummarySection: React.FC = memo(() => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const stats: StatItem[] = [
    { label: t('career.stats.lectures'), value: '50+', icon: BookOpen },
    { label: t('career.stats.partners'), value: '15+', icon: Building },
    {
      label: t('career.stats.educationPeriod'),
      value: t('career.stats.educationYears'),
      icon: Award,
    },
  ];

  const highlights: Highlight[] = [
    {
      year: '2025',
      titleKey: 'careerSummary.highlights.2025.title',
      descriptionKey: 'careerSummary.highlights.2025.description',
    },
    {
      year: '2024',
      titleKey: 'careerSummary.highlights.2024.title',
      descriptionKey: 'careerSummary.highlights.2024.description',
    },
    {
      year: '2023',
      titleKey: 'careerSummary.highlights.2023.title',
      descriptionKey: 'careerSummary.highlights.2023.description',
    },
    {
      year: '2022',
      titleKey: 'careerSummary.highlights.2022.title',
      descriptionKey: 'careerSummary.highlights.2022.description',
    },
  ];

  const handleViewDetail = useCallback(() => {
    navigate('/career');
  }, [navigate]);

  return (
    <section id="career" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            {t('careerSummary.title')}
          </h2>
          <p
            className="text-xl text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t('careerSummary.subtitle') }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Career Timeline */}
        <div className="space-y-6 mb-12">
          {highlights.map((item, index) => (
            <HighlightCard key={item.year} item={item} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleViewDetail}
            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {t('careerSummary.viewDetail')}
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
});

CareerSummarySection.displayName = 'CareerSummarySection';

export default CareerSummarySection;
