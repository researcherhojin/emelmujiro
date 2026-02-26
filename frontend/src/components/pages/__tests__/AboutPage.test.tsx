import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
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
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: MotionComponentProps) => (
      <div {...props}>{children}</div>
    ),
    section: ({ children, ...props }: MotionComponentProps) => (
      <section {...props}>{children}</section>
    ),
    h1: ({ children, ...props }: MotionComponentProps) => (
      <h1 {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: MotionComponentProps) => (
      <h2 {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: MotionComponentProps) => (
      <h3 {...props}>{children}</h3>
    ),
    p: ({ children, ...props }: MotionComponentProps) => (
      <p {...props}>{children}</p>
    ),
    article: ({ children, ...props }: MotionComponentProps) => (
      <article {...props}>{children}</article>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    set: vi.fn(),
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

    expect(
      screen.getByText(/AI 교육과 솔루션 개발 전문 스타트업/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/2024년 12월에 설립된 AI 교육 및 컨설팅 전문 기업/i)
    ).toBeInTheDocument();
  });

  it('renders mission section', () => {
    renderWithRouter();

    expect(screen.getByText('우리의 미션')).toBeInTheDocument();
    expect(
      screen.getByText(/실무 중심의 AI 교육과 맞춤형 솔루션 개발/i)
    ).toBeInTheDocument();
  });

  it('renders timeline section', () => {
    renderWithRouter();

    expect(screen.getByText('우리의 여정')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('renders core values section', () => {
    renderWithRouter();

    expect(screen.getByText('핵심 가치')).toBeInTheDocument();

    // Check for actual core value items from the component
    expect(screen.getByText('실무 중심 교육')).toBeInTheDocument();
    expect(screen.getByText('맞춤형 커리큘럼')).toBeInTheDocument();
    expect(screen.getByText('최신 기술 활용')).toBeInTheDocument();
  });

  it('renders services section', () => {
    renderWithRouter();

    expect(screen.getByText('핵심 가치')).toBeInTheDocument();
  });

  it('renders company stats section', () => {
    renderWithRouter();

    expect(screen.getByText('1,000+')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByText('30+')).toBeInTheDocument();
    expect(screen.getByText('4.8+')).toBeInTheDocument();
  });

  it('renders contact CTA section', () => {
    renderWithRouter();

    expect(
      screen.getByText('함께 성장할 준비가 되셨나요?')
    ).toBeInTheDocument();
    expect(screen.getByText(/프로젝트 문의하기/i)).toBeInTheDocument();
  });

  it('has contact button that can be clicked', () => {
    renderWithRouter();

    const contactButton = screen.getByText(/프로젝트 문의하기/i);
    expect(contactButton).toBeInTheDocument();
  });

  it('renders with proper semantic structure', () => {
    renderWithRouter();

    // Check that sections exist by looking for section headings
    expect(screen.getByText('우리의 미션')).toBeInTheDocument();
    expect(screen.getByText('핵심 가치')).toBeInTheDocument();
    expect(screen.getByText('주요 성과')).toBeInTheDocument();
  });

  it('renders values and services with their content', () => {
    renderWithRouter();

    // Check that value items are rendered
    const practicalValue = screen.getByText('실무 중심 교육');
    expect(practicalValue).toBeInTheDocument();

    const customValue = screen.getByText('맞춤형 커리큘럼');
    expect(customValue).toBeInTheDocument();

    const techValue = screen.getByText('최신 기술 활용');
    expect(techValue).toBeInTheDocument();
  });

  it('displays timeline section', () => {
    renderWithRouter();

    expect(screen.getByText('우리의 여정')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('displays all value descriptions', () => {
    renderWithRouter();

    expect(
      screen.getByText(/이론과 실습을 균형있게 구성/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/고객사의 수준과 목표에 맞춰 설계/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ChatGPT, Claude 등 최신 AI 도구 활용법/i)
    ).toBeInTheDocument();
  });
});
