import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AboutPage from '../AboutPage';
import React from 'react';

// Type definitions for motion component props
interface MotionComponentProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: MotionComponentProps) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: MotionComponentProps) => (
      <section {...props}>{children}</section>
    ),
    h1: ({ children, ...props }: MotionComponentProps) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: MotionComponentProps) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: MotionComponentProps) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: MotionComponentProps) => <p {...props}>{children}</p>,
    article: ({ children, ...props }: MotionComponentProps) => (
      <article {...props}>{children}</article>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => true,
}));

describe('AboutPage', () => {
  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <HelmetProvider>
          <AboutPage />
        </HelmetProvider>
      </MemoryRouter>
    );
  };

  it('renders about page with main heading', () => {
    renderWithRouter();

    expect(screen.getByText('에멜무지로')).toBeInTheDocument();
  });

  it('renders company introduction section', () => {
    renderWithRouter();

    expect(screen.getByText(/2022년부터 시작한 AI 교육 경험/i)).toBeInTheDocument();
    expect(screen.getByText(/AI 전문 컨설팅 기업/i)).toBeInTheDocument();
  });

  it('renders vision section', () => {
    renderWithRouter();

    expect(screen.getByText('비전')).toBeInTheDocument();
    expect(screen.getByText(/모든 기업이 AI 기술을 통해 비즈니스 혁신/i)).toBeInTheDocument();
  });

  it('renders mission section', () => {
    renderWithRouter();

    expect(screen.getByText('미션')).toBeInTheDocument();
  });

  it('renders core values section', () => {
    renderWithRouter();

    expect(screen.getByText('핵심 가치')).toBeInTheDocument();

    // Check for actual core value items from the component
    expect(screen.getByText('실무 중심')).toBeInTheDocument();
    expect(screen.getByText('맞춤형 접근')).toBeInTheDocument();
    expect(screen.getByText('기술 전문성')).toBeInTheDocument();
  });

  it('renders services section', () => {
    renderWithRouter();

    expect(screen.getByText('주요 서비스')).toBeInTheDocument();
  });

  it('renders company stats section', () => {
    renderWithRouter();

    expect(screen.getByText('회사 현황')).toBeInTheDocument();
    expect(screen.getByText('1,000+')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByText('15+')).toBeInTheDocument();
  });

  it('renders contact CTA section', () => {
    renderWithRouter();

    expect(screen.getByText('프로젝트를 시작하세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /무료 상담 신청하기/i })).toBeInTheDocument();
  });

  it('has contact button that can be clicked', () => {
    renderWithRouter();

    const contactButton = screen.getByRole('button', { name: /무료 상담 신청하기/i });
    expect(contactButton).toBeInTheDocument();
  });

  it('renders with proper semantic structure', () => {
    renderWithRouter();

    // Check that sections exist by looking for section headings
    expect(screen.getByText('비전')).toBeInTheDocument();
    expect(screen.getByText('미션')).toBeInTheDocument();
    expect(screen.getByText('핵심 가치')).toBeInTheDocument();
    expect(screen.getByText('주요 서비스')).toBeInTheDocument();
  });

  it('renders values and services with their content', () => {
    renderWithRouter();

    // Check that value items are rendered
    const practicalValue = screen.getByText('실무 중심');
    expect(practicalValue).toBeInTheDocument();

    const customValue = screen.getByText('맞춤형 접근');
    expect(customValue).toBeInTheDocument();

    const techValue = screen.getByText('기술 전문성');
    expect(techValue).toBeInTheDocument();
  });

  it('displays timeline section', () => {
    renderWithRouter();

    expect(screen.getByText('연혁')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('displays all value descriptions', () => {
    renderWithRouter();

    expect(screen.getByText(/이론보다 실제 비즈니스 문제 해결/i)).toBeInTheDocument();
    expect(screen.getByText(/각 기업의 특성과 필요에 맞는/i)).toBeInTheDocument();
    expect(screen.getByText(/최신 AI\/ML 기술에 대한 깊은 이해/i)).toBeInTheDocument();
  });
});
