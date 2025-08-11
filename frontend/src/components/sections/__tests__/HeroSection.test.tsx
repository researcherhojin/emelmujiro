import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'hero.title': '실무에 강한\nAI 전문가 그룹',
        'hero.subtitle': '대기업 AI 교육부터 스타트업 기술 컨설팅까지',
        'hero.description': '검증된 실무 경험으로 성공을 만들어갑니다',
        'hero.cta.primary': '프로젝트 문의하기',
        'hero.cta.secondary': '회사 소개',
        'statistics.clients': '교육 수료생',
        'statistics.projects': '완료 프로젝트',
        'statistics.experience': '파트너 기업',
        'statistics.technologies': '만족도',
      };
      return translations[key] || key;
    },
  }),
}));

describe('HeroSection Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test('renders main heading', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText(/실무에 강한.*AI 전문가 그룹/s)).toBeInTheDocument();
  });

  test('renders subheading', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText(/대기업 AI 교육부터 스타트업 기술 컨설팅까지/)).toBeInTheDocument();
  });

  test('renders call to action buttons', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText('프로젝트 문의하기')).toBeInTheDocument();
    expect(screen.getByText('회사 소개')).toBeInTheDocument();
  });
});
