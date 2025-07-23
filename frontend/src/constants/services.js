export const SERVICES = [
  {
    id: 'ai-consulting',
    title: 'AI/ML 컨설팅',
    shortTitle: 'AI 컨설팅',
    description: '비즈니스 문제에 대한 실용적 AI 솔루션',
    features: ['맞춤형 모델 개발', 'MLOps 구축 지원', '성능 최적화'],
    details: '모델 개발, MLOps 구축, 성능 최적화',
    icon: 'Brain'
  },
  {
    id: 'education',
    title: '기업 교육',
    shortTitle: '기업 교육',
    description: '실무 중심의 AI/데이터 교육 프로그램',
    features: ['커스텀 커리큘럼', '실습 위주 교육', '사후 지원'],
    details: '맞춤형 커리큘럼, 실습 중심, 멘토링',
    icon: 'GraduationCap'
  },
  {
    id: 'poc',
    title: 'PoC 개발',
    shortTitle: 'PoC 개발',
    description: '아이디어를 현실로 만드는 빠른 프로토타이핑',
    features: ['빠른 검증', '비용 효율적', 'MVP 개발'],
    details: '빠른 검증, 비용 효율적, MVP 지원',
    icon: 'Lightbulb'
  }
];

export const getServiceById = (id) => {
  return SERVICES.find(service => service.id === id);
};

export const getServiceIcon = (iconName) => {
  // Icon mapping for different icon libraries
  const iconMap = {
    'Brain': 'Brain',
    'GraduationCap': 'GraduationCap',
    'Lightbulb': 'Lightbulb'
  };
  return iconMap[iconName] || iconName;
};