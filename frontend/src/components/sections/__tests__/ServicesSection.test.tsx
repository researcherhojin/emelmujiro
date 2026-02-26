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
    expect(
      screen.getByText(/기업의 AI 도입을 위한 단계별 솔루션/)
    ).toBeInTheDocument();
  });

  test('renders all service cards', () => {
    renderWithRouter(<ServicesSection />);

    expect(screen.getByText('AI 교육 & 강의')).toBeInTheDocument();
    expect(screen.getByText('AI 컨설팅')).toBeInTheDocument();
    expect(screen.getByText('LLM/생성형 AI')).toBeInTheDocument();
    expect(screen.getByText('Computer Vision')).toBeInTheDocument();
  });

  test('renders service descriptions', () => {
    renderWithRouter(<ServicesSection />);

    expect(
      screen.getByText(/대기업·공공기관 맞춤형 AI 역량 강화/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/AI 도입을 위한 전략 수립 및 기술 자문/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/대규모 언어 모델 기반 서비스 개발/)
    ).toBeInTheDocument();
  });

  test('renders service details', () => {
    renderWithRouter(<ServicesSection />);

    expect(screen.getByText(/맞춤형 커리큘럼 설계/)).toBeInTheDocument();
    expect(screen.getByText(/RAG 시스템 설계 및 구축/)).toBeInTheDocument();
    expect(screen.getByText(/객체 탐지 \/ 세그멘테이션/)).toBeInTheDocument();
  });

  test('service cards have proper content', () => {
    renderWithRouter(<ServicesSection />);

    expect(
      screen.getByText(/대기업·공공기관 맞춤형 AI 역량 강화/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/AI 도입을 위한 전략 수립 및 기술 자문/)
    ).toBeInTheDocument();
    expect(screen.getByText(/영상 처리 및 비전 AI 솔루션/)).toBeInTheDocument();
  });
});
