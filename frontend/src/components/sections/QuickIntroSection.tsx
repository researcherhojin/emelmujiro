import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface Differentiator {
  number: string;
  titleKey: string;
  descriptionKey: string;
}

const QuickIntroSection: React.FC = memo(() => {
  const { t } = useTranslation();

  const differentiators: Differentiator[] = [
    {
      number: '01',
      titleKey: 'quickIntro.items.consulting.title',
      descriptionKey: 'quickIntro.items.consulting.description',
    },
    {
      number: '02',
      titleKey: 'quickIntro.items.education.title',
      descriptionKey: 'quickIntro.items.education.description',
    },
    {
      number: '03',
      titleKey: 'quickIntro.items.llm.title',
      descriptionKey: 'quickIntro.items.llm.description',
    },
    {
      number: '04',
      titleKey: 'quickIntro.items.data.title',
      descriptionKey: 'quickIntro.items.data.description',
    },
  ];

  return (
    <section className="py-32 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Content */}
          <div>
            <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">
              {t('services.sectionLabel')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12">
              {t('services.title')}
            </h2>

            <div className="space-y-8">
              {differentiators.map((item) => (
                <div key={item.number} className="flex gap-6 items-start">
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-600">
                    {item.number}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {t(item.titleKey)}
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      {t(item.descriptionKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Empty for balance */}
          <div>{/* Spacer for layout balance */}</div>
        </div>
      </div>
    </section>
  );
});

QuickIntroSection.displayName = 'QuickIntroSection';

export default QuickIntroSection;
