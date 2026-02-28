// 로고 이미지 import
import samsungLogo from '../assets/logos/samsung.svg';
import lgLogo from '../assets/logos/lg.svg';
import hyundaiLogo from '../assets/logos/hyundaiconstruction.svg';
import sktLogo from '../assets/logos/skt.svg';
import ktLogo from '../assets/logos/kt.svg';
import naverLogo from '../assets/logos/naver_bi.png';
import kakaoLogo from '../assets/logos/kakao.svg';
import hancomLogo from '../assets/logos/hancom.svg';
import seoulUnivLogo from '../assets/logos/seoul_univ.svg';
import uosLogo from '../assets/logos/uos.svg';
import likelionLogo from '../assets/logos/likelion.png';
import eliceLogo from '../assets/logos/elice.png';
import seoulEduLogo from '../assets/logos/seoul_edu.svg';
import scienceFoundationLogo from '../assets/logos/science_foundation.svg';
import moduLogo from '../assets/logos/modu.png';
import nipaLogo from '../assets/logos/nipa.jpg';
import ablearnLogo from '../assets/logos/ablearn.png';
import nanoLogo from '../assets/logos/nano.jpg';

export type CompanyCategory = 'enterprise' | 'education' | 'public';

export interface PartnerCompany {
  id: string;
  name: string;
  logo: string;
  category: CompanyCategory;
  description: string;
}

export const PARTNER_COMPANIES: PartnerCompany[] = [
  // 대기업
  {
    id: 'samsung',
    name: '삼성전자',
    logo: samsungLogo,
    category: 'enterprise',
    description: 'AI 교육 및 컨설팅',
  },
  {
    id: 'lg',
    name: 'LG',
    logo: lgLogo,
    category: 'enterprise',
    description: 'AI 솔루션 개발',
  },
  {
    id: 'hyundai',
    name: '현대건설',
    logo: hyundaiLogo,
    category: 'enterprise',
    description: 'AI 기반 건설 자동화',
  },
  {
    id: 'skt',
    name: 'SKT',
    logo: sktLogo,
    category: 'enterprise',
    description: 'AI 서비스 개발',
  },
  {
    id: 'kt',
    name: 'KT',
    logo: ktLogo,
    category: 'enterprise',
    description: 'AI 플랫폼 구축',
  },
  {
    id: 'naver',
    name: '네이버',
    logo: naverLogo,
    category: 'enterprise',
    description: 'AI 기술 자문',
  },
  {
    id: 'kakao',
    name: '카카오',
    logo: kakaoLogo,
    category: 'enterprise',
    description: 'AI 서비스 컨설팅',
  },
  {
    id: 'hancom',
    name: '한글과컴퓨터',
    logo: hancomLogo,
    category: 'enterprise',
    description: 'AI 문서 처리',
  },

  // 교육기관
  {
    id: 'seoul-univ',
    name: '서울대학교',
    logo: seoulUnivLogo,
    category: 'education',
    description: 'AI 교육 프로그램',
  },
  {
    id: 'uos',
    name: '서울시립대',
    logo: uosLogo,
    category: 'education',
    description: 'AI 커리큘럼 개발',
  },
  {
    id: 'likelion',
    name: '멋쟁이사자처럼',
    logo: likelionLogo,
    category: 'education',
    description: 'AI 부트캠프',
  },
  {
    id: 'modu',
    name: '모두의연구소',
    logo: moduLogo,
    category: 'education',
    description: 'AI 연구 협력',
  },
  {
    id: 'elice',
    name: '엘리스',
    logo: eliceLogo,
    category: 'education',
    description: 'AI 교육 플랫폼',
  },
  {
    id: 'ablearn',
    name: 'ablearn',
    logo: ablearnLogo,
    category: 'education',
    description: 'AI 학습 솔루션',
  },
  {
    id: 'seoul-edu',
    name: '서울시교육청',
    logo: seoulEduLogo,
    category: 'education',
    description: '교육 AI 도입',
  },

  // 공공기관
  {
    id: 'nano',
    name: '나노융합산업연구조합',
    logo: nanoLogo,
    category: 'public',
    description: 'AI 연구 협력',
  },
  {
    id: 'nipa',
    name: '정보통신산업진흥원',
    logo: nipaLogo,
    category: 'public',
    description: 'AI 산업 육성',
  },
  {
    id: 'science-foundation',
    name: '한국과학창의재단',
    logo: scienceFoundationLogo,
    category: 'public',
    description: 'AI 교육 혁신',
  },
];
