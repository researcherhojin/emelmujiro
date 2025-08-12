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

type TabType = 'career' | 'education' | 'projects';

const ProfilePage: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<TabType>('career');
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
      description:
        '삼성전자, LG전자, 현대건설, 카카오 등 대기업 AI/ML 교육 · 누적 1,000명+ 교육생 배출',
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
      description: '지도교수: 조동현 교수',
    },
    {
      period: '2013.03 ~ 2021.02',
      school: '경북대학교',
      degree: '축산생명공학 학사',
      description: '부전공: 식품공학부 식품응용공학',
    },
  ];

  const projectStats: ProjectStats = {
    totalProjects: '50+',
    totalStudents: '1,000+',
    partnerCompanies: '15+',
    yearsOfExperience: '3+',
  };

  const handleBackClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

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
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                    주요 프로젝트
                  </h2>
                </div>

                <div className="grid gap-6">
                  <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                        AI 엔지니어 심화 부트캠프
                      </h3>
                      <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        2024 ~ 2025
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      멋쟁이사자처럼 AI 엔지니어 심화 부트캠프 이미지처리 과정 · 객체 탐지,
                      세그멘테이션, 멀티태스킹 실전 프로젝트 · 공공 데이터 활용 AI 서비스 개발
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        Object Detection
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        Segmentation
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        PyTorch
                      </span>
                    </div>
                  </div>

                  <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                        산업전문인력 AI역량강화 교육
                      </h3>
                      <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        2025
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      나노융합산업연구조합 협력 · 나노소재 빅데이터 활용 AI융합전문가 교육 ·
                      제조라인 고장예측 및 신소재 구조분석 시뮬레이션 실습
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        빅데이터
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        제조 AI
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        시뮬레이션
                      </span>
                    </div>
                  </div>

                  <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                        생성형 AI 교육자 연수
                      </h3>
                      <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        2024 ~ 2025
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      한국과학창의재단 찾아가는 학교 컨설팅 · 초중고 교사 및 학부모 대상 ChatGPT
                      활용 교육 · 교육 현장 AI 도구 활용법 및 평가계획 설계 실습
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        생성형 AI
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        교육 혁신
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        AI 리터러시
                      </span>
                    </div>
                  </div>

                  <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                        스타트업 스테이션
                      </h3>
                      <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        2023 ~ 2025
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      멋쟁이사자처럼 테킷 스타트업 스테이션 6~10기 운영 · 예비 IT창업자 대상 개발
                      역량 강화 · 창업 특강 및 1:1 멘토링 · DSC공유대학 AI+X 서비스 분석
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        Full Stack
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        멘토링
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        창업 교육
                      </span>
                    </div>
                  </div>

                  <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                        대기업 AI/데이터 교육
                      </h3>
                      <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        2022 ~ 현재
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      삼성전자 Spotfire 데이터 분석 · LG전자 Data Science 프로젝트 · 현대건설 ML/DL
                      과정 · SKT Computer Vision · 카카오 외 대기업 교육 (누적 1,000명+)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        Data Science
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        ML/DL
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        Spotfire
                      </span>
                    </div>
                  </div>

                  <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                        주요 활동 및 수상
                      </h3>
                      <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        2022 ~ 2023
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      오픈소스 컨트리뷰션 아카데미 Visual Python 개발 · 네이버 부스트코스 리드부스터
                      및 코딩코치 · KURLY HACK FESTA 2022 본선 진출 · 스마트농업 AI 경진대회 본선
                      진출 · 기상-AI 해커톤 2등 수상
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        Open Source
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        Hackathon
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        멘토링
                      </span>
                    </div>
                  </div>
                </div>
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
