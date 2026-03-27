import React, { lazy, Suspense, useState, memo, useCallback } from 'react';
import { Briefcase, GraduationCap, Code, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';
import { SITE_URL } from '../../utils/constants';
import ProfileHero from './profile/ProfileHero';
import StatsSection from './profile/StatsSection';
import CareerTab from './profile/CareerTab';
import EducationTab from './profile/EducationTab';
import ProjectsTab from './profile/ProjectsTab';

const TimelineSection = lazy(() => import('../sections/TimelineSection'));

type TabType = 'career' | 'education' | 'projects' | 'timeline';
type ProjectCategory = 'all' | 'enterprise' | 'bootcamp' | 'education' | 'startup' | 'research';

const ProfilePage: React.FC = memo(() => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('career');
  const [projectFilter, setProjectFilter] = useState<ProjectCategory>('all');
  const { localizedNavigate } = useLocalizedPath();

  const handleBackClick = useCallback(() => {
    localizedNavigate('/');
  }, [localizedNavigate]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleProjectFilterChange = useCallback((filter: ProjectCategory) => {
    setProjectFilter(filter);
  }, []);

  return (
    <>
      <SEOHelmet
        title={t('profilePage.seoTitle')}
        description={t('profilePage.seoDescription')}
        keywords={t('profilePage.seoKeywords')}
        url={`${SITE_URL}/profile`}
      />
      <StructuredData type="Person" />
      <StructuredData type="Breadcrumb" />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <ProfileHero onBackClick={handleBackClick} />
        <StatsSection />

        {/* Tab Navigation */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex justify-center space-x-8">
                <button
                  onClick={() => handleTabChange('career')}
                  className={`py-4 px-1 font-bold text-sm uppercase tracking-wider transition-all relative focus:outline-none border-none bg-transparent ${
                    activeTab === 'career'
                      ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Briefcase className="w-4 h-4 inline-block mr-2" />
                  {t('profilePage.tabCareer')}
                </button>
                <button
                  onClick={() => handleTabChange('education')}
                  className={`py-4 px-1 font-bold text-sm uppercase tracking-wider transition-all relative focus:outline-none border-none bg-transparent ${
                    activeTab === 'education'
                      ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 inline-block mr-2" />
                  {t('profilePage.tabEducation')}
                </button>
                <button
                  onClick={() => handleTabChange('projects')}
                  className={`py-4 px-1 font-bold text-sm uppercase tracking-wider transition-all relative focus:outline-none border-none bg-transparent ${
                    activeTab === 'projects'
                      ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Code className="w-4 h-4 inline-block mr-2" />
                  {t('profilePage.tabProjects')}
                </button>
                <button
                  onClick={() => handleTabChange('timeline')}
                  className={`py-4 px-1 font-bold text-sm uppercase tracking-wider transition-all relative focus:outline-none border-none bg-transparent ${
                    activeTab === 'timeline'
                      ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Clock className="w-4 h-4 inline-block mr-2" />
                  {t('profilePage.tabTimeline')}
                </button>
              </nav>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'career' && <CareerTab />}
            {activeTab === 'education' && <EducationTab />}
            {activeTab === 'projects' && (
              <ProjectsTab
                projectFilter={projectFilter}
                onFilterChange={handleProjectFilterChange}
              />
            )}
            {activeTab === 'timeline' && (
              <Suspense fallback={null}>
                <TimelineSection />
              </Suspense>
            )}
          </div>
        </section>
      </div>
    </>
  );
});

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
