import React, { memo } from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCareerData } from '../../../data/profileData';

const CareerTab: React.FC = memo(() => {
  const { t } = useTranslation();
  const careerData = getCareerData();

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
          {t('profilePage.careerLabel')}
        </span>
        <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white">
          {t('profilePage.careerHistory')}
        </h2>
      </div>

      <div className="space-y-5">
        {careerData.map((item, index) => (
          <div
            key={index}
            className="group flex flex-col md:flex-row md:items-start gap-2 md:gap-10"
          >
            {/* Period */}
            <div className="flex-shrink-0 md:w-28 md:pt-6 md:text-right flex items-center gap-2 md:block">
              <span className="text-sm md:text-xl font-black text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {item.period}
              </span>
              {item.current && (
                <span className="md:hidden inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900 text-black dark:text-white">
                  {t('profilePage.currentlyEmployed')}
                </span>
              )}
            </div>

            {/* Content Card */}
            <div className="flex-grow bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-gray-900 dark:group-hover:border-white transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {item.company}
                  </h3>
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {item.position}
                  </p>
                </div>
                {item.current && (
                  <span className="hidden md:inline-flex flex-shrink-0 ml-4 items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900 text-black dark:text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    {t('profilePage.currentlyEmployed')}
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed break-keep">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

CareerTab.displayName = 'CareerTab';

export default CareerTab;
