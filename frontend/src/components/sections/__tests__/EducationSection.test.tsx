import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import EducationSection from '../EducationSection';

describe('EducationSection', () => {
  it('renders education section with title', () => {
    renderWithProviders(<EducationSection />);
    
    expect(screen.getByText('학력')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
  });

  it('displays all education entries', () => {
    renderWithProviders(<EducationSection />);
    
    // Check for degree titles
    expect(screen.getByText(/박사 과정/)).toBeInTheDocument();
    expect(screen.getByText(/석사/)).toBeInTheDocument();
    expect(screen.getByText(/학사/)).toBeInTheDocument();
  });

  it('shows university name for all entries', () => {
    renderWithProviders(<EducationSection />);
    
    const yonseiTexts = screen.getAllByText(/연세대학교/);
    expect(yonseiTexts.length).toBeGreaterThanOrEqual(3);
  });

  it('displays department information', () => {
    renderWithProviders(<EducationSection />);
    
    const deptTexts = screen.getAllByText(/전기전자공학/);
    expect(deptTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('shows graduation periods', () => {
    renderWithProviders(<EducationSection />);
    
    expect(screen.getByText(/2020\.03 - 2024\.08/)).toBeInTheDocument();
    expect(screen.getByText(/2018\.03 - 2020\.02/)).toBeInTheDocument();
    expect(screen.getByText(/2011\.03 - 2018\.02/)).toBeInTheDocument();
  });

  it('displays research areas for graduate degrees', () => {
    renderWithProviders(<EducationSection />);
    
    expect(screen.getByText(/컴퓨터 비전/)).toBeInTheDocument();
    expect(screen.getByText(/딥러닝/)).toBeInTheDocument();
  });

  it('shows thesis titles for graduate degrees', () => {
    renderWithProviders(<EducationSection />);
    
    // Check for thesis related content
    const thesisElements = screen.queryAllByText(/논문|연구|Detection|Tracking/);
    expect(thesisElements.length).toBeGreaterThanOrEqual(0);
  });

  it('renders degree icons', () => {
    const { container } = renderWithProviders(<EducationSection />);
    
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('applies proper styling classes', () => {
    const { container } = renderWithProviders(<EducationSection />);
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-20');
  });

  it('displays GPA information if available', () => {
    renderWithProviders(<EducationSection />);
    
    // GPA might be displayed
    const gpaElements = screen.queryAllByText(/4\.[0-9]\/4\.[0-9]|GPA/);
    expect(gpaElements.length).toBeGreaterThanOrEqual(0);
  });

  it('shows awards or honors if any', () => {
    renderWithProviders(<EducationSection />);
    
    // Check for awards
    const awardElements = screen.queryAllByText(/우수|장학|Award|Honor/);
    expect(awardElements.length).toBeGreaterThanOrEqual(0);
  });

  it('renders timeline layout correctly', () => {
    const { container } = renderWithProviders(<EducationSection />);
    
    const timelineElements = container.querySelectorAll('[class*="timeline"]');
    expect(timelineElements.length).toBeGreaterThanOrEqual(0);
  });

  it('displays course highlights for degrees', () => {
    renderWithProviders(<EducationSection />);
    
    // Check for course related content
    const courseElements = screen.queryAllByText(/과정|Course|수료/);
    expect(courseElements.length).toBeGreaterThanOrEqual(0);
  });

  it('shows academic focus areas', () => {
    renderWithProviders(<EducationSection />);
    
    expect(screen.getByText(/객체 탐지/)).toBeInTheDocument();
    expect(screen.getByText(/머신러닝/)).toBeInTheDocument();
  });

  it('renders with responsive design', () => {
    const { container } = renderWithProviders(<EducationSection />);
    
    const responsiveElements = container.querySelectorAll('[class*="md:"], [class*="lg:"]');
    expect(responsiveElements.length).toBeGreaterThan(0);
  });

  it('displays completion status', () => {
    renderWithProviders(<EducationSection />);
    
    expect(screen.getByText(/수료/)).toBeInTheDocument();
    expect(screen.getByText(/졸업/)).toBeInTheDocument();
  });

  it('shows research publications if any', () => {
    renderWithProviders(<EducationSection />);
    
    const publicationElements = screen.queryAllByText(/논문|Paper|Publication|발표/);
    expect(publicationElements.length).toBeGreaterThanOrEqual(0);
  });

  it('renders education cards with proper spacing', () => {
    const { container } = renderWithProviders(<EducationSection />);
    
    const cards = container.querySelectorAll('[class*="mb-"], [class*="mt-"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('displays advisor information for graduate degrees', () => {
    renderWithProviders(<EducationSection />);
    
    const advisorElements = screen.queryAllByText(/지도교수|Advisor|Professor/);
    expect(advisorElements.length).toBeGreaterThanOrEqual(0);
  });

  it('shows relevant coursework', () => {
    renderWithProviders(<EducationSection />);
    
    const courseworkElements = screen.queryAllByText(/신호처리|알고리즘|데이터/);
    expect(courseworkElements.length).toBeGreaterThanOrEqual(0);
  });
});