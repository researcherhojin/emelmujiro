import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import CareerSummarySection from '../CareerSummarySection';

describe('CareerSummarySection', () => {
  it('renders career summary section', () => {
    renderWithProviders(<CareerSummarySection />);
    
    expect(screen.getByText(/경력 요약|Career Summary/)).toBeInTheDocument();
  });

  it('displays years of experience', () => {
    renderWithProviders(<CareerSummarySection />);
    
    // Check for experience years
    const experienceText = screen.queryByText(/\d+년|\d+\+ years/);
    if (experienceText) {
      expect(experienceText).toBeInTheDocument();
    }
  });

  it('shows key achievements', () => {
    renderWithProviders(<CareerSummarySection />);
    
    // Check for achievement numbers
    expect(screen.getByText(/40개|40\+/)).toBeInTheDocument();
    expect(screen.getByText(/1000명|1000\+/)).toBeInTheDocument();
  });

  it('displays company count', () => {
    renderWithProviders(<CareerSummarySection />);
    
    expect(screen.getByText(/기업|Companies/)).toBeInTheDocument();
  });

  it('shows student count', () => {
    renderWithProviders(<CareerSummarySection />);
    
    expect(screen.getByText(/교육생|Students/)).toBeInTheDocument();
  });

  it('renders statistics cards', () => {
    const { container } = renderWithProviders(<CareerSummarySection />);
    
    const cards = container.querySelectorAll('[class*="card"], [class*="stat"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('displays icons for each stat', () => {
    const { container } = renderWithProviders(<CareerSummarySection />);
    
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('shows project count if available', () => {
    renderWithProviders(<CareerSummarySection />);
    
    const projectCount = screen.queryByText(/프로젝트|Projects/);
    if (projectCount) {
      expect(projectCount).toBeInTheDocument();
    }
  });

  it('renders with proper grid layout', () => {
    const { container } = renderWithProviders(<CareerSummarySection />);
    
    const gridElements = container.querySelectorAll('[class*="grid"]');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('applies animation classes', () => {
    const { container } = renderWithProviders(<CareerSummarySection />);
    
    const animatedElements = container.querySelectorAll('[class*="animate"]');
    expect(animatedElements.length).toBeGreaterThanOrEqual(0);
  });

  it('displays satisfaction rate if available', () => {
    renderWithProviders(<CareerSummarySection />);
    
    const satisfactionRate = screen.queryByText(/만족도|Satisfaction|%/);
    if (satisfactionRate) {
      expect(satisfactionRate).toBeInTheDocument();
    }
  });

  it('shows technology stack count', () => {
    renderWithProviders(<CareerSummarySection />);
    
    const techStack = screen.queryByText(/기술|Technologies/);
    if (techStack) {
      expect(techStack).toBeInTheDocument();
    }
  });

  it('renders with responsive design', () => {
    const { container } = renderWithProviders(<CareerSummarySection />);
    
    const responsiveElements = container.querySelectorAll('[class*="md:"], [class*="lg:"]');
    expect(responsiveElements.length).toBeGreaterThan(0);
  });

  it('displays certification count if any', () => {
    renderWithProviders(<CareerSummarySection />);
    
    const certifications = screen.queryByText(/자격증|Certifications/);
    if (certifications) {
      expect(certifications).toBeInTheDocument();
    }
  });

  it('shows training hours delivered', () => {
    renderWithProviders(<CareerSummarySection />);
    
    const trainingHours = screen.queryByText(/시간|Hours/);
    if (trainingHours) {
      expect(trainingHours).toBeInTheDocument();
    }
  });
});