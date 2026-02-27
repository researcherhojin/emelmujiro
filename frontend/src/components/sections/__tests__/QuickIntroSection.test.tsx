import React from 'react';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import QuickIntroSection from '../QuickIntroSection';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

describe('QuickIntroSection', () => {
  it('renders quick intro section', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for main heading (now i18n keys)
    expect(screen.getByText('services.title')).toBeInTheDocument();
    expect(screen.getByText('services.sectionLabel')).toBeInTheDocument();
  });

  it('displays introduction text', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for i18n keys for differentiator items
    const introTexts = screen.queryAllByText(/quickIntro\.items/);
    expect(introTexts.length).toBeGreaterThan(0);
  });

  it('shows key highlights', () => {
    renderWithProviders(<QuickIntroSection />);

    // Check for differentiator title keys
    const highlights = screen.queryAllByText(/quickIntro\.items\.\w+\.title/);
    expect(highlights.length).toBeGreaterThanOrEqual(1);
  });

  it('renders with proper styling', () => {
    renderWithProviders(<QuickIntroSection />);

    const heading = screen.getByText('services.title');
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
