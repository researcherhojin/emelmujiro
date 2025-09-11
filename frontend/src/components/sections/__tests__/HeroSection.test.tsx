import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';
import { testSkipInCI } from '../../../test-utils/ci-skip';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
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

  testSkipInCI('renders main heading', () => {
    renderWithRouter(<HeroSection />);

    // Check that the heading is rendered (h1 element specifically),
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain('실무에 강한');
    expect(heading.textContent).toContain('AI 전문가 그룹');
  });

  testSkipInCI('renders subheading', () => {
    renderWithRouter(<HeroSection />);

    expect(
      screen.getByText(/대기업 AI 교육부터 스타트업 기술 컨설팅까지/)
    ).toBeInTheDocument();
  });

  testSkipInCI('renders call to action button', () => {
    renderWithRouter(<HeroSection />);

    // HeroSection now only has one CTA button with an arrow
    const ctaButton = screen.getByText(/프로젝트 문의하기/);
    expect(ctaButton).toBeInTheDocument();
  });
});
