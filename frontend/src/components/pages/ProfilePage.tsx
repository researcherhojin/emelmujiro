import React, { useState, memo, useCallback } from 'react';
import { Building, Award, Clock, Briefcase, GraduationCap, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';

interface CareerItem {
  period: string;
  company: string;
  position: string;
  description: string;
  current?: boolean;
}

interface EducationItem {
  period: string;
  school: string;
  degree: string;
  description: string;
}

interface ProjectStats {
  totalProjects: string;
  totalStudents: string;
  partnerCompanies: string;
  yearsOfExperience: string;
}

interface Project {
  id: string;
  title: string;
  period: string;
  description: string;
  category: 'enterprise' | 'bootcamp' | 'education' | 'startup' | 'research';
  tags: string[];
  highlight?: boolean;
}

type TabType = 'career' | 'education' | 'projects';
type ProjectCategory = 'all' | 'enterprise' | 'bootcamp' | 'education' | 'startup' | 'research';

const ProfilePage: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<TabType>('career');
  const [projectFilter, setProjectFilter] = useState<ProjectCategory>('all');
  const navigate = useNavigate();

  const careerData: CareerItem[] = [
    {
      period: '2024.12 ~ 현재',
      company: '에멜무지로',
      position: '대표',
      description: 'AI 교육 및 컨설팅 전문 기업 창업 · 기업 맞춤형 AI 솔루션 개발',
      current: true,
    },
    {
      period: '2023.05 ~ 현재',
      company: '멋쟁이사자처럼',
      position: 'AI 전문 강사',
      description:
        '스타트업 스테이션 과정 · AI 엔지니어 심화 부트캠프 이미지처리 · 창업 특강 및 멘토링',
      current: true,
    },
    {
      period: '2023.05 ~ 2024.09',
      company: '엘리스',
      position: 'AI/데이터분석 전문 강사',
      description: '삼성전자 Spotfire 데이터 분석 · Python/ML 기초 교육 · 현대건설 ML/DL 과정',
    },
    {
      period: '2022.10 ~ 2024.09',
      company: 'Cobslab',
      position: '책임 연구원 / 전문 강사',
      description: '대기업/정부기관 Python, 데이터 분석, ML/DL 강의 개발 및 연구',
    },
    {
      period: '2022.06',
      company: '코코넛사일로',
      position: '연구원',
      description: 'Data Lab · 데이터 바우처 지원사업 프로토타입 개발',
    },
    {
      period: '2021.05 ~ 2021.08',
      company: '서울시 청년청',
      position: 'Front-End Developer',
      description: '사회적 기업 과제 수행 · 웹 프론트엔드 개발',
    },
    {
      period: '2022.04 ~ 2023.02',
      company: '모두의연구소 / 한글과컴퓨터',
      position: 'AI 교육 강사',
      description:
        '서울대, 서울시립대 AI 교육 · SKT Computer Vision · KETI 나노소재 AI융합 전문가 과정',
    },
  ];

  const educationData: EducationItem[] = [
    {
      period: '2024.09 ~ 2026.06\n(예정)',
      school: '한양대학교',
      degree: '인공지능융합대학원 인공지능시스템학과 석사과정',
      description: 'Computer Vision · 지도교수: 조동현 교수',
    },
    {
      period: '2013.03 ~ 2021.02',
      school: '경북대학교',
      degree: '축산생명공학 학사',
      description: '부전공: 식품공학부 식품응용공학',
    },
  ];

  const projects: Project[] = [
    {
      id: 'ai-bootcamp',
      title: 'AI 엔지니어 심화 부트캠프',
      period: '2024 ~ 2025',
      description:
        '멋쟁이사자처럼 AI 엔지니어 심화 부트캠프 이미지처리 과정 · 객체 탐지, 세그멘테이션, 멀티태스킹 실전 프로젝트',
      category: 'bootcamp',
      tags: ['Computer Vision', 'Object Detection', 'PyTorch', 'Segmentation'].sort(),
      highlight: true,
    },
    {
      id: 'nano-ai',
      title: '산업전문인력 AI역량강화 교육',
      period: '2025.06 ~ 2025.08',
      description:
        '나노융합산업연구조합 협력 · 나노소재 빅데이터 활용 AI융합전문가 교육 · 제조라인 고장예측 및 신소재 구조분석',
      category: 'enterprise',
      tags: ['빅데이터', '산업 AI', '시뮬레이션', '제조 AI'].sort(),
      highlight: false,
    },
    {
      id: 'teacher-training',
      title: '생성형 AI 교육자 연수',
      period: '2024 ~ 2025',
      description:
        '한국과학창의재단 찾아가는 학교 컨설팅 · 초중고 교사 및 학부모 대상 ChatGPT 활용 교육',
      category: 'education',
      tags: ['AI 리터러시', 'ChatGPT', '교육 혁신', '생성형 AI'].sort(),
    },
    {
      id: 'startup-station',
      title: '테킷 스타트업 스테이션',
      period: '2023 ~ 2025',
      description:
        '멋쟁이사자처럼 테킷 스타트업 스테이션 7~10기 운영 · 예비 IT창업자 대상 개발 역량 강화',
      category: 'startup',
      tags: ['MVP 개발', '멘토링', '창업 교육', '풀스택'].sort(),
    },
    {
      id: 'samsung-spotfire',
      title: '삼성전자 Spotfire 데이터 분석',
      period: '2023 ~ 2024',
      description:
        '삼성전자 임직원 대상 Spotfire 데이터 분석 및 시각화 교육 · 실무 데이터 활용 대시보드 구축',
      category: 'enterprise',
      tags: ['BI', 'Spotfire', '데이터 분석', '시각화'].sort(),
    },
    {
      id: 'lg-data-science',
      title: 'LG전자 Data Science 프로젝트',
      period: '2023',
      description: 'Data Science 프로젝트 기획부터 개발까지 메인 강사 · 머신러닝 모델 개발 및 배포',
      category: 'enterprise',
      tags: ['Data Science', 'ML', '실무 교육', '프로젝트'].sort(),
    },
    {
      id: 'hyundai-ml',
      title: '현대건설 ML/DL 과정',
      period: '2023',
      description:
        '현대건설 시니어 대상 머신러닝/딥러닝 교육 · YOLO 기반 건설 현장 안전 관리 시스템',
      category: 'enterprise',
      tags: ['Computer Vision', 'Deep Learning', 'YOLO', '안전 관리'].sort(),
    },
    {
      id: 'keti-nano',
      title: 'KETI 나노소재 AI 전문가 과정',
      period: '2022',
      description:
        '한국전자기술연구원 나노소재 빅데이터 활용 AI융합 전문가 과정 · 도메인 지식 기반 AI 도입',
      category: 'research',
      tags: ['AI 융합', '나노소재', '빅데이터', '연구'].sort(),
    },
    {
      id: 'seoul-ai',
      title: '서울시립대 AI 취업사관학교',
      period: '2022',
      description: '서울시립대 캠퍼스타운형 취업사관학교 AI 과정 · 대학생 대상 실무 중심 AI 교육',
      category: 'education',
      tags: ['AI 교육', '실무 프로젝트', '취업 연계'].sort(),
    },
    {
      id: 'open-source',
      title: 'Visual Python 오픈소스 개발',
      period: '2022',
      description: '2022 오픈소스 컨트리뷰션 아카데미 · Visual Python ML/Statistics 모듈 개발',
      category: 'research',
      tags: ['ML', 'Python', '시각화', '오픈소스'].sort(),
    },
  ];

  const projectStats: ProjectStats = {
    totalProjects: '50+',
    totalStudents: '1,000+',
    partnerCompanies: '30+',
    yearsOfExperience: '4+',
  };

  const projectCategories = [
    { id: 'all', label: '전체', count: projects.length },
    {
      id: 'enterprise',
      label: '기업 교육',
      count: projects.filter(p => p.category === 'enterprise').length,
    },
    {
      id: 'bootcamp',
      label: '부트캠프',
      count: projects.filter(p => p.category === 'bootcamp').length,
    },
    {
      id: 'education',
      label: '교육 혁신',
      count: projects.filter(p => p.category === 'education').length,
    },
    {
      id: 'startup',
      label: '스타트업',
      count: projects.filter(p => p.category === 'startup').length,
    },
    {
      id: 'research',
      label: '연구/개발',
      count: projects.filter(p => p.category === 'research').length,
    },
  ];

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
      : projects.filter(project => project.category === projectFilter);

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
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">협력 기업</p>
              </div>
              <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700">
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-3">
                  {projectStats.yearsOfExperience}
                </div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">교육 경력</p>
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
                              <span className="flex-shrink-0 ml-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
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
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">ADsP</h4>
                      <p className="text-gray-600 dark:text-gray-400">데이터 분석 준전문가</p>
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
                          <span className="font-bold text-gray-900 dark:text-white">57점</span>
                        </li>
                        <li className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">정보기술개발</span>
                          <span className="font-bold text-gray-900 dark:text-white">57점</span>
                        </li>
                        <li className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">인공지능</span>
                          <span className="font-bold text-gray-900 dark:text-white">57점</span>
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
                    {projectCategories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleProjectFilterChange(category.id as ProjectCategory)}
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
                  {filteredProjects.map(project => (
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
