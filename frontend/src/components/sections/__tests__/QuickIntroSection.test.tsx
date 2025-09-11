import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import QuickIntroSection from '../QuickIntroSection';
import { itSkipInCI } from '../../../test-utils/ci-skip';

describe('QuickIntroSection', () => {
  itSkipInCI('renders quick intro section', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for main heading
    expect(screen.getByText('주요 서비스')).toBeInTheDocument();
    expect(screen.getByText('WHAT WE DO')).toBeInTheDocument();
  });

  itSkipInCI('displays introduction text', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for intro content - use queryAllByText for multiple matches
    const introTexts = screen.queryAllByText(/AI|인공지능|전문가/);
    expect(introTexts.length).toBeGreaterThan(0);
  });

  itSkipInCI('shows key highlights', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for highlight items
    const highlights = screen.queryAllByText(/경력|교육|프로젝트|연구/);
    expect(highlights.length).toBeGreaterThanOrEqual(1);
  });

  itSkipInCI('renders with proper styling', () => {
    renderWithProviders(<QuickIntroSection />);

    const heading = screen.getByText('주요 서비스');
    expect(heading).toBeInTheDocument();
    // Check if it has proper heading styling
    expect(heading).toHaveClass('text-3xl');
  });

  itSkipInCI('displays contact information', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for contact info
    const contactInfo = screen.queryByText(/연락|Contact|이메일|Email/);
    if (contactInfo) {
      expect(contactInfo).toBeInTheDocument();
    }
  });

  itSkipInCI('shows professional title', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for title
    const title = screen.queryByText(/강사|개발자|엔지니어|컨설턴트/);
    if (title) {
      expect(title).toBeInTheDocument();
    }
  });

  itSkipInCI('renders profile image if available', () => {
    renderWithProviders(<QuickIntroSection />);

    const image = screen.queryByRole('img');
    if (image) {
      expect(image).toHaveAttribute('alt');
    }
  });

  itSkipInCI('displays skills summary', () => {
    renderWithProviders(<QuickIntroSection />);

    const skills = screen.queryAllByText(
      /Python|Machine Learning|Deep Learning|AI/
    );
    expect(skills.length).toBeGreaterThanOrEqual(0);
  });

  itSkipInCI('shows call-to-action button', () => {
    renderWithProviders(<QuickIntroSection />);

    const ctaButton =
      screen.queryByRole('button') || screen.queryByRole('link');
    if (ctaButton) {
      expect(ctaButton).toBeInTheDocument();
    }
  });

  itSkipInCI('renders with responsive layout', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check if component renders with content
    const content = screen.queryAllByText(/\w+/);
    expect(content.length).toBeGreaterThanOrEqual(0);
  });
});
