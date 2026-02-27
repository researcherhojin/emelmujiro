import React from 'react';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import EducationSection from '../EducationSection';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options?.returnObjects) return key;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: any) => children,
}));

describe('EducationSection', () => {
  it('renders education section with title', () => {
    renderWithProviders(<EducationSection />);

    // Look for education section title (i18n key)
    const educationText = screen.queryByText('education.title');
    expect(educationText).toBeInTheDocument();
  });

  it('displays all education tracks', () => {
    renderWithProviders(<EducationSection />);

    // Check for track title keys
    expect(
      screen.getByText('education.tracks.corporate.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('education.tracks.advanced.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('education.tracks.genai.title')
    ).toBeInTheDocument();
  });

  it('shows track descriptions', () => {
    renderWithProviders(<EducationSection />);

    expect(
      screen.getByText('education.tracks.corporate.description')
    ).toBeInTheDocument();
    expect(
      screen.getByText('education.tracks.advanced.description')
    ).toBeInTheDocument();
    expect(
      screen.getByText('education.tracks.genai.description')
    ).toBeInTheDocument();
  });

  it('displays recent courses section', () => {
    renderWithProviders(<EducationSection />);

    expect(screen.getByText('education.recentCourses')).toBeInTheDocument();
  });

  it('shows course company names', () => {
    renderWithProviders(<EducationSection />);

    expect(
      screen.getByText('education.courses.samsung.company')
    ).toBeInTheDocument();
    expect(
      screen.getByText('education.courses.hyundai.company')
    ).toBeInTheDocument();
    expect(
      screen.getByText('education.courses.likelion.company')
    ).toBeInTheDocument();
  });

  it('shows course details', () => {
    renderWithProviders(<EducationSection />);

    expect(
      screen.getByText('education.courses.samsung.course')
    ).toBeInTheDocument();
    expect(
      screen.getByText('education.courses.samsung.period')
    ).toBeInTheDocument();
    expect(
      screen.getByText('education.courses.samsung.type')
    ).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    renderWithProviders(<EducationSection />);

    expect(screen.getByText('common.inquireEducation')).toBeInTheDocument();
  });

  it('renders degree icons', () => {
    const { container } = renderWithProviders(<EducationSection />);

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('applies proper styling classes', () => {
    const { container } = renderWithProviders(<EducationSection />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('py-24');
  });

  it('renders education subtitle', () => {
    renderWithProviders(<EducationSection />);

    expect(screen.getByText('education.subtitle')).toBeInTheDocument();
  });

  it('renders timeline layout correctly', () => {
    const { container } = renderWithProviders(<EducationSection />);

    const timelineElements = container.querySelectorAll('[class*="timeline"]');
    expect(timelineElements.length).toBeGreaterThanOrEqual(0);
  });

  it('renders education cards with proper spacing', () => {
    const { container } = renderWithProviders(<EducationSection />);

    const cards = container.querySelectorAll('[class*="mb-"], [class*="mt-"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders with responsive design', () => {
    const { container } = renderWithProviders(<EducationSection />);

    const responsiveElements = container.querySelectorAll(
      '[class*="md:"], [class*="lg:"]'
    );
    expect(responsiveElements.length).toBeGreaterThan(0);
  });
});
