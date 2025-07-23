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
    expect(screen.getByText('우리의 서비스')).toBeInTheDocument();
  });

  test('renders section subtitle', () => {
    renderWithRouter(<ServicesSection />);
    expect(screen.getByText(/최신 AI 기술을 활용한 맞춤형 솔루션/)).toBeInTheDocument();
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
    
    expect(screen.getByText(/귀사의 비즈니스에 최적화된 AI 전략/)).toBeInTheDocument();
    expect(screen.getByText(/임직원들의 AI 활용 능력/)).toBeInTheDocument();
    expect(screen.getByText(/대규모 언어 모델을 활용한/)).toBeInTheDocument();
  });

  test('renders service features', () => {
    renderWithRouter(<ServicesSection />);
    
    // Check for some feature items
    expect(screen.getByText('비즈니스 분석 및 AI 기회 발굴')).toBeInTheDocument();
    expect(screen.getByText('맞춤형 AI 로드맵 수립')).toBeInTheDocument();
    expect(screen.getByText('ChatGPT/LLM 기초부터 고급까지')).toBeInTheDocument();
  });

  test('renders icons for each service', () => {
    const { container } = renderWithRouter(<ServicesSection />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(3); // At least 3 service icons
  });

  test('service cards have hover effects', () => {
    const { container } = renderWithRouter(<ServicesSection />);
    const cards = container.querySelectorAll('.group');
    
    cards.forEach(card => {
      expect(card).toHaveClass('hover:shadow-xl');
    });
  });
});