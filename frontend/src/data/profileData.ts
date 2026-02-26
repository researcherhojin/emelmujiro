export interface CareerItem {
  period: string;
  company: string;
  position: string;
  description: string;
  current?: boolean;
}

export interface EducationItem {
  period: string;
  school: string;
  degree: string;
  description: string;
}

export interface ProjectStats {
  totalProjects: string;
  totalStudents: string;
  partnerCompanies: string;
  yearsOfExperience: string;
}

export interface Project {
  id: string;
  title: string;
  period: string;
  description: string;
  category: 'enterprise' | 'bootcamp' | 'education' | 'startup' | 'research';
  tags: string[];
  highlight?: boolean;
}

export const careerData: CareerItem[] = [
  {
    period: '2024.12 ~ 현재',
    company: '에멜무지로',
    position: '대표',
    description: 'AI 교육·컨설팅 전문 기업 창업 · LLM/RAG 기반 솔루션 개발',
    current: true,
  },
  {
    period: '2023.05 ~ 현재',
    company: '멋쟁이사자처럼',
    position: 'AI 전문 강사',
    description:
      'AI 엔지니어 심화 부트캠프 · 테킷 스타트업 스테이션 · 한국과학창의재단 AI 교육 · 산업전문인력 AI역량강화 교육',
    current: true,
  },
  {
    period: '2023.05 ~ 2024.09',
    company: '엘리스',
    position: 'AI/데이터분석 전문 강사',
    description:
      '삼성전자 Spotfire 데이터 분석 · LG전자 Data Science 프로젝트 · Python/ML 기초 교육 · 현대건설 ML/DL 과정',
  },
  {
    period: '2022.10 ~ 2024.09',
    company: 'Cobslab',
    position: '책임 연구원 / 전문 강사',
    description:
      '삼성전자, LG전자 등 대기업·정부기관 AI 교육 콘텐츠 개발 및 강의',
  },
  {
    period: '2022.04 ~ 2023.02',
    company: '모두의연구소 / 한글과컴퓨터',
    position: 'AI 교육 강사',
    description:
      '서울대·서울시립대 AI 교육 · SKT Computer Vision · KETI 나노소재 AI 과정 · 서울시 교육청 교원 AI 직무연수',
  },
  {
    period: '2022.06',
    company: '코코넛사일로',
    position: '연구원',
    description: 'Data Lab · 데이터 바우처 지원사업 프로토타입 개발',
  },
  {
    period: '2021.05 ~ 2021.08',
    company: '서울시 청년청',
    position: 'Front-End Developer',
    description: '사회적 기업 과제 수행 · 웹 프론트엔드 개발',
  },
];

export const educationData: EducationItem[] = [
  {
    period: '2024.09 ~ 2026.06\n(예정)',
    school: '한양대학교',
    degree: '인공지능융합대학원 인공지능시스템학과 석사과정',
    description: 'Computer Vision · 지도교수: 조동현 교수',
  },
  {
    period: '2013.03 ~ 2021.02',
    school: '경북대학교',
    degree: '축산생명공학 학사',
    description: '부전공: 식품공학부 식품응용공학',
  },
];

export const projects: Project[] = [
  {
    id: 'ai-cv-bootcamp',
    title: 'AI 컴퓨터비전(CV) 심화 과정',
    period: '2024 ~ 2026',
    description:
      '멋쟁이사자처럼 AI 엔지니어 심화 부트캠프 1~3기 운영 · YOLO, RT-DETR, SAM 기반 실전 프로젝트 리딩 · AI 챔피언상 수상팀 및 데이콘 우승팀 배출',
    category: 'bootcamp',
    tags: [
      'Computer Vision',
      'Image Generation',
      'Object Detection',
      'PyTorch',
      'Segmentation',
    ].sort(),
    highlight: true,
  },
  {
    id: 'enterprise-ai-education',
    title: '대기업·공공기관 AI 교육',
    period: '2022 ~ 2026',
    description:
      '삼성전자, LG전자, 현대건설, SKT, 서울대, 서울시 교육청 등 · CV, ML/DL, 데이터 분석, 생성형 AI 프로젝트 기반 교육 설계 및 운영',
    category: 'enterprise',
    tags: ['Computer Vision', 'Data Science', 'ML/DL', '생성형 AI'].sort(),
  },
  {
    id: 'ict-piuda',
    title: 'ICT콤플렉스 피우다 프로젝트',
    period: '2025',
    description:
      '경계선지능 청소년 AI 학습 지원 서비스 "이음(E-eum)" 기획 및 개발 · LLM 기반 쉬운 말 변환 시스템 · 270팀 중 최종 15팀, 분야 3위 수상',
    category: 'research',
    tags: ['FastAPI', 'LLM', 'React', '사회적 가치'].sort(),
  },
  {
    id: 'teacher-training',
    title: '생성형 AI 교육자 연수',
    period: '2024 ~ 2025',
    description:
      '한국과학창의재단 찾아가는 학교 컨설팅 · 초중고 6개교 교사 및 학부모 대상 ChatGPT 활용 교육',
    category: 'education',
    tags: ['AI 리터러시', 'ChatGPT', '교육 혁신', '생성형 AI'].sort(),
  },
  {
    id: 'startup-station',
    title: '테킷 스타트업 스테이션',
    period: '2023 ~ 2025',
    description:
      '멋쟁이사자처럼 테킷 스타트업 스테이션 7~10기 운영 · 예비 IT창업자 대상 AI 서비스 설계 및 개발 멘토링 · 정부 창업 지원사업 선정팀 다수 배출',
    category: 'startup',
    tags: ['AI 서비스', 'MVP 개발', '멘토링', '창업 교육'].sort(),
  },
  {
    id: 'nano-ai',
    title: '산업전문인력 AI 역량강화 교육',
    period: '2022 ~ 2025',
    description:
      '나노융합산업연구조합 협력 · 나노소재 빅데이터 AI 융합 교육 · SECOM 반도체 공정 고장예측 · CNT/수지 복합소재 구조분석 시뮬레이션',
    category: 'enterprise',
    tags: ['빅데이터', '산업 AI', '시뮬레이션', '제조 AI'].sort(),
  },
  {
    id: 'open-source',
    title: 'Visual Python 오픈소스 개발',
    period: '2022',
    description:
      '2022 오픈소스 컨트리뷰션 아카데미 · Visual Python ML/Statistics 모듈 개발',
    category: 'research',
    tags: ['ML', 'Python', '시각화', '오픈소스'].sort(),
  },
];

export const projectStats: ProjectStats = {
  totalProjects: '50+',
  totalStudents: '1,000+',
  partnerCompanies: '30+',
  yearsOfExperience: '5+',
};

export const projectCategories = [
  { id: 'all', label: '전체', count: projects.length },
  {
    id: 'enterprise',
    label: '기업 교육',
    count: projects.filter((p) => p.category === 'enterprise').length,
  },
  {
    id: 'bootcamp',
    label: '부트캠프',
    count: projects.filter((p) => p.category === 'bootcamp').length,
  },
  {
    id: 'education',
    label: '교육 혁신',
    count: projects.filter((p) => p.category === 'education').length,
  },
  {
    id: 'startup',
    label: '스타트업',
    count: projects.filter((p) => p.category === 'startup').length,
  },
  {
    id: 'research',
    label: '연구/개발',
    count: projects.filter((p) => p.category === 'research').length,
  },
];
