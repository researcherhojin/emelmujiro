import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
        <AboutPage />
      </MemoryRouter>
    );
  };

  it('renders about page with main heading', () => {
    renderWithRouter();

    expect(screen.getByText('에멜무지로 소개')).toBeInTheDocument();
  });

  it('renders company introduction section', () => {
    renderWithRouter();

    expect(screen.getByText(/AI 교육의 미래를 선도하는 기업/i)).toBeInTheDocument();
    expect(screen.getByText(/에멜무지로는 최첨단 AI 기술과 교육을 융합/i)).toBeInTheDocument();
  });

  it('renders vision section', () => {
    renderWithRouter();

    expect(screen.getByText('우리의 비전')).toBeInTheDocument();
    expect(screen.getByText(/모든 사람이 AI 기술을 이해하고 활용/i)).toBeInTheDocument();
  });

  it('renders mission section', () => {
    renderWithRouter();

    expect(screen.getByText('우리의 미션')).toBeInTheDocument();
  });

  it('renders core values section', () => {
    renderWithRouter();

    expect(screen.getByText('핵심 가치')).toBeInTheDocument();

    // Check for core value items
    expect(screen.getByText('혁신')).toBeInTheDocument();
    expect(screen.getByText('교육')).toBeInTheDocument();
    expect(screen.getByText('협력')).toBeInTheDocument();
    expect(screen.getByText('성장')).toBeInTheDocument();
  });

  it('renders services section', () => {
    renderWithRouter();

    expect(screen.getByText('주요 서비스')).toBeInTheDocument();

    // Check for service items
    expect(screen.getByText('AI 교육 프로그램')).toBeInTheDocument();
    expect(screen.getByText('기업 컨설팅')).toBeInTheDocument();
    expect(screen.getByText('커스텀 솔루션')).toBeInTheDocument();
    expect(screen.getByText('연구 개발')).toBeInTheDocument();
  });

  it('renders team section', () => {
    renderWithRouter();

    expect(screen.getByText('우리 팀')).toBeInTheDocument();
    expect(screen.getByText(/AI 전문가와 교육 전문가로 구성된/i)).toBeInTheDocument();
  });

  it('renders contact CTA section', () => {
    renderWithRouter();

    expect(screen.getByText('함께 미래를 만들어갑시다')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /문의하기/i })).toBeInTheDocument();
  });

  it('has correct link to contact page', () => {
    renderWithRouter();

    const contactLink = screen.getByRole('link', { name: /문의하기/i });
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('renders with proper semantic structure', () => {
    renderWithRouter();

    // Check for main element using role
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();

    // Check that sections exist by looking for section headings
    expect(screen.getByText('우리의 비전')).toBeInTheDocument();
    expect(screen.getByText('우리의 미션')).toBeInTheDocument();
    expect(screen.getByText('핵심 가치')).toBeInTheDocument();
    expect(screen.getByText('주요 서비스')).toBeInTheDocument();
  });

  it('renders values and services with their content', () => {
    renderWithRouter();

    // Check that value and service items are rendered
    // Values
    const innovationValue = screen.getByText('혁신');
    expect(innovationValue).toBeInTheDocument();

    const educationValue = screen.getByText('교육');
    expect(educationValue).toBeInTheDocument();

    // Services
    const aiEducation = screen.getByText('AI 교육 프로그램');
    expect(aiEducation).toBeInTheDocument();

    const consulting = screen.getByText('기업 컨설팅');
    expect(consulting).toBeInTheDocument();
  });

  it('displays all service descriptions', () => {
    renderWithRouter();

    expect(screen.getByText(/맞춤형 AI 교육 커리큘럼/i)).toBeInTheDocument();
    expect(screen.getByText(/AI 도입 전략 및 구현/i)).toBeInTheDocument();
    expect(screen.getByText(/고객 니즈에 맞춘 AI 솔루션/i)).toBeInTheDocument();
    expect(screen.getByText(/최신 AI 기술 연구/i)).toBeInTheDocument();
  });

  it('displays all value descriptions', () => {
    renderWithRouter();

    expect(screen.getByText(/최신 기술을 선도/i)).toBeInTheDocument();
    expect(screen.getByText(/체계적인 교육 시스템/i)).toBeInTheDocument();
    expect(screen.getByText(/파트너와의 상생/i)).toBeInTheDocument();
    expect(screen.getByText(/지속적인 발전 추구/i)).toBeInTheDocument();
  });
});
