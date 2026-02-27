import React, { useState, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ExternalLink, X } from 'lucide-react';
import { services, type ServiceDetail } from '../../data/footerData';

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
            className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onClose();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close modal"
          ></div>

          <div className="inline-block align-bottom bg-white dark:bg-dark-900 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white dark:bg-dark-900 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-dark-800 sm:mx-0 sm:h-10 sm:w-10">
                <IconComponent className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {service.description}
                </p>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    주요 서비스
                  </h4>
                  <ul className="space-y-2">
                    {service.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-900 dark:bg-gray-100 text-base font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onContactClick}
              >
                문의하기
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-dark-600 shadow-sm px-4 py-2 bg-white dark:bg-dark-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
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
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(
    null
  );

  const currentYear = new Date().getFullYear();

  const handleServiceClick = useCallback((serviceKey: string) => {
    setSelectedService(services[serviceKey]);
    setIsServiceModalOpen(true);
  }, []);

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
      <footer className="bg-gray-50 dark:bg-dark-950 border-t border-gray-200 dark:border-dark-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Services */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                서비스
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleServiceClick('ai-education')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all focus:outline-none border-none bg-transparent"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    AI 교육 & 강의
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleServiceClick('ai-consulting')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all focus:outline-none border-none bg-transparent"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    AI 컨설팅
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleServiceClick('llm-genai')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all focus:outline-none border-none bg-transparent"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    LLM/생성형 AI
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleServiceClick('computer-vision')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all focus:outline-none border-none bg-transparent"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    Computer Vision
                  </button>
                </li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                메뉴
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection('hero')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all focus:outline-none border-none bg-transparent"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    홈
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('services')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all focus:outline-none border-none bg-transparent"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    서비스
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('/profile')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all focus:outline-none border-none bg-transparent"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    대표 프로필
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('/contact')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all focus:outline-none border-none bg-transparent"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    문의하기
                  </button>
                </li>
              </ul>
            </div>

            {/* Company Info */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                에멜무지로
              </h3>
              <div className="space-y-3">
                <div className="flex items-start text-base text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="break-all">researcherhojin@gmail.com</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>010-7279-0380</span>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                문의하기
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-base mb-6 leading-relaxed">
                AI 프로젝트 도입을 계획 중이시나요?
              </p>
              <button
                onClick={() => handleNavigate('/contact')}
                className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                문의하기
                <ExternalLink className="ml-2 w-3 h-3 flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200 dark:border-dark-700">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-base">
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
