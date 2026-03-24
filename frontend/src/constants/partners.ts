// Logo image imports
import samsungLogo from '../assets/logos/samsungLogo.svg';
import lgLogo from '../assets/logos/lgLogo.svg';
import hyundaiLogo from '../assets/logos/hyundaiLogo.webp';
import sktLogo from '../assets/logos/sktLogo.svg';
import ktLogo from '../assets/logos/ktLogo.svg';
import naverLogo from '../assets/logos/naverLogo.webp';
import kakaoLogo from '../assets/logos/kakaoLogo.svg';
import hancomLogo from '../assets/logos/hancomLogo.svg';
import seoulUnivLogo from '../assets/logos/snuLogo.webp';
import uosLogo from '../assets/logos/uosLogo.webp';
import likelionLogo from '../assets/logos/likelionLogo.svg';
import eliceLogo from '../assets/logos/eliceLogo.webp';
import seoulEduLogo from '../assets/logos/seoulEduLogo.svg';
import scienceFoundationLogo from '../assets/logos/scienceFoundationLogo.webp';
import moduLogo from '../assets/logos/moduLogo.webp';
import nipaLogo from '../assets/logos/nipaLogo.webp';
import ablearnLogo from '../assets/logos/ablearnLogo.webp';
import nanoLogo from '../assets/logos/nanoLogo.jpg';
import weatherLogo from '../assets/logos/weatherLogo.svg';
import nepesLogo from '../assets/logos/nepesLogo.svg';

export type CompanyCategory = 'enterprise' | 'education' | 'public';

export interface PartnerCompany {
  id: string;
  name: string;
  logo: string;
  category: CompanyCategory;
  description: string;
}

export const PARTNER_COMPANIES: PartnerCompany[] = [
  // Row 1: Major enterprises + SNU
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
    id: 'skt',
    name: 'SKT',
    logo: sktLogo,
    category: 'enterprise',
    description: 'AI 서비스 개발',
  },
  {
    id: 'naver',
    name: '네이버',
    logo: naverLogo,
    category: 'enterprise',
    description: 'AI 기술 자문',
  },
  {
    id: 'seoul-univ',
    name: '서울대학교',
    logo: seoulUnivLogo,
    category: 'education',
    description: 'AI 교육 프로그램',
  },
  {
    id: 'kakao',
    name: '카카오',
    logo: kakaoLogo,
    category: 'enterprise',
    description: 'AI 서비스 컨설팅',
  },
  {
    id: 'kt',
    name: 'KT',
    logo: ktLogo,
    category: 'enterprise',
    description: 'AI 플랫폼 구축',
  },
  {
    id: 'hyundai',
    name: '현대건설',
    logo: hyundaiLogo,
    category: 'enterprise',
    description: 'AI 기반 건설 자동화',
  },
  {
    id: 'hancom',
    name: '한글과컴퓨터',
    logo: hancomLogo,
    category: 'enterprise',
    description: 'AI 문서 처리',
  },
  {
    id: 'nepes',
    name: '네페스',
    logo: nepesLogo,
    category: 'enterprise',
    description: 'AI 반도체 솔루션',
  },

  // Row 2: Education & public institutions
  {
    id: 'nipa',
    name: '정보통신산업진흥원',
    logo: nipaLogo,
    category: 'public',
    description: 'AI 산업 육성',
  },
  {
    id: 'likelion',
    name: '멋쟁이사자처럼',
    logo: likelionLogo,
    category: 'education',
    description: 'AI 부트캠프',
  },
  {
    id: 'science-foundation',
    name: '한국과학창의재단',
    logo: scienceFoundationLogo,
    category: 'public',
    description: 'AI 교육 혁신',
  },
  {
    id: 'uos',
    name: '서울시립대',
    logo: uosLogo,
    category: 'education',
    description: 'AI 커리큘럼 개발',
  },
  {
    id: 'elice',
    name: '엘리스',
    logo: eliceLogo,
    category: 'education',
    description: 'AI 교육 플랫폼',
  },
  {
    id: 'nano',
    name: '나노융합산업연구조합',
    logo: nanoLogo,
    category: 'public',
    description: 'AI 연구 협력',
  },
  {
    id: 'seoul-edu',
    name: '서울시교육청',
    logo: seoulEduLogo,
    category: 'education',
    description: '교육 AI 도입',
  },
  {
    id: 'modu',
    name: '모두의연구소',
    logo: moduLogo,
    category: 'education',
    description: 'AI 연구 협력',
  },
  {
    id: 'ablearn',
    name: 'ablearn',
    logo: ablearnLogo,
    category: 'education',
    description: 'AI 학습 솔루션',
  },
  {
    id: 'weather',
    name: '기상청',
    logo: weatherLogo,
    category: 'public',
    description: 'AI 기상 예측',
  },
];
