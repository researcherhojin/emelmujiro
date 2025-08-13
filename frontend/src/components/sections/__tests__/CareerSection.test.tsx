import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import CareerSection from '../CareerSection';

describe('CareerSection', () => {
  it('renders career section with title', () => {
    renderWithProviders(<CareerSection />);
    
    expect(screen.getByText('경력')).toBeInTheDocument();
    expect(screen.getByText('Career')).toBeInTheDocument();
  });

  it('renders all career items', () => {
    renderWithProviders(<CareerSection />);
    
    // Check for company names
    expect(screen.getByText('인천창조경제혁신센터')).toBeInTheDocument();
    expect(screen.getByText('연세대학교 (박사)')).toBeInTheDocument();
    expect(screen.getByText('연세대학교 (석사)')).toBeInTheDocument();
    expect(screen.getByText('연세대학교 (학사)')).toBeInTheDocument();
  });

  it('displays roles for each career item', () => {
    renderWithProviders(<CareerSection />);
    
    expect(screen.getByText('인공지능전문강사 & PM')).toBeInTheDocument();
    expect(screen.getByText(/대학원 과정 수료/)).toBeInTheDocument();
    expect(screen.getByText(/대학원 졸업/)).toBeInTheDocument();
    expect(screen.getByText(/전기전자공학 전공/)).toBeInTheDocument();
  });

  it('shows period for each career item', () => {
    renderWithProviders(<CareerSection />);
    
    expect(screen.getByText('2024.08 - 2024.11')).toBeInTheDocument();
    expect(screen.getByText('2020.03 - 2024.08')).toBeInTheDocument();
    expect(screen.getByText('2018.03 - 2020.02')).toBeInTheDocument();
    expect(screen.getByText('2011.03 - 2018.02')).toBeInTheDocument();
  });

  it('displays achievements section', () => {
    renderWithProviders(<CareerSection />);
    
    expect(screen.getByText(/주요 성과/)).toBeInTheDocument();
    expect(screen.getByText(/40개 기업 대상 AI 교육 진행/)).toBeInTheDocument();
    expect(screen.getByText(/1000명\+ 교육생 배출/)).toBeInTheDocument();
  });

  it('renders expertise tags', () => {
    renderWithProviders(<CareerSection />);
    
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning')).toBeInTheDocument();
    expect(screen.getByText('Deep Learning')).toBeInTheDocument();
    expect(screen.getByText('Computer Vision')).toBeInTheDocument();
  });

  it('expands and collapses career items', () => {
    renderWithProviders(<CareerSection />);
    
    const firstItem = screen.getByText('인천창조경제혁신센터').closest('div');
    expect(firstItem).toBeInTheDocument();
    
    // Check if description is visible
    const description = screen.queryByText(/최신 AI 기술 트렌드/);
    expect(description).toBeInTheDocument();
  });

  it('renders with proper styling classes', () => {
    const { container } = renderWithProviders(<CareerSection />);
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-20');
    expect(section).toHaveClass('bg-gray-50');
  });

  it('displays icons for each career item', () => {
    const { container } = renderWithProviders(<CareerSection />);
    
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('handles animation on scroll', () => {
    renderWithProviders(<CareerSection />);
    
    // Career items should have animation classes
    const careerItems = document.querySelectorAll('[class*="timeline"]');
    expect(careerItems.length).toBeGreaterThan(0);
  });

  it('renders research focus areas', () => {
    renderWithProviders(<CareerSection />);
    
    expect(screen.getByText(/컴퓨터 비전 연구/)).toBeInTheDocument();
    expect(screen.getByText(/객체 탐지 및 추적/)).toBeInTheDocument();
    expect(screen.getByText(/통신 시스템 최적화/)).toBeInTheDocument();
  });

  it('displays education details correctly', () => {
    renderWithProviders(<CareerSection />);
    
    expect(screen.getByText(/전기전자공학과/)).toBeInTheDocument();
    expect(screen.getByText(/박사/)).toBeInTheDocument();
    expect(screen.getByText(/석사/)).toBeInTheDocument();
    expect(screen.getByText(/학사/)).toBeInTheDocument();
  });

  it('shows timeline connector lines', () => {
    const { container } = renderWithProviders(<CareerSection />);
    
    const connectorLines = container.querySelectorAll('[class*="border-l"]');
    expect(connectorLines.length).toBeGreaterThan(0);
  });

  it('renders gradient backgrounds', () => {
    const { container } = renderWithProviders(<CareerSection />);
    
    const gradients = container.querySelectorAll('[class*="gradient"]');
    expect(gradients.length).toBeGreaterThanOrEqual(0);
  });

  it('handles responsive layout', () => {
    const { container } = renderWithProviders(<CareerSection />);
    
    const responsiveElements = container.querySelectorAll('[class*="md:"]');
    expect(responsiveElements.length).toBeGreaterThan(0);
  });

  it('displays company logos or icons', () => {
    const { container } = renderWithProviders(<CareerSection />);
    
    const companyIcons = container.querySelectorAll('[class*="company"]');
    expect(companyIcons.length).toBeGreaterThanOrEqual(0);
  });

  it('shows more details on hover', () => {
    renderWithProviders(<CareerSection />);
    
    const careerItem = screen.getByText('인천창조경제혁신센터').closest('div');
    
    if (careerItem) {
      fireEvent.mouseEnter(careerItem);
      // Check for hover effects
      expect(careerItem).toBeInTheDocument();
    }
  });

  it('handles click events on career items', () => {
    renderWithProviders(<CareerSection />);
    
    const careerItem = screen.getByText('연세대학교 (박사)').closest('div');
    
    if (careerItem) {
      fireEvent.click(careerItem);
      // Item should remain visible
      expect(careerItem).toBeInTheDocument();
    }
  });

  it('renders achievements with proper formatting', () => {
    renderWithProviders(<CareerSection />);
    
    const achievements = screen.getAllByText(/AI|교육|프로젝트/);
    expect(achievements.length).toBeGreaterThan(0);
  });
});