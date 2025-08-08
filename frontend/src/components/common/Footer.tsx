import React, { useState, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  ExternalLink,
  X,
  Code,
  GraduationCap,
  BarChart3,
  Database,
  LucideIcon,
} from 'lucide-react';

interface ServiceDetail {
  title: string;
  icon: LucideIcon;
  description: string;
  details: string[];
  cases: string[];
}

interface Services {
  [key: string]: ServiceDetail;
}

interface ServiceModalProps {
  isOpen: boolean;
  service: ServiceDetail | null;
  onClose: () => void;
  onContactClick: () => void;
}

const ServiceModal: React.FC<ServiceModalProps> = memo(
  ({ isOpen, service, onClose, onContactClick }) => {
    if (!isOpen || !service) return null;

    const IconComponent = service.icon;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                onClose();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close modal"
          ></div>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                <IconComponent className="h-6 w-6 text-gray-700" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">주요 서비스</h4>
                  <ul className="space-y-2">
                    {service.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">주요 사례</h4>
                  <ul className="space-y-1">
                    {service.cases.map((caseItem, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {caseItem}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onContactClick}
              >
                문의하기
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ServiceModal.displayName = 'ServiceModal';

const Footer: React.FC = memo(() => {
  const navigate = useNavigate();
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  const currentYear = new Date().getFullYear();

  const services: Services = useMemo(
    () => ({
      'ai-solution': {
        title: 'AI 솔루션 개발',
        icon: Code,
        description: '기업 맞춤형 AI 솔루션을 설계하고 구현합니다.',
        details: [
          '맞춤형 LLM 기반 솔루션 개발',
          'Computer Vision & 이미지 분석 시스템',
          'NLP 기반 텍스트 분석 및 자동화',
          '예측 모델링 및 추천 시스템',
          'MLOps 파이프라인 구축',
          'AI 모델 성능 최적화',
        ],
        cases: [
          '삼성전자 - AI 이상탐지 시스템',
          'LG전자 - 데이터 분석 파이프라인',
          '현대건설 - 머신러닝 예측 모델',
        ],
      },
      'ai-education': {
        title: 'AI 교육 & 강의',
        icon: GraduationCap,
        description: '실무 중심의 AI 교육 프로그램을 제공합니다.',
        details: [
          '기업 맞춤형 AI 교육 커리큘럼 설계',
          'Python 머신러닝/딥러닝 실무 교육',
          'LLM & ChatGPT 활용 워크샵',
          'Computer Vision 프로젝트 교육',
          'Data Science 실전 과정',
          '비전공자 대상 AI 기초 교육',
        ],
        cases: [
          '삼성전자 - Python 머신러닝 교육',
          '카카오 - 컴퓨터비전 강의',
          '멋쟁이사자처럼 - AI 스타트업 교육',
        ],
      },
      'ai-consulting': {
        title: 'AI 전략 컨설팅',
        icon: BarChart3,
        description: 'AI 도입 전략부터 실행까지 종합적인 컨설팅을 제공합니다.',
        details: [
          'AI 도입 전략 수립 및 로드맵 설계',
          'AI 비즈니스 모델 개발',
          'AI 역량 진단 및 개선 방안',
          'AI 거버넌스 체계 구축',
          'AI 프로젝트 관리 및 PMO',
          'AI 성과 측정 및 ROI 분석',
        ],
        cases: ['대기업 AI 전략 컨설팅', '공공기관 AI 도입 지원', '스타트업 AI 기술 자문'],
      },
      'data-analysis': {
        title: '데이터 분석',
        icon: Database,
        description: '비즈니스 인사이트 도출을 위한 데이터 분석 서비스를 제공합니다.',
        details: [
          '비즈니스 데이터 분석 및 시각화',
          '통계적 분석 및 가설 검증',
          '고객 행동 분석 및 세그멘테이션',
          '시계열 데이터 분석 및 예측',
          'A/B 테스트 설계 및 분석',
          '데이터 품질 관리 및 정제',
        ],
        cases: ['이커머스 고객 분석', '제조업 품질 데이터 분석', '금융 리스크 분석'],
      },
    }),
    []
  );

  const handleServiceClick = useCallback(
    (serviceKey: string) => {
      setSelectedService(services[serviceKey]);
      setIsServiceModalOpen(true);
    },
    [services]
  );

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const scrollToSection = useCallback(
    (sectionId: string) => {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    [navigate]
  );

  const handleModalClose = useCallback(() => {
    setIsServiceModalOpen(false);
  }, []);

  const handleModalContactClick = useCallback(() => {
    setIsServiceModalOpen(false);
    handleNavigate('/contact');
  }, [handleNavigate]);

  return (
    <>
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Services */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-6">서비스</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleServiceClick('ai-solution')}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm text-left block w-full"
                  >
                    AI 솔루션 개발
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleServiceClick('ai-education')}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm text-left block w-full"
                  >
                    AI 교육 & 강의
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleServiceClick('ai-consulting')}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm text-left block w-full"
                  >
                    AI 전략 컨설팅
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleServiceClick('data-analysis')}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm text-left block w-full"
                  >
                    데이터 분석
                  </button>
                </li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-6">메뉴</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection('hero')}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm text-left block w-full"
                  >
                    홈
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('services')}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm text-left block w-full"
                  >
                    서비스
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('/profile')}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm text-left block w-full"
                  >
                    대표 프로필
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('/contact')}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm text-left block w-full"
                  >
                    문의하기
                  </button>
                </li>
              </ul>
            </div>

            {/* Company Info */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-6">에멜무지로</h3>
              <div className="space-y-3">
                <div className="flex items-start text-base text-gray-700">
                  <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="break-all">researcherhojin@gmail.com</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>010-7279-0380</span>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-6">문의하기</h3>
              <p className="text-gray-700 text-base mb-6 leading-relaxed">
                AI 프로젝트 도입을 계획 중이시나요?
              </p>
              <button
                onClick={() => handleNavigate('/contact')}
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-base font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md"
              >
                문의하기
                <ExternalLink className="ml-2 w-3 h-3 flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 text-base">
                © {currentYear} 에멜무지로. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Service Detail Modal */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        service={selectedService}
        onClose={handleModalClose}
        onContactClick={handleModalContactClick}
      />
    </>
  );
});

Footer.displayName = 'Footer';

export default Footer;
