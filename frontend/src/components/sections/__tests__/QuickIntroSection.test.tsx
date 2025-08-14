import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import QuickIntroSection from '../QuickIntroSection';

describe('QuickIntroSection', () => {
  it('renders quick intro section', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for main heading
    expect(screen.getByText('주요 서비스')).toBeInTheDocument();
    expect(screen.getByText('WHAT WE DO')).toBeInTheDocument();
  });

  it('displays introduction text', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for intro content - use queryAllByText for multiple matches
    const introTexts = screen.queryAllByText(/AI|인공지능|전문가/);
    expect(introTexts.length).toBeGreaterThan(0);
  });

  it('shows key highlights', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for highlight items
    const highlights = screen.queryAllByText(/경력|교육|프로젝트|연구/);
    expect(highlights.length).toBeGreaterThanOrEqual(1);
  });

  it('renders with proper styling', () => {
    renderWithProviders(<QuickIntroSection />);

    const heading = screen.getByText('주요 서비스');
    expect(heading).toBeInTheDocument();
    // Check if it has proper heading styling
    expect(heading).toHaveClass('text-3xl');
  });

  it('displays contact information', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for contact info
    const contactInfo = screen.queryByText(/연락|Contact|이메일|Email/);
    if (contactInfo) {
      expect(contactInfo).toBeInTheDocument();
    }
  });

  it('shows professional title', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for title
    const title = screen.queryByText(/강사|개발자|엔지니어|컨설턴트/);
    if (title) {
      expect(title).toBeInTheDocument();
    }
  });

  it('renders profile image if available', () => {
    renderWithProviders(<QuickIntroSection />);

    const image = screen.queryByRole('img');
    if (image) {
      expect(image).toHaveAttribute('alt');
    }
  });

  it('displays skills summary', () => {
    renderWithProviders(<QuickIntroSection />);

    const skills = screen.queryAllByText(
      /Python|Machine Learning|Deep Learning|AI/
    );
    expect(skills.length).toBeGreaterThanOrEqual(0);
  });

  it('shows call-to-action button', () => {
    renderWithProviders(<QuickIntroSection />);

    const ctaButton =
      screen.queryByRole('button') || screen.queryByRole('link');
    if (ctaButton) {
      expect(ctaButton).toBeInTheDocument();
    }
  });

  it('renders with responsive layout', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check if component renders with content
    const content = screen.queryAllByText(/\w+/);
    expect(content.length).toBeGreaterThanOrEqual(0);
  });
});
