import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 공통 컴포넌트
import ErrorBoundary from './common/ErrorBoundary';
import SEO from './layout/SEO';

// 섹션 컴포넌트
import HeroSection from './sections/HeroSection';
import ServicesSection from './sections/ServicesSection';
import AboutSection from './sections/AboutSection';
import LectureCareerSection from './sections/LectureCareerSection';
import EducationSection from './sections/EducationSection';
import LogosSection from './sections/LogosSection';
import BlogSection from './sections/BlogSection';

// API 서비스
import { api } from '../services/api';

// 로고 데이터
import samsungLogo from '../assets/logos/samsung.svg';
import lgLogo from '../assets/logos/lg.svg';
import sktLogo from '../assets/logos/skt.svg';
import ktLogo from '../assets/logos/kt.svg';
import kakaoLogo from '../assets/logos/kakao.svg';
import likelionLogo from '../assets/logos/likelion.png';
import eliceLogo from '../assets/logos/elice.png';
import hancomLogo from '../assets/logos/hancom.svg';
import hyundaiconstructionLogo from '../assets/logos/hyundaiconstruction.svg';
import seoulEduLogo from '../assets/logos/seoul_edu.svg';
import weatherLogo from '../assets/logos/weather.svg';
import nepes from '../assets/logos/nepes.svg';
import scienceFoundationLogo from '../assets/logos/science_foundation.svg';
import seoulUnivLogo from '../assets/logos/seoul_univ.svg';
import uosLogo from '../assets/logos/uos.svg';

const companies = [
    { name: '삼성전자', logo: samsungLogo, sortOrder: 1, description: 'Spotfire 데이터 분석 및 AI/ML 과정 제공' },
    { name: 'LG전자', logo: lgLogo, sortOrder: 2, description: 'Data Science 프로젝트 및 AI 교육 협력' },
    { name: 'SKT', logo: sktLogo, sortOrder: 3, description: 'Computer Vision' },
    { name: 'KT', logo: ktLogo, sortOrder: 4, description: 'AI+X 사례 분석' },
    { name: '카카오', logo: kakaoLogo, sortOrder: 4, description: 'AI 기반 데이터 처리 및 최적화 협력' },
    { name: '현대건설', logo: hyundaiconstructionLogo, sortOrder: 5, description: 'YOLO 모델 실습 및 딥러닝 교육' },
    { name: '멋쟁이사자처럼', logo: likelionLogo, sortOrder: 6, description: '생성형 AI 활용과 스타트업 교육 제공' },
    { name: '엘리스', logo: eliceLogo, sortOrder: 7, description: 'Python 및 AI/ML 맞춤형 교육 진행' },
    { name: '한글과컴퓨터', logo: hancomLogo, sortOrder: 8, description: 'NLP 및 Computer Vision 심화 과정 협력' },
    { name: 'NEPES', logo: nepes, sortOrder: 9, description: 'AI 프로젝트 기술 검증 및 최적화 참여' },
    { name: '서울특별시교육청', logo: seoulEduLogo, sortOrder: 10, description: '교육 프로그램 개발 및 지원' },
    { name: '기상청', logo: weatherLogo, sortOrder: 11, description: 'AI 해커톤 멘토링 및 데이터 관리 지원' },
    { name: '교육부', logo: scienceFoundationLogo, sortOrder: 12, description: 'AI 교육 전략 및 기술 개발' },
    { name: '서울대학교', logo: seoulUnivLogo, sortOrder: 13, description: '사범대 Python 특강 및 연구 협력' },
    { name: '서울시립대', logo: uosLogo, sortOrder: 14, description: 'AI 과정 교육 및 취업사관학교 AI 프로그램' },
];

// 로고를 sortOrder 기준으로 정렬
const sortedCompanies = companies.sort((a, b) => a.sortOrder - b.sortOrder);

const Website = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleContact = useCallback(() => {
        navigate('/contact');
    }, [navigate]);

    useEffect(() => {
        const fetchBlogPosts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.getBlogPosts();
                setPosts(response.data);
            } catch (err) {
                console.error('Error fetching blog posts:', err.message);
                setError('블로그 게시물을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlogPosts();
    }, []);

    return (
        <ErrorBoundary>
            <div className="flex flex-col min-h-screen">
                <SEO
                    title="에멜무지로 | AI 혁신 파트너"
                    description="기업의 AI 전환을 위한 솔루션 개발, 실전 교육, 전략 컨설팅을 제공합니다."
                    keywords="AI 도입, AI 컨설팅, AI 교육, 기업 AI, 디지털 전환, AI 솔루션"
                    ogImage="/og-image.png"
                    canonical="https://emelmujiro.com"
                />

                <main>
                    <HeroSection handleContact={handleContact} />
                    <ServicesSection />
                    <AboutSection />
                    <LectureCareerSection />
                    <EducationSection />
                    <LogosSection companies={sortedCompanies} />
                    <BlogSection posts={posts} isLoading={isLoading} error={error} />
                </main>
            </div>
        </ErrorBoundary>
    );
};

export default Website;
