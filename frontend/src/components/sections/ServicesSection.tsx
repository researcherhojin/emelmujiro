import React, { memo } from 'react';
import { Code2, GraduationCap, MessageSquare, Database } from 'lucide-react';

interface Service {
  number: string;
  title: string;
  description: string;
  details: string[];
  icon: React.ElementType;
}

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = memo(({ service }) => {
  const Icon = service.icon;

  return (
    <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300">
      {/* Icon and Number */}
      <div className="flex items-center justify-between mb-6">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
        <span className="text-4xl font-black text-gray-200 dark:text-gray-700 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
          {service.number}
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{service.title}</h3>
      <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400 mb-6">
        {service.description}
      </p>
      <ul className="space-y-3">
        {service.details.map((detail, idx) => (
          <li key={idx} className="text-sm text-gray-500 dark:text-gray-400 flex items-start">
            <span className="mr-2 text-gray-400 mt-1">•</span>
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

const ServicesSection: React.FC = memo(() => {
  const services: Service[] = [
    {
      number: '01',
      title: 'AI 컨설팅',
      description: '비즈니스 문제를 위한 AI 솔루션 개발',
      details: ['MLOps 구축 및 최적화', '모델 개발 및 성능 향상', 'AI 도입 전략 수립'],
      icon: Code2,
    },
    {
      number: '02',
      title: '기업 AI 교육',
      description: '실무자를 위한 체계적인 AI 역량 강화',
      details: ['맞춤형 커리큘럼 설계', '실습 중심 교육 진행', '1:1 멘토링 지원'],
      icon: GraduationCap,
    },
    {
      number: '03',
      title: 'LLM 솔루션',
      description: '최신 언어 모델 기반 비즈니스 혁신',
      details: ['RAG 시스템 구축', '맞춤형 챗봇 개발', '문서 자동화 솔루션'],
      icon: MessageSquare,
    },
    {
      number: '04',
      title: '데이터 분석',
      description: '데이터 기반 의사결정 지원 시스템',
      details: ['비즈니스 인텔리전스 도구 구축', '예측 모델 개발', '데이터 파이프라인 최적화'],
      icon: Database,
    },
  ];

  return (
    <section id="services" className="py-32 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-4">
            WHAT WE DO
          </h2>
          <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
            주요 서비스
          </h3>
          <p className="text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            기업의 AI 도입을 위한 단계별 솔루션을 제공합니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map(service => (
            <ServiceCard key={service.number} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';

export default ServicesSection;
