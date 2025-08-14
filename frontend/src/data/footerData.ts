import {
  LucideIcon,
  Code,
  GraduationCap,
  BarChart3,
  Database,
} from 'lucide-react';

export interface ServiceDetail {
  title: string;
  icon: LucideIcon;
  description: string;
  details: string[];
  cases: string[];
}

export interface Services {
  [key: string]: ServiceDetail;
}

export const services: Services = {
  'ai-solution': {
    title: 'AI 솔루션 개발',
    icon: Code,
    description: '기업 맞춤형 AI 솔루션을 설계하고 구현합니다.',
    details: [
      '맞춤형 LLM 기반 솔루션 개발',
      'Computer Vision & 이미지 분석 시스템',
      'NLP 기반 텍스트 분석 및 자동화',
      '예측 모델링 및 추천 시스템',
      'MLOps 파이프라인 구축',
      'AI 모델 성능 최적화',
    ],
    cases: [
      '삼성전자 - AI 이상탐지 시스템',
      'LG전자 - 데이터 분석 파이프라인',
      '현대건설 - 머신러닝 예측 모델',
    ],
  },
  'ai-education': {
    title: 'AI 교육 & 강의',
    icon: GraduationCap,
    description: '실무 중심의 AI 교육 프로그램을 제공합니다.',
    details: [
      '기업 맞춤형 AI 교육 커리큘럼 설계',
      'Python 머신러닝/딥러닝 실무 교육',
      'LLM & ChatGPT 활용 워크샵',
      'Computer Vision 프로젝트 교육',
      'Data Science 실전 과정',
      '비전공자 대상 AI 기초 교육',
    ],
    cases: [
      '삼성전자 - Python 머신러닝 교육',
      '카카오 - 컴퓨터비전 강의',
      '멋쟁이사자처럼 - AI 스타트업 교육',
    ],
  },
  'ai-consulting': {
    title: 'AI 전략 컨설팅',
    icon: BarChart3,
    description: 'AI 도입 전략부터 실행까지 종합적인 컨설팅을 제공합니다.',
    details: [
      'AI 도입 전략 수립 및 로드맵 설계',
      'AI 비즈니스 모델 개발',
      'AI 역량 진단 및 개선 방안',
      'AI 거버넌스 체계 구축',
      'AI 프로젝트 관리 및 PMO',
      'AI 성과 측정 및 ROI 분석',
    ],
    cases: [
      '대기업 AI 전략 컨설팅',
      '공공기관 AI 도입 지원',
      '스타트업 AI 기술 자문',
    ],
  },
  'data-analysis': {
    title: '데이터 분석',
    icon: Database,
    description:
      '비즈니스 인사이트 도출을 위한 데이터 분석 서비스를 제공합니다.',
    details: [
      '비즈니스 데이터 분석 및 시각화',
      '통계적 분석 및 가설 검증',
      '고객 행동 분석 및 세그멘테이션',
      '시계열 데이터 분석 및 예측',
      'A/B 테스트 설계 및 분석',
      '데이터 품질 관리 및 정제',
    ],
    cases: [
      '이커머스 고객 분석',
      '제조업 품질 데이터 분석',
      '금융 리스크 분석',
    ],
  },
};
