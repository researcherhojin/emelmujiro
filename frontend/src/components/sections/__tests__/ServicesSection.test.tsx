import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ServicesSection from '../ServicesSection';
import React from 'react';

describe('ServicesSection Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test('renders section title', () => {
    renderWithRouter(<ServicesSection />);
    expect(screen.getByText('주요 서비스')).toBeInTheDocument();
  });

  test('renders section subtitle', () => {
    renderWithRouter(<ServicesSection />);
    expect(screen.getByText(/기업의 AI 도입을 위한 단계별 솔루션/)).toBeInTheDocument();
  });

  test('renders all service cards', () => {
    renderWithRouter(<ServicesSection />);

    // Check for service titles
    expect(screen.getByText('AI 컨설팅')).toBeInTheDocument();
    expect(screen.getByText('기업 AI 교육')).toBeInTheDocument();
    expect(screen.getByText('LLM 솔루션')).toBeInTheDocument();
  });

  test('renders service descriptions', () => {
    renderWithRouter(<ServicesSection />);

    expect(screen.getByText(/비즈니스 문제에 대한 실용적 AI 솔루션/)).toBeInTheDocument();
    expect(screen.getByText(/실무자를 위한 체계적인 AI 역량 강화/)).toBeInTheDocument();
    expect(screen.getByText(/최신 언어 모델 기반 비즈니스 혁신/)).toBeInTheDocument();
  });

  test('renders service details', () => {
    renderWithRouter(<ServicesSection />);

    // Check for some detail items
    expect(screen.getByText(/모델 개발, MLOps 구축, 성능 최적화/)).toBeInTheDocument();
    expect(screen.getByText(/맞춤형 커리큘럼, 핸즈온 실습, 1:1 멘토링/)).toBeInTheDocument();
    expect(screen.getByText(/챗봇 개발, RAG 시스템, 문서 분석/)).toBeInTheDocument();
  });

  test('renders all service cards', () => {
    renderWithRouter(<ServicesSection />);
    // Check that all service titles are rendered
    expect(screen.getByText('AI 컨설팅')).toBeInTheDocument();
    expect(screen.getByText('기업 AI 교육')).toBeInTheDocument();
    expect(screen.getByText('LLM 솔루션')).toBeInTheDocument();
  });

  test('service cards have proper content', () => {
    renderWithRouter(<ServicesSection />);

    // Check that service descriptions are present
    expect(screen.getByText(/비즈니스 문제에 대한 실용적 AI 솔루션/)).toBeInTheDocument();
    expect(screen.getByText(/실무자를 위한 체계적인 AI 역량 강화/)).toBeInTheDocument();
    expect(screen.getByText(/최신 언어 모델 기반 비즈니스 혁신/)).toBeInTheDocument();
  });
});
