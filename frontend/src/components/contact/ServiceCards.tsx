import React, { memo } from 'react';
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
  const services = [
    {
      icon: <Code className="w-6 h-6" />,
      title: 'AI 컨설팅',
      description: '비즈니스 맞춤형 AI 솔루션 제공',
      features: ['AI 도입 전략 수립', '기술 검토 및 평가', 'ROI 분석'],
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: '기업 AI 교육',
      description: '실무 중심의 AI 교육 프로그램',
      features: ['맞춤형 커리큘럼', '실습 위주 교육', '사후 멘토링'],
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'LLM 솔루션',
      description: '대규모 언어 모델 구축 및 최적화',
      features: ['커스텀 LLM 개발', 'Fine-tuning', 'API 통합'],
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: '데이터 분석',
      description: '데이터 기반 인사이트 도출',
      features: ['데이터 파이프라인', '예측 모델링', '시각화 대시보드'],
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
