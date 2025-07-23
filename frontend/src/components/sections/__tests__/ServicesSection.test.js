import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ServicesSection from '../ServicesSection';

describe('ServicesSection Component', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
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

  test('renders service cards with icons', () => {
    const { container } = renderWithRouter(<ServicesSection />);
    // The new design uses div elements instead of SVG icons
    const iconContainers = container.querySelectorAll('.w-12.h-12.bg-gray-100');
    expect(iconContainers.length).toBe(3); // 3 service cards
  });

  test('service cards have hover effects', () => {
    const { container } = renderWithRouter(<ServicesSection />);
    const cards = container.querySelectorAll('.group');
    
    expect(cards.length).toBe(3);
    cards.forEach(card => {
      expect(card).toHaveClass('hover:shadow-2xl');
    });
  });
});