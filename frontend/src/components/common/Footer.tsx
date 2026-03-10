import React, { useState, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, ExternalLink } from 'lucide-react';
import { getServices, type ServiceDetail } from '../../data/footerData';
import { CONTACT_EMAIL } from '../../utils/constants';
import ServiceModal from './ServiceModal';
import { useScrollToSection } from '../../hooks/useScrollToSection';

const Footer: React.FC = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollToSection = useScrollToSection();
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  const currentYear = new Date().getFullYear();

  const handleServiceClick = useCallback((serviceKey: string) => {
    const currentServices = getServices();
    setSelectedService(currentServices[serviceKey]);
    setIsServiceModalOpen(true);
  }, []);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const handleModalClose = useCallback(() => {
    setIsServiceModalOpen(false);
  }, []);

  const handleModalContactClick = useCallback(() => {
    setIsServiceModalOpen(false);
    window.location.href = `mailto:${CONTACT_EMAIL}`;
  }, []);

  return (
    <>
      <footer className="bg-gray-50 dark:bg-dark-950 border-t border-gray-200 dark:border-dark-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Services */}
            <nav className="col-span-1" aria-label={t('accessibility.footerNavServices')}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('footer.services')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleServiceClick('ai-education')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all outline-none focus:outline-none border-none bg-transparent"
                  >
                    {t('services.education.title')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleServiceClick('ai-consulting')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all outline-none focus:outline-none border-none bg-transparent"
                  >
                    {t('services.consulting.title')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleServiceClick('llm-genai')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all outline-none focus:outline-none border-none bg-transparent"
                  >
                    {t('services.llmGenai.title')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleServiceClick('computer-vision')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all outline-none focus:outline-none border-none bg-transparent"
                  >
                    {t('services.computerVision.title')}
                  </button>
                </li>
              </ul>
            </nav>

            {/* Navigation */}
            <nav className="col-span-1" aria-label={t('accessibility.footerNavMenu')}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('common.menu')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection('hero')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all outline-none focus:outline-none border-none bg-transparent"
                  >
                    {t('common.home')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('services')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all outline-none focus:outline-none border-none bg-transparent"
                  >
                    {t('common.services')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('/profile')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all outline-none focus:outline-none border-none bg-transparent"
                  >
                    {t('common.representativeProfile')}
                  </button>
                </li>
                <li>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm text-left inline-block relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gray-900 dark:after:bg-white after:w-0 after:transition-all"
                  >
                    {t('common.contact')}
                  </a>
                </li>
              </ul>
            </nav>

            {/* Company Info */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('common.companyName')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start text-base text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="break-all">{CONTACT_EMAIL}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
                  <span>{t('contact.info.phone')}</span>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('common.contact')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-base mb-6 leading-relaxed">
                {t('footer.ctaQuestion')}
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {t('common.contact')}
                <ExternalLink className="ml-2 w-3 h-3 flex-shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200 dark:border-dark-700 space-y-3">
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              {t('footer.copyright', { year: currentYear })}
            </p>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              {t('footer.businessInfo.representative')}:{' '}
              {t('footer.businessInfo.representativeName')} |{' '}
              {t('footer.businessInfo.businessNumber')}:{' '}
              {t('footer.businessInfo.businessNumberValue')}
            </p>
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
