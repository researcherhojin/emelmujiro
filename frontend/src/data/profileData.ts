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
    description:
      'AI 교육 및 컨설팅 전문 기업 창업 · 기업 맞춤형 AI 솔루션 개발',
    current: true,
  },
  {
    period: '2023.05 ~ 현재',
    company: '멋쟁이사자처럼',
    position: 'AI 전문 강사',
    description:
      '스타트업 스테이션 과정 · AI 엔지니어 심화 부트캠프 이미지처리 · 창업 특강 및 멘토링',
    current: true,
  },
  {
    period: '2023.05 ~ 2024.09',
    company: '엘리스',
    position: 'AI/데이터분석 전문 강사',
    description:
      '삼성전자 Spotfire 데이터 분석 · Python/ML 기초 교육 · 현대건설 ML/DL 과정',
  },
  {
    period: '2022.10 ~ 2024.09',
    company: 'Cobslab',
    position: '책임 연구원 / 전문 강사',
    description: '대기업/정부기관 Python, 데이터 분석, ML/DL 강의 개발 및 연구',
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
  {
    period: '2022.04 ~ 2023.02',
    company: '모두의연구소 / 한글과컴퓨터',
    position: 'AI 교육 강사',
    description:
      '서울대, 서울시립대 AI 교육 · SKT Computer Vision · KETI 나노소재 AI융합 전문가 과정',
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
    id: 'ai-bootcamp',
    title: 'AI 엔지니어 심화 부트캠프',
    period: '2024 ~ 2025',
    description:
      '멋쟁이사자처럼 AI 엔지니어 심화 부트캠프 이미지처리 과정 · 객체 탐지, 세그멘테이션, 멀티태스킹 실전 프로젝트',
    category: 'bootcamp',
    tags: [
      'Computer Vision',
      'Object Detection',
      'PyTorch',
      'Segmentation',
    ].sort(),
    highlight: true,
  },
  {
    id: 'nano-ai',
    title: '산업전문인력 AI역량강화 교육',
    period: '2025.06 ~ 2025.08',
    description:
      '나노융합산업연구조합 협력 · 나노소재 빅데이터 활용 AI융합전문가 교육 · 제조라인 고장예측 및 신소재 구조분석',
    category: 'enterprise',
    tags: ['빅데이터', '산업 AI', '시뮬레이션', '제조 AI'].sort(),
    highlight: false,
  },
  {
    id: 'teacher-training',
    title: '생성형 AI 교육자 연수',
    period: '2024 ~ 2025',
    description:
      '한국과학창의재단 찾아가는 학교 컨설팅 · 초중고 교사 및 학부모 대상 ChatGPT 활용 교육',
    category: 'education',
    tags: ['AI 리터러시', 'ChatGPT', '교육 혁신', '생성형 AI'].sort(),
  },
  {
    id: 'startup-station',
    title: '테킷 스타트업 스테이션',
    period: '2023 ~ 2025',
    description:
      '멋쟁이사자처럼 테킷 스타트업 스테이션 7~10기 운영 · 예비 IT창업자 대상 개발 역량 강화',
    category: 'startup',
    tags: ['MVP 개발', '멘토링', '창업 교육', '풀스택'].sort(),
  },
  {
    id: 'samsung-spotfire',
    title: '삼성전자 Spotfire 데이터 분석',
    period: '2023 ~ 2024',
    description:
      '삼성전자 임직원 대상 Spotfire 데이터 분석 및 시각화 교육 · 실무 데이터 활용 대시보드 구축',
    category: 'enterprise',
    tags: ['BI', 'Spotfire', '데이터 분석', '시각화'].sort(),
  },
  {
    id: 'lg-data-science',
    title: 'LG전자 Data Science 프로젝트',
    period: '2023',
    description:
      'Data Science 프로젝트 기획부터 개발까지 메인 강사 · 머신러닝 모델 개발 및 배포',
    category: 'enterprise',
    tags: ['Data Science', 'ML', '실무 교육', '프로젝트'].sort(),
  },
  {
    id: 'hyundai-ml',
    title: '현대건설 ML/DL 과정',
    period: '2023',
    description:
      '현대건설 시니어 대상 머신러닝/딥러닝 교육 · YOLO 기반 건설 현장 안전 관리 시스템',
    category: 'enterprise',
    tags: ['Computer Vision', 'Deep Learning', 'YOLO', '안전 관리'].sort(),
  },
  {
    id: 'keti-nano',
    title: 'KETI 나노소재 AI 전문가 과정',
    period: '2022',
    description:
      '한국전자기술연구원 나노소재 빅데이터 활용 AI융합 전문가 과정 · 도메인 지식 기반 AI 도입',
    category: 'research',
    tags: ['AI 융합', '나노소재', '빅데이터', '연구'].sort(),
  },
  {
    id: 'seoul-ai',
    title: '서울시립대 AI 취업사관학교',
    period: '2022',
    description:
      '서울시립대 캠퍼스타운형 취업사관학교 AI 과정 · 대학생 대상 실무 중심 AI 교육',
    category: 'education',
    tags: ['AI 교육', '실무 프로젝트', '취업 연계'].sort(),
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
  yearsOfExperience: '4+',
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
