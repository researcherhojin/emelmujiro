import React, { useState, memo, useCallback } from 'react';
import { ArrowLeft, Calendar, School, Building, Award, Clock } from 'lucide-react';
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
            description: 'AI 솔루션 개발 및 컨설팅 전문 기업 창업',
            current: true
        },
        {
            period: '2022.10 ~ 2024.09',
            company: 'Cobslab',
            position: '책임 연구원 / 전문 강사',
            description: '대기업 AI 교육 및 컨설팅 프로젝트 진행'
        },
        {
            period: '2022.06',
            company: '코코넛사일로',
            position: '연구원',
            description: 'AI 모델 성능 개선 연구 및 데이터바우처 사업 관리'
        },
        {
            period: '2022.04 ~ 2022.10',
            company: '모두의연구소',
            position: '보조 강사',
            description: '대기업 및 대학교 AI 교육 프로그램 운영'
        }
    ];

    const educationData: EducationItem[] = [
        {
            period: '2024.09 ~ 2026.06\n(예정)',
            school: '한양대학교',
            degree: '인공지능융합대학원 인공지능시스템학과 석사과정',
            description: '지도교수: 조동현 교수'
        },
        {
            period: '2013.03 ~ 2021.02',
            school: '경북대학교',
            degree: '축산생명공학 학사',
            description: '부전공: 식품공학부 식품응용공학'
        }
    ];

    const projectStats: ProjectStats = {
        totalProjects: '50+',
        totalStudents: '1,000+',
        partnerCompanies: '15+',
        yearsOfExperience: '3+'
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
                url="https://researcherhojin.github.io/emelmujiro/#/profile"
            />
            <StructuredData type="Person" />
            <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={handleBackClick}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        돌아가기
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Profile Header */}
                <div className="mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">이호진</h1>
                    <p className="text-2xl text-gray-600">AI Researcher & Educator</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 text-center hover:border-gray-300 transition-all hover:shadow-lg">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                            {projectStats.totalProjects}
                        </div>
                        <div className="text-sm sm:text-base text-gray-600">프로젝트</div>
                    </div>
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 text-center hover:border-gray-300 transition-all hover:shadow-lg">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                            {projectStats.totalStudents}
                        </div>
                        <div className="text-sm sm:text-base text-gray-600">교육생</div>
                    </div>
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 text-center hover:border-gray-300 transition-all hover:shadow-lg">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                            {projectStats.partnerCompanies}
                        </div>
                        <div className="text-sm sm:text-base text-gray-600">협력 기업</div>
                    </div>
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 text-center hover:border-gray-300 transition-all hover:shadow-lg">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                            {projectStats.yearsOfExperience}
                        </div>
                        <div className="text-sm sm:text-base text-gray-600">교육 경력</div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-12">
                    <nav className="-mb-px flex overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => handleTabChange('career')}
                            className={`relative py-4 px-6 sm:px-8 font-semibold text-base sm:text-lg transition-all whitespace-nowrap ${
                                activeTab === 'career'
                                    ? 'text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            경력
                            <span className={`absolute -bottom-1 left-4 right-4 h-1 bg-gray-900 transition-all duration-200 ${
                                activeTab === 'career' ? 'opacity-100' : 'opacity-0'
                            }`}></span>
                        </button>
                        <button
                            onClick={() => handleTabChange('education')}
                            className={`relative py-4 px-6 sm:px-8 font-semibold text-base sm:text-lg transition-all whitespace-nowrap ${
                                activeTab === 'education'
                                    ? 'text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            학력
                            <span className={`absolute -bottom-1 left-4 right-4 h-1 bg-gray-900 transition-all duration-200 ${
                                activeTab === 'education' ? 'opacity-100' : 'opacity-0'
                            }`}></span>
                        </button>
                        <button
                            onClick={() => handleTabChange('projects')}
                            className={`relative py-4 px-6 sm:px-8 font-semibold text-base sm:text-lg transition-all whitespace-nowrap ${
                                activeTab === 'projects'
                                    ? 'text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            주요 프로젝트
                            <span className={`absolute -bottom-1 left-4 right-4 h-1 bg-gray-900 transition-all duration-200 ${
                                activeTab === 'projects' ? 'opacity-100' : 'opacity-0'
                            }`}></span>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'career' && (
                    <div className="space-y-8">
                        <div className="mb-12">
                            <div className="flex items-center mb-4">
                                <Building className="w-6 h-6 mr-3 text-gray-700" />
                                <h2 className="text-3xl font-bold text-gray-900">경력 사항</h2>
                            </div>
                            <div className="h-1 w-20 bg-gray-900 rounded-full"></div>
                        </div>
                        
                        <div className="space-y-6">
                            {careerData.map((item, index) => (
                                <div key={index} className="flex gap-8">
                                    <div className="flex-shrink-0 w-44 text-base text-gray-600 font-medium whitespace-pre-line">
                                        {item.period}
                                    </div>
                                    <div className="flex-grow pb-8 border-b border-gray-100 last:border-0">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {item.company}
                                        </h3>
                                        <p className="text-lg text-gray-700 mb-2">{item.position}</p>
                                        <p className="text-base text-gray-600 leading-relaxed">{item.description}</p>
                                        {item.current && (
                                            <span className="inline-flex items-center mt-3 px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-900 text-white">
                                                <Clock className="w-4 h-4 mr-1.5" />
                                                현재 재직중
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'education' && (
                    <div className="space-y-8">
                        <div className="mb-12">
                            <div className="flex items-center mb-4">
                                <School className="w-6 h-6 mr-3 text-gray-700" />
                                <h2 className="text-3xl font-bold text-gray-900">학력 사항</h2>
                            </div>
                            <div className="h-1 w-20 bg-gray-900 rounded-full"></div>
                        </div>
                        
                        <div className="space-y-6">
                            {educationData.map((item, index) => (
                                <div key={index} className="flex gap-8">
                                    <div className="flex-shrink-0 w-44 text-base text-gray-600 font-medium whitespace-pre-line">
                                        {item.period}
                                    </div>
                                    <div className="flex-grow pb-8 border-b border-gray-100 last:border-0">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {item.school}
                                        </h3>
                                        <p className="text-gray-600 mb-2">{item.degree}</p>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12">
                            <div className="flex items-center mb-6">
                                <Award className="w-5 h-5 mr-3 text-gray-600" />
                                <h3 className="text-2xl font-bold text-gray-900">자격 사항</h3>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                                <div className="mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">ADsP</h4>
                                    <p className="text-sm text-gray-600">데이터 분석 준전문가</p>
                                    <p className="text-xs text-gray-500 mt-1">한국데이터산업진흥원 (2025.03)</p>
                                </div>
                                
                                <div className="pt-4 border-t border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-3">NCS 직무능력</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex justify-between">
                                            <span className="text-gray-600">정보기술전략·계획</span>
                                            <span className="font-medium">57점</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="text-gray-600">정보기술개발</span>
                                            <span className="font-medium">57점</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="text-gray-600">인공지능</span>
                                            <span className="font-medium">57점</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="space-y-8">
                        <div className="mb-12">
                            <div className="flex items-center mb-4">
                                <Calendar className="w-6 h-6 mr-3 text-gray-700" />
                                <h2 className="text-3xl font-bold text-gray-900">주요 프로젝트</h2>
                            </div>
                            <div className="h-1 w-20 bg-gray-900 rounded-full"></div>
                        </div>
                        
                        <div className="grid gap-6">
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-gray-300 transition-all hover:shadow-lg">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        대기업 AI 교육 프로그램
                                    </h3>
                                    <span className="text-base text-gray-600">2022 ~ 현재</span>
                                </div>
                                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                                    삼성전자, LG전자, SK, 현대건설 등 국내 주요 대기업 임직원 대상 
                                    맞춤형 AI 교육 프로그램 설계 및 운영
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-medium">
                                        Python
                                    </span>
                                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-medium">
                                        Machine Learning
                                    </span>
                                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-medium">
                                        Deep Learning
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-gray-300 transition-all hover:shadow-lg">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Computer Vision 프로젝트
                                    </h3>
                                    <span className="text-base text-gray-600">2023</span>
                                </div>
                                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                                    제조업 품질 검사 자동화를 위한 YOLO 기반 객체 탐지 시스템 개발 및 구축
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-medium">
                                        YOLO
                                    </span>
                                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-medium">
                                        OpenCV
                                    </span>
                                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-medium">
                                        PyTorch
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-gray-300 transition-all hover:shadow-lg">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        LLM 기반 솔루션 개발
                                    </h3>
                                    <span className="text-base text-gray-600">2024</span>
                                </div>
                                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                                    기업 내부 문서 자동 분석 및 인사이트 도출을 위한 LLM 기반 시스템 구축
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-medium">
                                        GPT-4
                                    </span>
                                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-medium">
                                        LangChain
                                    </span>
                                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-medium">
                                        RAG
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
});

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;