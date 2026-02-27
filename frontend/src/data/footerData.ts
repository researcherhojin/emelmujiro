import {
  LucideIcon,
  GraduationCap,
  Code2,
  MessageSquare,
  Eye,
} from 'lucide-react';

export interface ServiceDetail {
  title: string;
  icon: LucideIcon;
  description: string;
  details: string[];
}

export interface Services {
  [key: string]: ServiceDetail;
}

export const services: Services = {
  'ai-education': {
    title: 'AI 교육 & 강의',
    icon: GraduationCap,
    description: '기업 맞춤 AI 교육 프로그램을 설계하고 운영합니다.',
    details: [
      '맞춤형 커리큘럼 설계',
      '프로젝트 기반 실습 교육',
      '1:1 기술 멘토링',
      'Python 머신러닝/딥러닝 실무 교육',
      'LLM & 생성형 AI 활용 워크샵',
      '비전공자 대상 AI 기초 교육',
    ],
  },
  'ai-consulting': {
    title: 'AI 컨설팅',
    icon: Code2,
    description: 'AI 도입 전략 수립부터 기술 자문까지 제공합니다.',
    details: [
      'AI 도입 전략 및 기술 검토',
      '모델 선정 및 PoC 개발',
      '서비스 프로토타입 설계',
      'AI 비즈니스 모델 개발',
      'AI 프로젝트 관리 및 기술 자문',
      'AI 성과 측정 및 ROI 분석',
    ],
  },
  'llm-genai': {
    title: 'LLM/생성형 AI',
    icon: MessageSquare,
    description: 'LLM 기반 서비스를 설계하고 개발합니다.',
    details: [
      'RAG 시스템 설계 및 구축',
      'LLM 기반 서비스 프로토타입',
      '생성형 AI 활용 교육',
      '프롬프트 엔지니어링 최적화',
      'LLM 파인튜닝 및 성능 최적화',
      'AI 에이전트 설계 및 개발',
    ],
  },
  'computer-vision': {
    title: 'Computer Vision',
    icon: Eye,
    description: '영상 처리 및 비전 AI 솔루션을 제공합니다.',
    details: [
      '객체 탐지 / 세그멘테이션',
      '최신 모델 적용 (YOLO, SAM 등)',
      'CV 프로젝트 설계 및 멘토링',
      '이미지 분류 및 검색 시스템',
      '영상 분석 파이프라인 구축',
      '산업용 비전 AI 솔루션 설계',
    ],
  },
};
