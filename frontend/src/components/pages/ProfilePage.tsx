import React, { useState, memo, useCallback } from 'react';
import {
  Building,
  Award,
  Clock,
  Briefcase,
  GraduationCap,
  Code,
  Trophy,
  Medal,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';
import {
  careerData,
  educationData,
  projects,
  projectStats,
  projectCategories,
} from '../../data/profileData';

type TabType = 'career' | 'education' | 'projects';
type ProjectCategory =
  | 'all'
  | 'enterprise'
  | 'bootcamp'
  | 'education'
  | 'startup'
  | 'research';

const ProfilePage: React.FC = memo(() => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('career');
  const [projectFilter, setProjectFilter] = useState<ProjectCategory>('all');
  const navigate = useNavigate();

  const handleBackClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleProjectFilterChange = useCallback((filter: ProjectCategory) => {
    setProjectFilter(filter);
  }, []);

  const filteredProjects =
    projectFilter === 'all'
      ? projects
      : projects.filter((project) => project.category === projectFilter);

  return (
    <>
      <SEOHelmet
        title={t('profilePage.seoTitle')}
        description={t('profilePage.seoDescription')}
        keywords={t('profilePage.seoKeywords')}
        url="https://researcherhojin.github.io/emelmujiro/profile"
      />
      <StructuredData type="Person" />
      <StructuredData type="Breadcrumb" />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
              {t('profilePage.sectionLabel')}
            </span>
            <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
              {t('profilePage.name')}
            </h1>
            <p className="mt-6 text-xl font-medium text-gray-600 dark:text-gray-400">
              {t('profilePage.role')}
            </p>
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleBackClick}
                className="inline-flex items-center px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all focus:outline-none"
              >
                ← {t('profilePage.backToMain')}
              </button>
            </div>
          </div>
        </section>

        {/* Stats & Achievements Section */}
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
                  className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                  aria-hidden="true"
                />
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {t('achievements.items.championAward.highlight')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('achievements.items.championAward.description')}
                </p>
              </div>
              <div className="group text-center bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
                <Medal
                  className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                  aria-hidden="true"
                />
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {t('achievements.items.daconWin.highlight')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('achievements.items.daconWin.description')}
                </p>
              </div>
              <div className="group text-center bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all">
                <Building2
                  className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                  aria-hidden="true"
                />
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {t('achievements.items.corporateTraining.highlight')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('achievements.items.corporateTraining.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

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
                  style={{ outline: 'none', boxShadow: 'none' }}
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
                  style={{ outline: 'none', boxShadow: 'none' }}
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
                  style={{ outline: 'none', boxShadow: 'none' }}
                >
                  <Code className="w-4 h-4 inline-block mr-2" />
                  {t('profilePage.tabProjects')}
                </button>
              </nav>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'career' && (
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
            )}

            {activeTab === 'education' && (
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
                      key={index}
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
            )}

            {activeTab === 'projects' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
                    {t('profilePage.projectsLabel')}
                  </span>
                  <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
                    {t('profilePage.majorProjects')}
                  </h2>

                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {projectCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          handleProjectFilterChange(
                            category.id as ProjectCategory
                          )
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          projectFilter === category.id
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category.label}
                        <span className="ml-1 text-xs">({category.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`group bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border ${
                        project.highlight
                          ? 'border-gray-300 dark:border-gray-600 ring-2 ring-gray-200 dark:ring-gray-700'
                          : 'border-gray-200 dark:border-gray-700'
                      } hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                            {project.title}
                          </h3>
                          {project.highlight && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs font-bold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                              {t('profilePage.inProgress')}
                            </span>
                          )}
                        </div>
                        <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                          {project.period}
                        </span>
                      </div>
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed break-keep">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('profilePage.noProjectsInCategory')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
});

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
