import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HeroSection Component', () => {
  const renderWithRouter = component => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test('renders main heading', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText('실무에 강한')).toBeInTheDocument();
    expect(screen.getByText('AI 전문가 그룹')).toBeInTheDocument();
  });

  test('renders subheading', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText(/대기업 AI 교육부터 스타트업 기술 컨설팅까지/)).toBeInTheDocument();
  });

  test('renders call to action buttons', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByRole('link', { name: /프로젝트 문의하기/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /회사 소개/ })).toBeInTheDocument();
  });
});
