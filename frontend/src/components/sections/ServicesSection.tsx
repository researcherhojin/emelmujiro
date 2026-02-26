import React, { memo } from 'react';
import { GraduationCap, Code2, MessageSquare, Eye } from 'lucide-react';

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

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {service.title}
      </h3>
      <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400 mb-6">
        {service.description}
      </p>
      <ul className="space-y-3">
        {service.details.map((detail, idx) => (
          <li
            key={idx}
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

const ServicesSection: React.FC = memo(() => {
  const services: Service[] = [
    {
      number: '01',
      title: 'AI 교육 & 강의',
      description: '대기업·공공기관 맞춤형 AI 역량 강화',
      details: [
        '맞춤형 커리큘럼 설계',
        '프로젝트 기반 실습 교육',
        '1:1 기술 멘토링',
      ],
      icon: GraduationCap,
    },
    {
      number: '02',
      title: 'AI 컨설팅',
      description: 'AI 도입을 위한 전략 수립 및 기술 자문',
      details: [
        'AI 도입 전략 및 기술 검토',
        '모델 선정 및 PoC 개발',
        '서비스 프로토타입 설계',
      ],
      icon: Code2,
    },
    {
      number: '03',
      title: 'LLM/생성형 AI',
      description: '대규모 언어 모델 기반 서비스 개발',
      details: [
        'RAG 시스템 설계 및 구축',
        'LLM 기반 서비스 프로토타입',
        '생성형 AI 활용 교육',
      ],
      icon: MessageSquare,
    },
    {
      number: '04',
      title: 'Computer Vision',
      description: '영상 처리 및 비전 AI 솔루션',
      details: [
        '객체 탐지 / 세그멘테이션',
        '최신 모델 적용 (YOLO, SAM 등)',
        'CV 프로젝트 설계 및 멘토링',
      ],
      icon: Eye,
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
