import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

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

const TimelineSection: React.FC = memo(() => {
  const { t } = useTranslation();
  return (
    <section aria-label={t('accessibility.timelineSection')} className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-4 block">
            {t('about.journey.sectionLabel')}
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
            {t('about.journey.title')}
          </h2>
          <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 max-w-2xl mx-auto break-keep">
            {t('about.journey.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {timeline.map((item) => (
            <div key={item.year} className="group flex items-start gap-6 md:gap-10">
              <div className="flex-shrink-0 w-16 md:w-24 pt-6 text-right">
                <span className="text-xl md:text-3xl font-black text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {item.year}
                </span>
              </div>
              <div className="flex-grow bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-gray-900 dark:group-hover:border-white transition-all">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
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
});

TimelineSection.displayName = 'TimelineSection';

export default TimelineSection;
