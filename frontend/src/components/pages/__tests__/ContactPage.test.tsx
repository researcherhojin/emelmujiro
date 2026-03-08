import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ContactPage from '../ContactPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('../../contact/ContactInfo', () => ({
  default: () => <div data-testid="contact-info">ContactInfo</div>,
}));

describe('ContactPage', () => {
  const renderPage = () =>
    render(
      <HelmetProvider>
        <MemoryRouter>
          <ContactPage />
        </MemoryRouter>
      </HelmetProvider>
    );

  it('renders page title and subtitle', () => {
    renderPage();
    expect(screen.getByText('contact.title')).toBeInTheDocument();
    expect(screen.getByText('contact.subtitle')).toBeInTheDocument();
  });

  it('renders Google Form description', () => {
    renderPage();
    expect(
      screen.getByText('contact.googleForm.description')
    ).toBeInTheDocument();
  });

  it('renders Google Form iframe', () => {
    renderPage();
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.src).toContain('docs.google.com/forms');
  });

  it('renders open in new tab link', () => {
    renderPage();
    const link = screen.getByText('contact.googleForm.openInNewTab');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('renders ContactInfo component', () => {
    renderPage();
    expect(screen.getByTestId('contact-info')).toBeInTheDocument();
  });

  it('renders form title', () => {
    renderPage();
    expect(
      screen.getByText('contact.googleForm.formTitle')
    ).toBeInTheDocument();
  });
});
