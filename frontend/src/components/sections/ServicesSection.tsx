import React, { memo, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import { GraduationCap, Lightbulb, Bot, Eye } from 'lucide-react';
import { getServices } from '../../data/footerData';
import ServiceModal from '../common/ServiceModal';

interface Service {
  number: string;
  titleKey: string;
  descriptionKey: string;
  detailsKey: string;
  icon: React.ElementType;
}

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = memo(({ service, onClick }) => {
  const { t } = useTranslation();
  const Icon = service.icon;
  const details = t(service.detailsKey, {
    returnObjects: true,
  }) as unknown as string[];

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        /* v8 ignore next -- both branches tested; v8 miscounts || short-circuit */
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Icon */}
      <div className="flex items-center mb-6">
        <Icon
          className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {t(service.titleKey)}
      </h3>
      <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400 mb-6 break-keep">
        {t(service.descriptionKey)}
      </p>
      <ul className="space-y-3">
        {Array.isArray(details) &&
          details.map((detail, idx) => (
            <li
              key={`detail-${idx}`}
              className="text-sm text-gray-500 dark:text-gray-400 flex items-start"
            >
              <span className="mr-2 text-gray-400 mt-1">•</span>
              <span>{detail}</span>
            </li>
          ))}
      </ul>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

const SERVICE_KEYS = ['ai-education', 'ai-consulting', 'llm-genai', 'computer-vision'];

const ServicesSection: React.FC = memo(() => {
  const { t, i18n } = useTranslation();
  const { localizedNavigate } = useLocalizedPath();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // react-hooks/exhaustive-deps false positive: ESLint treats i18n.language
  // as "unnecessary" because i18n from useTranslation() is a stable
  // reference, but getServices() internally calls i18n.t() and the returned
  // strings are language-dependent. Without i18n.language in the deps the
  // memo would cache the original language forever across a switch.
  const serviceData = useMemo(
    () => getServices(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language]
  );
  const serviceList = useMemo(() => SERVICE_KEYS.map((key) => serviceData[key]), [serviceData]);

  const handleCardClick = useCallback((index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleContactClick = useCallback(() => {
    setIsModalOpen(false);
    localizedNavigate('/contact');
  }, [localizedNavigate]);

  const services: Service[] = [
    {
      number: '01',
      titleKey: 'services.education.title',
      descriptionKey: 'services.education.description',
      detailsKey: 'services.education.details',
      icon: GraduationCap,
    },
    {
      number: '02',
      titleKey: 'services.consulting.title',
      descriptionKey: 'services.consulting.description',
      detailsKey: 'services.consulting.details',
      icon: Lightbulb,
    },
    {
      number: '03',
      titleKey: 'services.llmGenai.title',
      descriptionKey: 'services.llmGenai.description',
      detailsKey: 'services.llmGenai.details',
      icon: Bot,
    },
    {
      number: '04',
      titleKey: 'services.computerVision.title',
      descriptionKey: 'services.computerVision.description',
      detailsKey: 'services.computerVision.details',
      icon: Eye,
    },
  ];

  return (
    <>
      <section
        id="services"
        aria-label={t('accessibility.servicesSection')}
        className="py-16 sm:py-32 bg-white dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-20 text-center">
            <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-3 sm:mb-4 block">
              {t('services.sectionLabel')}
            </span>
            <h2 className="text-2xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6">
              {t('services.title')}
            </h2>
            <p className="text-sm sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto break-keep">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, idx) => (
              <ServiceCard
                key={service.number}
                service={service}
                onClick={() => handleCardClick(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      <ServiceModal
        isOpen={isModalOpen}
        services={serviceList}
        currentIndex={modalIndex}
        onNavigate={setModalIndex}
        onClose={handleModalClose}
        onContactClick={handleContactClick}
      />
    </>
  );
});

ServicesSection.displayName = 'ServicesSection';

export default ServicesSection;
