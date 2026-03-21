import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(screen.getByText('contact.googleForm.description')).toBeInTheDocument();
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
    expect(screen.getByText('contact.googleForm.formTitle')).toBeInTheDocument();
  });

  it('hides loading indicator after iframe loads', () => {
    renderPage();

    // Loading overlay div should be visible initially
    const loadingOverlay = document.querySelector('.absolute.inset-0');
    expect(loadingOverlay).toBeTruthy();

    // Simulate iframe load event
    const iframe = document.querySelector('iframe')!;
    fireEvent.load(iframe);

    // Loading overlay should be removed after iframe load
    const removedOverlay = document.querySelector('.absolute.inset-0');
    expect(removedOverlay).toBeNull();
  });
});
