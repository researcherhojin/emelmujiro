import React, { useState, memo, useCallback } from 'react';
import {
  Building,
  Award,
  Clock,
  Briefcase,
  GraduationCap,
  Code,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';
import {
  careerData,
  educationData,
  projects,
  projectStats,
  projectCategories,
  type CareerItem,
  type EducationItem,
  type ProjectStats,
  type Project,
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
        title="대표 프로필 - 이호진"
        description="AI/ML 전문가, 풀스택 개발자, IT 교육 전문가. 에멜무지로 대표 이호진의 경력과 전문 분야를 소개합니다."
        keywords="이호진, AI 전문가, 머신러닝 전문가, IT 강사, 에멜무지로 대표, 프로그래밍 교육, 인공지능 컨설팅"
        url="https://researcherhojin.github.io/emelmujiro/profile"
      />
      <StructuredData type="Person" />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
                CEO PROFILE
              </span>
              <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
                이호진
              </h1>
              <p className="mt-6 text-xl font-medium text-gray-600 dark:text-gray-400">
                AI Researcher & Educator
              </p>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleBackClick}
                  className="inline-flex items-center px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all focus:outline-none"
                >
                  ← 메인으로 돌아가기
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700">
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-3">
                  {projectStats.totalProjects}
                </div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                  완료 프로젝트
                </p>
              </div>
              <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700">
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-3">
                  {projectStats.totalStudents}
                </div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                  누적 교육생
                </p>
              </div>
              <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700">
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-3">
                  {projectStats.partnerCompanies}
                </div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                  협력 기업
                </p>
              </div>
              <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700">
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-3">
                  {projectStats.yearsOfExperience}
                </div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                  교육 경력
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
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
                  경력
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
                  학력
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
                  프로젝트
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
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                    경력 사항
                  </h2>
                </div>

                <div className="relative">
                  {/* Timeline Line - 모바일에서는 숨김 */}
                  <div className="hidden md:block absolute left-[140px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"></div>

                  <div className="space-y-6 md:space-y-8">
                    {careerData.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row gap-4 md:gap-8 items-start group relative"
                      >
                        {/* Period - 개선된 타이포그래피 */}
                        <div className="flex-shrink-0 w-full md:w-[120px] md:text-right">
                          <div className="inline-block md:block px-4 py-2 md:p-0 bg-gray-100 dark:bg-gray-800 md:bg-transparent rounded-lg md:rounded-none">
                            <div className="text-sm font-bold text-gray-900 dark:text-white md:text-gray-600 md:dark:text-gray-400 tracking-wide">
                              {item.period}
                            </div>
                          </div>
                        </div>

                        {/* Timeline Dot - 모바일에서는 숨김 */}
                        <div className="hidden md:block absolute left-[134px] top-3 w-4 h-4 bg-white dark:bg-gray-900 border-3 border-gray-400 dark:border-gray-500 group-hover:border-gray-900 dark:group-hover:border-white rounded-full shadow-md z-10 transition-all"></div>

                        {/* Content Card - 개선된 레이아웃 */}
                        <div className="flex-grow bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-grow">
                              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {item.company}
                              </h3>
                              <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
                                {item.position}
                              </p>
                            </div>
                            {item.current && (
                              <span className="flex-shrink-0 ml-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900 text-black dark:text-white">
                                <Clock className="w-3 h-3 mr-1" />
                                재직중
                              </span>
                            )}
                          </div>
                          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                    학력 사항
                  </h2>
                </div>

                <div className="relative">
                  {/* Timeline Line - 모바일에서는 숨김 */}
                  <div className="hidden md:block absolute left-[140px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"></div>

                  <div className="space-y-6 md:space-y-8">
                    {educationData.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row gap-4 md:gap-8 items-start group relative"
                      >
                        {/* Period - 개선된 타이포그래피 */}
                        <div className="flex-shrink-0 w-full md:w-[120px] md:text-right">
                          <div className="inline-block md:block px-4 py-2 md:p-0 bg-gray-100 dark:bg-gray-800 md:bg-transparent rounded-lg md:rounded-none">
                            <div className="text-sm font-bold text-gray-900 dark:text-white md:text-gray-600 md:dark:text-gray-400 tracking-wide whitespace-pre-line">
                              {item.period}
                            </div>
                          </div>
                        </div>

                        {/* Timeline Dot - 모바일에서는 숨김 */}
                        <div className="hidden md:block absolute left-[134px] top-3 w-4 h-4 bg-white dark:bg-gray-900 border-3 border-gray-400 dark:border-gray-500 group-hover:border-gray-900 dark:group-hover:border-white rounded-full shadow-md z-10 transition-all"></div>

                        {/* Content Card - 개선된 레이아웃 */}
                        <div className="flex-grow bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {item.school}
                          </h3>
                          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {item.degree}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-16">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 text-center">
                    자격 및 인증
                  </h3>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                      <Award className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        ADsP
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        데이터 분석 준전문가
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        한국데이터산업진흥원 (2025.03)
                      </p>
                    </div>

                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                      <Building className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        NCS 직무능력
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            정보기술전략·계획
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            57점
                          </span>
                        </li>
                        <li className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            정보기술개발
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            57점
                          </span>
                        </li>
                        <li className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            인공지능
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            57점
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
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6">
                    주요 프로젝트
                  </h2>

                  {/* 카테고리 필터 버튼들 */}
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
                              진행중
                            </span>
                          )}
                        </div>
                        <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                          {project.period}
                        </span>
                      </div>
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
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

                {/* 프로젝트가 없을 때 메시지 */}
                {filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      해당 카테고리에 프로젝트가 없습니다.
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
