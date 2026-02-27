import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Code2, MessageSquare, Eye } from 'lucide-react';

interface Service {
  number: string;
  titleKey: string;
  descriptionKey: string;
  detailsKey: string;
  icon: React.ElementType;
}

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = memo(({ service }) => {
  const { t } = useTranslation();
  const Icon = service.icon;
  const details = t(service.detailsKey, {
    returnObjects: true,
  }) as unknown as string[];

  return (
    <article
      className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300"
      aria-label={t(service.titleKey)}
    >
      {/* Icon and Number */}
      <div className="flex items-center justify-between mb-6">
        <Icon
          className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
          aria-hidden="true"
        />
        <span className="text-4xl font-black text-gray-200 dark:text-gray-700 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
          {service.number}
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {t(service.titleKey)}
      </h3>
      <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400 mb-6">
        {t(service.descriptionKey)}
      </p>
      <ul className="space-y-3">
        {Array.isArray(details) &&
          details.map((detail, idx) => (
            <li
              key={idx}
              className="text-sm text-gray-500 dark:text-gray-400 flex items-start"
            >
              <span className="mr-2 text-gray-400 mt-1">•</span>
              <span>{detail}</span>
            </li>
          ))}
      </ul>
    </article>
  );
});

ServiceCard.displayName = 'ServiceCard';

const ServicesSection: React.FC = memo(() => {
  const { t } = useTranslation();

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
      icon: Code2,
    },
    {
      number: '03',
      titleKey: 'services.llmGenai.title',
      descriptionKey: 'services.llmGenai.description',
      detailsKey: 'services.llmGenai.details',
      icon: MessageSquare,
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
    <section
      id="services"
      aria-label={t('accessibility.servicesSection')}
      className="py-32 bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-4">
            {t('services.sectionLabel')}
          </h2>
          <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
            {t('services.title')}
          </h3>
          <p className="text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.number} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';

export default ServicesSection;
