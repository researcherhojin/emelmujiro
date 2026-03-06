import React, { memo } from 'react';
import { Award, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getEducationData } from '../../../data/profileData';

const EducationTab: React.FC = memo(() => {
  const { t } = useTranslation();
  const educationData = getEducationData();

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
          {t('profilePage.educationLabel')}
        </span>
        <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white">
          {t('profilePage.educationHistory')}
        </h2>
      </div>

      <div className="space-y-5">
        {educationData.map((item, index) => (
          <div
            key={item.school}
            className="group flex flex-col md:flex-row md:items-start gap-2 md:gap-10"
          >
            {/* Period */}
            <div className="flex-shrink-0 md:w-28 md:pt-6 md:text-right">
              <span className="text-sm md:text-xl font-black text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors whitespace-pre-line">
                {item.period}
              </span>
            </div>

            {/* Content Card */}
            <div className="flex-grow bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-gray-900 dark:group-hover:border-white transition-all">
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {item.school}
              </h3>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                {item.degree}
              </p>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed break-keep">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 text-center">
          {t('profilePage.certificationsTitle')}
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="group bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
            <Award className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors mb-4" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('profilePage.adspTitle')}
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {t('profilePage.adspDescription')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {t('profilePage.adspIssuer')}
            </p>
          </div>

          <div className="group bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
            <Building className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors mb-4" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('profilePage.ncsTitle')}
            </h4>
            <ul className="space-y-2">
              <li className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('profilePage.ncsStrategy')}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {t('profilePage.ncsScore')}
                </span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('profilePage.ncsDevelopment')}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {t('profilePage.ncsScore')}
                </span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('profilePage.ncsAI')}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {t('profilePage.ncsScore')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

EducationTab.displayName = 'EducationTab';

export default EducationTab;
