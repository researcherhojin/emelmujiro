import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Code, GraduationCap, MessageSquare, Database } from 'lucide-react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = memo(
  ({ icon, title, description, features }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-gray-700 dark:text-gray-300">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400"
          >
            <span className="text-gray-400 dark:text-gray-600 mt-1">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
);

ServiceCard.displayName = 'ServiceCard';

const ServiceCards: React.FC = memo(() => {
  const { t } = useTranslation();

  const services = [
    {
      icon: <Code className="w-6 h-6" />,
      title: t('contact.services.consulting.title'),
      description: t('contact.services.consulting.description'),
      features: [
        t('contact.services.consulting.feature1'),
        t('contact.services.consulting.feature2'),
        t('contact.services.consulting.feature3'),
      ],
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: t('contact.services.education.title'),
      description: t('contact.services.education.description'),
      features: [
        t('contact.services.education.feature1'),
        t('contact.services.education.feature2'),
        t('contact.services.education.feature3'),
      ],
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: t('contact.services.llm.title'),
      description: t('contact.services.llm.description'),
      features: [
        t('contact.services.llm.feature1'),
        t('contact.services.llm.feature2'),
        t('contact.services.llm.feature3'),
      ],
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: t('contact.services.data.title'),
      description: t('contact.services.data.description'),
      features: [
        t('contact.services.data.feature1'),
        t('contact.services.data.feature2'),
        t('contact.services.data.feature3'),
      ],
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {services.map((service, index) => (
        <ServiceCard key={index} {...service} />
      ))}
    </div>
  );
});

ServiceCards.displayName = 'ServiceCards';

export default ServiceCards;
