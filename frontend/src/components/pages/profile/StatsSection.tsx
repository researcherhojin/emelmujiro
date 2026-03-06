import React, { memo } from 'react';
import {
  Briefcase,
  GraduationCap,
  Building,
  Clock,
  Trophy,
  Medal,
  Building2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { projectStats } from '../../../data/profileData';

const StatsSection: React.FC = memo(() => {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
            {t('achievements.sectionLabel')}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white">
            {t('achievements.title')}
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div className="group text-center bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
            <Briefcase
              className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              aria-hidden="true"
            />
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2">
              {projectStats.totalProjects}
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
              {t('profilePage.completedProjects')}
            </p>
          </div>
          <div className="group text-center bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
            <GraduationCap
              className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              aria-hidden="true"
            />
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2">
              {projectStats.totalStudents}
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
              {t('profilePage.totalStudents')}
            </p>
          </div>
          <div className="group text-center bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
            <Building
              className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              aria-hidden="true"
            />
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2">
              {projectStats.partnerCompanies}
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
              {t('profilePage.partnerCompanies')}
            </p>
          </div>
          <div className="group text-center bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
            <Clock
              className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              aria-hidden="true"
            />
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2">
              {projectStats.yearsOfExperience}
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
              {t('profilePage.educationCareer')}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10">
          <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Achievement Highlights */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="group text-center bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
            <Trophy
              className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              aria-hidden="true"
            />
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">
              {t('achievements.items.championAward.highlight')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('achievements.items.championAward.description')}
            </p>
          </div>
          <div className="group text-center bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
            <Medal
              className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              aria-hidden="true"
            />
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">
              {t('achievements.items.daconWin.highlight')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('achievements.items.daconWin.description')}
            </p>
          </div>
          <div className="group text-center bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
            <Building2
              className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              aria-hidden="true"
            />
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">
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
});

StatsSection.displayName = 'StatsSection';

export default StatsSection;
