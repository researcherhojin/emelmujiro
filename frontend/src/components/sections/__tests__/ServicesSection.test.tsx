import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ServicesSection from '../ServicesSection';
import React from 'react';
import { testSkipInCI } from '../../../test-utils/ci-skip';

describe('ServicesSection Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  testSkipInCI('renders section title', () => {
    renderWithRouter(<ServicesSection />);
    expect(screen.getByText('주요 서비스')).toBeInTheDocument();
  });

  testSkipInCI('renders section subtitle', () => {
    renderWithRouter(<ServicesSection />);
    expect(
      screen.getByText(/기업의 AI 도입을 위한 단계별 솔루션/)
    ).toBeInTheDocument();
  });

  testSkipInCI('renders all service cards', () => {
    renderWithRouter(<ServicesSection />);

    // Check for service titles
    expect(screen.getByText('AI 컨설팅')).toBeInTheDocument();
    expect(screen.getByText('기업 AI 교육')).toBeInTheDocument();
    expect(screen.getByText('LLM 솔루션')).toBeInTheDocument();
  });

  testSkipInCI('renders service descriptions', () => {
    renderWithRouter(<ServicesSection />);

    expect(
      screen.getByText(/비즈니스 문제를 위한 AI 솔루션 개발/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/실무자를 위한 체계적인 AI 역량 강화/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/최신 언어 모델 기반 비즈니스 혁신/)
    ).toBeInTheDocument();
  });

  testSkipInCI('renders service details', () => {
    renderWithRouter(<ServicesSection />);

    // Check for some detail items
    expect(screen.getByText(/MLOps 구축 및 최적화/)).toBeInTheDocument();
    expect(screen.getByText(/맞춤형 커리큘럼 설계/)).toBeInTheDocument();
    expect(screen.getByText(/RAG 시스템 구축/)).toBeInTheDocument();
  });

  testSkipInCI('renders all service cards', () => {
    renderWithRouter(<ServicesSection />);
    // Check that all service titles are rendered
    expect(screen.getByText('AI 컨설팅')).toBeInTheDocument();
    expect(screen.getByText('기업 AI 교육')).toBeInTheDocument();
    expect(screen.getByText('LLM 솔루션')).toBeInTheDocument();
  });

  testSkipInCI('service cards have proper content', () => {
    renderWithRouter(<ServicesSection />);

    // Check that service descriptions are present
    expect(
      screen.getByText(/비즈니스 문제를 위한 AI 솔루션 개발/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/실무자를 위한 체계적인 AI 역량 강화/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/최신 언어 모델 기반 비즈니스 혁신/)
    ).toBeInTheDocument();
  });
});
